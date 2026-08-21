// Runs before any stylesheet paints, so an explicit override (set by the
// theme-toggle button) never flashes the OS-preferred theme first. Also sets
// the theme-color meta tag (Android status bar / PWA toolbar color) up
// front, since that can't be expressed with CSS alone once an explicit
// data-theme override is in play. Colors must match --bg light/dark in
// assets/css/web.css.
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
  var explicit = document.documentElement.getAttribute("data-theme");
  var dark = explicit ? explicit === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#161513" : "#fbfaf8");
})();
