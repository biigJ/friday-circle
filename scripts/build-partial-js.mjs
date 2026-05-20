import fs from "fs";
import path from "path";

const dir = path.join(import.meta.dirname, "..", "partials");

function toJs(name) {
  const html = fs.readFileSync(path.join(dir, `${name}.html`), "utf8").trim();
  const escaped = html.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\s+/g, " ");
  const body = `(function (w) {
  w.FC_PARTIAL_HTML = w.FC_PARTIAL_HTML || {};
  w.FC_PARTIAL_HTML["${name}"] = '${escaped}';
})(window);
`;
  fs.writeFileSync(path.join(dir, `${name}.js`), body);
}

toJs("site-header");
toJs("site-footer");
