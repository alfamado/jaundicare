// Bump this whenever shell assets or language/audio handling changes. It
// forces browsers that installed the old two-language web shell to discard it.
const CACHE_NAME = "jaundicare-web-shell-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add("/")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Never cache API calls, authorisation headers, or a user's clinical data.
  if (url.origin !== self.location.origin || request.headers.has("Authorization")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === "GET") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        if (request.mode === "navigate") return (await caches.match("/")) || Response.error();
        return (await caches.match(request)) || Response.error();
      }),
  );
});
