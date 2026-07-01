(function initFcProgramHero() {
  var root = document.getElementById("fc-program-hero");
  if (!root) return;

  var stage = root.closest(".fc-program-hero-stage");
  var wrap = root.closest(".fc-program-hero-wrap");
  var hoverRoot = stage || wrap || root;
  var prevBtn = stage && stage.querySelector(".fc-program-hero-arrow--prev");
  var nextBtn = stage && stage.querySelector(".fc-program-hero-arrow--next");
  var slides = root.querySelectorAll(".fc-program-hero__slide");
  var panels = root.querySelectorAll(".fc-program-hero__panel");
  var dots = root.querySelectorAll(".fc-program-hero__dot");
  var titleEl = document.getElementById("fc-program-hero-title");
  if (!slides.length) return;

  var SLIDE_LABELS = [
    { de: "Wer Gym-Buddys hat bleibt leichter in Bewegung", en: "If you have gym buddies, staying in motion is easier" },
    { de: "Dein Interior Game auf das nächste Level", en: "Take your interior game to the next level" },
    { de: "Dein fertig bepflanzter Lieblingsort in Berlin.", en: "Your ready-planted favourite spot in Berlin." },
    { de: "Eine Tour durch Berlin als open Source Plattform", en: "A tour through Berlin as an open-source platform" },
    { de: "Einordnung ins große Ganze für mehr Gelassenheit", en: "Context for the bigger picture — more calm" },
    {
      de: "Deine buchstäblich einzigartigen Produkte mit Zufriedenheitsgarantie",
      en: "Your literally unique products with satisfaction guarantee",
    },
  ];

  function updateTitle() {
    if (!titleEl || !SLIDE_LABELS[index]) return;
    var de = titleEl.querySelector(".de-t");
    var en = titleEl.querySelector(".en-t");
    if (de) de.textContent = SLIDE_LABELS[index].de;
    if (en) en.textContent = SLIDE_LABELS[index].en;
  }

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
    root.classList.toggle("is-lebensjahre", index === 4);
    updateTitle();
  }

  var index = 0;
  var timer;
  var paused = false;
  var visible = false;
  var mqFlush = window.matchMedia("(max-width: 760px)");
  var navEl = document.querySelector("header.nav");

  function next() {
    show(index + 1);
  }

  function prev() {
    show(index - 1);
  }

  function start() {
    stop();
    if (paused || !visible) return;
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

  hoverRoot.addEventListener("mouseenter", function () {
    paused = true;
    stop();
  });

  hoverRoot.addEventListener("mouseleave", function () {
    paused = false;
    if (visible) start();
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
              visible = entry.isIntersecting && entry.intersectionRatio > 0.12;
              if (visible && !paused) start();
              else stop();
            });
          },
          { threshold: [0, 0.12, 0.35] }
        )
      : null;

  if (io) {
    io.observe(root);
  } else {
    visible = true;
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
