/*
  Rafaela Gym V2
  Offline Service Worker

  Caches the complete Rafaela Gym application:
  - Interface
  - Curriculum
  - Learning ledger
  - Adaptive trainer
  - Scenario engine
  - App controller
  - Manifest
  - Icons
*/

const CACHE_NAME = "rafaela-gym-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./curriculum.js",
  "./storage.js",
  "./trainer.js",
  "./scenarios.js",
  "./app.js"
];


/*
  --------------------------------
  INSTALL
  --------------------------------

  Download the complete app shell.
*/

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();

  }
);


/*
  --------------------------------
  ACTIVATE
  --------------------------------

  Delete older Rafaela Gym caches.
*/

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {

          return Promise.all(
            cacheNames.map((cacheName) => {

              if (cacheName !== CACHE_NAME) {
                return caches.delete(cacheName);
              }

              return Promise.resolve();

            })
          );

        })
    );

    self.clients.claim();

  }
);


/*
  --------------------------------
  FETCH
  --------------------------------

  Strategy:

  HTML navigation:
  Network first → cached app fallback

  Static application files:
  Cache first → network → save response

  This gives us:
  - current versions when online
  - reliable operation when offline
*/

self.addEventListener(
  "fetch",
  (event) => {

    const request = event.request;

    if (request.method !== "GET") {
      return;
    }

    const requestURL = new URL(request.url);

    /*
      Only manage files belonging to
      Rafaela Gym itself.
    */

    if (requestURL.origin !== self.location.origin) {
      return;
    }


    /*
      -----------------------------
      PAGE NAVIGATION
      -----------------------------
    */

    if (request.mode === "navigate") {

      event.respondWith(

        fetch(request)

          .then((response) => {

            const responseCopy =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {

                cache.put(
                  "./index.html",
                  responseCopy
                );

              });

            return response;

          })

          .catch(() => {

            return caches.match(
              "./index.html"
            );

          })

      );

      return;

    }


    /*
      -----------------------------
      STATIC APP FILES
      -----------------------------
    */

    event.respondWith(

      caches
        .match(request)

        .then((cachedResponse) => {

          if (cachedResponse) {

            /*
              Refresh the cached copy
              quietly in the background.
            */

            fetch(request)
              .then((networkResponse) => {

                if (
                  networkResponse &&
                  networkResponse.ok
                ) {

                  caches
                    .open(CACHE_NAME)
                    .then((cache) => {

                      cache.put(
                        request,
                        networkResponse.clone()
                      );

                    });

                }

              })
              .catch(() => {});

            return cachedResponse;

          }


          /*
            File was not cached yet.
            Try the network.
          */

          return fetch(request)

            .then((networkResponse) => {

              if (
                !networkResponse ||
                !networkResponse.ok
              ) {

                return networkResponse;

              }

              const responseCopy =
                networkResponse.clone();

              caches
                .open(CACHE_NAME)
                .then((cache) => {

                  cache.put(
                    request,
                    responseCopy
                  );

                });

              return networkResponse;

            })

            .catch(() => {

              /*
                Last fallback for a navigation-like
                request that reaches this branch.
              */

              return caches.match(
                "./index.html"
              );

            });

        })

    );

  }
);
