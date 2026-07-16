(function () {
  var menu = document.getElementById("bjg-menu");
  var burger = document.querySelector(".bjg-burger");
  var closeBtn = document.querySelector(".bjg-menu__close");
  var backdrop = document.querySelector(".bjg-menu__backdrop");

  if (menu && burger) {
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
  }
})();

(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll(".bjg-hero__video"));
  if (videos.length < 2) return;

  var desktopPlaylist = [
    "/assets/bjgrope/6E7CB054-194B-43A7-AC54-A574538302C4.mp4",
    "/assets/bjgrope/1EAEEA0D-408C-47A6-9D7A-284D294A5036.mp4",
    "/assets/bjgrope/IMG_5284.MOV",
    "/assets/bjgrope/ScreenRecording_03-20-2026 09-42-14_1.mov",
    "/assets/bjgrope/IMG_7473.MOV",
    "/assets/bjgrope/copy_766C6AA6-3A61-4BB7-BADF-677D3BB84361.mov",
  ];

  var mobilePlaylist = [
    "/assets/bjgrope/mobile/6E7CB054-194B-43A7-AC54-A574538302C4.mp4",
    "/assets/bjgrope/mobile/1EAEEA0D-408C-47A6-9D7A-284D294A5036.mp4",
    "/assets/bjgrope/mobile/IMG_5284.mp4",
    "/assets/bjgrope/mobile/ScreenRecording_03-20-2026 09-42-14_1.mp4",
    "/assets/bjgrope/mobile/IMG_7473.mp4",
    "/assets/bjgrope/mobile/copy_766C6AA6-3A61-4BB7-BADF-677D3BB84361.mp4",
  ];

  function useMobilePlaylist() {
    try {
      return window.matchMedia("(max-width: 960px), (pointer: coarse)").matches;
    } catch (e) {
      return window.innerWidth <= 960;
    }
  }

  var playlist = (useMobilePlaylist() ? mobilePlaylist : desktopPlaylist).map(function (src) {
    return encodeURI(src);
  });

  if (!playlist.length) return;

  var currentIndex = 0;
  var frontSlot = 0;
  var crossfading = false;
  var stalled = false;

  function videoAt(slot) {
    return videos[slot];
  }

  function setActive(slot) {
    videos.forEach(function (video, i) {
      video.classList.toggle("is-active", i === slot);
    });
  }

  function tryPlay(video) {
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
    video.playsInline = true;
    var p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {
        stalled = true;
      });
    }
  }

  function resumePlayback() {
    stalled = false;
    tryPlay(videoAt(frontSlot));
  }

  function whenReady(video, cb) {
    if (video.readyState >= 2) {
      cb();
      return;
    }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      cb();
    }
    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("loadeddata", finish, { once: true });
    window.setTimeout(finish, 4000);
  }

  function assignSource(video, src) {
    if (video.dataset.src === src) return;
    video.dataset.src = src;
    video.src = src;
    video.load();
  }

  function preloadSlot(slot, index) {
    assignSource(videoAt(slot), playlist[index]);
  }

  function playSlot(slot, index) {
    var video = videoAt(slot);
    assignSource(video, playlist[index]);
    return new Promise(function (resolve) {
      whenReady(video, function () {
        tryPlay(video);
        resolve();
      });
    });
  }

  function crossfadeNext() {
    if (crossfading) return;
    crossfading = true;

    var backSlot = 1 - frontSlot;
    var nextIndex = (currentIndex + 1) % playlist.length;

    playSlot(backSlot, nextIndex).then(function () {
      setActive(backSlot);
      try {
        videoAt(frontSlot).pause();
      } catch (e) {}
      frontSlot = backSlot;
      currentIndex = nextIndex;
      crossfading = false;
      preloadSlot(1 - frontSlot, (currentIndex + 1) % playlist.length);
    });
  }

  videos.forEach(function (video, slot) {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = slot === 0 ? "auto" : "metadata";

    video.addEventListener("timeupdate", function () {
      if (slot !== frontSlot || crossfading) return;
      if (!video.duration || !isFinite(video.duration)) return;
      if (video.duration - video.currentTime <= 0.85) {
        crossfadeNext();
      }
    });

    video.addEventListener("ended", function () {
      if (slot === frontSlot && !crossfading) {
        crossfadeNext();
      }
    });

    video.addEventListener("error", function () {
      if (slot !== frontSlot || crossfading) return;
      currentIndex = (currentIndex + 1) % playlist.length;
      playSlot(frontSlot, currentIndex).then(function () {
        preloadSlot(1 - frontSlot, (currentIndex + 1) % playlist.length);
      });
    });
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      videos.forEach(function (video) {
        try {
          video.pause();
        } catch (e2) {}
      });
      return;
    }
    resumePlayback();
  });

  window.addEventListener("pageshow", function (event) {
    if (event.persisted || document.visibilityState === "visible") {
      resumePlayback();
    }
  });

  window.addEventListener("focus", resumePlayback);

  ["pointerdown", "touchstart", "keydown"].forEach(function (evt) {
    document.addEventListener(
      evt,
      function () {
        if (stalled) resumePlayback();
      },
      { once: true, passive: true }
    );
  });

  setActive(0);
  playSlot(0, 0).then(function () {
    preloadSlot(1, 1);
  });
})();
