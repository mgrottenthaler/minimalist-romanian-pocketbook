/**
 * Bits shared by the two PDF builds — scripts/build-pdf.mjs (the interior)
 * and scripts/build-cover.mjs (the cover).
 *
 * Both render a page out of public/ with headless Chromium, and both have to
 * serve it over HTTP rather than open it as file://, because the @font-face
 * URLs in assets/css/fonts.css are absolute (/fonts/...).
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PUBLIC = path.join(ROOT, "public");
export const DIST = path.join(ROOT, "dist");

export const CHROME =
  process.env.CHROME_PATH ||
  ["/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/google-chrome"].find(
    (p) => fs.existsSync(p),
  );

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

export function serve(dir) {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(dir, rel);
    if (!file.startsWith(dir + path.sep) || !fs.existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

/** Exits with a usable message unless Chromium and the rendered page exist. */
export function requireInputs(htmlRelPath) {
  if (!CHROME) {
    console.error("No Chromium found. Set CHROME_PATH=/path/to/chrome");
    process.exit(1);
  }
  if (!fs.existsSync(path.join(PUBLIC, htmlRelPath))) {
    console.error(`public/${htmlRelPath} missing — run \`hugo\` first.`);
    process.exit(1);
  }
}

/**
 * The whole font-vendoring pipeline exists to stop a glyph falling back to a
 * system face mid-word. That failure is invisible on screen, so assert it here
 * rather than leaving it to a manual check before ordering.
 */
export function checkFonts(pdf) {
  const fonts = spawnSync("pdffonts", [pdf], { encoding: "utf8" });
  if (fonts.error) {
    console.log("  fonts unchecked — pdffonts not installed (poppler-utils)");
    return;
  }
  const rows = fonts.stdout.split("\n").slice(2).filter((l) => l.trim());
  const unembedded = rows.filter((l) => / no +(yes|no) +(yes|no) /.test(l));
  const fallback = rows.filter((l) => /Times|Helvetica|Courier|Arial|DejaVu|Liberation/i.test(l));
  if (unembedded.length || fallback.length) {
    console.error("\n  ! Font check failed:");
    for (const l of unembedded) console.error(`    not embedded: ${l.trim().split(/\s+/)[0]}`);
    for (const l of fallback) console.error(`    system fallback: ${l.trim().split(/\s+/)[0]}`);
    console.error("    A glyph is missing from the subsets — see scripts/fetch-fonts.sh.");
    process.exit(1);
  }
  console.log(`  ${rows.length} faces, all embedded, no system fallback`);
}
