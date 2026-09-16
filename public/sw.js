const CACHE_NAME = 'candidate-se-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA: Static assets caching notice:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests and API requests
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  const url = new URL(request.url);

  // 1. Navigation requests (HTML pages): ALWAYS NETWORK-FIRST
  // This guarantees users always get the latest index.html with up-to-date JS chunk hashes!
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, serve cached HTML
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html') || caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Static / Assets requests (JS, CSS, Images, Fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached asset if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // IMPORTANT: Never cache an HTML fallback when fetching a .js or .css asset!
        const contentType = networkResponse.headers.get('content-type') || '';
        const isJsOrCss = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
        if (isJsOrCss && contentType.includes('text/html')) {
          return networkResponse;
        }

        // Cache valid asset
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
