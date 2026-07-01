/** On fridaycircle.club: send Interior/gogogo traffic to canonical domains (source files stay in-repo for export). */
(function () {
  if (!/fridaycircle\.club$/i.test(location.hostname)) return;

  var path = location.pathname.replace(/\/+$/, "") || "/";
  var tail = location.search + location.hash;

  if (/\/gogogo-landing\.html$/i.test(path) || path.endsWith("/gogogo-landing")) {
    location.replace("https://gogogo.social/" + tail);
    return;
  }

  if (/\/wolfganggrope\.html$/i.test(path) || path.endsWith("/wolfganggrope")) {
    location.replace("https://biig.works/kunst/" + tail);
    return;
  }

  var biigMatch = path.match(/\/biig-interior(\/.*)?$/i);
  if (biigMatch) {
    var sub = biigMatch[1] || "";
    if (sub === "/index.html") sub = "";
    if (sub.endsWith("/index.html")) sub = sub.slice(0, -"/index.html".length);
    location.replace("https://biig.works" + (sub || "/") + tail);
  }
})();
