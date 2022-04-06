import { build, files, version } from '$service-worker';

const worker = self;
const CACHE_NAME = `static-cache-${version}`;

const to_cache = build.concat(files);

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(to_cache))
      .then(worker.skipWaiting)
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(async keys => {
      for (const key of keys) {
        if (key !== CACHE_NAME) await caches.delete(key);
      }

      worker.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') {
    // Not a page navigation, bail.
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
