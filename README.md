# The Minimalist Romanian Pocketbook

**[romanian.grottenthaler.eu](https://romanian.grottenthaler.eu)**

A pocket-sized Romanian grammar reference: paradigms, endings and tense
formation, with as little prose as possible. Built with Hugo, paginated by
paged.js, printed to PDF by headless Chromium, and produced as a coil-bound
pocketbook at Lulu.

Free to read, download and print — see [LICENSE-CONTENT](LICENSE-CONTENT). If
you'd rather have a printed copy without doing it yourself, order one through
[Lulu](https://www.lulu.com/shop/martin-grottenthaler/the-minimalist-romanian-pocketbook/paperback/product-v82vvpy.html)
(€2 of the price goes to the author).

The book itself is entirely in Romanian — headings, table labels and the few
usage notes. It is a refresher for a reader at roughly B2, not a course: it
assumes you know what a subjunctive is and only need to see the forms again.
This README is in English because it documents the repo, not the book.

The grammar content was drafted with AI assistance and reviewed by the
author before publishing. If you spot an error, please
[open an issue](https://github.com/mgrottenthaler/minimalist-romanian-pocketbook/issues).

This is the first book in the *Minimalist Pocketbook* series. The layouts,
stylesheets, PWA shell and PDF build pipeline are shared across every book in
the series and live in
[minimalist-pocketbook-theme](https://github.com/mgrottenthaler/minimalist-pocketbook-theme),
included here as a git submodule at `themes/pocketbook-theme`. This repo is
everything specific to the Romanian book: content, config, and product
identity (domain, Lulu listing, cover copy).

---

## Production specs

| | |
|---|---|
| Trim size | 4.25 × 6.875 in (Lulu **Pocketbook**) |
| Binding | Coil — lies flat for one-handed reference use |
| Interior | Premium black & white, 60# cream uncoated, no bleed |
| Cover | Matte, full colour, one sheet 8.75 × 7.125 in incl. 0.125 in bleed, no spine |
| Margins | top .38 / bottom .34 / **inner .56** / outer .28 in, mirrored |
| Body face | Source Serif 4 **SmText** (OFL), 8.3 pt / 10.8 pt |
| Display face | Source Sans 3 (OFL) |
| Extent | **38 pages** — 37 of content incl. the contents page, plus a blank leaf to reach an even count |
| Version on the cover | read from `VERSION` at build time |
| Sold as | Lulu Bookstore listing, no ISBN |
| Print cost | ~€6.59/copy (Lulu project wizard, coil, checked 2026-08-19) |

The inner margin is oversized because coil binding punches through the
gutter and Lulu requires ≥ 0.5 in clearance from the punched edge. Margins
mirror between recto and verso via `@page :left` / `@page :right`.

Both fonts are OFL-licensed and vendored into the shared theme's
`static/fonts/` by its `scripts/fetch-fonts.sh`, which pulls Adobe's upstream
releases, subsets them with `fonttools`, and fetches each family's
`LICENSE.md` alongside (OFL 1.1 requires the licence travel with
redistributed fonts). Shared across the whole series, so it's re-run and
committed in the theme repo, not here.

Do not swap in the `@fontsource` builds: their subsets omit `U+2192 →`, used
on nearly every page, so arrows silently fall back to Times New Roman. The
`pdffonts` check in the build exists to catch exactly that.

## Toolchain

```
content/chapters/*.md ──hugo──> public/index.html ──paged.js──> paginated DOM
                                                  ──chromium──> dist/…-interior.pdf
content/cover.md      ──hugo──> public/cover/index.html
                                                  ──chromium──> dist/…-cover.pdf
```

Hugo assembles every chapter into **one** HTML document
(`themes/pocketbook-theme/layouts/home.html`); chapter pages are never
rendered individually. That document ships two stylesheets and picks one: a
normal `web.css` for browsing, and `book.css` + paged.js for the printed
layout, which does what Chrome's print engine cannot — mirrored margins,
running heads, folios, and a table of contents with real page numbers
(`target-counter`). A plain visit gets the website; appending `?print` to the
URL (or building the PDF) switches to the paginated book preview.

The cover is a second document with its own layout (`cover.html`), its own
stylesheet (`cover.css`) and its own build script, all in the theme. It skips
paged.js entirely — it is exactly one page — and is the only artwork in the
project with bleed. Its back-cover contents list is generated from the same
chapter pages the book is, so it can't drift out of date, and the version on
the front is read from `VERSION`, the file `release.py` bumps and tags.

All of the above — layouts, stylesheets, PWA shell, PDF build scripts and the
vendored fonts — live in
[minimalist-pocketbook-theme](https://github.com/mgrottenthaler/minimalist-pocketbook-theme),
shared with every other book in the series and included here as a git
submodule at `themes/pocketbook-theme`. This repo supplies content, the
`hugo.toml` `[params]` and `i18n/ro.toml` the theme's layouts read from, and
the product-specific bits (domain, Lulu listing, release process). See that
theme's README for the full params/i18n contract a book repo has to fill in.

### Build

```sh
git submodule update --init   # first time only — pulls in themes/pocketbook-theme

make pdf       # both PDFs into dist/, plus the og:image — interior, cover, og
make interior  # hugo + chromium → dist/gramatica-romana-interior.pdf
make cover     # hugo + chromium → dist/gramatica-romana-cover.pdf
make og        # hugo + chromium → public/images/og-cover.png (social card)
make serve     # live preview as a website; add ?print for the paginated book,
               # or open /cover/ (add ?guides for bleed / trim / punch guides)
make clean
```

Fonts are vendored once in the shared theme, not per book — see
[minimalist-pocketbook-theme](https://github.com/mgrottenthaler/minimalist-pocketbook-theme)'s
own `make fonts` to refresh them, then bump the submodule pointer here.

`make interior` prints the extent and the measured trim size, appends a blank
leaf if the count came out odd, and snaps every page box to exactly
4.25 × 6.875 in (Chromium's px→pt rounding otherwise lands a fraction of a
point off). It fails the build on two conditions rather than warning: a
rendered trim more than a point off the intended one, and any face that is
not embedded or that is a system fallback.

`make cover` applies the same discipline to the cover sheet: it fails if the
artwork rendered as anything other than one page, if the sheet came out more
than a point off 8.75 × 7.125 in, or if a face is missing from the subsets.

Requires `hugo` (extended), Node, and a Chromium binary. The build script finds
Chromium automatically; override with `CHROME_PATH=/path/to/chrome`.

### Layout

This repo:

```
content/chapters/*.md    one file per chapter, ordered by `weight`
content/cover.md         front matter only — gives the cover layout a page
content/og.md            front matter only — gives the og:image card a page
i18n/ro.toml             UI-chrome strings the theme's layouts read via {{ i18n }}
hugo.toml                site title + [params] contract the theme's layouts read
static/robots.txt        Allow: / plus a pointer at /sitemap.xml
static/manifest.webmanifest  PWA manifest — installable, standalone display
static/favicon.svg       source icon; static/favicon.ico, apple-touch-icon.png,
                         icon-192/512.png are generated from it (see below)
themes/pocketbook-theme/ git submodule — layouts, CSS, JS, fonts, build scripts
VERSION                  MAJOR.MINOR, bumped by release.py, printed on the cover
```

`themes/pocketbook-theme/` (shared with every book in the series — see its
own README for the full contract):

```
layouts/home.html        assembles the whole book into one document
layouts/cover.html       the cover artwork: back cover left, front cover right
layouts/og.html          the 1200x630 social-share card (og:image/twitter:image)
layouts/_default/sitemap.xml  single-entry sitemap (this site is one page)
assets/css/fonts.css     @font-face rules, shared by all three stylesheets
assets/css/web.css       the website: normal layout, loaded by default
assets/css/book.css      the printed book: page geometry, typography, tables
assets/css/cover.css     the cover: sheet geometry, bleed, safety, colour
static/fonts/            vendored OFL woff2 subsets + OFL-*.txt (see scripts/fetch-fonts.sh)
static/vendor/pagedjs/   vendored paged.js polyfill
static/sw.js             service worker: precaches the app shell, serves it offline
scripts/gen-favicon.mjs  rasterizes an svg into favicon.ico, apple-touch-icon.png, icon-192/512.png
scripts/pdf-common.mjs   shared by all three builds: local server, Chromium, font check
scripts/build-pdf.mjs    serves public/, waits for pagination, prints the interior
scripts/build-cover.mjs  prints the one-page cover sheet
scripts/gen-og-image.mjs screenshots layouts/og.html into public/images/og-cover.png
scripts/fetch-fonts.sh   downloads + subsets the fonts from Adobe upstream
```

### Website

`romanian.grottenthaler.eu` serves `public/` — the scrolling reading copy
(`web.css`), not the paginated PDF — from a Cloudflare Worker with static
assets, defined in `wrangler.jsonc`.

Deployed by `.github/workflows/pdf.yml`, on the same `push: tags` trigger
that builds the PDFs — not on every push to `main`, so the live site only
moves when a version is actually published, in step with the GitHub Release.

The workflow runs `npm run build` (hugo, both PDFs, then the og:image),
copies
`dist/*.pdf` into `public/pdf/`, and deploys with `wrangler deploy`
(`cloudflare/wrangler-action`), authenticated with a `CLOUDFLARE_API_TOKEN`
repo secret (`CLOUDFLARE_ACCOUNT_ID` too, unless the token is already scoped
to one account). The custom domain route is provisioned by that same
`wrangler deploy` from `wrangler.jsonc`.

Installable as a PWA and readable fully offline after the first visit: the
theme's `static/sw.js` precaches the app shell (the page, its CSS/JS/fonts,
the icons) and serves it from cache whenever the network is unreachable,
staying in sync with the live content on every online visit. Regenerate the
icons with `node themes/pocketbook-theme/scripts/gen-favicon.mjs static/favicon.svg static`
whenever `favicon.svg` changes.

The interior and cover PDFs are downloadable from the site itself
(`/pdf/gramatica-romana-interior.pdf`, `/pdf/gramatica-romana-cover.pdf`),
linked from a short web-only note above the contents. That note, and the
?print instructions next to it, are stripped from the DOM in book mode (see
the script at the bottom of the theme's `layouts/home.html`) so neither
shows up in the print output.

---

## Contents

Fifteen chapters, weights in steps of 10 so chapters can be inserted between.
Page counts are the actual extent of the current build, read off the generated
table of contents.

| # | Chapter | pp. |
|---|---|---|
| 1 | Substantivul — gen, plural, alternanțe, cazuri, vocativ | 3 |
| 2 | Articolul — nehotărât, hotărât enclitic, posesiv, demonstrativ | 2 |
| 3 | Adjectivul — clase de forme, poziție, comparație | 2 |
| 4 | Pronumele — personal, adresare, clitice, reflexiv, posesiv, demonstrativ, relativ | 5 |
| 5 | Numeralul — cardinal, ordinal, `de` după 20, ora | 2 |
| 6 | Verbul: indicativ prezent — 4 conjugări, sufixele -ez / -esc / -ăsc | 3 |
| 7 | Verbul: timpurile trecutului — imperfect, perfect compus, m.m.c.p. | 3 |
| 8 | Verbul: viitorul — literar, curent, prezent cu valoare de viitor | 1 |
| 9 | Conjunctivul, condiționalul, imperativul | 3 |
| 10 | Forme nepersonale și diateze — infinitiv, participiu, gerunziu, supin | 2 |
| 11 | Verbe neregulate — tabel de 64 de verbe | 3 |
| 12 | Adverbul — formare, comparație, poziție | 2 |
| 13 | Prepoziția și cazul — Ac / G / D | 2 |
| 14 | Sintaxa propoziției — topică, negație, `pe`, dublare clitică | 2 |
| 15 | Ortografie, registru și forme rare | 1 |

Plus the table of contents on page 1: **37 pages** of content, and the build
appends one blank leaf for an even **38**. The book has no title page — it would
only repeat the cover, which carries the same title and subtitle and has no
publisher or imprint to add. The theme's `layouts/home.html` drops the
`.titlepage` section from the DOM in book mode; the website still shows it.

Every chapter starts on a fresh page (`break-before: page` on `.chapter`), and
no table is split across a page turn (`break-inside: avoid` on `table`). Type
is already at 8.3 pt, about the floor for comfortable reading in print, so
there's nothing to win by relaxing either rule.

### Typographic conventions

- **bold** — the ending, infix or auxiliary that carries the grammar; in prose,
  the phrase the sentence turns on
- *italic* — example words and sentences, and a Romanian word named rather than
  used (a heading like *Legătura cu substantivul: de*)
- shaded box — a note about an exception or a trap

Nothing else is a distinction — no third inline style.

---

## What is deliberately left out

The point of a book this size is the cutting. Everything below is real
Romanian a full reference grammar would cover, omitted on purpose:

- **Rare/literary tenses** — perfectul simplu, viitorul cu *am să*, viitorul
  popular, viitorul anterior, modul prezumtiv, infinitivul lung as a verb
  form. At most a single line of recognition in ch. 15's register table.
- **Pronunciation and the alphabet** — the reader is B2.
- **Etymology, historical phonology, vocabulary lists, exercises** — different
  need, different book.
- **Regional morphology** (Moldovan, Banat, Ardeal) — standard literary
  Romanian only.
- **Historical orthography** (*sînt* vs. *sunt*) — current DOOM² spelling
  throughout, rules stated in ch. 15.
- **Rare collective numerals**, archaic vocative forms beyond the common ones,
  *dânsul* as a politeness form (one row + note in ch. 4).

Kept despite being marginal: mai-mult-ca-perfectul (still common in speech),
conjunctivul perfect *să fi plecat* (constant after *ar fi trebuit*), and the
supin (*am ceva de făcut*, heavily used and often skipped by textbooks).

---

## Printing at Lulu

1. `make pdf` → `dist/gramatica-romana-interior.pdf` and
   `dist/gramatica-romana-cover.pdf`. Each reports its own extent and measured
   size, and fails rather than ships if the size is wrong.
2. The font check runs as part of the build — every face must be embedded, no
   system fallback. It needs `pdffonts` from poppler-utils; if that isn't
   installed the build says so and continues, so check by hand:

   ```sh
   pdffonts dist/gramatica-romana-interior.pdf dist/gramatica-romana-cover.pdf
   ```

3. Check the cover against Lulu's own cover template before the first order —
   its geometry here is computed from Lulu's published bleed/safety rules
   rather than downloaded from them.
4. Upload interior + cover as two separate files — a new project the first
   time, a revision of that project on every release after. This step is
   manual: Lulu's public Print API only covers print jobs, file validation,
   shipping quotes and webhooks — no project/title/storefront endpoint — so a
   listing's files can't be replaced programmatically.

Lulu package id for this spec: `0425X0687.BW.PRE.CO.060UC444.MXX`
(`TRIM.INK.QUALITY.BINDING.PAPER.FINISH`). To check current pricing or
eligibility without an account, run
`themes/pocketbook-theme/scripts/check-lulu-pricing.sh`, which queries
Lulu's public `podPackages` GraphQL endpoint and greps out this spec's
package rows.

`distributionEligible` is false for every coil package — coil is Lulu
Bookstore only, not Global Distribution (Amazon, Ingram, B&N).

### Selling

Listed on the **Lulu Bookstore** only. Lulu is the merchant — they take
payment, quote shipping, carry VAT/refunds/reprints:

| List | Print | Lulu | Kept per copy |
|---|---|---|---|
| €9.09 | €6.59 | €0.50 | €2.00 |

No ISBN involved or needed — Bookstore-only projects aren't offered one.

### The cover

`dist/gramatica-romana-cover.pdf` is one sheet, printed outside-up:

```
|<--------------------- 8.75 in --------------------->|
| .125 |        4.25 in       ||       4.25 in        | .125 |   bleed
|      |      back cover      ||     front cover      |
                              ^^
                         coil punched here
```

- **Bleed** 0.125 in on the four outside edges, so the sheet is 8.75 × 7.125 in.
- **No spine.** A coil-bound cover is two punched boards; the halves meet in the
  middle of the sheet. If the binding ever changed to perfect bound, `SPINE` in
  the theme's `scripts/build-cover.mjs` takes the width from Lulu's template
  and `cover.css` needs a spine panel to match.
- **Keep-out** 0.56 in either side of the centre, where the coil punches
  through both boards — Lulu's own minimum is 0.5 in. Outside edges stay
  0.315 in in from trim (0.44 in from the sheet edge, including bleed),
  against Lulu's 0.25 in minimum.

`make serve` then <http://localhost:1313/cover/?guides> draws all of that over
the artwork: trim in red, safety dashed blue, the punch keep-out shaded, the
centre dashed. Preview-only — the PDF build never includes it.

The front carries the title, the subtitle from `hugo.toml`, one specimen word
(*învăț**ăm***), and `Versiune <VERSION>` — read from `VERSION` at build time,
so a cover built from a tagged tree always matches the release it ships with.
The back carries the blurb, the fifteen chapters generated from
`content/chapters/`, the typographic legend, the site
(`romanian.grottenthaler.eu`) and the repo. The copy itself is split between
`[params]` in `hugo.toml` (subtitle, blurb, specimen word, Lulu link, …) and
`i18n/ro.toml` (the fixed legend/label text the theme's layouts wrap it in).

Coil at Pocketbook trim is confirmed available, 2–470 pages. Should that ever
change, the nearest fallbacks are A5 (5.83 × 8.27 in) or US Trade (6 × 9 in):
change the `@page` blocks at the top of the theme's `assets/css/book.css`
and nothing else, then re-measure the extent.

## Licence

Code: MIT — see `LICENSE`. The theme (`themes/pocketbook-theme/`: layouts,
CSS, JS, build scripts) carries its own matching MIT `LICENSE`. Book text and
cover copy (`content/chapters/`, `hugo.toml`'s `[params]`, `i18n/ro.toml`):
**CC BY-NC-ND 4.0** — see `LICENSE-CONTENT`. Free to copy and print for
personal use with attribution; no unauthorised commercial resale, no
redistributing a modified version. Buy a printed copy through the store to
support the project.

Fonts: SIL Open Font License 1.1 — full text shipped with the subsets in the
theme's `static/fonts/OFL-source-serif.txt` and `OFL-source-sans.txt`.
paged.js: MIT.
