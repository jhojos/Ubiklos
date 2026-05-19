// Ubiklos Service Worker v1.2.0
// Estrategia: network-first con fallback a cache.
// Para invalidar caché al actualizar el proto, sube el número de versión abajo.

const CACHE_VERSION = 'ubiklos-v1.2.0';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Install: precachea archivos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: limpia caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, fallback a cache si no hay red
self.addEventListener('fetch', (event) => {
  // Solo manejamos GET; ignoramos otros métodos
  if (event.request.method !== 'GET') return;

  // Ignoramos peticiones a CDN externas (que tengan su propio cache)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es OK, la guardamos en cache para uso offline
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
