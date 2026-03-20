const CACHE_NAME = 'tschingler-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // If not in cache, fetch it
      return fetch(e.request).then((response) => {
        // Check if we received a valid response
        if (!response || (response.status !== 200 && response.type !== 'opaque')) {
          return response;
        }

        // Cache external audio files dynamically
        // We check for 'audio' destination OR common audio extensions
        if (
            e.request.destination === 'audio' || 
            e.request.url.match(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i)
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});
