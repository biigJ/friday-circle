/** Vercel Edge: bjgrope.de root → BJG landing (no FC index on that host). */
export default function middleware(request) {
  var host = (request.headers.get("host") || "").toLowerCase();
  var url = new URL(request.url);
  var path = url.pathname;

  if ((host === "bjgrope.de" || host === "www.bjgrope.de") && (path === "/" || path === "/index.html")) {
    url.pathname = "/bjgrope.html";
    return Response.redirect(url.toString(), 307);
  }
}

export const config = {
  matcher: ["/", "/index.html"],
};
