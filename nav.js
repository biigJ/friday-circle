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

  function fetchPartial(name) {
    var url = new URL("partials/" + name, partialBaseHref());
    return fetch(url.href).then(function (r) {
      if (!r.ok) throw new Error("partial " + name + " " + r.status);
      return r.text();
    });
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
      bindNav();
      return;
    }
    Promise.all(jobs)
      .then(function () {
        bindNav();
      })
      .catch(function () {
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
