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

(function () {
  var video = document.getElementById("bjg-hero-video");
  if (!video) return;

  // Play videos sequentially as Hero background, using files from assets/bjgrope/.
  // Keep them relative so this works in local + deployed environments.
  var playlist = [
    "assets/bjgrope/1EAEEA0D-408C-47A6-9D7A-284D294A5036.mp4",
    "assets/bjgrope/6E7CB054-194B-43A7-AC54-A574538302C4.mp4",
    "assets/bjgrope/IMG_5284.MOV",
    "assets/bjgrope/IMG_7473.MOV",
    "assets/bjgrope/ScreenRecording_03-20-2026%2009-42-14_1.mov",
    "assets/bjgrope/copy_766C6AA6-3A61-4BB7-BADF-677D3BB84361.mov",
  ];

  var idx = 0;
  var stalled = false;

  function playIndex(i) {
    if (!playlist.length) return;
    idx = (i + playlist.length) % playlist.length;
    var src = playlist[idx];
    if (!src) return;

    stalled = false;
    try {
      video.pause();
    } catch (e) {}

    video.src = src;
    video.load();

    var p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {
        // Autoplay can be blocked; poster stays visible until user interaction.
        stalled = true;
      });
    }
  }

  function next() {
    if (stalled) {
      // If we couldn't autoplay, just try again on end/error.
      stalled = false;
    }
    playIndex(idx + 1);
  }

  video.addEventListener("ended", function () {
    next();
  });

  video.addEventListener("error", function () {
    // Some formats might not be supported by the browser; skip to the next one.
    next();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      try {
        video.pause();
      } catch (e2) {}
      return;
    }
    if (!stalled) {
      var p2 = video.play();
      if (p2 && typeof p2.catch === "function") p2.catch(function () {});
    }
  });

  playIndex(0);
})();
