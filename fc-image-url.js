(function (global) {
  "use strict";

  var RASTER_RE = /\.(jpe?g|png)$/i;
  var VARIANT_RE = /-(800|1000|1200|1400|1600)\.webp$/i;

  function splitQuery(src) {
    if (!src) return { path: "", query: "" };
    var i = String(src).indexOf("?");
    if (i < 0) return { path: src, query: "" };
    return { path: src.slice(0, i), query: src.slice(i) };
  }

  function optimizedUrl(src, width) {
    if (!src || !width) return src;
    var parts = splitQuery(src);
    if (!RASTER_RE.test(parts.path) || VARIANT_RE.test(parts.path)) return src;
    var base = parts.path.replace(RASTER_RE, "");
    return base + "-" + width + ".webp" + parts.query;
  }

  function setImage(img, src, width, opts) {
    if (!img || !src) return src;
    opts = opts || {};
    var fallback = src;
    var webp = optimizedUrl(src, width);
    if (!webp || webp === src) {
      img.src = fallback;
      if (opts.srcset) img.removeAttribute("srcset");
      return fallback;
    }

    function useFallback() {
      img.removeEventListener("error", onError);
      if (img.getAttribute("src") !== fallback) img.src = fallback;
      if (opts.srcset) img.removeAttribute("srcset");
    }

    function onError() {
      useFallback();
    }

    img.addEventListener("error", onError);
    img.src = webp;
    if (opts.srcset) {
      img.srcset = webp + " " + width + "w";
      if (opts.sizes) img.sizes = opts.sizes;
    }
    return webp;
  }

  function upgradeImages(root, selector, defaultWidth) {
    root = root || document;
    selector = selector || "img[data-fc-optimize]";
    root.querySelectorAll(selector).forEach(function (img) {
      var src = img.getAttribute("data-fc-src") || img.getAttribute("src");
      if (!src) return;
      var width = Number(img.getAttribute("data-fc-width")) || defaultWidth || 800;
      setImage(img, src, width, { srcset: img.hasAttribute("data-fc-srcset") });
    });
  }

  global.fcOptimizedUrl = optimizedUrl;
  global.fcSetImage = setImage;
  global.fcUpgradeImages = upgradeImages;
})(typeof window !== "undefined" ? window : globalThis);
