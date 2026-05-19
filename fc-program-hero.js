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
    timer = window.setInterval(next, 3000);
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

  var mqFlush = window.matchMedia("(max-width: 760px)");
  var navEl = document.querySelector("header.nav");

  function navHeight() {
    return navEl ? navEl.getBoundingClientRect().height : 72;
  }

  function updateHeroWidth() {
    if (mqFlush.matches) {
      root.style.setProperty("--fc-hero-grow", "1");
      root.classList.add("is-flush");
      return;
    }
    var rect = root.getBoundingClientRect();
    var nh = navHeight();
    var growStart = window.innerHeight * 0.72;
    var range = Math.max(growStart - nh, 1);
    var progress = 1 - (rect.top - nh) / range;
    progress = Math.min(1, Math.max(0, progress));
    root.style.setProperty("--fc-hero-grow", String(progress));
    root.classList.toggle("is-flush", progress >= 0.995);
  }

  updateHeroWidth();
  window.addEventListener("scroll", updateHeroWidth, { passive: true });
  window.addEventListener("resize", updateHeroWidth, { passive: true });
  if (mqFlush.addEventListener) {
    mqFlush.addEventListener("change", updateHeroWidth);
  } else if (mqFlush.addListener) {
    mqFlush.addListener(updateHeroWidth);
  }
})();
