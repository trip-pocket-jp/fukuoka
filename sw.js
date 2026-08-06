const CACHE = "fukuoka-trip-v40";
const baseUrl = new URL("./", self.registration.scope);
const assetUrl = (path) => new URL(path, baseUrl).toString();
const STATIC_FILES = [
  assetUrl("./"),
  assetUrl("manifest.webmanifest"),
  assetUrl("icons/icon-192.png"),
  assetUrl("icons/icon-512.png"),
  assetUrl("icons/apple-touch-icon.png"),
  assetUrl("assets/app-v40.js"),
  assetUrl("assets/app-v40.css"),
  assetUrl("assets/github-app-v40.js"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => Promise.allSettled(STATIC_FILES.map(async (url) => {
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) await cache.put(url, response);
    }))),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(baseUrl.href)) return;
  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(assetUrl("./")))),
  );
});
