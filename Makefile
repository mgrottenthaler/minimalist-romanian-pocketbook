.PHONY: pdf html interior cover og serve fonts clean

PDF_BASENAME := gramatica-romana

# Both print-ready PDFs into dist/, plus the site's social-share image into
# public/images/, and the live-preview server — all shared logic, defined
# in themes/pocketbook-theme/Makefile.inc (see that theme's README for the
# submodule/PDF_BASENAME contract).
include themes/pocketbook-theme/Makefile.inc

# Fonts are vendored once in the shared theme (same faces/subset for every
# book in the series) and picked up here by the submodule pointer — this
# repo never runs fetch-fonts.sh itself. See themes/pocketbook-theme's own
# Makefile (`make fonts`) to refresh them there.
fonts:
	@echo "Fonts are vendored in the theme, not this repo — see themes/pocketbook-theme/README.md"
	@exit 1
