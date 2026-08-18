.PHONY: pdf html interior cover serve fonts clean

# Both print-ready PDFs into dist/: the interior and the cover. Lulu takes them
# as two separate uploads, so they stay two files. `html` is a prerequisite of
# both, and make runs it once.
pdf: interior cover

html:
	hugo --cleanDestinationDir

interior: html
	node scripts/build-pdf.mjs

# The cover carries no spine (coil binding), so it does not depend on the
# interior's final page count the way a perfect-bound cover would.
cover: html
	node scripts/build-cover.mjs

# Live preview in the browser as a normal website (assets/css/web.css).
# Add ?print to the URL to see the paginated book layout instead, exactly as
# it will print (assets/css/book.css + paged.js). /cover/ shows the cover
# artwork; add ?guides there for the bleed, trim and coil-punch guides.
#
# --baseURL only so the address hugo prints carries a scheme and is clickable:
# baseURL in hugo.toml is "/" (the built site uses root-relative URLs only),
# and hugo server keeps that empty scheme, printing "//localhost:1313/".
serve:
	hugo server --disableFastRender --baseURL http://localhost:1313/

# Re-vendor the fonts from Adobe upstream into static/fonts/
fonts:
	./scripts/fetch-fonts.sh

clean:
	rm -rf public dist resources
