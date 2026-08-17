.PHONY: pdf serve fonts clean

# Build the print-ready interior PDF into dist/
pdf:
	hugo --cleanDestinationDir
	node scripts/build-pdf.mjs

# Live preview in the browser as a normal website (assets/css/web.css).
# Add ?print to the URL to see the paginated book layout instead, exactly as
# it will print (assets/css/book.css + paged.js).
serve:
	hugo server --disableFastRender

# Re-vendor the fonts from Adobe upstream into static/fonts/
fonts:
	./scripts/fetch-fonts.sh

clean:
	rm -rf public dist resources
