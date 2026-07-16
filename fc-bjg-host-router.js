/** Host routing: bjgrope.de landing + legal only; FC stays on fridaycircle.club. */
(function () {
  var FC = "https://www.fridaycircle.club";
  var host = location.hostname.toLowerCase();
  var path = location.pathname.replace(/\/+$/, "") || "/";
  var tail = location.search + location.hash;
  var isBjgHost = host === "bjgrope.de" || host === "www.bjgrope.de";
  var isFcHost = /fridaycircle\.club$/i.test(host);

  function isStaticAsset(p) {
    return (
      p.indexOf("/assets/") === 0 ||
      /\.(css|js|webp|png|jpe?g|gif|svg|mp4|mov|woff2?|ico|map)$/i.test(p)
    );
  }

  function isBjgAllowed(p) {
    return (
      p === "/" ||
      p === "/index.html" ||
      p === "/bjgrope.html" ||
      p === "/bjg-impressum" ||
      p === "/bjg-impressum/index.html" ||
      p === "/bjg-datenschutz" ||
      p === "/bjg-datenschutz/index.html" ||
      isStaticAsset(p)
    );
  }

  if (isBjgHost) {
    if (path === "/" || path === "/index.html") {
      location.replace("/bjgrope.html" + tail);
      return;
    }
    if (!isBjgAllowed(path)) {
      location.replace(FC + (path === "/" ? "/" : path) + tail);
      return;
    }
  }

  if (isFcHost && (path === "/bjgrope.html" || path === "/bjg-impressum" || path === "/bjg-impressum/index.html" || path === "/bjg-datenschutz" || path === "/bjg-datenschutz/index.html")) {
    location.replace(FC + "/" + tail);
  }
})();
