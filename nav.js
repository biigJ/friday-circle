(function () {
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
})();
