#!/usr/bin/env node
/**
 * Renders public/index.html to a print-ready PDF.
 *
 *   hugo && node scripts/build-pdf.mjs
 *
 * The page is served over HTTP (not file://) so the absolute /fonts/ URLs
 * resolve, laid out by paged.js, then printed by headless Chromium with
 * preferCSSPageSize so paged.js's own @page size wins over any default.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { PDFDocument } from "pdf-lib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "dist", "gramatica-romana-interior.pdf");

// Intended trim, in inches. Must match the @page size in assets/css/book.css.
// Chromium rounds the page box through pixels, so the rendered size can land a
// fraction of a point off; every page box is snapped to exactly this at the end,
// and a mismatch larger than rounding is reported rather than silently fixed.
const TRIM = { w: 4.25, h: 6.875 };

const CHROME =
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

function serve(dir) {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(dir, rel);
    if (!file.startsWith(dir) || !fs.existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

if (!CHROME) {
  console.error("No Chromium found. Set CHROME_PATH=/path/to/chrome");
  process.exit(1);
}
if (!fs.existsSync(path.join(PUBLIC, "index.html"))) {
  console.error("public/index.html missing — run `hugo` first.");
  process.exit(1);
}

const server = await serve(PUBLIC);
const { port } = server.address();

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});
const page = await browser.newPage();

page.on("console", (m) => {
  if (m.type() === "error") console.error("  [page]", m.text());
});

// paged.js calls PagedConfig.after() once pagination is complete.
await page.evaluateOnNewDocument(() => {
  window.PagedConfig = { auto: true, after: () => { window.__PAGED_DONE = true; } };
});

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => window.__PAGED_DONE === true, { timeout: 120000 });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
await page.pdf({
  path: OUT,
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: false,
  timeout: 120000,
});

await browser.close();
server.close();

// A printed leaf is two pages, so the interior extent must be even. paged.js
// will not emit a trailing empty page, so the blank leaf is appended to the
// finished PDF, at whatever trim size the document actually came out.
const doc = await PDFDocument.load(fs.readFileSync(OUT));

const target = { w: TRIM.w * 72, h: TRIM.h * 72 };
const rendered = doc.getPage(0).getSize();
const drift = Math.max(Math.abs(rendered.width - target.w), Math.abs(rendered.height - target.h));
if (drift > 1) {
  console.error(
    `  ! Rendered trim ${(rendered.width / 72).toFixed(3)} × ${(rendered.height / 72).toFixed(3)} in` +
      ` differs from the intended ${TRIM.w} × ${TRIM.h} in.` +
      `\n    Check the @page rule in assets/css/book.css, and that it declares no bleed or marks.`,
  );
}

const padded = doc.getPageCount() % 2 !== 0;
if (padded) doc.addPage([target.w, target.h]);

for (const p of doc.getPages()) p.setSize(target.w, target.h);
fs.writeFileSync(OUT, await doc.save());

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n  ${path.relative(ROOT, OUT)}`);
console.log(`  ${doc.getPageCount()} pages · ${TRIM.w} × ${TRIM.h} in · ${kb} KB`);
if (padded) console.log("  one blank leaf appended to reach an even count");
