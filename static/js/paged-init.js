// Default is the website: a normal scrolling page, styled by web.css.
// Book mode (paged.js pagination + book.css) is opt-in — either visit
// with ?print, or scripts/build-pdf.mjs sets PagedConfig.auto = true
// itself before this script runs. The two stylesheets are mutually
// exclusive: paged.js clones the live DOM into its paginated output, so
// web.css must be fully disabled in book mode or its rules cascade
// straight onto the paginated pages alongside book.css.
window.PagedConfig = window.PagedConfig || { auto: new URLSearchParams(location.search).has("print") };

// A chapter's opening page already carries the chapter title, in 12pt over
// a rule; the running head would repeat the same words 4mm above it. Mark
// those pages once pagination is done and let book.css drop the head on
// them. It has to happen here rather than in CSS: a named @page would work,
// but paged.js forces a page break wherever the page name changes, which
// pushes every chapter's body onto a leaf of its own (+16 pages).
// scripts/build-pdf.mjs installs its own `after` to signal that pagination
// finished, so compose with whatever is already there instead of replacing.
var pagedAfter = window.PagedConfig.after;
window.PagedConfig.after = function (flow) {
  document.querySelectorAll(".pagedjs_page").forEach(function (pg) {
    if (pg.querySelector(".chapter > h1")) pg.classList.add("chapter-open");
  });
  if (pagedAfter) return pagedAfter(flow);
};

if (window.PagedConfig.auto) {
  document.getElementById("web-css").media = "not all";
  document.getElementById("book-css").media = "all";
}
