/** Route bjgrope.de root to BJG landing; keep fridaycircle.club on FC index. */
(function () {
  var host = location.hostname.toLowerCase();
  var path = location.pathname.replace(/\/+$/, "") || "/";
  var tail = location.search + location.hash;
  var isBjgHost = host === "bjgrope.de" || host === "www.bjgrope.de";
  var isFcHost = /fridaycircle\.club$/i.test(host);

  if (isBjgHost && (path === "/" || /\/index\.html$/i.test(path))) {
    location.replace("/bjgrope.html" + tail);
    return;
  }

  if (isFcHost && /\/bjgrope\.html$/i.test(path)) {
    location.replace("/" + tail);
  }
})();
