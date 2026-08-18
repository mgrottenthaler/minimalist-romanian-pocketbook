#!/usr/bin/env node
/**
 * Renders public/cover/index.html to the print-ready cover PDF.
 *
 *   hugo && node scripts/build-cover.mjs
 *
 * One page, one sheet: back cover left, front cover right, 0.125in bleed on
 * all four outside edges. No paged.js — the cover is a single fixed-size page,
 * so Chromium prints it directly and preferCSSPageSize takes the @page size
 * out of assets/css/cover.css.
 *
 * Coil-bound covers carry no spine text, so SPINE is zero and the two halves
 * meet at the centre of the sheet. If the binding ever changes to perfect
 * bound, set SPINE to the width Lulu's template gives for the final page
 * count and cover.css has to grow a spine panel to match.
 */

import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import { ROOT, PUBLIC, DIST, CHROME, serve, requireInputs, checkFonts } from "./pdf-common.mjs";

const OUT = path.join(DIST, "gramatica-romana-cover.pdf");

// Inches. TRIM is one cover, i.e. the interior trim; the sheet is two of them
// side by side plus the spine plus bleed all round. Must match the @page size
// and the geometry comment at the top of assets/css/cover.css.
const TRIM = { w: 4.25, h: 6.875 };
const BLEED = 0.125;
const SPINE = 0;
const SHEET = { w: TRIM.w * 2 + SPINE + BLEED * 2, h: TRIM.h + BLEED * 2 };

requireInputs(path.join("cover", "index.html"));

const server = await serve(PUBLIC);
const { port } = server.address();

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

try {
  const page = await browser.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") console.error("  [page]", m.text());
  });

  // No ?guides: the preview overlay must never reach the printed sheet.
  await page.goto(`http://127.0.0.1:${port}/cover/`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.pdf({
    path: OUT,
    printBackground: true,      // the cover *is* its backgrounds
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    timeout: 120000,
  });
} finally {
  await browser.close();
  server.close();
}

const doc = await PDFDocument.load(fs.readFileSync(OUT));

// A cover that silently came out as two pages means the artwork overflowed the
// sheet — always a layout bug, and one that uploads as a broken cover.
if (doc.getPageCount() !== 1) {
  console.error(
    `  ! Cover rendered as ${doc.getPageCount()} pages; it must be exactly one.` +
      `\n    Something in layouts/cover.html is taller than the sheet.`,
  );
  process.exit(1);
}

const target = { w: SHEET.w * 72, h: SHEET.h * 72 };
const rendered = doc.getPage(0).getSize();
const drift = Math.max(Math.abs(rendered.width - target.w), Math.abs(rendered.height - target.h));
// Same reasoning as the interior build: snapping a box that came out at the
// wrong size just hides cropped artwork behind correct-looking dimensions.
if (drift > 1) {
  console.error(
    `  ! Rendered sheet ${(rendered.width / 72).toFixed(3)} × ${(rendered.height / 72).toFixed(3)} in` +
      ` differs from the intended ${SHEET.w} × ${SHEET.h} in.` +
      `\n    Check the @page rule in assets/css/cover.css.`,
  );
  process.exit(1);
}

doc.getPage(0).setSize(target.w, target.h);   // px→pt rounding, as the interior
fs.writeFileSync(OUT, await doc.save());

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n  ${path.relative(ROOT, OUT)}`);
console.log(
  `  1 sheet · ${SHEET.w} × ${SHEET.h} in incl. ${BLEED} in bleed` +
    ` · 2 × ${TRIM.w} × ${TRIM.h} in trim · ${kb} KB`,
);

checkFonts(OUT);
