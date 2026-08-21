/**
 * One-off dev tool: rasterizes a hand-authored favicon.svg into the actual
 * files browsers/OSes fall back to when they don't use SVG favicons —
 * favicon.ico (16/32/48, packed as one multi-res icon), a 180px
 * apple-touch-icon.png, and the 192/512px PNGs the web app manifest points
 * at (manifest icons have to be real files — no browser rasterizes an SVG
 * for the install-prompt/home-screen icon). The source SVG already paints
 * its background edge to edge, so the same 512px render doubles as the
 * maskable icon (manifest.webmanifest lists it under both purposes rather
 * than generating a separately-padded variant). Not part of `npm run
 * build`; run manually whenever the source SVG changes, same category as
 * scripts/fetch-fonts.sh.
 *
 * Usage: node scripts/gen-favicon.mjs <svg-path> <output-dir>
 *
 * Reuses this repo's existing puppeteer-core dependency and the CHROME
 * lookup from pdf-common.mjs, so no new dependency is needed just to
 * rasterize an SVG. The ICO packer below embeds PNG payloads directly
 * (supported by every modern browser and Windows since Vista) instead of
 * pulling in an `ico`/`to-ico` package for a ~30-line format.
 */

import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { CHROME } from "./pdf-common.mjs";

const ICO_SIZES = [16, 32, 48];
const APPLE_TOUCH_SIZE = 180;
const PWA_ICON_SIZES = [192, 512];

async function renderPng(browser, svg, size) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><head><style>
       html, body { margin: 0; padding: 0; }
       svg { display: block; width: ${size}px; height: ${size}px; }
     </style></head><body>${svg}</body></html>`,
  );
  const png = await page.screenshot({ type: "png" });
  await page.close();
  return png;
}

/** Packs same-format PNGs into one .ico (PNG-payload icon entries). */
function packIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const buffers = [header, entries];

  images.forEach(({ size, png }, i) => {
    const e = i * 16;
    entries.writeUInt8(size >= 256 ? 0 : size, e); // width
    entries.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    entries.writeUInt8(0, e + 2); // color count
    entries.writeUInt8(0, e + 3); // reserved
    entries.writeUInt16LE(1, e + 4); // color planes
    entries.writeUInt16LE(32, e + 6); // bits per pixel
    entries.writeUInt32LE(png.length, e + 8); // bytes in resource
    entries.writeUInt32LE(offset, e + 12); // offset
    offset += png.length;
    buffers.push(png);
  });

  return Buffer.concat(buffers);
}

async function main() {
  const [, , svgPath, outDir] = process.argv;
  if (!svgPath || !outDir) {
    console.error("Usage: node scripts/gen-favicon.mjs <svg-path> <output-dir>");
    process.exit(1);
  }
  if (!CHROME) {
    console.error("No Chromium found. Set CHROME_PATH=/path/to/chrome");
    process.exit(1);
  }

  const svg = fs.readFileSync(svgPath, "utf8");
  const browser = await puppeteer.launch({ executablePath: CHROME });

  const icoImages = [];
  for (const size of ICO_SIZES) {
    icoImages.push({ size, png: await renderPng(browser, svg, size) });
  }
  const touchIcon = await renderPng(browser, svg, APPLE_TOUCH_SIZE);
  const pwaIcons = [];
  for (const size of PWA_ICON_SIZES) {
    pwaIcons.push({ size, png: await renderPng(browser, svg, size) });
  }

  await browser.close();

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "favicon.ico"), packIco(icoImages));
  fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), touchIcon);
  for (const { size, png } of pwaIcons) {
    fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  }

  console.log(`Wrote ${path.join(outDir, "favicon.ico")} (${ICO_SIZES.join("/")}px)`);
  console.log(`Wrote ${path.join(outDir, "apple-touch-icon.png")} (${APPLE_TOUCH_SIZE}px)`);
  for (const size of PWA_ICON_SIZES) {
    console.log(`Wrote ${path.join(outDir, `icon-${size}.png`)}`);
  }
}

main();
