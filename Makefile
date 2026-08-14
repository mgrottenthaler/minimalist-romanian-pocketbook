.PHONY: pdf serve fonts clean

# Build the print-ready interior PDF into dist/
pdf:
	hugo --cleanDestinationDir
	node scripts/build-pdf.mjs

# Live preview in the browser, paginated by paged.js exactly as it will print
serve:
	hugo server --disableFastRender

# Re-vendor the fonts from Adobe upstream into static/fonts/
fonts:
	./scripts/fetch-fonts.sh

clean:
	rm -rf public dist resources
