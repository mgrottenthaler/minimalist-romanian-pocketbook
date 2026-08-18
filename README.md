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
| Binding | Coil |
| Interior | Black & white, no bleed |
| Margins | top .34 / bottom .38 / **inner .56** / outer .28 in, mirrored |
| Body face | Source Serif 4 **SmText** (OFL), 8.3 pt / 10.8 pt |
| Display face | Source Sans 3 (OFL) |
| Extent | **38 pages** incl. the contents page |

The inner margin is deliberately oversized: coil binding punches holes through
the gutter, and Lulu asks for ≥ 0.5 in of clearance from the punched edge.
Margins mirror between recto and verso via `@page :left` / `@page :right`.

Both fonts are OFL-licensed and vendored into `static/fonts/` by
`scripts/fetch-fonts.sh`, which pulls Adobe's upstream releases and subsets them
with `fonttools`. Re-run it to refresh them. It also fetches each family's
`LICENSE.md` alongside the subsets — OFL 1.1 requires the licence to travel with
redistributed fonts, and these are redistributed in this repo.

Two things drove the font choice. They render **ș** and **ț** with a proper comma
below rather than a cedilla (ş/ţ), which a large share of screen fonts get wrong
and which looks wrong in print. And Source Serif ships an explicit **SmText**
optical size, drawn for small text — the right cut for an 8.3 pt body.

Do not swap in the `@fontsource` builds: their subsets omit `U+2192 →`, which
this book uses on nearly every page, so every arrow silently falls back to Times
New Roman. The `pdffonts` check below exists to catch exactly that.

## Print decisions

Settled against Lulu's live product data (checked 2026-08-18). Everything here
is a choice, not a constraint, so the reasoning is written down rather than left
implicit in `book.css`.

| Decision | Why | Cost of the alternative |
|---|---|---|
| **Pocketbook** 4.25 × 6.875 in | It is a pocketbook. Coil *is* offered at this trim — 2–470 pages — so nothing forces a larger size. | A5 or US Trade would take the same content in fewer pages, and stop fitting in a pocket. |
| **Coil** binding | A reference gets consulted one-handed, held open at one table. Coil lies flat; perfect binding at 40 pages does not. | Coil is **not eligible for Lulu retail distribution** — only perfect bound is. This book is print-for-self / direct sale, so that is not a loss here, but it does mean an ISBN listing would require re-binding as perfect bound (32-page minimum, which 40 clears). |
| **Standard B&W** interior, 60# cream uncoated | Cheapest option, and the book is pure type — bold, italic and a shaded box carry every distinction it makes. Cream is easier on the eye at 8.3 pt than white. | Colour costs more, and is billed across the **whole** book, not per coloured page. See the table below. |
| **Inner margin .56 in** | Coil punches through the gutter; Lulu asks ≥ 0.5 in clearance from the punched edge. | Text destroyed by the punch, or unreadable in the gutter. |

Print cost per copy, Pocketbook / 40 pp / coil / glossy cover, from Lulu's
pricing calculator in EUR on 2026-08-18:

| Interior | Paper | Cost |
|---|---|---|
| **Standard B&W** | 60# cream uncoated | **€6.17** |
| Premium B&W | 60# cream uncoated | €6.65 |
| Standard Colour | 60# white uncoated | €6.94 |
| Standard Colour | 80# coated white | €7.17 |
| Premium Colour | 60# white uncoated | €9.42 |
| Premium Colour | 80# coated white | €9.94 |

Two things make colour worse than the +€0.77 headline suggests: it is charged on
every page whether or not that page has any colour, and it is not offered on
cream stock at all, so choosing colour also means giving up the cream paper.
Hence: **black and white**, and the design must carry its distinctions with
weight, shape and shading rather than hue.

To re-check any of this without an account — Lulu's product catalogue is a
public GraphQL endpoint. `podPackages` returns every valid combination of trim,
binding, ink, paper and finish, with page-count limits and retail eligibility:

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

Package ids read `TRIM.INK.QUALITY.BINDING.PAPER.FINISH` — ours is
`0425X0687.BW.STD.CO.060UC444.GXX`. Prices are not in that endpoint; they come
from the calculator at <https://www.lulu.com/pricing>.

## Toolchain

```
content/*.md  ──hugo──>  public/index.html  ──paged.js──>  paginated DOM
                                            ──chromium──>  dist/*.pdf
```

Hugo assembles every chapter into **one** HTML document (`layouts/home.html`);
chapter pages are never rendered individually. That document ships two
stylesheets and picks one: a normal `web.css` for browsing, and `book.css` +
paged.js for the printed layout, which does what Chrome's print engine
cannot — mirrored margins, running heads, folios, and a table of contents
with real page numbers (`target-counter`). A plain visit gets the website;
appending `?print` to the URL (or building the PDF) switches to the
paginated book preview.

### Build

```sh
make pdf      # hugo + chromium → dist/gramatica-romana-interior.pdf
make serve    # live preview as a website; add ?print for the paginated book
make fonts    # re-vendor the fonts from upstream
make clean
```

`make pdf` prints the extent and the measured trim size, appends a blank leaf if
the count came out odd, and snaps every page box to exactly 4.25 × 6.875 in
(Chromium's px→pt rounding otherwise lands a fraction of a point off). It fails
the build on two conditions rather than warning: a rendered trim more than a
point off the intended one, and any face that is not embedded or that is a
system fallback.

Requires `hugo` (extended), Node, and a Chromium binary. The build script finds
Chromium automatically; override with `CHROME_PATH=/path/to/chrome`.

### Layout

```
content/chapters/*.md    one file per chapter, ordered by `weight`
layouts/home.html        assembles the whole book into one document
assets/css/fonts.css     @font-face rules, shared by book.css and web.css
assets/css/web.css       the website: normal layout, loaded by default
assets/css/book.css      the printed book: page geometry, typography, tables
static/fonts/            vendored OFL woff2 subsets + OFL-*.txt (see scripts/fetch-fonts.sh)
static/vendor/pagedjs/   vendored paged.js polyfill
scripts/build-pdf.mjs    serves public/, waits for pagination, prints PDF
scripts/fetch-fonts.sh   downloads + subsets the fonts from Adobe upstream
```

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
| 15 | Registru și forme omise | 2 |

Plus the table of contents on page 1: **38 pages** total. The book has no
title page — it would only repeat the cover, which carries the same title and
subtitle and has no publisher or imprint to add. `layouts/home.html` drops the
`.titlepage` section from the DOM in book mode; the website still shows it.

> The original target was 30. The type is already at 8.3 pt, which is about the
> floor for comfortable reading in print, so the remaining eight pages are
> structural rather than typographic: every chapter starts on a fresh page, and
> tables are never split across a page turn. Two levers exist if 30 matters more
> than those properties — drop `break-before: page` on `.chapter` (≈ −6 pp, at
> the cost of findability), or relax `break-inside: avoid` on `table` (≈ −3 pp,
> at the cost of paradigms splitting across a page turn with no repeated header).

### Typographic conventions

- **bold** — the ending, infix or auxiliary that carries the grammar
- *italic* — example words and sentences
- shaded box — a note about an exception or a trap

---

## What is deliberately left out

The point of a book this size is the cutting. Everything below is real Romanian
that a reference grammar would cover, and is omitted on purpose.

**Tenses and moods**

| Omitted | Why |
|---|---|
| Perfectul simplu (*cântai, cântă*) | Literary narrative and spoken Oltenia only. You will read it, never say it. Mentioned in ch. 15 as recognition-only. |
| Viitorul cu *am să* (*am să cânt*) | Overlaps with *o să* in meaning and register; markedly less frequent. One line in ch. 15. |
| Viitorul popular (*oi cânta*) | Regional, distinct paradigm from *o să* (no *să*, different *o*). Rare outside rural/regional speech. One line in ch. 15. |
| Viitorul anterior (*voi fi cântat*) | Effectively extinct outside formal writing. |
| Modul prezumtiv (*o fi cântând*) | Genuinely used for hedging, but marginal enough to cost more space than it returns. One line in ch. 15. |
| Infinitivul lung as a verb form (*cântare*) | Survives only as a noun. Noun use is covered; verbal use is not. |
| Optativ/condițional perfect drills | The form (*aș fi cântat*) is given once; usage is left to the reader. |

**Everything else**

| Omitted | Why |
|---|---|
| Pronunciation and the alphabet | The reader is B2. Nothing here is worth a page. |
| Etymology, historical phonology | Explains alternations, but is not a reference need. |
| Vocabulary, thematic word lists | Different book. |
| Exercises | Different book. |
| Regional morphology (Moldovan, Banat, Ardeal) | Standard literary Romanian only. |
| Archaic vocative (*Doamne*, *frate*) beyond the common forms | Covered only where still productive. |
| Historical orthography (*sînt* vs. *sunt*, î/â rules) | Current DOOM² spelling throughout, no rule history. |
| Rare collective numerals (*câteșitrei*) | Not worth the line. |
| *Dânsul* as a politeness form | Contested register in Romania; a plain 3rd-person pronoun in Moldova, not politeness. One row + note in ch. 15. |

**Included even though it is arguably marginal**

- Mai-mult-ca-perfectul — still common in speech, unlike the other "hard" tenses.
- Conjunctivul perfect (*să fi plecat*) — one row, because it appears constantly
  after *ar fi trebuit*.
- Supinul — heavily used (*am ceva de făcut*) and often skipped by textbooks.

---

## Printing at Lulu

1. `make pdf` → `dist/gramatica-romana-interior.pdf` (interior only). It reports
   the extent and trim, and fails rather than ships if the trim is wrong.
2. The font check runs as part of the build: every face must be embedded and no
   system face (Times, Helvetica, Arial, …) may appear, which would mean a glyph
   fell back. It needs `pdffonts` from poppler-utils; if that is not installed
   the build says so and continues, and you should check by hand:

   ```sh
   pdffonts dist/gramatica-romana-interior.pdf
   ```

3. Download Lulu's cover template for that exact page count and build the cover
   separately — coil-bound covers have no spine text, so it is a front/back
   artboard, not a wrap. **Still to do.**
4. Upload interior + cover.

### Known quirks of the output

- Chromium writes some italic runs as **Type 3** fonts. They are embedded and
  path-based — checked at 600 dpi, they print as clean vector outlines — so this
  is cosmetic. If Lulu's preflight ever objects, a Ghostscript pass
  (`gs -sDEVICE=pdfwrite`) normalises them.
- The 64-row irregular-verb table spans three pages and paged.js does not re-emit
  the `<thead>` on the later ones. Left as is: the columns are self-evident, and
  the alternatives are all more fragile than the problem.

Coil at Pocketbook trim is confirmed available, 2–470 pages — see **Print
decisions** above. Should that ever change, the nearest fallbacks are A5
(5.83 × 8.27 in) or US Trade (6 × 9 in): change the `@page` blocks at the top of
`assets/css/book.css` and nothing else, then re-measure the extent.

## Licence

Book text: to be decided. Fonts: SIL Open Font License 1.1 — full text shipped
with the subsets in `static/fonts/OFL-source-serif.txt` and
`static/fonts/OFL-source-sans.txt`. paged.js: MIT.
