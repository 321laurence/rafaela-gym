const CACHE_NAME = "rafaela-gym-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_FILES);
      })
  );

  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
  );

  self.clients.claim();
});


self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (
    new URL(event.request.url).origin !==
    self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseCopy =
          response.clone();

        caches
          .open(CACHE_NAME)
          .then((cache) => {
            cache.put(
              event.request,
              responseCopy
            );
          });

        return response;
      })
      .catch(() => {
        return caches
          .match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            return caches.match(
              "./index.html"
            );
          });
      })
  );
});
