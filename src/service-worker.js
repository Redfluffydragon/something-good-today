import { build, files, version } from '$service-worker';

const worker = self;
const CACHE_NAME = `static-cache-${version}`;

const to_cache = build.concat(files);

worker.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(to_cache))
      .then(worker.skipWaiting)
  );
});

worker.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(async keys => {
      for (const key of keys) {
        if (key !== CACHE_NAME) await caches.delete(key);
      }

      worker.clients.claim();
    })
  );
});

worker.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') {
    // Not a page navigation, bail.
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(async () => {
        return caches.open(CACHE_NAME)
          .then(cache => {
            return cache.match(event.request);
          });
      })
  );
});
