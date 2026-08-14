#!/usr/bin/env bash
# Vendors the book's fonts into static/fonts/ from Adobe's upstream releases.
#
# Not @fontsource: its subsets omit U+2192 (→), which this book uses on almost
# every page, so every arrow silently fell back to Times New Roman.
#
# The serif is the SmText optical size — the cut Adobe designed for small text,
# which is what the 8.3pt body of a pocketbook needs.
#
# Requires: curl, unzip, python3 with fonttools + brotli.
set -euo pipefail

SERIF_VER=4.005
SANS_VER=3.052R
OUT="$(cd "$(dirname "$0")/.." && pwd)/static/fonts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Latin, Latin-1, Latin Extended-A/B (ș ț ă), punctuation, currency, arrows.
UNICODES="U+0020-007E,U+00A0-00FF,U+0100-024F,U+02B0-02FF,U+0300-036F,U+2000-206F,U+2070-209F,U+20A0-20BF,U+2116,U+2122,U+2190-21FF,U+2212"

echo "→ downloading"
curl -sSL -o "$TMP/serif.zip" \
  "https://github.com/adobe-fonts/source-serif/releases/download/${SERIF_VER}R/source-serif-${SERIF_VER}_WOFF2.zip"
curl -sSL -o "$TMP/sans.zip" \
  "https://github.com/adobe-fonts/source-sans/releases/download/${SANS_VER}/WOFF2-source-sans-${SANS_VER}.zip"
unzip -q -o "$TMP/serif.zip" -d "$TMP/serif"
unzip -q -o "$TMP/sans.zip" -d "$TMP/sans"

subset () {  # subset <source> <output-name>
  python3 -m fontTools.subset "$1" \
    --unicodes="$UNICODES" \
    --layout-features='kern,liga,ccmp,mark,mkmk,onum,lnum,tnum' \
    --flavor=woff2 \
    --output-file="$OUT/$2"
  printf '   %-40s %s\n' "$2" "$(du -h "$OUT/$2" | cut -f1)"
}

mkdir -p "$OUT"
rm -f "$OUT"/*.woff2

SERIF="$TMP/serif/source-serif-${SERIF_VER}_WOFF2/TTF"
SANS="$TMP/sans/WOFF2/TTF"

echo "→ subsetting"
subset "$SERIF/SourceSerif4SmText-Regular.ttf.woff2"  source-serif-regular.woff2
subset "$SERIF/SourceSerif4SmText-It.ttf.woff2"       source-serif-italic.woff2
subset "$SERIF/SourceSerif4SmText-Semibold.ttf.woff2" source-serif-semibold.woff2
subset "$SERIF/SourceSerif4SmText-Bold.ttf.woff2"     source-serif-bold.woff2
subset "$SANS/SourceSans3-Regular.ttf.woff2"          source-sans-regular.woff2
subset "$SANS/SourceSans3-Semibold.ttf.woff2"         source-sans-semibold.woff2
subset "$SANS/SourceSans3-Bold.ttf.woff2"             source-sans-bold.woff2

echo "→ done"
