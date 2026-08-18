#!/usr/bin/env node
/**
 * Renders public/index.html — the book interior — to a print-ready PDF.
 *
 *   hugo && node scripts/build-pdf.mjs
 *
 * The page is served over HTTP (not file://) so the absolute /fonts/ URLs
 * resolve, laid out by paged.js, then printed by headless Chromium with
 * preferCSSPageSize so paged.js's own @page size wins over any default.
 *
 * The cover is a separate document with its own geometry and its own script —
 * see scripts/build-cover.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import { ROOT, PUBLIC, DIST, CHROME, serve, requireInputs, checkFonts } from "./pdf-common.mjs";

const OUT = path.join(DIST, "gramatica-romana-interior.pdf");

// Intended trim, in inches. Must match the @page size in assets/css/book.css.
// Chromium rounds the page box through pixels, so the rendered size can land a
// fraction of a point off; every page box is snapped to exactly this at the end,
// and a mismatch larger than rounding is reported rather than silently fixed.
const TRIM = { w: 4.25, h: 6.875 };

requireInputs("index.html");

const server = await serve(PUBLIC);
const { port } = server.address();

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

// Pagination is the step that fails when a CSS change breaks paged.js, and it
// fails by timing out. Without the finally, that throw leaks a Chromium process
// and leaves the server holding the event loop open.
try {
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
} finally {
  await browser.close();
  server.close();
}

// A printed leaf is two pages, so the interior extent must be even. paged.js
// will not emit a trailing empty page, so the blank leaf is appended to the
// finished PDF, at whatever trim size the document actually came out.
const doc = await PDFDocument.load(fs.readFileSync(OUT));

const target = { w: TRIM.w * 72, h: TRIM.h * 72 };
const rendered = doc.getPage(0).getSize();
const drift = Math.max(Math.abs(rendered.width - target.w), Math.abs(rendered.height - target.h));
// Fail rather than snap: forcing the box to the target when the layout came out
// at a different size produces a correctly-sized PDF with cropped or offset
// content, which looks fine in a viewer and is wrong at the printer.
if (drift > 1) {
  console.error(
    `  ! Rendered trim ${(rendered.width / 72).toFixed(3)} × ${(rendered.height / 72).toFixed(3)} in` +
      ` differs from the intended ${TRIM.w} × ${TRIM.h} in.` +
      `\n    Check the @page rule in assets/css/book.css, and that it declares no bleed or marks.`,
  );
  process.exit(1);
}

const padded = doc.getPageCount() % 2 !== 0;
if (padded) doc.addPage([target.w, target.h]);

for (const p of doc.getPages()) p.setSize(target.w, target.h);
fs.writeFileSync(OUT, await doc.save());

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n  ${path.relative(ROOT, OUT)}`);
console.log(`  ${doc.getPageCount()} pages · ${TRIM.w} × ${TRIM.h} in · ${kb} KB`);
if (padded) console.log("  one blank leaf appended to reach an even count");

checkFonts(OUT);
