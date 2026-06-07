(function () {
  const CATALOG_URL = "data/wga-catalog.json";
  let catalog = null;
  const worksById = {};
  const workSectionById = {};
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

  const inquiryPopup = document.getElementById("wga-inquiry");
  const inquiryImg = document.getElementById("wga-inquiry-img");
  const inquiryText = document.getElementById("wga-inquiry-text");
  const inquiryMail = document.getElementById("wga-inquiry-mail");
  let openInquiryWorkId = null;

  const bioOverlay = document.getElementById("wga-bio");
  const bioOpen = document.getElementById("wga-bio-open");
  const bioText = document.getElementById("wga-bio-text");
  const chaptersNav = document.getElementById("wga-chapters-nav");
  const chaptersBtn = document.getElementById("wga-chapters-btn");
  const chaptersMenu = document.getElementById("wga-chapters-menu");
  const BIO_URL = "data/wga-bio-de.txt";
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
    Object.keys(workSectionById).forEach((k) => delete workSectionById[k]);
    workOrder.length = 0;
    (catalog?.sections || []).forEach((section) => {
      if (!/^\d{2}\s/.test(section.chapter || "")) return;
      (section.works || []).forEach((work) => {
        if (work.id && !work.empty) {
          worksById[work.id] = work;
          workSectionById[work.id] = section;
          workOrder.push(work.id);
        }
      });
    });
  }

  function normInquiryText(value) {
    return String(value || "")
      .normalize("NFC")
      .toLowerCase();
  }

  function formatEuroAmount(amount) {
    return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function formatInquiryPrice(price) {
    if (price.fixed) return formatEuroAmount(price.value) + " €";
    return formatEuroAmount(price.min) + " - " + formatEuroAmount(price.max) + " €";
  }

  const INQUIRY_PRICE_RULES = [
    {
      match: function (sectionLabel, medium, sectionTitle) {
        return /obst in aquarell/.test(sectionLabel);
      },
      price: { min: 250, max: 1400 },
    },
    {
      match: function (sectionLabel) {
        return /skizzenbuch|skribbel/.test(sectionLabel);
      },
      price: { min: 300, max: 900 },
    },
    {
      match: function (sectionLabel, medium, sectionTitle) {
        return /kreide acryl radierung/.test(sectionLabel) || /kreide acryl radierung/.test(sectionTitle);
      },
      price: { min: 300, max: 500 },
    },
    {
      match: function (sectionLabel) {
        return /naives malen/.test(sectionLabel);
      },
      price: { value: 150, fixed: true },
    },
    {
      match: function (sectionLabel) {
        return /grafikdruck/.test(sectionLabel);
      },
      price: { value: 1600, fixed: true },
    },
    {
      match: function (sectionLabel, medium) {
        return /collagen/.test(sectionLabel) || /collage/.test(medium);
      },
      price: { value: 900, fixed: true },
    },
    {
      match: function (sectionLabel, medium) {
        return (
          sectionLabel === "tuschezeichnung" ||
          sectionLabel === "tuschestrichzeichnungen" ||
          (/tuschezeichnung/.test(medium) && !/skizze/.test(medium))
        );
      },
      price: { value: 550, fixed: true },
    },
    {
      match: function (sectionLabel, medium) {
        return /holzschnitt/.test(medium) || /holzschnitt/.test(sectionLabel);
      },
      price: { min: 780, max: 1300 },
    },
    {
      match: function (sectionLabel, medium) {
        return /aquarell/.test(medium) || /aquarell/.test(sectionLabel);
      },
      price: { min: 650, max: 2100 },
    },
    {
      match: function (sectionLabel, medium) {
        return /skizze|skizzen|buntstift/.test(medium) || /skizzen|buntstift/.test(sectionLabel);
      },
      price: { min: 300, max: 900 },
    },
    {
      match: function (sectionLabel, medium) {
        return /radierung|grafik/.test(medium) || /radierung/.test(sectionLabel);
      },
      price: { min: 350, max: 590 },
    },
    {
      match: function (sectionLabel, medium) {
        return /acryl/.test(medium) || /acryl/.test(sectionLabel);
      },
      price: { min: 2500, max: 3500 },
    },
    {
      match: function (sectionLabel, medium) {
        return /ölkreide|kreidezeichnung/.test(medium) || /ölkreide/.test(sectionLabel);
      },
      price: { min: 800, max: 1200 },
    },
    {
      match: function (medium) {
        return /ölmalerei|ölgemälde|olgem/.test(medium);
      },
      price: { min: 2000, max: 5000 },
    },
    {
      match: function (medium) {
        return /keramik/.test(medium);
      },
      price: { min: 500, max: 800 },
    },
  ];

  function inquiryPriceForWork(work, section) {
    const sectionLabel = normInquiryText(section && section.sectionLabel);
    const sectionTitle = normInquiryText(section && section.title);
    const medium = normInquiryText(work && work.medium);
    for (let i = 0; i < INQUIRY_PRICE_RULES.length; i++) {
      const rule = INQUIRY_PRICE_RULES[i];
      if (rule.match(sectionLabel, medium, sectionTitle)) return rule.price;
    }
    return null;
  }

  function inquiryMessage(work) {
    const section = workSectionById[work.id];
    const price = inquiryPriceForWork(work, section);
    const lang = getWgaLang();
    if (!price) {
      return lang === "en"
        ? "Inquiry to the Grope family. Shipped framed. Price on request."
        : "Anfrage an Familie Grope. Gerahmt versendet. Preis auf Anfrage.";
    }
    const priceStr = formatInquiryPrice(price);
    if (lang === "en") {
      const pricePart = price.fixed ? "Price " + priceStr : "Price between " + priceStr;
      return "Inquiry to the Grope family. Shipped framed. " + pricePart + ".";
    }
    const pricePart = price.fixed ? "Preis " + priceStr : "Preis zwischen " + priceStr;
    return "Anfrage an Familie Grope. Gerahmt versendet. " + pricePart + ".";
  }

  function inquiryMailHref(work) {
    const subject = [work.catalogId, work.title, work.year !== "—" ? work.year : ""]
      .filter(Boolean)
      .join(" · ");
    const params = subject ? "?subject=" + encodeURIComponent("Anfrage: " + subject) : "";
    return "mailto:mail@bjgrope.de" + params;
  }

  function updateInquiryPopupContent(work) {
    if (!work) return;
    if (inquiryText) inquiryText.textContent = inquiryMessage(work);
    if (inquiryMail) {
      inquiryMail.href = inquiryMailHref(work);
      inquiryMail.textContent = getWgaLang() === "en" ? "Email" : "E-Mail";
    }
  }

  function openInquiryPopup(id) {
    const work = worksById[id];
    if (!work || !inquiryPopup || work.berlinStatus === "unavailable") return;
    openInquiryWorkId = id;
    if (inquiryImg) {
      inquiryImg.src = workImage(work);
      inquiryImg.alt = tileLabel(work);
    }
    updateInquiryPopupContent(work);
    inquiryPopup.hidden = false;
    inquiryPopup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = inquiryPopup.querySelector(".wga-inquiry__close");
    if (closeBtn) closeBtn.focus();
    updateWgaScrollTopBtn();
  }

  function closeInquiryPopup() {
    if (!inquiryPopup) return;
    openInquiryWorkId = null;
    inquiryPopup.hidden = true;
    inquiryPopup.setAttribute("aria-hidden", "true");
    if ((!popup || popup.hidden) && (!bioOverlay || bioOverlay.hidden)) document.body.style.overflow = "";
    updateWgaScrollTopBtn();
  }

  function updatePopupNav() {
    if (popupNav) popupNav.hidden = workOrder.length <= 1;
  }

  function stepPopupWork(delta) {
    if (!openWorkId || workOrder.length <= 1) return;
    if (isWgaNavMobile() && slideCount === 3 && sliderTrack && sliderTrack.children.length === 3) {
      commitMobilePopupStep(delta);
      return;
    }
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
    const unavailable = work && work.berlinStatus === "unavailable";
    const dot = unavailable ? document.createElement("span") : document.createElement("button");
    dot.className = "wga-berlin-dot" + (unavailable ? " wga-berlin-dot--unavailable" : "");
    if (unavailable) {
      dot.setAttribute("aria-hidden", "true");
    } else {
      dot.type = "button";
      dot.setAttribute(
        "aria-label",
        getWgaLang() === "en" ? "Inquiry to the Grope family" : "Anfrage an Familie Grope"
      );
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        openInquiryPopup(work.id);
      });
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
    if (isWgaNavMobile() && slideCount === 3) {
      slider.style.removeProperty("width");
      return;
    }
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

  function adjacentWorkId(delta) {
    if (!openWorkId || !workOrder.length) return null;
    const idx = workOrder.indexOf(openWorkId);
    if (idx < 0) return null;
    return workOrder[(idx + delta + workOrder.length) % workOrder.length];
  }

  function workPrimaryImage(work) {
    if (!work) return resolveAsset(catalog?.meta?.placeholder || "assets/wolfgang-grope/placeholder.svg");
    const images = work.images || [];
    return images.length ? resolveAsset(images[0]) : resolveAsset(catalog?.meta?.placeholder || "");
  }

  function appendPopupSlide(src, alt) {
    const fig = document.createElement("figure");
    fig.className = "wga-slider__slide";
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.decoding = "async";
    fig.appendChild(img);
    sliderTrack.appendChild(fig);
    return img;
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

    const mobileCarousel = isWgaNavMobile() && workOrder.length > 1 && openWorkId;

    if (mobileCarousel) {
      const prevWork = worksById[adjacentWorkId(-1)];
      const nextWork = worksById[adjacentWorkId(1)];
      const currentWork = worksById[openWorkId];
      appendPopupSlide(workPrimaryImage(prevWork), (prevWork?.title || "Werk") + " — vorheriges");
      appendPopupSlide(workPrimaryImage(currentWork), title + " — Bild 1");
      appendPopupSlide(workPrimaryImage(nextWork), (nextWork?.title || "Werk") + " — nächstes");
      slideCount = 3;
      slideIndex = 1;
      sliderTrack.style.transition = "transform 0.35s ease";
      sliderTrack.style.transform = "translateX(-100%)";
      sliderDots.hidden = true;
      syncPopupFrameWidth();
      initPopupSwipe();
      return;
    }

    slideCount = images.length;
    slideIndex = 0;

    images.forEach(function (src, i) {
      appendPopupSlide(src, title + " — Bild " + (i + 1));

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

    sliderTrack.style.transition = "transform 0.35s ease";
    sliderTrack.style.transform = "translateX(0)";
    sliderDots.hidden = slideCount <= 1;
    syncPopupFrameWidth();
    initPopupSwipe();
  }

  function openPopup(id) {
    const work = worksById[id];
    if (!work || !popup) return;
    openWorkId = id;
    popupCarouselBusy = false;
    updatePopupChrome(work);
    buildPopupSlider(
      (work.images || [catalog.meta.placeholder]).map(resolveAsset),
      work.title || "Werk"
    );
    updatePopupNav();
    popup.hidden = false;
    popup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateWgaScrollTopBtn();
  }

  function closePopup() {
    if (!popup) return;
    openWorkId = null;
    popupCarouselBusy = false;
    if (popupSwipeApi && popupSwipeApi.destroy) popupSwipeApi.destroy();
    popupSwipeApi = null;
    popup.hidden = true;
    popup.setAttribute("aria-hidden", "true");
    if (!bioOverlay || bioOverlay.hidden) document.body.style.overflow = "";
    updateWgaScrollTopBtn();
  }

  function getBioCopy() {
    const bio = window.__WGA_BIO__;
    const lang = getWgaLang();
    if (bio && typeof bio === "object") return bio[lang] || bio.de || "";
    if (typeof bio === "string") return bio;
    return "";
  }

  function applyBioText() {
    if (!bioText) return;
    bioText.textContent = getBioCopy();
  }

  async function loadBioText() {
    if (!bioText) return;
    if (window.__WGA_BIO__) {
      applyBioText();
      bioLoaded = true;
      return;
    }
    if (bioLoaded && bioText.textContent) return;
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
  let popupCarouselBusy = false;

  function updatePopupChrome(work) {
    if (!work) return;
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
    if (popup) {
      if (popupIndex && popupIndex.textContent) popup.setAttribute("aria-describedby", "wga-popup-index");
      else popup.removeAttribute("aria-describedby");
    }
  }

  function preloadImageSrc(src) {
    return new Promise(function (resolve) {
      if (!src) {
        resolve();
        return;
      }
      const img = new Image();
      img.decoding = "async";
      function done() {
        resolve();
      }
      img.onload = done;
      img.onerror = done;
      img.src = src;
      if (img.complete) done();
    });
  }

  function updateMobileCarouselSlideImage(slideEl, src, alt) {
    if (!slideEl) return null;
    const img = slideEl.querySelector("img");
    if (!img) return null;
    if (img.getAttribute("src") !== src) img.src = src;
    img.alt = alt;
    return img;
  }

  function resetMobileCarouselTrack() {
    sliderTrack.style.transition = "none";
    sliderTrack.style.transform = "translateX(-100%)";
    slideIndex = 1;
    void sliderTrack.offsetWidth;
    sliderTrack.style.transition = "transform 0.35s ease";
  }

  function commitMobilePopupStep(delta) {
    if (!openWorkId || popupCarouselBusy) return;
    const idx = workOrder.indexOf(openWorkId);
    if (idx < 0) return;
    const nextId = workOrder[(idx + delta + workOrder.length) % workOrder.length];
    const nextWork = worksById[nextId];
    if (!nextWork) return;

    popupCarouselBusy = true;
    openWorkId = nextId;
    updatePopupChrome(nextWork);

    const prevWork = worksById[adjacentWorkId(-1)];
    const nextWorkAdjacent = worksById[adjacentWorkId(1)];
    const entries = [
      { work: prevWork, suffix: " — vorheriges" },
      { work: nextWork, suffix: " — Bild 1" },
      { work: nextWorkAdjacent, suffix: " — nächstes" },
    ];

    Promise.all(
      entries.map(function (entry) {
        return preloadImageSrc(workPrimaryImage(entry.work));
      })
    ).then(function () {
      const slides = sliderTrack.children;
      if (slides.length !== 3) {
        buildPopupSlider(
          (nextWork.images || [catalog.meta.placeholder]).map(resolveAsset),
          nextWork.title || "Werk"
        );
        popupCarouselBusy = false;
        return;
      }

      entries.forEach(function (entry, i) {
        const work = entry.work;
        updateMobileCarouselSlideImage(
          slides[i],
          workPrimaryImage(work),
          (work?.title || "Werk") + entry.suffix
        );
      });
      resetMobileCarouselTrack();
      syncPopupFrameWidth();
      if (popupSwipeApi && popupSwipeApi.sync) popupSwipeApi.sync(false);
      popupCarouselBusy = false;
    });
  }

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
    if (!isWgaNavMobile() || workOrder.length <= 1 || !window.FcSwipeSlider) return;

    const zone = document.querySelector(".wga-popup__frame");
    if (!zone || !sliderTrack || slideCount !== 3) return;

    popupSwipeApi = window.FcSwipeSlider.bind({
      zone: zone,
      track: sliderTrack,
      mode: "percent",
      getIndex: function () {
        return slideIndex;
      },
      getCount: function () {
        return 3;
      },
      onIndexChange: function (newIndex) {
        if (newIndex === 1 || popupCarouselBusy) {
          slideIndex = 1;
          return;
        }
        const delta = newIndex === 0 ? -1 : 1;
        slideIndex = newIndex;
        sliderTrack.style.transition = "transform 0.35s ease";
        sliderTrack.style.transform = "translateX(-" + newIndex * 100 + "%)";

        function finish(e) {
          if (e && e.target !== sliderTrack) return;
          if (e && e.propertyName && e.propertyName !== "transform") return;
          commitMobilePopupStep(delta);
        }
        sliderTrack.addEventListener("transitionend", finish, { once: true });
      },
      ignore: function (target) {
        return !!target.closest(".wga-slider__dot, .wga-popup__arrow, .wga-popup__close, button, a");
      },
      loop: false,
      minIndex: 0,
      maxIndex: 2,
      transition: "transform 0.35s ease",
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
    const inquiryOpen = inquiryPopup && !inquiryPopup.hidden;
    const bioOpenState = bioOverlay && !bioOverlay.hidden;
    btn.hidden = !isPastHero() || popupOpen || inquiryOpen || bioOpenState;
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

  if (inquiryPopup) {
    inquiryPopup.querySelectorAll("[data-wga-inquiry-close]").forEach(function (el) {
      el.addEventListener("click", closeInquiryPopup);
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
    if (bioLoaded) applyBioText();
    if (openInquiryWorkId) {
      const work = worksById[openInquiryWorkId];
      if (work) updateInquiryPopupContent(work);
    }
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
    if (popup && !popup.hidden) initPopupSwipe();
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
      else if (inquiryPopup && !inquiryPopup.hidden) closeInquiryPopup();
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
