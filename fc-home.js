(function () {
  var menu = document.getElementById("bjg-menu");
  var burger = document.querySelector(".bjg-burger");
  var closeBtn = document.querySelector(".bjg-menu__close");
  var backdrop = document.querySelector(".bjg-menu__backdrop");

  if (!menu || !burger) return;

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    document.body.classList.toggle("bjg-menu-open", open);
    if (open) {
      var first = menu.querySelector(".bjg-menu__nav a");
      if (first) first.focus();
    } else {
      burger.focus();
    }
  }

  burger.addEventListener("click", function () {
    setOpen(!menu.classList.contains("is-open"));
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });
  }

  menu.querySelectorAll("[data-bjg-menu-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      setOpen(false);
    });
  });

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
  }

  menu.querySelectorAll(".bjg-menu__nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
    }
  });
})();
