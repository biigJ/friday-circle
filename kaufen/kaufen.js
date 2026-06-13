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
    if (!go || !options) return;

    var selected = "grafik";

    bindChoiceGroup(options, function (value) {
      selected = value;
    });

    go.addEventListener("click", function () {
      var target = "../wolfganggrope.html#wga-catalog-root";
      if (selected === "malerei") target += "?focus=malerei";
      if (selected === "keramik") target += "?focus=keramik";
      window.location.href = target;
    });
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
