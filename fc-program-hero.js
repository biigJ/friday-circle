(function initFcProgramHero() {
  var root = document.getElementById("fc-program-hero");
  if (!root) return;

  var section = document.getElementById("fc-program-hero-section");
  var stage = document.querySelector(".fc-program-hero-stage");
  var slides = root.querySelectorAll(".fc-program-hero__slide");
  var panels = root.querySelectorAll(".fc-program-hero__panel");
  var dots = root.querySelectorAll(".fc-program-hero__dot");
  if (!slides.length) return;

  var index = 0;
  var timer;
  var mqFlush = window.matchMedia("(max-width: 760px)");
  var navEl = document.querySelector("header.nav");
  var stickScrollY = null;
  var GROW_PX = 420;

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
    if (stage) return stage.getBoundingClientRect().width;
    var pad = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var navPad = 48;
    try {
      var tmp = document.createElement("div");
      tmp.style.padding = "0 var(--nav-pad-x)";
      document.documentElement.appendChild(tmp);
      navPad = parseFloat(getComputedStyle(tmp).paddingLeft) || navPad;
      document.documentElement.removeChild(tmp);
    } catch (e) {}
    var max = 1280;
    try {
      max = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--content-max")) || max;
    } catch (e2) {}
    return Math.min(window.innerWidth - navPad * 2, max);
  }

  function applyMobileFlush() {
    root.style.width = "";
    root.style.marginLeft = "";
    root.style.marginRight = "";
    root.classList.add("is-flush");
  }

  function applyDesktopWidth(progress) {
    var boxed = boxedWidth();
    var full = window.innerWidth;
    var w = boxed + (full - boxed) * progress;
    var flush = progress >= 0.995;

    root.style.width = Math.round(w) + "px";
    root.style.marginLeft = flush ? "calc(50% - 50vw)" : "auto";
    root.style.marginRight = flush ? "calc(50% - 50vw)" : "auto";
    root.classList.toggle("is-flush", flush);
    if (flush) {
      root.style.borderRadius = "0";
    } else {
      root.style.removeProperty("border-radius");
    }
  }

  function refreshNav() {
    navEl = document.querySelector("header.nav");
  }

  function updateHeroWidth() {
    refreshNav();
    if (mqFlush.matches) {
      stickScrollY = null;
      applyMobileFlush();
      return;
    }

    var nh = navHeight();
    document.documentElement.style.setProperty("--fc-nav-h", nh + "px");

    var rect = root.getBoundingClientRect();
    var atNav = rect.top <= nh + 1;

    if (!atNav) {
      stickScrollY = null;
      applyDesktopWidth(0);
      return;
    }

    if (stickScrollY === null) {
      stickScrollY = window.scrollY;
    }

    var scrolled = window.scrollY - stickScrollY;
    var growPx = Math.max(GROW_PX, window.innerHeight * 0.38);
    var progress = Math.min(1, Math.max(0, scrolled / growPx);

    if (section) {
      var sectionRect = section.getBoundingClientRect();
      var runwayLeft = sectionRect.bottom - nh - rect.height;
      if (runwayLeft < 0 && progress < 1) {
        progress = Math.max(progress, 1 + runwayLeft / Math.max(growPx, 1));
        progress = Math.min(1, Math.max(0, progress));
      }
    }

    applyDesktopWidth(progress);
  }

  show(0);
  updateHeroWidth();
  window.addEventListener("scroll", updateHeroWidth, { passive: true });
  window.addEventListener("resize", updateHeroWidth, { passive: true });
  if (mqFlush.addEventListener) {
    mqFlush.addEventListener("change", updateHeroWidth);
  } else if (mqFlush.addListener) {
    mqFlush.addListener(updateHeroWidth);
  }

  var headerMount = document.getElementById("fc-site-header");
  if (headerMount && typeof MutationObserver !== "undefined") {
    new MutationObserver(updateHeroWidth).observe(headerMount, { childList: true, subtree: true });
  }
})();
