(function () {
  const CATALOG_URL = "data/wga-catalog.json";
  let catalog = null;
  const worksById = {};
  const workOrder = [];

  function resolveAsset(path) {
    if (!path || /^https?:\/\//i.test(path)) return path;
    const normalized = String(path).normalize("NFC");
    try {
      return new URL(normalized, document.baseURI || location.href).href;
    } catch (e) {
      return normalized;
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
  const heroCaption = document.getElementById("wga-hero-caption");
  const heroPrev = document.getElementById("wga-hero-prev");
  const heroNext = document.getElementById("wga-hero-next");
  const heroArrows = document.getElementById("wga-hero-arrows");
  const catalogRoot = document.getElementById("wga-catalog-root");
  const heroHeadline = document.getElementById("wga-hero-headline");

  const popup = document.getElementById("wga-popup");
  const popupTitle = document.getElementById("wga-popup-title");
  const popupUnavailable = document.getElementById("wga-popup-unavailable");
  const popupIndex = document.getElementById("wga-popup-index");
  const popupNav = document.getElementById("wga-popup-nav");
  const popupPrev = document.getElementById("wga-popup-prev");
  const popupNext = document.getElementById("wga-popup-next");
  const sliderTrack = document.getElementById("wga-popup-track");
  const sliderDots = document.getElementById("wga-popup-dots");

  const bioOverlay = document.getElementById("wga-bio");
  const bioOpen = document.getElementById("wga-bio-open");
  const bioText = document.getElementById("wga-bio-text");
  const chaptersNav = document.getElementById("wga-chapters-nav");
  const chaptersBtn = document.getElementById("wga-chapters-btn");
  const chaptersMenu = document.getElementById("wga-chapters-menu");
  const BIO_URL = "data/wga-bio.txt";
  let bioLoaded = false;

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
    workOrder.length = 0;
    (catalog?.sections || []).forEach((section) => {
      if (!/^\d{2}\s/.test(section.chapter || "")) return;
      (section.works || []).forEach((work) => {
        if (work.id && !work.empty) {
          worksById[work.id] = work;
          workOrder.push(work.id);
        }
      });
    });
  }

  function updatePopupNav() {
    if (popupNav) popupNav.hidden = workOrder.length <= 1;
  }

  function stepPopupWork(delta) {
    if (!openWorkId || workOrder.length <= 1) return;
    const idx = workOrder.indexOf(openWorkId);
    if (idx < 0) return;
    const nextId = workOrder[(idx + delta + workOrder.length) % workOrder.length];
    openPopup(nextId);
  }

  function initPopupNav() {
    if (popupPrev && !popupPrev.dataset.wgaBound) {
      popupPrev.dataset.wgaBound = "1";
      popupPrev.addEventListener("click", function () {
        stepPopupWork(-1);
      });
    }
    if (popupNext && !popupNext.dataset.wgaBound) {
      popupNext.dataset.wgaBound = "1";
      popupNext.addEventListener("click", function () {
        stepPopupWork(1);
      });
    }
    updatePopupNav();
  }

  function heroSlideCount() {
    if (heroTrack && heroTrack.children.length) return heroTrack.children.length;
    return (catalog && catalog.heroSlides && catalog.heroSlides.length) || 0;
  }

  function heroCaptionText(slide) {
    if (!slide) return "";
    const parts = [slide.year, slide.medium].filter(function (v) {
      return v && v !== "—";
    });
    return parts.join(" · ");
  }

  function updateHeroCaption() {
    if (!heroCaption) return;
    const slide = catalog?.heroSlides?.[heroIndex];
    heroCaption.textContent = heroCaptionText(slide);
  }

  function updateHeroControls() {
    const count = heroSlideCount();
    const hideNav = count <= 1;
    if (heroDots) heroDots.hidden = hideNav;
    if (heroArrows) heroArrows.hidden = hideNav;
  }

  function heroStep(delta) {
    setHeroSlide(heroIndex + delta);
    startHeroAutoplay();
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
    updateHeroCaption();
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
    if (heroArrows) heroArrows.hidden = slides.length <= 1;
    setHeroSlide(0);
    startHeroAutoplay();
    updateNavTheme();
    initHeroSwipe();
  }

  function initHeroNav() {
    if (heroPrev && !heroPrev.dataset.wgaBound) {
      heroPrev.dataset.wgaBound = "1";
      heroPrev.addEventListener("click", function () {
        heroStep(-1);
      });
    }
    if (heroNext && !heroNext.dataset.wgaBound) {
      heroNext.dataset.wgaBound = "1";
      heroNext.addEventListener("click", function () {
        heroStep(1);
      });
    }
    updateHeroControls();
  }

  function chapterDisplayName(chapter) {
    return String(chapter || "")
      .replace(/^\d{2}\s+/, "")
      .trim();
  }

  function normalizeYearLabel(value) {
    return String(value || "")
      .trim()
      .replace(/-/g, "–");
  }

  function deriveSectionYear(section) {
    const folder = String(section.title || section.folder || "").trim();
    if (!folder) return "";

    const range = folder.match(/\b((?:19|20)\d{2})-((?:19|20)\d{2})\b/);
    if (range) return `${range[1]}–${range[2]}`;

    const trailingAfterDash = folder.match(/-\s*((?:19|20)\d{2})\s*$/);
    if (trailingAfterDash) return trailingAfterDash[1];

    const beforeParen = folder.match(/\b((?:19|20)\d{2})\s*\(/);
    if (beforeParen) return beforeParen[1];

    const trailingYear = folder.match(/\b((?:19|20)\d{2})\s*$/);
    if (trailingYear) return trailingYear[1];

    return "";
  }

  function sectionDisplayName(section, sectionYear) {
    const label = (section.sectionLabel || "").trim();
    if (!label) return "";
    if (sectionYear && normalizeYearLabel(label) === normalizeYearLabel(sectionYear)) return "";
    if (/^\d{4}(?:[–-]\d{4})?$/.test(label)) return "";
    return label;
  }

  function shouldShowSectionHeader(section) {
    const sectionYear = deriveSectionYear(section);
    const sectionName = sectionDisplayName(section, sectionYear);
    return !!(sectionYear || sectionName);
  }

  function popupIndexLine(work) {
    const id = work.catalogId || work.id || "";
    const match = String(id).match(/^(?:wg|WG)-(\d+)-(\d+)$/i);
    if (!match) return "";
    const chapter = match[1].padStart(2, "0");
    const workNo = match[2].padStart(3, "0");
    const yearMatch = work.year && work.year !== "—" ? String(work.year).match(/(\d{4})/) : null;
    if (yearMatch) return `${chapter}-${workNo}-${yearMatch[1]}`;
    return `${chapter}-${workNo}`;
  }

  function catalogNo(work) {
    if (work.catalogId) {
      const m = String(work.catalogId).match(/-(\d+)$/i);
      if (m) return m[1];
    }
    if (work.id && /^wg-\d+-\d+$/i.test(work.id)) {
      const m = work.id.match(/-(\d+)$/i);
      if (m) return m[1];
    }
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

  function createBerlinDot(work) {
    const dot = document.createElement("span");
    const unavailable = work && work.berlinStatus === "unavailable";
    dot.className = "wga-berlin-dot" + (unavailable ? " wga-berlin-dot--unavailable" : "");
    dot.setAttribute("aria-hidden", "true");
    if (!unavailable) {
      dot.title = getWgaLang() === "en" ? "Available" : "verfügbar";
    }
    return dot;
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
    media.appendChild(createBerlinDot(work));

    const hover = document.createElement("span");
    hover.className = "wga-tile__hover";
    const label = document.createElement("span");
    label.className = "wga-tile__label";
    label.textContent = work.medium && work.medium !== "—" ? work.medium : work.title || "Werk";
    const sub = document.createElement("span");
    sub.className = "wga-tile__sub";
    const no = catalogNo(work);
    sub.textContent = [no ? "Nr. " + no : "", work.year]
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

    let lastChapter = null;
    const sections = (catalog.sections || []).filter(function (section) {
      return /^\d{2}\s/.test(section.chapter || "");
    });

    sections.forEach(function (section) {
      const sec = document.createElement("section");
      sec.className = "wga-section";
      sec.id = section.id;

      const shell = document.createElement("div");
      shell.className = "wga-shell";

      if (section.chapter !== lastChapter) {
        const chapterHead = document.createElement("div");
        chapterHead.className = "wga-chapter-head";

        const chapterTitle = document.createElement("h2");
        chapterTitle.className = "wga-chapter__title";
        chapterTitle.textContent = chapterDisplayName(section.chapter);
        chapterHead.appendChild(chapterTitle);

        shell.appendChild(chapterHead);
        lastChapter = section.chapter;
      }

      if (shouldShowSectionHeader(section)) {
        const sectionTitle = document.createElement("h3");
        sectionTitle.className = "wga-section__title";
        const sectionYear = deriveSectionYear(section);
        const sectionName = sectionDisplayName(section, sectionYear);
        if (sectionYear) {
          const yearEl = document.createElement("span");
          yearEl.className = "wga-section__year";
          yearEl.textContent = sectionYear;
          sectionTitle.appendChild(yearEl);
        }
        if (sectionName) {
          const nameEl = document.createElement("span");
          nameEl.className = "wga-section__name";
          nameEl.textContent = sectionName;
          sectionTitle.appendChild(nameEl);
        }
        shell.appendChild(sectionTitle);
      }

      const grid = document.createElement("div");
      grid.className = "wga-grid";

      (section.works || []).forEach(function (work) {
        const tile = createTile(work);
        if (tile) grid.appendChild(tile);
      });

      shell.appendChild(grid);
      sec.appendChild(shell);
      catalogRoot.appendChild(sec);
    });
    renderChaptersNav();
  }

  function navHeight() {
    const nav = document.querySelector(".wga-nav");
    return nav ? nav.getBoundingClientRect().height : 72;
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - navHeight() - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function setChaptersOpen(open) {
    if (!chaptersNav || !chaptersBtn || !chaptersMenu) return;
    chaptersNav.classList.toggle("is-open", open);
    chaptersBtn.setAttribute("aria-expanded", open ? "true" : "false");
    chaptersMenu.hidden = !open;
    syncChaptersMenuLayout();
  }

  function isWgaNavMobile() {
    return window.matchMedia("(max-width: 760px)").matches;
  }

  function syncChaptersMenuLayout() {
    if (!chaptersMenu) return;
    if (!isWgaNavMobile()) {
      chaptersMenu.style.removeProperty("top");
      chaptersMenu.style.removeProperty("position");
      return;
    }
    if (chaptersMenu.hidden) return;
    var nav = document.querySelector(".wga-nav");
    if (!nav) return;
    chaptersMenu.style.position = "fixed";
    chaptersMenu.style.top = nav.getBoundingClientRect().bottom + 10 + "px";
  }

  function syncChaptersNavOffset() {
    if (!chaptersBtn || !chaptersNav) return;
    if (isWgaNavMobile()) {
      chaptersNav.style.marginLeft = "0";
      return;
    }
    var lang =
      document.body.classList.contains("en") || document.documentElement.lang === "en" ? "en" : "de";
    var label = chaptersBtn.querySelector(lang === "en" ? ".en-t" : ".de-t");
    if (!label) return;
    chaptersNav.style.marginLeft = label.getBoundingClientRect().width + "px";
  }

  function renderChaptersNav() {
    if (!chaptersNav || !chaptersMenu || !catalog) return;
    chaptersMenu.innerHTML = "";
    const chapters = [];
    const seen = new Set();

    (catalog.sections || []).forEach(function (section) {
      const hasWorks = (section.works || []).some(function (work) {
        return work && !work.empty;
      });
      if (!hasWorks) return;

      const chapter = section.chapter || section.title;
      if (!chapter || seen.has(chapter)) return;
      if (!/^\d{2}\s/.test(chapter)) return;

      seen.add(chapter);
      chapters.push({ label: chapterDisplayName(chapter), sectionId: section.id });
    });

    if (!chapters.length) {
      chaptersNav.hidden = true;
      return;
    }
    chapters.forEach(function (chapter) {
      const item = document.createElement("li");
      item.className = "wga-nav__chapters-item";
      item.setAttribute("role", "option");
      const link = document.createElement("a");
      link.className = "wga-nav__chapters-link";
      link.href = "#" + chapter.sectionId;
      link.textContent = chapter.label;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        setChaptersOpen(false);
        scrollToSection(chapter.sectionId);
        history.replaceState(null, "", "#" + chapter.sectionId);
      });
      item.appendChild(link);
      chaptersMenu.appendChild(item);
    });
    chaptersNav.hidden = false;
    setChaptersOpen(false);
    syncChaptersNavOffset();
  }

  function initChaptersNav() {
    if (!chaptersBtn || !chaptersMenu) return;
    chaptersBtn.addEventListener("click", function () {
      setChaptersOpen(!chaptersNav.classList.contains("is-open"));
    });
    document.addEventListener("click", function (e) {
      if (!chaptersNav || chaptersNav.hidden || !chaptersNav.classList.contains("is-open")) return;
      if (chaptersNav.contains(e.target)) return;
      setChaptersOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setChaptersOpen(false);
    });
  }

  function syncPopupFrameWidth() {
    const slider = sliderTrack && sliderTrack.parentElement;
    if (!slider || !slideCount) return;
    const slide = sliderTrack.children[slideIndex];
    if (!slide) return;
    const img = slide.querySelector("img");
    if (!img) return;
    function apply() {
      const w = img.offsetWidth;
      if (w > 0) slider.style.width = w + "px";
    }
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener("load", apply, { once: true });
  }

  function setSlide(index) {
    if (!slideCount) return;
    slideIndex = (index + slideCount) % slideCount;
    sliderTrack.style.transform = "translateX(-" + slideIndex * 100 + "%)";
    sliderDots.querySelectorAll(".wga-slider__dot").forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === slideIndex);
    });
    syncPopupFrameWidth();
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
    syncPopupFrameWidth();
    initPopupSwipe();
  }

  function openPopup(id) {
    const work = worksById[id];
    if (!work || !popup) return;
    openWorkId = id;
    popupTitle.textContent = work.title || "Werk";
    if (popupUnavailable) {
      const unavailable = work.berlinStatus === "unavailable";
      popupUnavailable.hidden = !unavailable;
      popupUnavailable.textContent = unavailable
        ? getWgaLang() === "en"
          ? "not available / in use"
          : "nicht verfügbar / in Nutzung"
        : "";
    }
    if (popupIndex) {
      popupIndex.textContent = popupIndexLine(work);
      popupIndex.hidden = !popupIndex.textContent;
    }
    buildPopupSlider(
      (work.images || [catalog.meta.placeholder]).map(resolveAsset),
      work.title || "Werk"
    );
    if (popupIndex && popupIndex.textContent) popup.setAttribute("aria-describedby", "wga-popup-index");
    else popup.removeAttribute("aria-describedby");
    updatePopupNav();
    popup.hidden = false;
    popup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateWgaScrollTopBtn();
  }

  function closePopup() {
    if (!popup) return;
    openWorkId = null;
    popup.hidden = true;
    popup.setAttribute("aria-hidden", "true");
    if (!bioOverlay || bioOverlay.hidden) document.body.style.overflow = "";
    updateWgaScrollTopBtn();
  }

  async function loadBioText() {
    if (!bioText || (bioLoaded && bioText.textContent)) return;
    if (window.__WGA_BIO__) {
      bioText.textContent = window.__WGA_BIO__;
      bioLoaded = true;
      return;
    }
    try {
      const res = await fetch(BIO_URL, { cache: "no-store" });
      if (res.ok) bioText.textContent = (await res.text()).trim();
      bioLoaded = true;
    } catch (err) {
      console.warn("WGA bio fetch failed:", err.message);
    }
  }

  function openBio() {
    if (!bioOverlay) return;
    loadBioText();
    bioOverlay.hidden = false;
    bioOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = bioOverlay.querySelector(".wga-bio__close");
    if (closeBtn) closeBtn.focus();
    updateWgaScrollTopBtn();
  }

  function closeBio() {
    if (!bioOverlay) return;
    bioOverlay.hidden = true;
    bioOverlay.setAttribute("aria-hidden", "true");
    if (!popup || popup.hidden) document.body.style.overflow = "";
    if (bioOpen) bioOpen.focus();
    updateWgaScrollTopBtn();
  }

  function applyMeta() {
    if (heroHeadline && catalog?.meta?.heroHeadline) {
      heroHeadline.textContent = catalog.meta.heroHeadline;
    }
    var lang =
      document.body.classList.contains("en") || document.documentElement.lang === "en" ? "en" : "de";
    document.title =
      lang === "en"
        ? "WOLFGANG GROPE ART WORKS — Friday Circle"
        : "WOLFGANG GROPE KUNSTWERKE — Friday Circle";
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
    updateHeroCaption();
    updateHeroControls();
    startHeroAutoplay();
    updateNavTheme();
    initHeroSwipe();
  }

  let heroSwipeApi = null;
  let popupSwipeApi = null;

  function initHeroSwipe() {
    if (heroSwipeApi && heroSwipeApi.destroy) heroSwipeApi.destroy();
    heroSwipeApi = null;
    if (!window.FcSwipeSlider || !heroTrack) return;
    const zone = document.querySelector(".wga-hero__bleed");
    if (!zone || heroSlideCount() <= 1) return;
    heroSwipeApi = window.FcSwipeSlider.bind({
      zone: zone,
      track: heroTrack,
      mode: "percent",
      getIndex: function () {
        return heroIndex;
      },
      getCount: heroSlideCount,
      onIndexChange: function (newIndex) {
        setHeroSlide(newIndex);
        startHeroAutoplay();
      },
      ignore: function (target) {
        return !!target.closest(".wga-hero__dot, .wga-hero__arrow, button, a");
      },
      loop: true,
    });
  }

  function initPopupSwipe() {
    if (popupSwipeApi && popupSwipeApi.destroy) popupSwipeApi.destroy();
    popupSwipeApi = null;
    if (!window.FcSwipeSlider || !sliderTrack || slideCount <= 1) return;
    const zone = sliderTrack.closest(".wga-slider");
    if (!zone) return;
    popupSwipeApi = window.FcSwipeSlider.bind({
      zone: zone,
      track: sliderTrack,
      mode: "percent",
      getIndex: function () {
        return slideIndex;
      },
      getCount: function () {
        return slideCount;
      },
      onIndexChange: function (newIndex) {
        setSlide(newIndex);
      },
      ignore: function (target) {
        return !!target.closest(".wga-slider__dot, .wga-popup__arrow, button, a");
      },
      loop: true,
    });
  }

  function initNavOnLight() {
    updateNavTheme();
    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme, { passive: true });
    window.addEventListener("resize", syncPopupFrameWidth, { passive: true });
  }

  function getWgaLang() {
    return document.body.classList.contains("en") || document.documentElement.lang === "en" ? "en" : "de";
  }

  function scrollToWgaTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateWgaScrollTopBtn() {
    const btn = document.getElementById("wga-scroll-top");
    if (!btn) return;
    const popupOpen = popup && !popup.hidden;
    const bioOpenState = bioOverlay && !bioOverlay.hidden;
    btn.hidden = !isPastHero() || popupOpen || bioOpenState;
    btn.setAttribute("aria-label", getWgaLang() === "en" ? "Back to top" : "Nach oben");
  }

  function initWgaScrollTop() {
    const btn = document.getElementById("wga-scroll-top");
    if (!btn) return;
    btn.addEventListener("click", scrollToWgaTop);
    window.addEventListener("scroll", updateWgaScrollTopBtn, { passive: true });
    window.addEventListener("resize", updateWgaScrollTopBtn);
    document.addEventListener("fc-lang-change", updateWgaScrollTopBtn);
    updateWgaScrollTopBtn();
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
    loadBioText();
  }

  if (popup) {
    popup.querySelectorAll("[data-wga-popup-close]").forEach(function (el) {
      el.addEventListener("click", closePopup);
    });
  }

  if (bioOpen) bioOpen.addEventListener("click", openBio);
  initChaptersNav();
  initHeroNav();
  initPopupNav();
  initWgaScrollTop();
  document.addEventListener("fc-lang-change", syncChaptersNavOffset);
  document.addEventListener("fc-lang-change", function () {
    if (openWorkId) openPopup(openWorkId);
    if (popupPrev) {
      popupPrev.setAttribute("aria-label", getWgaLang() === "en" ? "Previous work" : "Vorheriges Werk");
    }
    if (popupNext) {
      popupNext.setAttribute("aria-label", getWgaLang() === "en" ? "Next work" : "Nächstes Werk");
    }
  });
  window.addEventListener("resize", function () {
    syncChaptersNavOffset();
    syncChaptersMenuLayout();
  });
  window.addEventListener("scroll", syncChaptersMenuLayout, { passive: true });
  if (bioOverlay) {
    bioOverlay.querySelectorAll("[data-wga-bio-close]").forEach(function (el) {
      el.addEventListener("click", closeBio);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (bioOverlay && !bioOverlay.hidden) closeBio();
      else if (popup && !popup.hidden) closePopup();
      return;
    }
    if (bioOverlay && !bioOverlay.hidden) return;
    if (popup && popup.hidden) return;
    if (e.key === "ArrowLeft") stepPopupWork(-1);
    if (e.key === "ArrowRight") stepPopupWork(1);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadCatalog);
  } else {
    loadCatalog();
  }
})();
