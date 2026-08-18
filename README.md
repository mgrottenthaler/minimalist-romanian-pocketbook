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
| Cover | Full colour, one sheet 8.75 × 7.125 in incl. 0.125 in bleed, no spine |
| Margins | top .34 / bottom .38 / **inner .56** / outer .28 in, mirrored |
| Body face | Source Serif 4 **SmText** (OFL), 8.3 pt / 10.8 pt |
| Display face | Source Sans 3 (OFL) |
| Extent | **38 pages** — 37 of content incl. the contents page, plus a blank leaf to reach an even count |
| Version on the cover | read from `VERSION` at build time |
| Sold as | Lulu Bookstore listing, no ISBN — see **Selling** |

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
| **Coil** binding | A reference gets consulted one-handed, held open at one table. Coil lies flat; perfect binding at 40 pages does not. | Coil is excluded from Lulu's **Global Distribution** — Amazon, Ingram, Barnes & Noble — because those retailers' requirements forbid it, not Lulu's. It sells on the Lulu Bookstore regardless, which is where this book goes; see the next row. Reaching the retail channels would mean re-binding as perfect bound (32-page minimum, which 40 clears) and taking an ISBN. |
| **Lulu Bookstore**, not Global Distribution | Bookstore-only accepts Lulu's entire catalogue of sizes and bindings, so coil is no obstacle, and it pays better: 80 % of gross profit with no retailer wholesale discount taken off ahead of Lulu's cut. It also issues no ISBN, which is the wanted outcome rather than a limitation. | Global Distribution would force perfect binding, an ISBN, and that retailer discount. A private shop instead (own checkout → Lulu's Print API) nets ~€0.75 more per copy at a €12 list and makes us the merchant: shipping quoted per destination, refunds, and reprints when a job fails preflight. |
| **Standard B&W** interior, 60# cream uncoated | Cheapest option, and the book is pure type — bold, italic and a shaded box carry every distinction it makes. Cream is easier on the eye at 8.3 pt than white. | Colour costs more, and is billed across the **whole** book, not per coloured page. See the table below. |
| **Inner margin .56 in** | Coil punches through the gutter; Lulu asks ≥ 0.5 in clearance from the punched edge. | Text destroyed by the punch, or unreadable in the gutter. |
| **Colour cover** | Lulu prints every cover in full colour whatever the interior is — the €6.17 below already includes it. So the cover costs nothing to make in colour, and the B&W discipline that the interior needs does not apply to it. | Setting the cover in grey to match the interior would pay the colour price and take nothing in return. |
| **No spine panel** | Coil-bound covers are two punched boards, not a wrap; there is no spine to print on. The cover is one sheet with the two halves meeting at the centre. | A spine panel would print as a stripe down the middle of the back board. |
| **No running head on a chapter's opening page** | The h1 already names the chapter 4 mm below where the head would sit, in 12 pt over a rule. Dropping it there affects 15 of the 38 pages. `layouts/home.html` tags those pages after pagination and `book.css` hides the margin box; the folio stays. | Doing it in pure CSS means a named `@page` on the h1 — and paged.js forces a break wherever the page name changes, so every chapter's body lands on a leaf of its own: **+16 pages**. |
| **A table never breaks away from the heading and lead-in that introduce it** | `break-after: avoid` on a heading is not enough — nearly every table here has a one-line lead-in between the two, and the table would break at that seam, opening the next page with a bare grid. This cost seven pages that started with an unexplained table. | Free, except in ch. 14, where it pushed three lines past the end of the chapter and left a note box alone on a page. That one heading opts out with `{.may-break}`. |

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

The cover is the exception, and it is free: Lulu's calculator only ever offers a
choice of *interior* ink — the cover is printed in colour on every package, and
the finish (glossy / matte) is the only cover option priced. So the cover uses
the website's accent red where the interior may not. Worth re-confirming in the
order flow before the first print run, since it is the one claim here that comes
from how the calculator is shaped rather than from a number read off it.

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

`distributionEligible` is false for every coil package, and it is the same flag as the icon the pricing calculator puts on eligible options. It means Global
Distribution only. It says nothing about the Lulu Bookstore, which takes coil.

Package ids read `TRIM.INK.QUALITY.BINDING.PAPER.FINISH` — ours is
`0425X0687.BW.STD.CO.060UC444.GXX`. Prices are not in that endpoint; they come
from the calculator at <https://www.lulu.com/pricing>.

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
paged.js entirely — it is exactly one page, so Chromium prints it straight —
and it is the only artwork in the project with bleed. Its back-cover contents
list is generated from the same chapter pages the book is, so it cannot drift
out of date, and the version on the front is read from `VERSION`, the file
`release.py` bumps and tags.

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

`make interior` prints the extent and the measured trim size, appends a blank leaf if
the count came out odd, and snaps every page box to exactly 4.25 × 6.875 in
(Chromium's px→pt rounding otherwise lands a fraction of a point off). It fails
the build on two conditions rather than warning: a rendered trim more than a
point off the intended one, and any face that is not embedded or that is a
system fallback.

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
publisher or imprint to add. `layouts/home.html` drops the
`.titlepage` section from the DOM in book mode; the website still shows it.

Two layout rules set the extent, and both are deliberate: every chapter starts
on a fresh page (`break-before: page` on `.chapter`), and no table is split
across a page turn (`break-inside: avoid` on `table`). Measured against the
current build:

| Relaxed | Extent | What it costs |
|---|---|---|
| — (as built) | **38 pp** | |
| `break-before` on `.chapter` | 32 pp | Chapters start mid-page; findability goes with it. |
| `break-inside` on `table` | 36 pp | Paradigms split across a page turn, and paged.js does not re-emit the header row. |
| both | 30 pp | Both of the above. |

Eight pages of whitespace is the right trade for a book you open at one page and
consult, so it stays as built. But that is where the pages are if the extent
ever has to come down: the type is already at 8.3 pt, about the floor for
comfortable reading in print, so there is nothing to win typographically.

### Typographic conventions

- **bold** — the ending, infix or auxiliary that carries the grammar; in prose,
  the phrase the sentence turns on
- *italic* — example words and sentences, and a Romanian word named rather than
  used (a heading like *Legătura cu substantivul: de*)
- shaded box — a note about an exception or a trap

Nothing else is a distinction. There is no third inline style: the book had a
`code`-style chip on four function words, which read as a UI token next to
letterspaced small caps, and those are now italic like every other named form.

---

## What is deliberately left out

The point of a book this size is the cutting. Everything below is real Romanian
that a reference grammar would cover, and is omitted on purpose.

**Tenses and moods**

| Omitted | Why |
|---|---|
| Perfectul simplu (*cântai, cântă*) | Literary narrative and spoken Oltenia only. You will read it, never say it. Mentioned in ch. 15 as recognition-only. |
| Viitorul cu *am să* (*am să cânt*) | Overlaps with *o să* in meaning and register; markedly less frequent. One cell in the register table in ch. 15. |
| Viitorul popular (*oi cânta*) | Regional, distinct paradigm from *o să* (no *să*, different *o*). Rare outside rural/regional speech. One line in ch. 15. |
| Viitorul anterior (*voi fi cântat*) | Effectively extinct outside formal writing. |
| Modul prezumtiv (*o fi cântând*) | Genuinely used for hedging, but marginal enough to cost more space than it returns. One line in ch. 15. |
| Infinitivul lung as a verb form (*cântare*) | Survives only as a noun. Noun use is covered; verbal use is not mentioned at all. |
| Optativ/condițional perfect drills | The form (*aș fi cântat*) is given once; usage is left to the reader. |

**Everything else**

| Omitted | Why |
|---|---|
| Pronunciation and the alphabet | The reader is B2. Nothing here is worth a page. |
| Etymology, historical phonology | Explains alternations, but is not a reference need. |
| Vocabulary, thematic word lists | Different book. |
| Exercises | Different book. |
| Regional morphology (Moldovan, Banat, Ardeal) | Standard literary Romanian only. |
| Archaic vocative (*Doamne*, *frate*) beyond the common forms | Covered only where still productive — the live endings are in ch. 1. |
| Historical orthography (*sînt* vs. *sunt*) | Current DOOM² spelling throughout, no rule history. The rules in force are stated in ch. 15. |
| Rare collective numerals (*câteșitrei*) | Not worth the line. |
| *Dânsul* as a politeness form | Contested register in Romania; a plain 3rd-person pronoun in Moldova, not politeness. One row + note in ch. 4. |

**Included even though it is arguably marginal**

- Mai-mult-ca-perfectul — still common in speech, unlike the other "hard" tenses.
- Conjunctivul perfect (*să fi plecat*) — one row, because it appears constantly
  after *ar fi trebuit*.
- Supinul — heavily used (*am ceva de făcut*) and often skipped by textbooks.

---

## Printing at Lulu

1. `make pdf` → `dist/gramatica-romana-interior.pdf` and
   `dist/gramatica-romana-cover.pdf`. Each reports its own extent and measured
   size, and fails rather than ships if the size is wrong.
2. The font check runs as part of the build: every face must be embedded and no
   system face (Times, Helvetica, Arial, …) may appear, which would mean a glyph
   fell back. It needs `pdffonts` from poppler-utils; if that is not installed
   the build says so and continues, and you should check by hand:

   ```sh
   pdffonts dist/gramatica-romana-interior.pdf dist/gramatica-romana-cover.pdf
   ```

3. Check the cover against Lulu's own cover template before the first order.
   The geometry is computed from Lulu's published bleed and safety rules rather
   than downloaded from them — see **The cover** below. Page count does not
   enter into it: coil binding has no spine to widen.
4. Upload interior + cover as two separate files — a new project the first
   time, a revision of that project on every release after. This step is done
   by hand and stays that way; see **Selling** below.

### Selling

The book is listed on the **Lulu Bookstore** and nowhere else. That gives it a
lulu.com product page anyone can order from, with Lulu as the merchant: they
take the payment, quote shipping to the buyer's own address, and carry VAT,
refunds and the reprint when a job fails in production. Their cut is 20 % of
gross profit and there are no distribution fees on Bookstore-only sales, so
against the €6.17 print cost, at a list price still to be chosen:

| List | Print | Lulu 20 % | Kept per copy |
|---|---|---|---|
| €10 | €6.17 | €0.77 | €3.06 |
| €12 | €6.17 | €1.17 | €4.66 |
| €15 | €6.17 | €1.77 | €7.06 |

No ISBN is involved. Bookstore-only projects are not offered Lulu's free one at
all, and nothing here needs a bought one.

**The upload is manual because it cannot be anything else.** Lulu's public API
is the Print API, and its entire surface is print jobs, file validation,
shipping quotes and webhooks:

    /print-jobs/              /validate-interior/    /shipping-options/
    /print-job-cost-calc…/    /validate-cover/       /webhooks/
    /print-jobs/{id}/…        /cover-dimensions/

There is no project, title or storefront endpoint anywhere in it, so a listing's
files cannot be replaced programmatically: each release goes up as a revision in
Lulu Studio by hand. That is accepted rather than worked around. A release wants
the cover check in step 3 regardless, so it was never a zero-touch event. Until
the revision is up, the Bookstore simply keeps selling the previous one.

The arrangement that *would* be automatic is a private checkout in front of the
Print API, whose `source_url` is fetched at order time and could point straight
at the newest release asset. It was priced and rejected — see **Print
decisions** above.

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
- **Keep-out** 0.5 in either side of the centre, because the coil punches
  through both boards there — the cover's version of the interior's fat inner
  margin. Artwork stays 0.44 in in from the outside edges, against Lulu's
  0.25 in minimum.

`make serve` then <http://localhost:1313/cover/?guides> draws all of that over
the artwork: trim in red, safety dashed blue, the punch keep-out shaded, the
centre dashed. The guides are preview-only — the PDF build loads the page
without the query string, so they can never print.

The front carries the title, the subtitle from `hugo.toml`, one specimen word
(*cânt**ăm***, ending picked out in the accent red, which is the book's whole
convention in one word), and `Ediția I · v<VERSION>` — the version read from
`VERSION` at build time, so a cover built from a tagged tree always matches the
release it ships with. The back carries the blurb, the fifteen chapters
generated from `content/chapters/`, the typographic legend and the repo. All
the copy lives in `[params]` in `hugo.toml`.

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
