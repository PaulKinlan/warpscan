const CACHE_NAME = "warp-scan-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/src/style.css",
  "/src/app.js",
  "/src/lib.js",
  "/src/camera.js",
  "/src/scanner.js",
  "/manifest.webmanifest",
  "/src/images/open.svg",
  "/src/images/start.svg",
  "/src/images/save.svg",
  "/src/images/stop.svg",
];

self.addEventListener("install", (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
