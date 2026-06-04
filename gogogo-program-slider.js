(function initGoglProgramSlider() {
  var root = document.getElementById("gogl-joscha-grow");
  if (!root || !root.classList.contains("gogl-program-slider")) return;

  var slides = root.querySelectorAll(".gogl-program-slider__slide");
  if (!slides.length) return;

  var SLIDE_LABELS_DE = [
    "Deine Bewegungsgruppe",
    "Deine Micro-Bewegung",
    "Expertise für Deine Aktivitäten",
    "CIRCLE TRAINING",
    "Factfulness",
    "Upper Body",
    "Mobilityroutine",
    "Das Naheliegende wirkt oft so fern.",
  ];
  var SLIDE_LABELS_EN = [
    "Your movement group",
    "Your micro-movement",
    "Expertise for your activities",
    "CIRCLE TRAINING",
    "Factfulness",
    "Upper body",
    "Mobility routine",
    "What seems obvious often feels so far away.",
  ];
  var SLIDE_DEFAULT_DE = "Ein leichter Schritt, Dich täglich ausreichend zu bewegen.";
  var SLIDE_DEFAULT_EN = "A light step toward moving enough every day.";

  function currentLang() {
    return document.body.classList.contains("en") ? "en" : "de";
  }

  function slideLabels() {
    return currentLang() === "en" ? SLIDE_LABELS_EN : SLIDE_LABELS_DE;
  }

  var titleEl = document.getElementById("gogl-program-slider-title");
  var dots = root.querySelectorAll(".gogl-program-slider__dot[data-slide-to]");
  var prevBtn = document.querySelector(".gogl-program-slider-arrow--prev");
  var nextBtn = document.querySelector(".gogl-program-slider-arrow--next");

  var index = 0;
  var timer;
  var autoEnabled = false;
  var pausedByHover = false;
  var hoverRoot = root.closest(".gogl-joscha-grow-wrap") || root;
  var DISPLAY_ORDER = [0, 1, 2, 4, 3, 6, 7, 5];

  function show(i) {
    index = (i + slides.length) % slides.length;
    var activeNodeIndex = DISPLAY_ORDER[index] != null ? DISPLAY_ORDER[index] : index;
    slides.forEach(function (slide, n) {
      slide.classList.toggle("is-active", n === activeNodeIndex);
    });
    if (titleEl) {
      var labels = slideLabels();
      titleEl.textContent = labels[index] || (currentLang() === "en" ? SLIDE_DEFAULT_EN : SLIDE_DEFAULT_DE);
    }
    dots.forEach(function (dot) {
      var n = parseInt(dot.getAttribute("data-slide-to"), 10);
      var on = n === index;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function next() {
    show(index + 1);
  }

  function prev() {
    show(index - 1);
  }

  function clearTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restartTimer() {
    clearTimer();
    if (autoEnabled && !pausedByHover) {
      timer = window.setInterval(next, 5000);
    }
  }

  function start() {
    // Autoplay disabled: slides should only move manually.
    autoEnabled = false;
    clearTimer();
  }

  function stop() {
    autoEnabled = false;
    clearTimer();
  }

  hoverRoot.addEventListener("pointerenter", function () {
    pausedByHover = true;
    clearTimer();
  });
  hoverRoot.addEventListener("pointerleave", function (e) {
    if (e.relatedTarget && hoverRoot.contains(e.relatedTarget)) return;
    pausedByHover = false;
    restartTimer();
  });

  window.goglProgramSlider = {
    pause: stop,
    resume: start,
    isOnJoschaSlide: function () {
      return index === 3;
    },
  };

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var n = parseInt(dot.getAttribute("data-slide-to"), 10);
      if (!isNaN(n)) {
        show(n);
        start();
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prev();
      start();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      start();
    });
  }

  root.querySelectorAll(".gogl-hero-slide-next").forEach(function (heroSlideNext) {
    heroSlideNext.addEventListener("click", function () {
      next();
      start();
    });
  });

  var io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
                start();
              } else {
                stop();
              }
            });
          },
          { threshold: [0, 0.12, 0.35] }
        )
      : null;

  if (io) {
    io.observe(root);
  } else {
    start();
  }

  document.addEventListener("fc-lang-change", function () {
    show(index);
  });

  show(0);
})();
