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
  var sliderWrap = root.closest(".gogl-joscha-grow-wrap") || root;
  var mobileNext = sliderWrap.querySelector(".gogl-program-slider__mobile-next");
  var mobileNextLabelEl = mobileNext ? mobileNext.querySelector(".gogl-hero-slide-next__label") : null;
  var mobileNextButtonEl = mobileNext ? mobileNext.querySelector("button") : null;

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

    if (mobileNextLabelEl) {
      var activeSlide = root.querySelector(".gogl-program-slider__slide.is-active");
      var labelEl =
        activeSlide &&
        (activeSlide.querySelector(".gogl-slide-footer-chrome .gogl-hero-slide-next__label") ||
          activeSlide.querySelector(".gogl-hero-slide-next__label"));

      var labelText = labelEl && labelEl.textContent ? labelEl.textContent.trim() : "";
      mobileNextLabelEl.textContent = labelText;
      if (mobileNextButtonEl) {
        var prefix = currentLang() === "en" ? "Next program: " : "Nächstes Programm: ";
        mobileNextButtonEl.setAttribute("aria-label", labelText ? prefix + labelText : prefix.trim());
      }
    }
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

  sliderWrap.querySelectorAll(".gogl-hero-slide-next").forEach(function (heroSlideNext) {
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

  var swipeStartX = 0;
  var swipeStartY = 0;
  var swipeEligible = false;
  var swipeThreshold = 48;

  root.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length !== 1) return;
      if (
        e.target.closest(
          ".gogl-tile, button, a, input, textarea, select, .gogl-program-slide-card__play"
        )
      ) {
        swipeEligible = false;
        return;
      }
      swipeEligible = true;
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchmove",
    function (e) {
      if (!swipeEligible || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - swipeStartX;
      var dy = e.touches[0].clientY - swipeStartY;
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  root.addEventListener(
    "touchend",
    function (e) {
      if (!swipeEligible) return;
      swipeEligible = false;
      var dx = e.changedTouches[0].clientX - swipeStartX;
      var dy = e.changedTouches[0].clientY - swipeStartY;
      if (Math.abs(dx) < swipeThreshold || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) next();
      else prev();
      start();
    },
    { passive: true }
  );

  show(0);
})();
