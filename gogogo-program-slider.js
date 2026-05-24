(function initGoglProgramSlider() {
  var root = document.getElementById("gogl-joscha-grow");
  if (!root || !root.classList.contains("gogl-program-slider")) return;

  var slides = root.querySelectorAll(".gogl-program-slider__slide");
  if (!slides.length) return;

  var SLIDE_LABELS = [
    "Ein leichter Schritt, Dich täglich ausreichend zu bewegen.",
    "gogogo App",
    "Den passenden Trainer",
    "Factfulness",
    "Upper Body Basics",
    "Cycle Training",
    "Triff Joscha",
    "3 Minuten Aufwärm-Routine",
  ];

  var titleEl = document.getElementById("gogl-program-slider-title");
  var dots = root.querySelectorAll(".gogl-program-slider__dot[data-slide-to]");
  var prevBtn = document.querySelector(".gogl-program-slider-arrow--prev");
  var nextBtn = document.querySelector(".gogl-program-slider-arrow--next");

  var index = 0;
  var timer;
  var autoEnabled = false;
  var pausedByHover = false;
  var hoverRoot = root.closest(".gogl-joscha-grow-wrap") || root;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (slide, n) {
      slide.classList.toggle("is-active", n === index);
    });
    if (titleEl && SLIDE_LABELS[index]) {
      titleEl.textContent = SLIDE_LABELS[index];
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
    autoEnabled = true;
    restartTimer();
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

  show(0);
})();
