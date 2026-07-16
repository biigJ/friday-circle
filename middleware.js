/** Vercel Edge: bjgrope.de — landing + legal only; other paths → fridaycircle.club */
var FC = "https://www.fridaycircle.club";

function isBjgHost(host) {
  return host === "bjgrope.de" || host === "www.bjgrope.de";
}

function isStaticAsset(path) {
  return path.indexOf("/assets/") === 0 || /\.(css|js|webp|png|jpe?g|gif|svg|mp4|mov|woff2?|ico|map)$/i.test(path);
}

function isBjgAllowed(path) {
  return (
    path === "/" ||
    path === "/index.html" ||
    path === "/bjgrope.html" ||
    path === "/bjg-impressum" ||
    path === "/bjg-impressum/" ||
    path === "/bjg-impressum/index.html" ||
    path === "/bjg-datenschutz" ||
    path === "/bjg-datenschutz/" ||
    path === "/bjg-datenschutz/index.html" ||
    isStaticAsset(path)
  );
}

export default function middleware(request) {
  var host = (request.headers.get("host") || "").toLowerCase();
  if (!isBjgHost(host)) return;

  var url = new URL(request.url);
  var path = url.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") path = "/";

  if (path === "/" || path === "/index.html") {
    url.pathname = "/bjgrope.html";
    return Response.redirect(url.toString(), 307);
  }

  if (!isBjgAllowed(path)) {
    url.hostname = "www.fridaycircle.club";
    url.protocol = "https:";
    url.pathname = path === "/" ? "/" : path.startsWith("/") ? path : "/" + path;
    return Response.redirect(url.toString(), 307);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
