(function () {
  var MAIL = "mail@bjgrope.de";

  function lang() {
    return document.body.classList.contains("en") || document.documentElement.lang === "en" ? "en" : "de";
  }

  function t(de, en) {
    return lang() === "en" ? en : de;
  }

  function isMobileProductSliderViewport() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function bindProductSliderSwipe(zone, options) {
    if (!zone || zone.dataset.productSwipeBound) return;
    options = options || {};
    zone.dataset.productSwipeBound = "1";

    var threshold = options.threshold || 52;
    var ignore =
      options.ignore ||
      function (target) {
        return !!target.closest(".kaufen-tile__nav, .kaufen-tile__dot");
      };

    var dragging = false;
    var startX = 0;
    var startY = 0;
    var pointerId = null;
    var axisLocked = null;

    function resetPointer() {
      dragging = false;
      pointerId = null;
      axisLocked = null;
    }

    zone.addEventListener("pointerdown", function (e) {
      if (!isMobileProductSliderViewport()) return;
      if (ignore(e.target)) return;
      if (typeof options.getCount === "function" && options.getCount() < 2) return;
      dragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      axisLocked = null;
      if (zone.setPointerCapture) zone.setPointerCapture(pointerId);
    });

    zone.addEventListener(
      "pointermove",
      function (e) {
        if (!dragging || e.pointerId !== pointerId) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (!axisLocked) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        }
        if (axisLocked === "x" && Math.abs(dx) > 10) e.preventDefault();
      },
      { passive: false }
    );

    function finishSwipe(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      if (zone.releasePointerCapture) {
        try {
          zone.releasePointerCapture(pointerId);
        } catch (err) {
          /* ignore */
        }
      }
      resetPointer();
      if (axisLocked !== "x" || Math.abs(dx) < threshold) return;
      if (dx < 0) {
        if (options.onNext) options.onNext();
      } else if (options.onPrev) {
        options.onPrev();
      }
    }

    zone.addEventListener("pointerup", finishSwipe);
    zone.addEventListener("pointercancel", finishSwipe);
  }

  function bindTileAutoplay(root, intervalMs) {
    if (!root || root.dataset.autoplayBound) return;
    var slides = root.querySelectorAll(".kaufen-tile__slide");
    if (slides.length < 2) return;

    root.dataset.autoplayBound = "1";
    var index = 0;
    slides.forEach(function (slide, n) {
      if (slide.classList.contains("is-active")) index = n;
    });

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === index);
      });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setInterval(function () {
      show(index + 1);
    }, intervalMs || 3000);
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

    bindProductSliderSwipe(root.querySelector(".kaufen-product__slider-stage"), {
      getCount: function () {
        return slides.length;
      },
      onPrev: function () {
        show(index - 1);
      },
      onNext: function () {
        show(index + 1);
      },
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

  var SWEATER_COLORS = {
    chocolate: { de: "Chocolate Braun", en: "Chocolate brown", slide: 0 },
    red: { de: "Dunkelrot", en: "Dark red", slide: 1 },
    darkgrey: { de: "Dunkelgrau", en: "Dark grey", slide: 2 },
  };

  var sweaterState = { size: "M", color: "chocolate", slide: 0 };

  function bindSweaterPage() {
    var order = document.getElementById("kaufen-order-link");
    var figure = document.getElementById("kaufen-sweater-figure");
    if (!order || !figure) return;

    var slider = document.getElementById("kaufen-sweater-slider");
    var slides = slider ? slider.querySelectorAll(".kaufen-tile__slide") : [];
    var dots = figure.querySelectorAll(".kaufen-tile__dot");
    var prev = document.getElementById("kaufen-sweater-prev");
    var next = document.getElementById("kaufen-sweater-next");
    var sizeWrap = document.getElementById("kaufen-size-grid");
    var colorWrap = document.getElementById("kaufen-color-grid");
    var colorLabel = document.getElementById("kaufen-color-label");

    function colorMeta(value) {
      return SWEATER_COLORS[value] || SWEATER_COLORS.chocolate;
    }

    function updateColorLabel() {
      if (!colorLabel) return;
      var meta = colorMeta(sweaterState.color);
      colorLabel.querySelectorAll(".de-t").forEach(function (el) {
        el.textContent = meta.de;
      });
      colorLabel.querySelectorAll(".en-t").forEach(function (el) {
        el.textContent = meta.en;
      });
    }

    function updateSwatchAria() {
      if (!colorWrap) return;
      colorWrap.querySelectorAll(".kaufen-swatch-btn").forEach(function (btn) {
        var value = btn.getAttribute("data-value");
        var meta = colorMeta(value);
        var active = value === sweaterState.color;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
        btn.setAttribute("aria-label", t(meta.de, meta.en));
      });
    }

    function showSlide(index) {
      if (!slides.length) return;
      sweaterState.slide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === sweaterState.slide);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("is-active", n === sweaterState.slide);
      });
      var activeSlide = slides[sweaterState.slide];
      var slideColor = activeSlide && activeSlide.getAttribute("data-color");
      if (slideColor && SWEATER_COLORS[slideColor]) {
        sweaterState.color = slideColor;
        updateSwatchAria();
        updateColorLabel();
        updateMail();
      }
    }

    function selectColor(value) {
      if (!SWEATER_COLORS[value]) return;
      sweaterState.color = value;
      showSlide(colorMeta(value).slide);
    }

    function updateMail() {
      var meta = colorMeta(sweaterState.color);
      order.href =
        "mailto:" +
        MAIL +
        "?subject=" +
        encodeURIComponent(
          t(
            "Bestellung Friday Circle Sweater Größe " + sweaterState.size + ", " + meta.de,
            "Order Friday Circle Sweater size " + sweaterState.size + ", " + meta.en
          )
        );
    }

    if (!figure.dataset.bound) {
      figure.dataset.bound = "1";

      if (prev) {
        prev.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(sweaterState.slide - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(sweaterState.slide + 1);
        });
      }
      dots.forEach(function (dot, n) {
        dot.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(n);
        });
      });

      bindChoiceGroup(colorWrap, function (value) {
        selectColor(value);
      });

      bindChoiceGroup(sizeWrap, function (value) {
        sweaterState.size = value;
        updateMail();
      });

      bindProductSliderSwipe(figure.querySelector(".kaufen-product__slider-stage"), {
        getCount: function () {
          return slides.length;
        },
        onPrev: function () {
          showSlide(sweaterState.slide - 1);
        },
        onNext: function () {
          showSlide(sweaterState.slide + 1);
        },
      });
    }

    updateColorLabel();
    updateSwatchAria();
    showSlide(colorMeta(sweaterState.color).slide);
    updateMail();
  }

  function bindTischPage() {
    var order = document.getElementById("kaufen-order-link");
    var figure = document.getElementById("kaufen-tisch-figure");
    var sliderRoot = document.getElementById("kaufen-tisch-product-slider");
    var slider = document.getElementById("kaufen-tisch-slider");
    var dotsWrap = document.getElementById("kaufen-tisch-dots");
    var price = document.getElementById("kaufen-product-price");
    var note = document.getElementById("kaufen-product-note");
    var variantWrap = document.getElementById("kaufen-variant-grid");
    if (!order || !figure || !slider || !variantWrap) return;

    var variants = {
      small: {
        priceDe: "950 €",
        priceEn: "€950",
        noteDe: "Frei Von Ecken, 4-Sitzer · 85 × 130 cm",
        noteEn: "Frei Von Ecken, 4-seater · 85 × 130 cm",
        subjectDe: "Bestellung Frei Von Ecken Tisch 85 x 130 cm",
        subjectEn: "Order Frei Von Ecken table 85 x 130 cm",
        slides: [
          {
            src: "../assets/interior/tisch-aufgruenemkaro.png",
            altDe: "Esstisch auf grünem Karomuster",
            altEn: "Dining table on green carom pattern",
          },
          {
            src: "../assets/interior/freivonecken130-lager.png",
            altDe: "Frei Von Ecken Esstisch im Lager, 85 x 130 cm",
            altEn: "Frei Von Ecken dining table in warehouse, 85 x 130 cm",
          },
        ],
      },
      large: {
        priceDe: "1.800 €",
        priceEn: "€1,800",
        noteDe: "Frei Von Ecken, 8-Sitzer · 90 × 240 cm",
        noteEn: "Frei Von Ecken, 8-seater · 90 × 240 cm",
        subjectDe: "Bestellung Frei Von Ecken Tisch 90 x 240 cm",
        subjectEn: "Order Frei Von Ecken table 90 x 240 cm",
        slides: [
          {
            src: "../assets/interior/freiVonEcken250-saal.png",
            altDe: "Frei Von Ecken Esstisch im Saal, 90 x 240 cm",
            altEn: "Frei Von Ecken dining table in hall, 90 x 240 cm",
          },
          {
            src: "../assets/interior/freiVonEcken240-terrazzo.png",
            altDe: "Frei Von Ecken Esstisch auf Terrazzo, 90 x 240 cm",
            altEn: "Frei Von Ecken dining table on terrazzo, 90 x 240 cm",
          },
          {
            src: "../assets/interior/freiVonEcken240-studioweiss.png",
            altDe: "Frei Von Ecken Esstisch im Studio, 90 x 240 cm",
            altEn: "Frei Von Ecken dining table in studio, 90 x 240 cm",
          },
          {
            src: "../assets/interior/tisch-250.png",
            altDe: "Großer Esstisch",
            altEn: "Large dining table",
          },
        ],
      },
    };

    var tischState = { variant: "small", slide: 0 };

    function variantMeta(value) {
      return variants[value] || variants.small;
    }

    function renderSlider(slides) {
      slider.innerHTML = "";
      if (dotsWrap) dotsWrap.innerHTML = "";
      slides.forEach(function (slide, index) {
        var slideEl = document.createElement("div");
        slideEl.className = "kaufen-tile__slide" + (index === 0 ? " is-active" : "");
        var img = document.createElement("img");
        img.src = slide.src;
        img.alt = t(slide.altDe, slide.altEn);
        img.decoding = "async";
        slideEl.appendChild(img);
        slider.appendChild(slideEl);

        if (dotsWrap) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "kaufen-tile__dot" + (index === 0 ? " is-active" : "");
          dotsWrap.appendChild(dot);
        }
      });
      tischState.slide = 0;
    }

    function showSlide(index) {
      var slides = slider.querySelectorAll(".kaufen-tile__slide");
      var dots = dotsWrap ? dotsWrap.querySelectorAll(".kaufen-tile__dot") : [];
      if (!slides.length) return;
      tischState.slide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === tischState.slide);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("is-active", n === tischState.slide);
      });
    }

    function updateVariantUi() {
      var meta = variantMeta(tischState.variant);
      if (price) price.textContent = t(meta.priceDe, meta.priceEn);
      if (note) note.textContent = t(meta.noteDe, meta.noteEn);
      order.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(t(meta.subjectDe, meta.subjectEn));
      variantWrap.querySelectorAll("button[data-value]").forEach(function (btn) {
        var active = btn.getAttribute("data-value") === tischState.variant;
        btn.classList.toggle("is-active", active);
      });
    }

    function setVariant(value) {
      tischState.variant = value;
      renderSlider(variantMeta(value).slides);
      updateVariantUi();
      bindTischSliderControls();
    }

    function bindTischSliderControls() {
      var prev = sliderRoot ? sliderRoot.querySelector(".kaufen-tile__nav--prev") : null;
      var next = sliderRoot ? sliderRoot.querySelector(".kaufen-tile__nav--next") : null;
      var dots = dotsWrap ? dotsWrap.querySelectorAll(".kaufen-tile__dot") : [];
      if (prev && !sliderRoot.dataset.tischNavBound) {
        sliderRoot.dataset.tischNavBound = "1";
        prev.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(tischState.slide - 1);
        });
        next.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(tischState.slide + 1);
        });
      }
      dots.forEach(function (dot, n) {
        dot.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(n);
        });
      });
    }

    if (!figure.dataset.tischBound) {
      figure.dataset.tischBound = "1";
      bindChoiceGroup(variantWrap, function (value) {
        setVariant(value);
      });
      bindProductSliderSwipe(sliderRoot.querySelector(".kaufen-product__slider-stage"), {
        getCount: function () {
          return slider.querySelectorAll(".kaufen-tile__slide").length;
        },
        onPrev: function () {
          showSlide(tischState.slide - 1);
        },
        onNext: function () {
          showSlide(tischState.slide + 1);
        },
      });
    }

    setVariant(tischState.variant);
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

  var sportState = { gender: "mann", slide: 1 };

  var SPORT_VARIANTS = {
    mann: {
      slide: 1,
      priceDe: "69 €",
      priceEn: "€69",
      labelDe: "Sportshirt",
      labelEn: "Sports shirt",
      mailDe: "Vorbestellung Friday Circle Sportshirt",
      mailEn: "Pre-order Friday Circle sports shirt",
    },
    frau: {
      slide: 0,
      priceDe: "49 €",
      priceEn: "€49",
      labelDe: "Sport-BH mit starkem Halt",
      labelEn: "Sports bra with strong support",
      mailDe: "Vorbestellung Friday Circle Sport-BH",
      mailEn: "Pre-order Friday Circle sports bra",
    },
  };

  function bindSportPage() {
    var order = document.getElementById("kaufen-sport-order");
    var figure = document.getElementById("kaufen-sport-figure");
    if (!order || !figure) return;

    var sliderRoot = document.getElementById("kaufen-sport-product-slider");
    var slides = sliderRoot ? sliderRoot.querySelectorAll(".kaufen-tile__slide") : [];
    var dots = sliderRoot ? sliderRoot.querySelectorAll(".kaufen-tile__dot") : [];
    var prev = sliderRoot ? sliderRoot.querySelector(".kaufen-tile__nav--prev") : null;
    var next = sliderRoot ? sliderRoot.querySelector(".kaufen-tile__nav--next") : null;
    var genderWrap = document.getElementById("kaufen-sport-gender");
    var priceEl = document.getElementById("kaufen-sport-price");
    var variantLabel = document.getElementById("kaufen-sport-variant-label");

    function variantMeta(value) {
      return SPORT_VARIANTS[value] || SPORT_VARIANTS.mann;
    }

    function showSlide(index) {
      if (!slides.length) return;
      sportState.slide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("is-active", n === sportState.slide);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("is-active", n === sportState.slide);
      });
      var activeSlide = slides[sportState.slide];
      var slideVariant = activeSlide && activeSlide.getAttribute("data-variant");
      if (slideVariant && slideVariant !== sportState.gender) {
        setGender(slideVariant, false);
      }
    }

    function updateVariantUi() {
      var meta = variantMeta(sportState.gender);
      if (priceEl) priceEl.textContent = t(meta.priceDe, meta.priceEn);
      if (variantLabel) {
        variantLabel.querySelectorAll(".de-t").forEach(function (el) {
          el.textContent = meta.labelDe;
        });
        variantLabel.querySelectorAll(".en-t").forEach(function (el) {
          el.textContent = meta.labelEn;
        });
      }
      order.setAttribute(
        "href",
        "mailto:" +
          MAIL +
          "?subject=" +
          encodeURIComponent(t(meta.mailDe, meta.mailEn))
      );
      if (genderWrap) {
        genderWrap.querySelectorAll("button[data-value]").forEach(function (btn) {
          var active = btn.getAttribute("data-value") === sportState.gender;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-pressed", active ? "true" : "false");
        });
      }
    }

    function setGender(value, syncSlide) {
      sportState.gender = value;
      updateVariantUi();
      if (syncSlide !== false) showSlide(variantMeta(value).slide);
    }

    if (!figure.dataset.sportBound) {
      figure.dataset.sportBound = "1";
      bindChoiceGroup(genderWrap, function (value) {
        setGender(value, true);
      });
      if (prev) {
        prev.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(sportState.slide - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(sportState.slide + 1);
        });
      }
      dots.forEach(function (dot, n) {
        dot.addEventListener("click", function (e) {
          e.preventDefault();
          showSlide(n);
        });
      });
      bindProductSliderSwipe(sliderRoot.querySelector(".kaufen-product__slider-stage"), {
        getCount: function () {
          return slides.length;
        },
        onPrev: function () {
          showSlide(sportState.slide - 1);
        },
        onNext: function () {
          showSlide(sportState.slide + 1);
        },
      });
      setGender(sportState.gender, true);
    } else {
      updateVariantUi();
    }
  }

  function normalizeShopCategory(value) {
    if (!value || value === "all") return "all";
    if (value === "kleidung") return "textilien";
    return value;
  }

  function shopCategoryFromLocation() {
    return normalizeShopCategory((location.hash || "").replace(/^#/, ""));
  }

  function shopNavKeyFromPath() {
    var path = (location.pathname || "").toLowerCase();
    if (path.indexOf("/tisch.html") >= 0) return "moebel";
    if (path.indexOf("/sweater.html") >= 0) return "textilien";
    if (path.indexOf("/handtuch.html") >= 0) return "textilien";
    if (path.indexOf("/sportoberteil.html") >= 0) return "textilien";
    if (path.indexOf("/kunst.html") >= 0) return "kunst";
    if (path.indexOf("/modernmen.html") >= 0) return "buch";
    if (document.getElementById("kaufen-shop-grid")) return shopCategoryFromLocation();
    return "all";
  }

  function applyShopFilter(category) {
    var grid = document.getElementById("kaufen-shop-grid");
    if (!grid) return;
    var normalized = normalizeShopCategory(category);
    var isFiltered = normalized !== "all";
    grid.classList.toggle("is-filtered", isFiltered);
    grid.querySelectorAll(".kaufen-tile[data-shop-group]").forEach(function (tile) {
      tile.classList.toggle("is-filtered-out", isFiltered && tile.getAttribute("data-shop-group") !== normalized);
    });
    document.querySelectorAll(".kaufen-sidebar__nav [data-shop-nav]").forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-shop-nav") === normalized);
    });
  }

  function bindShopNav() {
    var grid = document.getElementById("kaufen-shop-grid");
    var active = shopNavKeyFromPath();

    if (grid) {
      applyShopFilter(active);
    } else {
      document.querySelectorAll(".kaufen-sidebar__nav [data-shop-nav]").forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-shop-nav") === active);
      });
    }

    document.querySelectorAll(".kaufen-sidebar__nav [data-shop-nav]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (!grid) return;
        e.preventDefault();
        var category = normalizeShopCategory(link.getAttribute("data-shop-nav"));
        var nextHash = category === "all" ? "" : "#" + category;
        if (location.hash !== nextHash) {
          history.replaceState(null, "", location.pathname + location.search + nextHash);
        }
        applyShopFilter(category);
      });
    });

    window.addEventListener("hashchange", function () {
      if (grid) applyShopFilter(shopCategoryFromLocation());
    });
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

  function wgaCatalogHref(sectionId, workId) {
    if (!sectionId) return "wolfganggrope.html#wga-catalog-root";
    var qs = "section=" + encodeURIComponent(sectionId) + "&view=catalog";
    if (workId) qs += "&work=" + encodeURIComponent(workId);
    return "wolfganggrope.html?" + qs + "#" + encodeURIComponent(sectionId);
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

    function updateCatalogLink() {
      if (!go) return;
      var slide = currentSlides[slideIndex];
      go.href = wgaCatalogHref(slide ? slide.sectionId : "");
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
      updateCatalogLink();
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
        link.href = wgaCatalogHref(item.sectionId, item.workId);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
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
      updateCatalogLink();
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

    var kunstSlider = document.getElementById("kaufen-kunst-slider");
    bindProductSliderSwipe(
      kunstSlider ? kunstSlider.querySelector(".kaufen-product__slider-stage") : null,
      {
        getCount: function () {
          return currentSlides.length;
        },
        onPrev: function () {
          showKunstSlide(slideIndex - 1);
        },
        onNext: function () {
          showKunstSlide(slideIndex + 1);
        },
      }
    );

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
      updateCatalogLink();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindTileAutoplay(document.getElementById("kaufen-sport-preview-slider"), 3000);
    bindTileSlider(document.getElementById("kaufen-handtuch-product-slider"));
    bindShopNav();
    bindSweaterPage();
    bindSportPage();
    bindTischPage();
    bindKunstPage();
  });

  document.addEventListener("fc-lang-change", function () {
    bindSweaterPage();
    bindSportPage();
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
