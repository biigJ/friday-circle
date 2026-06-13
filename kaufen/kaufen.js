(function () {
  var MAIL = "mail@bjgrope.de";

  function lang() {
    return document.body.classList.contains("en") || document.documentElement.lang === "en" ? "en" : "de";
  }

  function t(de, en) {
    return lang() === "en" ? en : de;
  }

  function bindTileSlider(root) {
    if (!root) return;
    var slides = root.querySelectorAll(".kaufen-tile__slide");
    var dots = root.querySelectorAll(".kaufen-tile__dot");
    var prev = root.querySelector(".kaufen-tile__nav--prev");
    var next = root.querySelector(".kaufen-tile__nav--next");
    if (!slides.length) return;

    var index = 0;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === index);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("is-active", n === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        show(index + 1);
      });
    }
    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        show(n);
      });
    });
  }

  function bindChoiceGroup(container, onChange) {
    if (!container) return;
    var buttons = container.querySelectorAll("button[data-value]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        if (onChange) onChange(btn.getAttribute("data-value"), btn);
      });
    });
  }

  function bindSweaterPage() {
    var order = document.getElementById("kaufen-order-link");
    if (!order) return;
    var sizeWrap = document.getElementById("kaufen-size-grid");
    var selected = "M";

    function updateMail() {
      order.href =
        "mailto:" +
        MAIL +
        "?subject=" +
        encodeURIComponent(
          t("Bestellung Friday Circle Sweater Größe " + selected, "Order Friday Circle Sweater size " + selected)
        );
    }

    bindChoiceGroup(sizeWrap, function (value) {
      selected = value;
      updateMail();
    });
    updateMail();
  }

  function bindTischPage() {
    var order = document.getElementById("kaufen-order-link");
    var img = document.getElementById("kaufen-product-img");
    var price = document.getElementById("kaufen-product-price");
    var note = document.getElementById("kaufen-product-note");
    var variantWrap = document.getElementById("kaufen-variant-grid");
    if (!order || !variantWrap) return;

    var variants = {
      small: {
        img: "../assets/interior/tisch-aufgruenemkaro.png",
        altDe: "Esstisch auf grünem Karomuster",
        altEn: "Dining table on green carom pattern",
        priceDe: "950 €",
        priceEn: "€950",
        noteDe: "Frei Von Ecken, 4-Sitzer · 85 × 130 cm",
        noteEn: "Frei Von Ecken, 4-seater · 85 × 130 cm",
        subjectDe: "Bestellung Frei Von Ecken Tisch 85 x 130 cm",
        subjectEn: "Order Frei Von Ecken table 85 x 130 cm",
      },
      large: {
        img: "../assets/interior/tisch-250.png",
        altDe: "Großer Esstisch",
        altEn: "Large dining table",
        priceDe: "1.800 €",
        priceEn: "€1,800",
        noteDe: "Frei Von Ecken, 8-Sitzer · 90 × 240 cm",
        noteEn: "Frei Von Ecken, 8-seater · 90 × 240 cm",
        subjectDe: "Bestellung Frei Von Ecken Tisch 90 x 240 cm",
        subjectEn: "Order Frei Von Ecken table 90 x 240 cm",
      },
    };

    var selected = "small";

    function render() {
      var v = variants[selected];
      if (img) {
        img.src = v.img;
        img.alt = t(v.altDe, v.altEn);
      }
      if (price) price.textContent = t(v.priceDe, v.priceEn);
      if (note) note.textContent = t(v.noteDe, v.noteEn);
      order.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(t(v.subjectDe, v.subjectEn));
    }

    bindChoiceGroup(variantWrap, function (value) {
      selected = value;
      render();
    });
    render();
  }

  var KUNST_CATEGORIES = [
    {
      id: "aquarell",
      labelDe: "Aquarell",
      labelEn: "Watercolour",
      sections: [
        "01-28-jahre-alt-aquarell-1960",
        "07-neue-familie-1976-1979-aquarell",
        "08-80-er-jahre-1980-1989-aquarell",
        "09-90-er-jahre-1990-1995-aquarellbilder",
        "09-90-er-jahre-1995-obst-in-aquarell",
      ],
    },
    {
      id: "acryl",
      labelDe: "Acryl",
      labelEn: "Acrylic",
      sections: ["02-knalliges-acryl-1970"],
    },
    {
      id: "radierung",
      labelDe: "Radierung",
      labelEn: "Etching",
      sections: [
        "03-fruher-radierungen-1972-1974",
        "06-mehr-radierungen-1975-1979",
        "08-80-er-jahre-1988-1995-radierungen",
      ],
    },
    {
      id: "holzschnitt",
      labelDe: "Holzschnitt",
      labelEn: "Woodcut",
      sections: ["04-holzschnitte-1973-1974"],
    },
    {
      id: "collage",
      labelDe: "Collage",
      labelEn: "Collage",
      sections: ["07-1976-collagen"],
    },
    {
      id: "tusche",
      labelDe: "Tusche",
      labelEn: "Ink",
      sections: ["07-neue-familie-1976-tuschezeichnung", "09-90-er-jahre-1992-tuschestrichzeichnungen"],
    },
    {
      id: "skizzen",
      labelDe: "Skizzen",
      labelEn: "Sketches",
      sections: [
        "07-neue-familie-1976-1979-skizzen",
        "09-90-er-jahre-1990-krypta-wurzburger-dom",
        "09-90-er-jahre-1991-skizzen-griechenland",
        "09-90-er-jahre-1991-1995-skribbel",
        "09-90-er-jahre-1992-skizzen-bornholm",
        "09-90-er-jahre-1992-1994-skizzenbuch",
        "09-90-er-jahre-1995-skizzen-lofoten",
      ],
    },
    {
      id: "buntstift",
      labelDe: "Buntstift",
      labelEn: "Coloured pencil",
      sections: ["08-80-er-jahre-1980-1985-buntstiftzeichnungen"],
    },
    {
      id: "olkreide",
      labelDe: "Ölkreide",
      labelEn: "Oil pastel",
      sections: ["08-80-er-jahre-1984-1987-olkreide", "09-90-er-jahre-1995-olkreide"],
    },
    {
      id: "druck-experiment",
      labelDe: "Druck-Experiment",
      labelEn: "Print experiment",
      sections: ["08-80-er-jahre-1989-druck-experimente"],
    },
    {
      id: "olmalerei",
      labelDe: "Ölmalerei",
      labelEn: "Oil painting",
      sections: ["10-2000-er-jahre-1999-2002-olmalerei"],
    },
    {
      id: "keramik",
      labelDe: "Keramik",
      labelEn: "Ceramics",
      sections: ["11-keramik"],
    },
  ];

  function deriveSectionYear(title) {
    var folder = String(title || "").trim();
    var range = folder.match(/\b((?:19|20)\d{2})-((?:19|20)\d{2})\b/);
    if (range) return range[1] + "–" + range[2];
    var trailingAfterDash = folder.match(/-\s*((?:19|20)\d{2})\s*$/);
    if (trailingAfterDash) return trailingAfterDash[1];
    var beforeParen = folder.match(/\b((?:19|20)\d{2})\s*\(/);
    if (beforeParen) return beforeParen[1];
    var trailingYear = folder.match(/\b((?:19|20)\d{2})\s*$/);
    if (trailingYear) return trailingYear[1];
    return "";
  }

  function formatKunstSectionLabel(section) {
    if (!section) return "";
    var title = section.title || "";
    var year = deriveSectionYear(title);
    var paren = title.match(/\(([^)]+)\)/);
    if (paren) {
      return (year ? year + " " : "") + paren[1].trim();
    }
    var stripped = title.replace(/^\d{2}\s+[\w\s'äöüÄÖÜß-]+?\s+/i, "").trim();
    return stripped || section.id;
  }

  function priceForCategory(categoryId) {
    if (categoryId === "keramik") {
      return { de: "800 € – 2.500 €", en: "€800 – €2,500" };
    }
    if (categoryId === "aquarell" || categoryId === "acryl" || categoryId === "olmalerei") {
      return { de: "500 € – 1.200 €", en: "€500 – €1,200" };
    }
    return { de: "ab 300 €", en: "from €300" };
  }

  function bindIndexFilter() {
    var grid = document.getElementById("kaufen-shop-grid");
    var nav = document.getElementById("kaufen-shop-nav");
    var back = document.getElementById("kaufen-index-back");
    if (!grid || !nav) return;

    var tiles = grid.querySelectorAll("[data-shop-group]");
    var links = nav.querySelectorAll("[data-shop-filter]");
    var activeFilter = "";

    function applyFilter(filter) {
      activeFilter = filter || "";
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-shop-filter") === activeFilter);
      });
      tiles.forEach(function (tile) {
        var group = tile.getAttribute("data-shop-group");
        var show = !activeFilter || group === activeFilter;
        tile.classList.toggle("is-filtered-out", !show);
      });
      grid.classList.toggle("is-filtered", !!activeFilter);
      if (back) back.hidden = !activeFilter;
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var filter = link.getAttribute("data-shop-filter");
        applyFilter(activeFilter === filter ? "" : filter);
      });
    });

    if (back) {
      back.addEventListener("click", function (e) {
        if (!activeFilter) return;
        e.preventDefault();
        applyFilter("");
      });
    }

    applyFilter("");
  }

  function inquiryRefForWork(work, imageIndex) {
    if (!work) return "";
    imageIndex = imageIndex || 0;
    var id = work.catalogId || work.id || "";
    var pair = String(id).match(/^(?:wg|WG)-(\d+)-(\d{3})-a$/i);
    if (pair) {
      var chapter = pair[1].padStart(2, "0");
      var view = imageIndex === 1 ? "b" : imageIndex === 0 ? "a" : "";
      var workNo = view ? pair[2] + "-" + view : pair[2];
      var yearMatch = work.year && work.year !== "—" ? String(work.year).match(/(\d{4})/) : null;
      if (yearMatch) return chapter + "-" + workNo + "-" + yearMatch[1];
      return chapter + "-" + workNo;
    }
    var match = String(id).match(/^(?:wg|WG)-(\d+)-(\d{3})$/i);
    if (!match) return "";
    var chapterNum = match[1].padStart(2, "0");
    var workNum = match[2];
    var year = work.year && work.year !== "—" ? String(work.year).match(/(\d{4})/) : null;
    if (year) return chapterNum + "-" + workNum + "-" + year[1];
    return chapterNum + "-" + workNum;
  }

  function inquirySubjectForWork(work, imageIndex) {
    var ref = inquiryRefForWork(work, imageIndex);
    return ref ? "Anfrage " + ref : "Anfrage";
  }

  function bindKunstPage() {
    var go = document.getElementById("kaufen-kunst-go");
    var order = document.getElementById("kaufen-kunst-order");
    var options = document.getElementById("kaufen-kunst-options");
    var priceEl = document.getElementById("kaufen-kunst-price");
    var sectionLabelEl = document.getElementById("kaufen-kunst-section-label");
    var slidesRoot = document.getElementById("kaufen-kunst-slides");
    var dotsRoot = document.getElementById("kaufen-kunst-dots");
    var prev = document.getElementById("kaufen-kunst-prev");
    var next = document.getElementById("kaufen-kunst-next");
    if (!go || !options || !slidesRoot) return;

    var catalog = window.__WGA_CATALOG__;
    var sectionById = {};
    var worksById = {};
    var selected = "";
    var slideIndex = 0;
    var currentSlides = [];

    function workIsAvailable(work) {
      return work && !work.empty && work.berlinStatus !== "unavailable" && work.images && work.images[0];
    }

    function indexSections() {
      if (!catalog || !catalog.sections) return;
      catalog.sections.forEach(function (section) {
        sectionById[section.id] = section;
        (section.works || []).forEach(function (work) {
          if (work && work.id) worksById[work.id] = work;
        });
      });
    }

    function updateOrderMail() {
      if (!order) return;
      var slide = currentSlides[slideIndex];
      var work = slide ? worksById[slide.workId] : null;
      order.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(inquirySubjectForWork(work, 0));
    }

    function worksForCategory(categoryId) {
      var category = KUNST_CATEGORIES.find(function (entry) {
        return entry.id === categoryId;
      });
      if (!category) return [];
      var items = [];
      category.sections.forEach(function (sectionId) {
        var section = sectionById[sectionId];
        if (!section) return;
        var label = formatKunstSectionLabel(section);
        (section.works || []).forEach(function (work) {
          if (!workIsAvailable(work)) return;
          items.push({
            src: "../" + work.images[0],
            workId: work.id,
            sectionId: sectionId,
            sectionLabel: label,
          });
        });
      });
      if (categoryId === "radierung") {
        items.sort(function (a, b) {
          var aPin = a.src.indexOf("WG-Grafik-1972-1974-10") >= 0;
          var bPin = b.src.indexOf("WG-Grafik-1972-1974-10") >= 0;
          if (aPin && !bPin) return -1;
          if (!aPin && bPin) return 1;
          return 0;
        });
      }
      return items;
    }

    function updatePrice(categoryId) {
      if (!priceEl || !categoryId) {
        if (priceEl) priceEl.textContent = "—";
        return;
      }
      var p = priceForCategory(categoryId);
      priceEl.textContent = t(p.de, p.en);
    }

    function updateSectionLabel() {
      if (!sectionLabelEl) return;
      var slide = currentSlides[slideIndex];
      sectionLabelEl.textContent = slide ? slide.sectionLabel : "";
    }

    function showKunstSlide(i) {
      if (!currentSlides.length) return;
      slideIndex = (i + currentSlides.length) % currentSlides.length;
      slidesRoot.querySelectorAll(".kaufen-tile__slide").forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === slideIndex);
      });
      if (dotsRoot) {
        dotsRoot.querySelectorAll(".kaufen-tile__dot").forEach(function (dot, n) {
          dot.classList.toggle("is-active", n === slideIndex);
        });
      }
      updateSectionLabel();
      updateOrderMail();
    }

    function renderKunstSlider(categoryId) {
      currentSlides = worksForCategory(categoryId);
      slidesRoot.innerHTML = "";
      if (dotsRoot) dotsRoot.innerHTML = "";

      if (!currentSlides.length) {
        var empty = document.createElement("div");
        empty.className = "kaufen-tile__slide is-active";
        var emptyImg = document.createElement("img");
        emptyImg.src = "../assets/wolfgang-grope/placeholder.svg";
        emptyImg.alt = "";
        empty.appendChild(emptyImg);
        slidesRoot.appendChild(empty);
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
        updateSectionLabel();
        updateOrderMail();
        return;
      }

      currentSlides.forEach(function (item, n) {
        var slide = document.createElement("div");
        slide.className = "kaufen-tile__slide" + (n === 0 ? " is-active" : "");
        var link = document.createElement("a");
        link.href = "wolfganggrope.html#" + item.workId;
        link.setAttribute("aria-label", t("Werk im Katalog öffnen", "Open work in catalog"));
        var img = document.createElement("img");
        img.src = item.src;
        img.alt = "";
        img.decoding = "async";
        link.appendChild(img);
        slide.appendChild(link);
        slidesRoot.appendChild(slide);

        if (dotsRoot && currentSlides.length > 1) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "kaufen-tile__dot" + (n === 0 ? " is-active" : "");
          dot.addEventListener("click", function (e) {
            e.preventDefault();
            showKunstSlide(n);
          });
          dotsRoot.appendChild(dot);
        }
      });

      var multi = currentSlides.length > 1;
      if (prev) prev.hidden = !multi;
      if (next) next.hidden = !multi;
      slideIndex = 0;
      updateSectionLabel();
      updateOrderMail();
    }

    function selectCategory(categoryId) {
      selected = categoryId;
      options.querySelectorAll(".kaufen-kunst-btn").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-value") === categoryId);
      });
      updatePrice(categoryId);
      renderKunstSlider(categoryId);
    }

    function renderCategoryButtons() {
      options.innerHTML = "";
      KUNST_CATEGORIES.forEach(function (entry) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "kaufen-kunst-btn";
        btn.setAttribute("data-value", entry.id);
        btn.textContent = t(entry.labelDe, entry.labelEn).toLowerCase();
        var hasWorks = worksForCategory(entry.id).length > 0;
        if (!hasWorks) btn.disabled = true;
        btn.addEventListener("click", function () {
          selectCategory(entry.id);
        });
        options.appendChild(btn);
      });
    }

    if (prev) {
      prev.addEventListener("click", function (e) {
        e.preventDefault();
        showKunstSlide(slideIndex - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function (e) {
        e.preventDefault();
        showKunstSlide(slideIndex + 1);
      });
    }

    go.addEventListener("click", function () {
      var slide = currentSlides[slideIndex];
      var sectionId = slide ? slide.sectionId : "";
      window.location.href = sectionId ? "wolfganggrope.html#" + sectionId : "wolfganggrope.html#wga-catalog-root";
    });

    indexSections();
    renderCategoryButtons();
    var firstWithWorks = KUNST_CATEGORIES.find(function (entry) {
      return worksForCategory(entry.id).length > 0;
    });
    if (firstWithWorks) {
      selectCategory(firstWithWorks.id);
    } else {
      updatePrice("");
      updateSectionLabel();
      updateOrderMail();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindTileSlider(document.getElementById("kaufen-tisch-tile"));
    bindIndexFilter();
    bindSweaterPage();
    bindTischPage();
    bindKunstPage();
  });

  document.addEventListener("fc-lang-change", function () {
    bindSweaterPage();
    bindTischPage();
    var priceEl = document.getElementById("kaufen-kunst-price");
    var active = document.querySelector(".kaufen-kunst-btn.is-active");
    if (priceEl && active) {
      var p = priceForCategory(active.getAttribute("data-value"));
      priceEl.textContent = t(p.de, p.en);
    }
    document.querySelectorAll(".kaufen-kunst-btn").forEach(function (btn) {
      var entry = KUNST_CATEGORIES.find(function (cat) {
        return cat.id === btn.getAttribute("data-value");
      });
      if (entry) btn.textContent = t(entry.labelDe, entry.labelEn).toLowerCase();
    });
  });
})();
