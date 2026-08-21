// Makes the book readable offline once it's been opened online at least
// once. The whole book is one HTML document (see layouts/home.html) with a
// fixed, small set of subresources — no per-chapter files to enumerate or
// go stale — so the app shell below is the complete reading experience:
// install precaches it, and every request after that is served
// network-first (falling back to cache when offline) so a normal online
// visit always keeps the cache current. /cover/ and /og/ are build-only
// utility pages (see content/cover.md, content/og.md) and print assets
// (book.min.css, the paged.js polyfill) aren't needed to read the book on a
// phone, so both are left to the runtime cache-fills below rather than
// precached.
const CACHE = "pocketbook-v1";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/css/fonts.min.css",
  "/css/web.min.css",
  "/js/theme-init.js",
  "/js/theme-toggle.js",
  "/js/paged-init.js",
  "/js/book-mode-strip.js",
  "/fonts/source-serif-regular.woff2",
  "/fonts/source-serif-italic.woff2",
  "/fonts/source-serif-bold.woff2",
  "/fonts/source-serif-semibold.woff2",
  "/fonts/source-sans-regular.woff2",
  "/fonts/source-sans-bold.woff2",
  "/fonts/source-sans-semibold.woff2",
  "/favicon.svg",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // The page itself: always try the network first, so a normal online visit
  // sees the latest chapters and keeps the offline copy in sync. Only fall
  // back to whatever's cached — the last-seen page, or failing that the
  // app shell — once the network is unreachable.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match("/"))),
    );
    return;
  }

  // Everything else (css, js, fonts, icons, the print PDFs): serve the
  // cached copy immediately when there is one — instant and offline-capable
  // — while refreshing it from the network in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
