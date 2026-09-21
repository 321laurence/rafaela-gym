const CACHE_NAME = "rafaela-gym-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
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

  const requestURL =
    new URL(event.request.url);

  if (
    requestURL.origin !==
    self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {

        if (
          !response ||
          response.status !== 200
        ) {
          return response;
        }

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

            if (
              event.request.mode ===
              "navigate"
            ) {
              return caches.match(
                "./index.html"
              );
            }

            return new Response(
              "Offline",
              {
                status: 503,
                statusText: "Offline"
              }
            );
          });
      })
  );
});
