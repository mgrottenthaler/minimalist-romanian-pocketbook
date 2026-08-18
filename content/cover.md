---
# Renders to /cover/: the one-piece cover artwork, back and front on one sheet.
# scripts/build-cover.mjs prints that page to dist/gramatica-romana-cover.pdf.
# The copy lives in layouts/cover.html and hugo.toml [params] — this file only
# exists to give the layout a page to hang on, so it stays front matter only.
title: "Copertă"
layout: cover
build:
  list: never
---
