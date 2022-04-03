import { build, files, version } from '$service-worker';

const worker = self;
const CACHE_NAME = `static-cache-${version}`;

const to_cache = build.concat(files);
const staticAssets = new Set(to_cache);

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

/**
 * Fetch the asset from the network and store it in the cache.
 * Fall back to the cache if the user is offline.
 */
async function fetchAndCache(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const response = await cache.match(request);
    if (response) return response;

    throw err;
  }
}

worker.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') {
    // Not a page navigation, bail.
    return;
  }

  const url = new URL(event.request.url);
  const isStaticAsset = staticAssets.has(url.pathname);

  event.respondWith(
    (async () => {
      const cachedAsset = isStaticAsset && (await caches.match(event.request));

      return cachedAsset || fetchAndCache(event.request);
    })()
  );
});
