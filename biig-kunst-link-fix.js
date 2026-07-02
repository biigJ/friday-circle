/** Ensure Kunst links always point at the live catalog on biig.works/kunst/ */
(function () {
  var KUNST = "https://biig.works/kunst/";

  function fixKunstLinks() {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (/kunst\.biig\.works/i.test(href) || /biig\.works\/kunst\/index\.html/i.test(href)) {
        a.setAttribute("href", KUNST);
      }
    });
    document.querySelectorAll('link[rel="canonical"][href*="kunst"]').forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (/kunst\.biig\.works/i.test(href) || /\/kunst\/index\.html/i.test(href)) {
        link.setAttribute("href", KUNST);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixKunstLinks);
  } else {
    fixKunstLinks();
  }
})();
