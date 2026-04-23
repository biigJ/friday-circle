(function () {
  var mq = window.matchMedia("(max-width: 760px)");
  var header = document.querySelector("header.nav");
  var btn = document.querySelector(".nav__burger");
  var nav = document.getElementById("primary-nav");

  if (!header || !btn || !nav) return;

  function setOpen(open) {
    header.classList.toggle("nav--open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
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
