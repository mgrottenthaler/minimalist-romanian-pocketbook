#!/usr/bin/env node
/**
 * Screenshots public/og/index.html into public/images/og-cover.png — the
 * image og:image and twitter:image point at (layouts/home.html).
 *
 *   hugo && node scripts/gen-og-image.mjs
 *
 * The card itself (layouts/og.html) is laid out at 600x315 CSS px; a 2x
 * deviceScaleFactor viewport makes Chromium screenshot it at 1200x630 device
 * pixels, the size social platforms expect, without the template having to
 * do any of that arithmetic itself.
 */

import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { PUBLIC, CHROME, serve, requireInputs } from "./pdf-common.mjs";

const OUT = path.join(PUBLIC, "images", "og-cover.png");
const SIZE = { w: 600, h: 315 };
const SCALE = 2;

requireInputs(path.join("og", "index.html"));

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

  await page.setViewport({ width: SIZE.w, height: SIZE.h, deviceScaleFactor: SCALE });
  await page.goto(`http://127.0.0.1:${port}/og/`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT, type: "png" });
} finally {
  await browser.close();
  server.close();
}

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`\n  public/images/og-cover.png`);
console.log(`  ${SIZE.w * SCALE} x ${SIZE.h * SCALE}px · ${kb} KB`);
