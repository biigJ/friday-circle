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

  function bindKunstPage() {
    var go = document.getElementById("kaufen-kunst-go");
    var options = document.getElementById("kaufen-kunst-options");
    var slidesRoot = document.getElementById("kaufen-kunst-slides");
    var dotsRoot = document.getElementById("kaufen-kunst-dots");
    var prev = document.getElementById("kaufen-kunst-prev");
    var next = document.getElementById("kaufen-kunst-next");
    if (!go || !options || !slidesRoot) return;

    var catalog = window.__WGA_CATALOG__;
    var categories = {
      grafik: {
        chapters: ["03 Frühe Radierungen", "04 Holzschnitte", "06 Mehr Radierungen", "10 2000er Jahre"],
      },
      malerei: {
        chapters: ["01 28 Jahre alt", "02 Knalliges Acryl", "07 Neue Familie", "08 80er Jahre", "09 90er Jahre"],
      },
      keramik: {
        chapters: ["11 Keramik"],
      },
    };

    var selected = "grafik";
    var slideIndex = 0;
    var currentImages = [];

    function workIsAvailable(work) {
      return work && !work.empty && work.berlinStatus !== "unavailable" && work.images && work.images[0];
    }

    function sectionIdForCategory(key) {
      if (!catalog || !catalog.sections) return "";
      var chapters = categories[key].chapters;
      for (var i = 0; i < catalog.sections.length; i++) {
        var section = catalog.sections[i];
        if (chapters.indexOf(section.chapter) === -1) continue;
        if ((section.works || []).some(workIsAvailable)) return section.id;
      }
      return "";
    }

    function imagesForCategory(key) {
      if (!catalog || !catalog.sections) return [];
      var chapters = categories[key].chapters;
      var images = [];
      catalog.sections.forEach(function (section) {
        if (chapters.indexOf(section.chapter) === -1) return;
        (section.works || []).forEach(function (work) {
          if (!workIsAvailable(work)) return;
          images.push("../" + work.images[0]);
        });
      });
      return images.slice(0, 16);
    }

    function showKunstSlide(i) {
      if (!currentImages.length) return;
      slideIndex = (i + currentImages.length) % currentImages.length;
      slidesRoot.querySelectorAll(".kaufen-tile__slide").forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === slideIndex);
      });
      if (dotsRoot) {
        dotsRoot.querySelectorAll(".kaufen-tile__dot").forEach(function (dot, n) {
          dot.classList.toggle("is-active", n === slideIndex);
        });
      }
    }

    function renderKunstSlider(key) {
      currentImages = imagesForCategory(key);
      slidesRoot.innerHTML = "";
      if (dotsRoot) dotsRoot.innerHTML = "";

      if (!currentImages.length) {
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

      currentImages.forEach(function (src, n) {
        var slide = document.createElement("div");
        slide.className = "kaufen-tile__slide" + (n === 0 ? " is-active" : "");
        var img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.decoding = "async";
        slide.appendChild(img);
        slidesRoot.appendChild(slide);

        if (dotsRoot && currentImages.length > 1) {
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

      var multi = currentImages.length > 1;
      if (prev) prev.hidden = !multi;
      if (next) next.hidden = !multi;
      slideIndex = 0;
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

    bindChoiceGroup(options, function (value) {
      selected = value;
      renderKunstSlider(selected);
    });

    go.addEventListener("click", function () {
      var sectionId = sectionIdForCategory(selected);
      window.location.href = sectionId ? "wolfganggrope.html#" + sectionId : "wolfganggrope.html#wga-catalog-root";
    });

    renderKunstSlider(selected);
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindTileSlider(document.getElementById("kaufen-tisch-tile"));
    bindSweaterPage();
    bindTischPage();
    bindKunstPage();
  });

  document.addEventListener("fc-lang-change", function () {
    bindSweaterPage();
    bindTischPage();
  });
})();
