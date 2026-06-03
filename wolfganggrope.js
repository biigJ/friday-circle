(function () {
  const CATALOG_URL = "data/wga-catalog.json";
  let catalog = null;
  const worksById = {};

  function resolveAsset(path) {
    if (!path || /^https?:\/\//i.test(path)) return path;
    try {
      return new URL(path, document.baseURI || location.href).href;
    } catch (e) {
      return path;
    }
  }

  function workImage(work) {
    const src =
      (work.images && work.images[0]) ||
      (catalog && catalog.meta && catalog.meta.placeholder) ||
      "assets/wolfgang-grope/placeholder.svg";
    return resolveAsset(src);
  }

  const heroTrack = document.getElementById("wga-hero-track");
  const heroDots = document.getElementById("wga-hero-dots");
  const catalogRoot = document.getElementById("wga-catalog-root");
  const heroHeadline = document.getElementById("wga-hero-headline");

  const popup = document.getElementById("wga-popup");
  const popupTitle = document.getElementById("wga-popup-title");
  const popupMeta = document.getElementById("wga-popup-meta");
  const popupBody = document.getElementById("wga-popup-body");
  const popupPrice = document.getElementById("wga-popup-price");
  const sliderTrack = document.getElementById("wga-popup-track");
  const sliderDots = document.getElementById("wga-popup-dots");

  let heroIndex = 0;
  let heroTimer = null;
  let slideIndex = 0;
  let slideCount = 0;
  let openWorkId = null;
  const heroLumaCache = new Map();
  const HERO_LOGO_LUMA_THRESHOLD = 142;

  function isPastHero() {
    const hero = document.querySelector(".wga-hero__bleed");
    return !hero || hero.getBoundingClientRect().bottom <= 1;
  }

  function activeHeroImg() {
    if (!heroTrack) return null;
    const slide = heroTrack.children[heroIndex];
    return slide ? slide.querySelector("img") : null;
  }

  function coverVisibleRect(img) {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const dw = img.clientWidth || 1;
    const dh = img.clientHeight || 1;
    const scale = Math.max(dw / nw, dh / nh);
    const vw = dw / scale;
    const vh = dh / scale;
    const sx = (nw - vw) / 2;
    const sy = (nh - vh) / 2;
    return { sx, sy, vw, vh };
  }

  function sampleHeroLogoLuma(img, done) {
    if (!img) {
      done(128);
      return;
    }
    const key = (img.currentSrc || img.src) + "@" + img.clientWidth;
    if (heroLumaCache.has(key)) {
      done(heroLumaCache.get(key));
      return;
    }
    const measure = function () {
      try {
        const canvas = document.createElement("canvas");
        const tw = 64;
        const th = 40;
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        if (!nw || !nh) {
          done(128);
          return;
        }
        const vis = coverVisibleRect(img);
        const cropW = Math.max(1, vis.vw * 0.42);
        const cropH = Math.max(1, vis.vh * 0.2);
        ctx.drawImage(img, vis.sx, vis.sy, cropW, cropH, 0, 0, tw, th);
        const data = ctx.getImageData(0, 0, tw, th).data;
        let sum = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        const avg = sum / pixels;
        heroLumaCache.set(key, avg);
        done(avg);
      } catch (e) {
        done(128);
      }
    };
    if (img.complete && img.naturalWidth) measure();
    else img.addEventListener("load", measure, { once: true });
  }

  function applyHeroLogoTheme() {
    const nav = document.querySelector(".wga-nav");
    if (!nav || isPastHero()) return;

    const slideMeta = catalog?.heroSlides?.[heroIndex];
    if (slideMeta?.logoOn === "dark") {
      nav.classList.add("wga-nav--logo-dark");
      nav.classList.remove("wga-nav--logo-light");
      return;
    }
    if (slideMeta?.logoOn === "light") {
      nav.classList.add("wga-nav--logo-light");
      nav.classList.remove("wga-nav--logo-dark");
      return;
    }

    const index = heroIndex;
    const img = activeHeroImg();
    sampleHeroLogoLuma(img, function (luma) {
      if (isPastHero() || heroIndex !== index) return;
      const darkLogo = luma >= HERO_LOGO_LUMA_THRESHOLD;
      nav.classList.toggle("wga-nav--logo-dark", darkLogo);
      nav.classList.toggle("wga-nav--logo-light", !darkLogo);
    });
  }

  function updateNavTheme() {
    const nav = document.querySelector(".wga-nav");
    if (!nav) return;
    const past = isPastHero();
    nav.classList.toggle("wga-nav--on-light", past);
    if (past) {
      nav.classList.remove("wga-nav--logo-dark", "wga-nav--logo-light");
      return;
    }
    applyHeroLogoTheme();
  }

  function indexWorks() {
    Object.keys(worksById).forEach((k) => delete worksById[k]);
    (catalog?.sections || []).forEach((section) => {
      (section.works || []).forEach((work) => {
        if (work.id && !work.empty) worksById[work.id] = work;
      });
    });
  }

  function heroSlideCount() {
    if (heroTrack && heroTrack.children.length) return heroTrack.children.length;
    return (catalog && catalog.heroSlides && catalog.heroSlides.length) || 0;
  }

  function setHeroSlide(index) {
    const count = heroSlideCount();
    if (!heroTrack || !count) return;
    heroIndex = (index + count) % count;
    heroTrack.style.transform = "translateX(-" + heroIndex * 100 + "%)";
    if (heroDots) {
      heroDots.querySelectorAll(".wga-hero__dot").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === heroIndex);
      });
    }
    applyHeroLogoTheme();
  }

  function startHeroAutoplay() {
    if (heroTimer) window.clearInterval(heroTimer);
    if (heroSlideCount() <= 1) return;
    heroTimer = window.setInterval(function () {
      setHeroSlide(heroIndex + 1);
    }, 6000);
  }

  function initHero() {
    const slides = catalog?.heroSlides || [];
    if (!heroTrack) return;
    heroTrack.innerHTML = "";
    if (heroDots) heroDots.innerHTML = "";

    slides.forEach(function (slide, i) {
      const el = document.createElement("div");
      el.className = "wga-hero__slide";
      const img = document.createElement("img");
      img.src = resolveAsset(slide.src);
      img.alt = slide.alt || "";
      img.decoding = "async";
      img.loading = i === 0 ? "eager" : "lazy";
      img.addEventListener("load", function () {
        sampleHeroLogoLuma(img, function () {
          if (heroIndex === i) applyHeroLogoTheme();
        });
      });
      el.appendChild(img);
      heroTrack.appendChild(el);

      if (heroDots) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "wga-hero__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Hero-Bild " + (i + 1));
        dot.addEventListener("click", function () {
          setHeroSlide(i);
          startHeroAutoplay();
        });
        heroDots.appendChild(dot);
      }
    });

    if (heroDots) heroDots.hidden = slides.length <= 1;
    setHeroSlide(0);
    startHeroAutoplay();
    updateNavTheme();
  }

  function catalogNo(work) {
    const src = (work.images && work.images[0]) || "";
    const m = src.match(/-(\d+)\.(?:jpe?g|png|webp|svg)$/i);
    return m ? m[1] : "";
  }

  function tileLabel(work) {
    const parts = [];
    if (work.title) parts.push(work.title);
    const no = catalogNo(work);
    if (no) parts.push("Nr. " + no);
    if (work.year && work.year !== "—") parts.push(String(work.year));
    return parts.join(" · ") || "Werk";
  }

  function createTile(work) {
    if (work.empty) return null;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "wga-tile wga-tile--work";
    btn.setAttribute("data-wga-work", work.id);

    const media = document.createElement("span");
    media.className = "wga-tile__media";
    const img = document.createElement("img");
    img.src = workImage(work);
    img.alt = tileLabel(work);
    img.decoding = "async";
    img.loading = "lazy";
    media.appendChild(img);

    const hover = document.createElement("span");
    hover.className = "wga-tile__hover";
    const label = document.createElement("span");
    label.className = "wga-tile__label";
    label.textContent = work.title || "Werk";
    const sub = document.createElement("span");
    sub.className = "wga-tile__sub";
    const no = catalogNo(work);
    sub.textContent = [no ? "Nr. " + no : "", work.medium, work.year]
      .filter(function (v) {
        return v && v !== "—";
      })
      .join(" · ");
    hover.appendChild(label);
    hover.appendChild(sub);

    btn.appendChild(media);
    btn.appendChild(hover);
    btn.addEventListener("click", function () {
      openPopup(work.id);
    });
    return btn;
  }

  function renderCatalog() {
    if (!catalogRoot || !catalog) return;
    catalogRoot.innerHTML = "";

    catalog.sections.forEach(function (section) {
      const sec = document.createElement("section");
      sec.className = "wga-section";
      sec.id = section.id;

      const shell = document.createElement("div");
      shell.className = "wga-shell";

      const h2 = document.createElement("h2");
      h2.className = "wga-section__title";
      h2.textContent = section.title;

      const grid = document.createElement("div");
      grid.className = "wga-grid";

      (section.works || []).forEach(function (work) {
        const tile = createTile(work);
        if (tile) grid.appendChild(tile);
      });

      shell.appendChild(h2);
      shell.appendChild(grid);
      sec.appendChild(shell);
      catalogRoot.appendChild(sec);
    });
  }

  function setSlide(index) {
    if (!slideCount) return;
    slideIndex = (index + slideCount) % slideCount;
    sliderTrack.style.transform = "translateX(-" + slideIndex * 100 + "%)";
    sliderDots.querySelectorAll(".wga-slider__dot").forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === slideIndex);
    });
  }

  function buildPopupSlider(images, title) {
    sliderTrack.innerHTML = "";
    sliderDots.innerHTML = "";
    slideCount = images.length;
    slideIndex = 0;

    images.forEach(function (src, i) {
      const fig = document.createElement("figure");
      fig.className = "wga-slider__slide";
      const img = document.createElement("img");
      img.src = src;
      img.alt = title + " — Bild " + (i + 1);
      img.decoding = "async";
      fig.appendChild(img);
      sliderTrack.appendChild(fig);

      if (slideCount > 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "wga-slider__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Bild " + (i + 1));
        dot.addEventListener("click", function () {
          setSlide(i);
        });
        sliderDots.appendChild(dot);
      }
    });

    sliderTrack.style.transform = "translateX(0)";
    sliderDots.hidden = slideCount <= 1;
  }

  function openPopup(id) {
    const work = worksById[id];
    if (!work || !popup) return;
    openWorkId = id;
    popupTitle.textContent = work.title || "Werk";
    const meta = [work.year, work.medium, work.dimensions].filter(function (v) {
      return v && v !== "—";
    });
    popupMeta.textContent = meta.join(" · ");
    popupBody.textContent = work.body || "";
    if (work.price) {
      popupPrice.textContent = work.price;
      popupPrice.hidden = false;
    } else {
      popupPrice.textContent = "";
      popupPrice.hidden = true;
    }
    buildPopupSlider(
      (work.images || [catalog.meta.placeholder]).map(resolveAsset),
      work.title || "Werk"
    );
    popup.hidden = false;
    popup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePopup() {
    if (!popup) return;
    openWorkId = null;
    popup.hidden = true;
    popup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function applyMeta() {
    if (heroHeadline && catalog?.meta?.heroHeadline) {
      heroHeadline.textContent = catalog.meta.heroHeadline;
    }
    document.title = "Wolfgang Grope Art — Friday Circle";
  }

  function initHeroFromDom() {
    if (!heroTrack || heroTrack.children.length < 1) return;
    const slides = heroTrack.querySelectorAll(".wga-hero__slide");
    if (heroDots) {
      heroDots.innerHTML = "";
      slides.forEach(function (_, i) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "wga-hero__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Hero-Bild " + (i + 1));
        dot.addEventListener("click", function () {
          setHeroSlide(i);
          startHeroAutoplay();
        });
        heroDots.appendChild(dot);
      });
      heroDots.hidden = slides.length <= 1;
    }
    catalog = catalog || { heroSlides: [], sections: [] };
    catalog.heroSlides = Array.from(slides).map(function (slide, i) {
      const img = slide.querySelector("img");
      return { src: img ? img.getAttribute("src") : "", alt: img ? img.alt : "" };
    });
    heroIndex = 0;
    heroTrack.style.transform = "translateX(0)";
    startHeroAutoplay();
    updateNavTheme();
  }

  function initNavOnLight() {
    updateNavTheme();
    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme, { passive: true });
  }

  async function loadCatalog() {
    if (window.__WGA_CATALOG__) {
      catalog = window.__WGA_CATALOG__;
    }
    if (!catalog) {
      try {
        const res = await fetch(CATALOG_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        catalog = await res.json();
      } catch (err) {
        console.warn("WGA catalog fetch failed:", err.message);
      }
    }
    if (!catalog) {
      initHeroFromDom();
      initNavOnLight();
      return;
    }
    indexWorks();
    applyMeta();
    initHero();
    renderCatalog();
    initNavOnLight();
  }

  if (popup) {
    popup.querySelectorAll("[data-wga-popup-close]").forEach(function (el) {
      el.addEventListener("click", closePopup);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && popup && !popup.hidden) closePopup();
    if (popup && popup.hidden) return;
    if (e.key === "ArrowLeft") setSlide(slideIndex - 1);
    if (e.key === "ArrowRight") setSlide(slideIndex + 1);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadCatalog);
  } else {
    loadCatalog();
  }
})();
