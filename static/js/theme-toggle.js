(function () {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function effective() {
    var explicit = document.documentElement.getAttribute("data-theme");
    return explicit || (media.matches ? "dark" : "light");
  }
  function render() {
    var dark = effective() === "dark";
    btn.textContent = dark ? "dark" : "light";
    btn.setAttribute("aria-label", dark ? "Comută la tema deschisă" : "Comută la tema închisă");
  }
  btn.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    render();
  });
  render();
})();
