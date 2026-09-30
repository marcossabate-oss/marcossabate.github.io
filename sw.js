/**
 * This service worker only caches the tiny "shell" (this handful of files) so
 * the app icon still opens to something instead of a blank/error screen when
 * there's no signal. It never touches script.google.com or the Sheets data —
 * that all happens live, inside the iframe, over the network as normal.
 *
 * Bump CACHE_NAME whenever you edit any shell file so returning devices pick
 * up the change instead of serving a stale cached copy.
 */
const CACHE_NAME = "shuttle-portal-shell-v1";
const SHELL_FILES = [
  "config.js",
  "driver/index.html",
  "driver/manifest.json",
  "admin/index.html",
  "admin/manifest.json",
  "icons/driver-192.png",
  "icons/driver-512.png",
  "icons/admin-192.png",
  "icons/admin-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for our own shell files only. Anything else (e.g. the
// script.google.com iframe content, Google Fonts, etc.) is left completely
// alone and goes straight to the network — this worker never intercepts it.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
