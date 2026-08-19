// Runs before any stylesheet paints, so an explicit override (set by the
// theme-toggle button) never flashes the OS-preferred theme first.
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
