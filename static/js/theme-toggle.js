(function () {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  var meta = document.querySelector('meta[name="theme-color"]');
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function effective() {
    var explicit = document.documentElement.getAttribute("data-theme");
    return explicit || (media.matches ? "dark" : "light");
  }
  function render() {
    var dark = effective() === "dark";
    btn.textContent = dark ? "dark" : "light";
    btn.setAttribute("aria-label", dark ? "Comută la tema deschisă" : "Comută la tema închisă");
    if (meta) meta.setAttribute("content", dark ? "#161513" : "#fbfaf8");
  }
  btn.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    render();
  });
  // Keep the status bar in sync if the OS theme changes while no explicit
  // override is set (data-theme absent, so effective() tracks the OS).
  media.addEventListener("change", render);
  render();
})();
