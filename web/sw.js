/* ============================================================
   JaundiCare Service Worker — Offline support
   Caches shell, assets, and i18n files for offline use
   ============================================================ */

const CACHE_NAME  = "jaundicare-v1";
const CACHE_FIRST = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./i18n/en.json",
  "./i18n/yo.json",
  "./i18n/ha.json",
  "./i18n/ig.json",
  "./i18n/pcm.json"
];

// Install — cache shell immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_FIRST))
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — cache first for shell, network first for API
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — always go to network
  if (url.pathname.startsWith("/screening") ||
      url.pathname.startsWith("/profile") ||
      url.hostname === "127.0.0.1") {
    return;
  }

  // Cache first for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});