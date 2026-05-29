(function () {
  function navScriptEl() {
    return document.querySelector('script[src*="nav.js"]');
  }

  function partialBaseHref() {
    var s = navScriptEl();
    if (s && s.src) {
      try {
        return new URL(".", s.src).href;
      } catch (e) {}
    }
    try {
      return new URL("./", location.href).href;
    } catch (e2) {
      return location.href;
    }
  }

  function partialKey(name) {
    return name.replace(/\.html$/, "");
  }

  function ensureSiteBase() {
    var el = document.querySelector("base[data-fc-site-root]");
    if (!el) {
      el = document.createElement("base");
      el.setAttribute("data-fc-site-root", "");
      document.head.insertBefore(el, document.head.firstChild);
    }
    el.href = partialBaseHref();
  }

  function loadPartialScript(name) {
    var key = partialKey(name);
    if (window.FC_PARTIAL_HTML && window.FC_PARTIAL_HTML[key]) {
      return Promise.resolve(window.FC_PARTIAL_HTML[key]);
    }
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = new URL("partials/" + key + ".js", partialBaseHref()).href;
      s.onload = function () {
        if (window.FC_PARTIAL_HTML && window.FC_PARTIAL_HTML[key]) {
          resolve(window.FC_PARTIAL_HTML[key]);
        } else {
          reject(new Error("partial " + key + " missing export"));
        }
      };
      s.onerror = function () {
        reject(new Error("partial " + key + " script failed"));
      };
      document.head.appendChild(s);
    });
  }

  function fetchPartial(name) {
    if (location.protocol === "file:") {
      return loadPartialScript(name);
    }
    var url = new URL("partials/" + name, partialBaseHref());
    return fetch(url.href)
      .then(function (r) {
        if (!r.ok) throw new Error("partial " + name + " " + r.status);
        return r.text();
      })
      .catch(function () {
        return loadPartialScript(name);
      });
  }

  function loadScript(name) {
    if (document.querySelector('script[src*="' + name + '"]')) return;
    var s = document.createElement("script");
    s.src = new URL(name, partialBaseHref()).href;
    s.defer = true;
    document.head.appendChild(s);
  }

  function loadFcLang() {
    loadScript("fc-lang.js");
  }

  function syncNavLangWidth() {
    var langEl = document.querySelector(".nav__lang");
    if (langEl) {
      document.documentElement.style.setProperty("--nav-lang-width", langEl.offsetWidth + "px");
    }
  }

  function chromeReady() {
    ensureSiteBase();
    if (document.body.classList.contains("bat-page")) {
      var primaryNav = document.getElementById("primary-nav");
      if (primaryNav) primaryNav.setAttribute("hidden", "");
    }
    syncNavLangWidth();
    document.dispatchEvent(new CustomEvent("fc-chrome-ready"));
    loadFcLang();
  }

  function injectSiteChrome() {
    var headerMount = document.getElementById("fc-site-header");
    var footerMount = document.getElementById("fc-site-footer");
    var jobs = [];
    if (headerMount) {
      jobs.push(
        fetchPartial("site-header.html").then(function (html) {
          headerMount.outerHTML = html;
        })
      );
    }
    if (footerMount) {
      jobs.push(
        fetchPartial("site-footer.html").then(function (html) {
          footerMount.outerHTML = html;
        })
      );
    }
    if (!jobs.length) {
      chromeReady();
      bindNav();
      return;
    }
    Promise.all(jobs)
      .then(function () {
        chromeReady();
        bindNav();
      })
      .catch(function () {
        chromeReady();
        bindNav();
      });
  }

  function bindNav() {
    var mq = window.matchMedia("(max-width: 760px)");
    var header = document.querySelector("header.nav");
    var btn = document.querySelector(".nav__burger");
    var nav = document.getElementById("primary-nav");
    var gogogoArrow = document.querySelector(".nav__cta-arrow");
    var gogogoToggle = document.getElementById("nav-gogogo-toggle");
    var gogogoPanel = document.getElementById("nav-gogogo-dropdown");

    function gogogoSetOpen(open) {
      if (!gogogoArrow || !gogogoToggle || !gogogoPanel) return;
      gogogoToggle.setAttribute("aria-expanded", open ? "true" : "false");
      gogogoArrow.classList.toggle("is-open", open);
    }

    if (gogogoArrow && gogogoToggle && gogogoPanel) {
      gogogoToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        gogogoSetOpen(!gogogoArrow.classList.contains("is-open"));
      });
      gogogoPanel.querySelectorAll("a[role=menuitem]").forEach(function (a) {
        a.addEventListener("click", function () {
          gogogoSetOpen(false);
        });
      });
      gogogoArrow.addEventListener("click", function (e) {
        e.stopPropagation();
      });
      document.addEventListener("click", function () {
        gogogoSetOpen(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && gogogoArrow.classList.contains("is-open")) {
          gogogoSetOpen(false);
          gogogoToggle.focus();
        }
      });
    }

    if (!header || !btn || !nav) return;

    function setOpen(open) {
      header.classList.toggle("nav--open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      gogogoSetOpen(false);
    }

    function closeIfMobile() {
      if (mq.matches) setOpen(false);
    }

    btn.addEventListener("click", function () {
      if (!mq.matches) return;
      setOpen(!header.classList.contains("nav--open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeIfMobile);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mq.matches) setOpen(false);
    });

    mq.addEventListener("change", function () {
      if (!mq.matches) setOpen(false);
    });
  }

  injectSiteChrome();
})();
