(function initFcProgramHero() {
  var root = document.getElementById("fc-program-hero");
  if (!root) return;

  var slides = root.querySelectorAll(".fc-program-hero__slide");
  var panels = root.querySelectorAll(".fc-program-hero__panel");
  var dots = root.querySelectorAll(".fc-program-hero__dot");
  if (!slides.length) return;

  var index = 0;
  var timer;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      s.classList.toggle("is-active", n === index);
    });
    panels.forEach(function (p, n) {
      p.classList.toggle("is-active", n === index);
    });
    dots.forEach(function (d, n) {
      d.classList.toggle("is-active", n === index);
      d.setAttribute("aria-selected", n === index ? "true" : "false");
    });
  }

  function next() {
    show(index + 1);
  }

  function start() {
    stop();
    timer = window.setInterval(next, 5500);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
  }

  dots.forEach(function (dot, n) {
    dot.addEventListener("click", function () {
      show(n);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) start();
  });

  show(0);
  start();
})();
