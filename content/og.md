---
# Renders to /og/: a 600x315 card, screenshotted at 2x by
# scripts/gen-og-image.mjs straight into public/images/og-cover.png (1200x630,
# the size og:image/twitter:image expect) — public/, not static/, because the
# screenshot is taken from this page's own rendered output, so it can only
# exist after hugo has already built public/. Front-matter-only, like
# content/cover.md.
title: "Card social"
layout: og
build:
  list: never
---
