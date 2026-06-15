(function () {
  "use strict";

  function initOberteilSlideshow() {
    document.querySelectorAll(".pgl-prod-card--oberteil").forEach(function (card) {
      if (card.dataset.cyclSlideshowInit) return;
      card.dataset.cyclSlideshowInit = "1";
      var images = [
        "assets/biigJ/sportshirt.png",
        "assets/biigJ/sportbra-curls.png",
      ];
      var idx = 0;
      var prefix = card.closest(".cycl-table-page") ? "" : "";
      card.style.backgroundImage = "url('" + prefix + images[0] + "')";
      setInterval(function () {
        idx = (idx + 1) % images.length;
        card.style.backgroundImage = "url('" + prefix + images[idx] + "')";
      }, 3000);
    });
  }

  document.addEventListener("DOMContentLoaded", initOberteilSlideshow);
})();
