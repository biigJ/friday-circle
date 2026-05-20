(function initFcProgramHero() {
  var root = document.getElementById("fc-program-hero");
  if (!root) return;

  var slides = root.querySelectorAll(".fc-program-hero__slide");
  var panels = root.querySelectorAll(".fc-program-hero__panel");
  var dots = root.querySelectorAll(".fc-program-hero__dot");
  if (!slides.length) return;

  var index = 0;
  var timer;
  var mqFlush = window.matchMedia("(max-width: 760px)");
  var navEl = document.querySelector("header.nav");

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
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, n) {
    dot.addEventListener("click", function () {
      show(n);
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

  function navHeight() {
    return navEl ? navEl.getBoundingClientRect().height : 72;
  }

  function boxedWidth() {
    var el = document.documentElement;
    var pad = 48;
    var probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;padding:0 var(--nav-pad-x);";
    document.body.appendChild(probe);
    pad = parseFloat(getComputedStyle(probe).paddingLeft) || pad;
    document.body.removeChild(probe);
    var max = parseFloat(getComputedStyle(el).getPropertyValue("--content-max")) || 1280;
    return Math.max(0, Math.min(window.innerWidth, max) - pad * 2);
  }

  function applyMobileFlush() {
    root.style.width = "";
    root.classList.add("is-flush");
  }

  function applyDesktopWidth(progress) {
    var boxed = boxedWidth();
    var full = window.innerWidth;
    var w = boxed + (full - boxed) * progress;
    var flush = progress >= 0.995;

    root.style.width = Math.round(w) + "px";
    root.classList.toggle("is-flush", flush);
    if (flush) {
      root.style.borderRadius = "0";
    } else {
      root.style.removeProperty("border-radius");
    }
  }

  function scrollProgress() {
    var nh = navHeight();
    var rect = root.getBoundingClientRect();
    var growStart = window.innerHeight * 0.72;
    var range = Math.max(growStart - nh, 1);

    if (rect.top >= growStart) return 0;
    if (rect.top <= nh) return 1;
    return 1 - (rect.top - nh) / range;
  }

  function updateHeroWidth() {
    navEl = document.querySelector("header.nav");

    if (mqFlush.matches) {
      applyMobileFlush();
      return;
    }

    root.classList.remove("is-flush");
    var nh = navHeight();
    document.documentElement.style.setProperty("--fc-nav-h", nh + "px");
    applyDesktopWidth(scrollProgress());
  }

  show(0);
  updateHeroWidth();
  window.addEventListener("scroll", updateHeroWidth, { passive: true });
  window.addEventListener("resize", updateHeroWidth, { passive: true });
  document.addEventListener("fc-chrome-ready", updateHeroWidth);
  if (mqFlush.addEventListener) {
    mqFlush.addEventListener("change", updateHeroWidth);
  } else if (mqFlush.addListener) {
    mqFlush.addListener(updateHeroWidth);
  }
})();
