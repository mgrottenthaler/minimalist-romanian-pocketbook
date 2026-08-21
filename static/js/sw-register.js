// Registered from the website only (not book-mode/print — see the
// PagedConfig.auto guard in paged-init.js — there's nothing to install
// while paginating for a PDF).
if ("serviceWorker" in navigator && !window.PagedConfig.auto) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js");
  });
}
