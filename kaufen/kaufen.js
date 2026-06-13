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

  function chapterLabel(chapter) {
    return String(chapter || "")
      .replace(/^\d{2}\s+/, "")
      .toLowerCase();
  }

  function priceForChapter(chapter) {
    if (chapter === "11 Keramik") {
      return { de: "800 € – 2.500 €", en: "€800 – €2,500" };
    }
    if (
      chapter === "01 28 Jahre alt" ||
      chapter === "02 Knalliges Acryl" ||
      chapter === "05 Ölmalerei 1974" ||
      chapter === "07 Neue Familie" ||
      chapter === "08 80er Jahre" ||
      chapter === "09 90er Jahre"
    ) {
      return { de: "500 € – 1.200 €", en: "€500 – €1,200" };
    }
    return { de: "ab 300 €", en: "from €300" };
  }

  function bindIndexFilter() {
    var grid = document.getElementById("kaufen-shop-grid");
    var nav = document.getElementById("kaufen-shop-nav");
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
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var filter = link.getAttribute("data-shop-filter");
        applyFilter(activeFilter === filter ? "" : filter);
      });
    });

    applyFilter("");
  }

  function bindKunstPage() {
    var go = document.getElementById("kaufen-kunst-go");
    var options = document.getElementById("kaufen-kunst-options");
    var priceEl = document.getElementById("kaufen-kunst-price");
    var slidesRoot = document.getElementById("kaufen-kunst-slides");
    var dotsRoot = document.getElementById("kaufen-kunst-dots");
    var prev = document.getElementById("kaufen-kunst-prev");
    var next = document.getElementById("kaufen-kunst-next");
    if (!go || !options || !slidesRoot) return;

    var catalog = window.__WGA_CATALOG__;
    var chapters = [];
    var chapterMap = {};
    var selected = "";
    var slideIndex = 0;
    var currentSlides = [];

    function workIsAvailable(work) {
      return work && !work.empty && work.berlinStatus !== "unavailable" && work.images && work.images[0];
    }

    function buildChapters() {
      if (!catalog || !catalog.sections) return;
      var seen = new Set();
      catalog.sections.forEach(function (section) {
        var chapter = section.chapter;
        if (!chapter || seen.has(chapter) || !/^\d{2}\s/.test(chapter)) return;
        seen.add(chapter);
        var entry = {
          chapter: chapter,
          sectionId: section.id,
          label: chapterLabel(chapter),
        };
        chapters.push(entry);
        chapterMap[chapter] = entry;
      });
    }

    function worksForChapter(chapter) {
      var items = [];
      if (!catalog || !catalog.sections) return items;
      catalog.sections.forEach(function (section) {
        if (section.chapter !== chapter) return;
        (section.works || []).forEach(function (work) {
          if (!workIsAvailable(work)) return;
          items.push({
            src: "../" + work.images[0],
            workId: work.id,
          });
        });
      });
      if (chapter === "03 Frühe Radierungen") {
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

    function updatePrice(chapter) {
      if (!priceEl || !chapter) {
        if (priceEl) priceEl.textContent = "—";
        return;
      }
      var p = priceForChapter(chapter);
      priceEl.textContent = t(p.de, p.en);
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
    }

    function renderKunstSlider(chapter) {
      currentSlides = worksForChapter(chapter);
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
    }

    function selectChapter(chapter) {
      selected = chapter;
      options.querySelectorAll(".kaufen-kunst-btn").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-value") === chapter);
      });
      updatePrice(chapter);
      renderKunstSlider(chapter);
    }

    function renderChapterButtons() {
      options.innerHTML = "";
      chapters.forEach(function (entry) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "kaufen-kunst-btn";
        btn.setAttribute("data-value", entry.chapter);
        btn.textContent = entry.label;
        var hasWorks = worksForChapter(entry.chapter).length > 0;
        if (!hasWorks) btn.disabled = true;
        btn.addEventListener("click", function () {
          selectChapter(entry.chapter);
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
      var entry = chapterMap[selected];
      var sectionId = entry ? entry.sectionId : "";
      window.location.href = sectionId ? "wolfganggrope.html#" + sectionId : "wolfganggrope.html#wga-catalog-root";
    });

    buildChapters();
    renderChapterButtons();
    var firstWithWorks = chapters.find(function (entry) {
      return worksForChapter(entry.chapter).length > 0;
    });
    if (firstWithWorks) {
      selectChapter(firstWithWorks.chapter);
    } else {
      updatePrice("");
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
      var p = priceForChapter(active.getAttribute("data-value"));
      priceEl.textContent = t(p.de, p.en);
    }
  });
})();
