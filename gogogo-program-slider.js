(function initGoglProgramSlider() {
  var root = document.getElementById("gogl-joscha-grow");
  if (!root || !root.classList.contains("gogl-program-slider")) return;

  var SLIDE_LABELS_DE = [
    "genügend Bewegung für Dich",
    "Deine Micro-Bewegung",
    "Expertise für Deine Aktivitäten",
    "CIRCLE TRAINING",
    "Factfulness",
    "Upper Body",
    "Mobilityroutine",
    "Das Naheliegende wirkt oft so fern.",
  ];
  var SLIDE_LABELS_EN = [
    "enough movement for you",
    "Your micro-movement",
    "Expertise for your activities",
    "CIRCLE TRAINING",
    "Factfulness",
    "Upper body",
    "Mobility routine",
    "What seems obvious often feels so far away.",
  ];
  var SLIDE_DEFAULT_DE = "genügend Bewegung für Dich";
  var SLIDE_DEFAULT_EN = "enough movement for you";

  var DISPLAY_ORDER = [0, 1, 2, 4, 3, 6, 7, 5];

  var viewport = root.querySelector(".gogl-program-slider__viewport");
  var track = viewport && viewport.querySelector(".gogl-program-slider__track");
  if (viewport && !track) {
    track = document.createElement("div");
    track.className = "gogl-program-slider__track";
    DISPLAY_ORDER.forEach(function (n) {
      var slide = root.querySelector('.gogl-program-slider__slide[data-slide="' + n + '"]');
      if (slide) track.appendChild(slide);
    });
    viewport.appendChild(track);
  }

  var slides = track ? track.querySelectorAll(".gogl-program-slider__slide") : root.querySelectorAll(".gogl-program-slider__slide");
  if (!slides.length) return;

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

  function applyTrackPosition(animate) {
    if (!track) return;
    track.style.transition = animate !== false ? "transform 0.45s ease" : "none";
    track.style.transform = "translateX(-" + index * 100 + "%)";
  }

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (slide, n) {
      slide.classList.toggle("is-active", n === index);
    });
    applyTrackPosition(true);
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
      var activeSlide = slides[index];
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

  if (window.FcSwipeSlider && viewport && track) {
    window.FcSwipeSlider.bind({
      zone: viewport,
      track: track,
      mode: "percent",
      getIndex: function () {
        return index;
      },
      getCount: function () {
        return slides.length;
      },
      onIndexChange: function (newIndex) {
        show(newIndex);
        start();
      },
      ignore: function (target) {
        return !!target.closest(
          ".gogl-tile, button, a, input, textarea, select, .gogl-program-slide-card__play"
        );
      },
      loop: true,
    });
  }

  show(0);
})();
