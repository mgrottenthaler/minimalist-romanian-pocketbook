# The Minimalist Romanian Pocketbook

A pocket-sized Romanian grammar reference: paradigms, endings and tense
formation, with as little prose as possible. Built with Hugo, paginated by
paged.js, printed to PDF by headless Chromium, and produced as a coil-bound
pocketbook at Lulu.

The book itself is entirely in Romanian — headings, table labels and the few
usage notes. It is a refresher for a reader at roughly B2, not a course: it
assumes you know what a subjunctive is and only need to see the forms again.
This README is in English because it documents the repo, not the book.

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

Both fonts are OFL-licensed and vendored into `static/fonts/` by
`scripts/fetch-fonts.sh`, which pulls Adobe's upstream releases, subsets them
with `fonttools`, and fetches each family's `LICENSE.md` alongside (OFL 1.1
requires the licence travel with redistributed fonts). Re-run it to refresh.

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

Hugo assembles every chapter into **one** HTML document (`layouts/home.html`);
chapter pages are never rendered individually. That document ships two
stylesheets and picks one: a normal `web.css` for browsing, and `book.css` +
paged.js for the printed layout, which does what Chrome's print engine
cannot — mirrored margins, running heads, folios, and a table of contents
with real page numbers (`target-counter`). A plain visit gets the website;
appending `?print` to the URL (or building the PDF) switches to the
paginated book preview.

The cover is a second document with its own layout (`layouts/cover.html`), its
own stylesheet (`assets/css/cover.css`) and its own build script. It skips
paged.js entirely — it is exactly one page — and is the only artwork in the
project with bleed. Its back-cover contents list is generated from the same
chapter pages the book is, so it can't drift out of date, and the version on
the front is read from `VERSION`, the file `release.py` bumps and tags.

### Build

```sh
make pdf       # both PDFs into dist/ — interior and cover
make interior  # hugo + chromium → dist/gramatica-romana-interior.pdf
make cover     # hugo + chromium → dist/gramatica-romana-cover.pdf
make serve     # live preview as a website; add ?print for the paginated book,
               # or open /cover/ (add ?guides for bleed / trim / punch guides)
make fonts     # re-vendor the fonts from upstream
make clean
```

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

```
content/chapters/*.md    one file per chapter, ordered by `weight`
content/cover.md         front matter only — gives the cover layout a page
layouts/home.html        assembles the whole book into one document
layouts/cover.html       the cover artwork: back cover left, front cover right
assets/css/fonts.css     @font-face rules, shared by all three stylesheets
assets/css/web.css       the website: normal layout, loaded by default
assets/css/book.css      the printed book: page geometry, typography, tables
assets/css/cover.css     the cover: sheet geometry, bleed, safety, colour
static/fonts/            vendored OFL woff2 subsets + OFL-*.txt (see scripts/fetch-fonts.sh)
static/vendor/pagedjs/   vendored paged.js polyfill
scripts/pdf-common.mjs   shared by both builds: local server, Chromium, font check
scripts/build-pdf.mjs    serves public/, waits for pagination, prints the interior
scripts/build-cover.mjs  prints the one-page cover sheet
scripts/fetch-fonts.sh   downloads + subsets the fonts from Adobe upstream
VERSION                  MAJOR.MINOR, bumped by release.py, printed on the cover
```

### Website

`romanian.grottenthaler.eu` serves `public/` — the scrolling reading copy
(`web.css`), not the paginated PDF — from a Cloudflare Worker with static
assets, defined in `wrangler.jsonc`.

Deployed by `.github/workflows/pdf.yml`, on the same `push: tags` trigger
that builds the PDFs — not on every push to `main`, so the live site only
moves when a version is actually published, in step with the GitHub Release.

The workflow runs `npm run build` (hugo, then both PDFs), copies
`dist/*.pdf` into `public/pdf/`, and deploys with `wrangler deploy`
(`cloudflare/wrangler-action`), authenticated with a `CLOUDFLARE_API_TOKEN`
repo secret (`CLOUDFLARE_ACCOUNT_ID` too, unless the token is already scoped
to one account). The custom domain route is provisioned by that same
`wrangler deploy` from `wrangler.jsonc`.

The interior and cover PDFs are downloadable from the site itself
(`/pdf/gramatica-romana-interior.pdf`, `/pdf/gramatica-romana-cover.pdf`),
linked from a short web-only note above the contents. That note, and the
?print instructions next to it, are stripped from the DOM in book mode (see
the script at the bottom of `layouts/home.html`) so neither shows up in the
print output.

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
publisher or imprint to add. `layouts/home.html` drops the `.titlepage`
section from the DOM in book mode; the website still shows it.

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
eligibility without an account, Lulu's product catalogue is a public GraphQL
endpoint:

```sh
curl -sG https://api.lulu.com/graphql/ \
  --data-urlencode 'operationName=podPackages' \
  --data-urlencode 'variables={"printableType":"BOOK"}' \
  --data-urlencode 'query=query podPackages($printableType: PrintableTypeEnum) {
    podPackages(printableType: $printableType) {
      id distributionEligible minPages maxPages interiorInkColor printQuality
      trimSize { key } bindingType { key } } }' |
  python3 -m json.tool | grep -A2 '"0425X0687\.[A-Z]*\.[A-Z]*\.CO\.'
```

`distributionEligible` is false for every coil package — coil is Lulu
Bookstore only, not Global Distribution (Amazon, Ingram, B&N). Prices aren't
in that endpoint; the project wizard at lulu.com is the authoritative number
(it has disagreed with the public pricing calculator at lulu.com/pricing by
tens of cents on an identical spec).

### Selling

Listed on the **Lulu Bookstore** only. Lulu is the merchant — they take
payment, quote shipping, carry VAT/refunds/reprints — for a 20% cut of gross
profit and no distribution fees:

| List | Print | Lulu 20% | Kept per copy |
|---|---|---|---|
| €10 | €6.17 | €0.77 | €3.06 |
| €12 | €6.17 | €1.17 | €4.66 |
| €15 | €6.17 | €1.77 | €7.06 |

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
  `scripts/build-cover.mjs` takes the width from Lulu's template and
  `cover.css` needs a spine panel to match.
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
(`romanian.grottenthaler.eu`) and the repo. All copy lives in `[params]` in
`hugo.toml`.

### Known quirks of the output

- Chromium writes some italic runs as **Type 3** fonts. They are embedded and
  path-based — checked at 600 dpi, they print as clean vector outlines — so
  this is cosmetic. If Lulu's preflight ever objects, a Ghostscript pass
  (`gs -sDEVICE=pdfwrite`) normalises them.
- The 64-row irregular-verb table spans three pages and paged.js does not
  re-emit the `<thead>` on the later ones. Left as is — the columns are
  self-evident.

Coil at Pocketbook trim is confirmed available, 2–470 pages. Should that ever
change, the nearest fallbacks are A5 (5.83 × 8.27 in) or US Trade (6 × 9 in):
change the `@page` blocks at the top of `assets/css/book.css` and nothing
else, then re-measure the extent.

## Licence

Code (`layouts/`, `assets/css/`, `scripts/`): MIT — see `LICENSE`. Book text
and cover copy (`content/chapters/`, the copy in `hugo.toml`'s `[params]`):
**CC BY-NC-ND 4.0** — see `LICENSE-CONTENT`. Free to copy and print for
personal use with attribution; no unauthorised commercial resale, no
redistributing a modified version. Buy a printed copy through the store to
support the project.

Fonts: SIL Open Font License 1.1 — full text shipped with the subsets in
`static/fonts/OFL-source-serif.txt` and `static/fonts/OFL-source-sans.txt`.
paged.js: MIT.
