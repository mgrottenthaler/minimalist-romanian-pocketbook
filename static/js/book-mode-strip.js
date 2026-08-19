// The title page, the web-only instructions note, and the site
// header/footer (cross-link to grottenthaler.eu, imprint/privacy) are all
// website-only. The title page would only duplicate the cover — same
// title and subtitle, no publisher or imprint to carry — so the book
// opens straight on the contents; the note (?print, PDF download links)
// makes no sense once it's already printed; and the header/footer are
// browser chrome with nothing to say on paper. All of them have to leave
// the DOM rather than be hidden in book.css: paged.js lays out
// display:none elements all the same, which costs an empty leading (or
// trailing) page.
if (window.PagedConfig.auto) {
  document.querySelectorAll(".titlepage, .site-note, .site-header, .site-footer").forEach(function (el) {
    el.remove();
  });
}
