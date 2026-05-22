(function initGoglProgramSlider() {
  var root = document.getElementById("gogl-joscha-grow");
  if (!root || !root.classList.contains("gogl-program-slider")) return;

  var slides = root.querySelectorAll(".gogl-program-slider__slide");
  if (!slides.length) return;

  var SLIDE_LABELS = [
    "Factfulness",
    "Aufwärmen mit der Mobility-Routine",
    "Cycle Training",
    "gogogo App",
    "Lohnt sich ein Personal Trainer",
    "Triff Joscha",
    "Upper Body Basics",
  ];

  var titleEl = document.getElementById("gogl-program-slider-title");
  var dots = root.querySelectorAll(".gogl-program-slider__dot[data-slide-to]");
  var prevBtn = document.querySelector(".gogl-program-slider-arrow--prev");
  var nextBtn = document.querySelector(".gogl-program-slider-arrow--next");

  var index = 0;
  var timer;

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

  function start() {
    stop();
    timer = window.setInterval(next, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  window.goglProgramSlider = {
    pause: stop,
    resume: start,
    isOnJoschaSlide: function () {
      return index === 0;
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
