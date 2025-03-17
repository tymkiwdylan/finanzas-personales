const CACHE_NAME = 'budgetcash-cache-v1'; // Increment this version when making changes
const urlsToCache = [
  '/',
  '/offline',
  '/dashboard',
  '/auth/login',
  '/auth/register',
  '/pricing',
  '/icons-png/icon-96x96.png',
  '/icons-png/icon-128x128.png',
  '/icons-png/icon-144x144.png',
  '/icons-png/icon-152x152.png',
  '/icons-png/icon-167x167.png',
  '/icons-png/icon-180x180.png',
  '/icons-png/icon-192x192.png',
  '/icons-png/icon-384x384.png',
  '/icons-png/icon-512x512.png',
  '/icons-png/maskable-192x192.png',
  '/icons-png/maskable-512x512.png',
  '/favicon.ico',
  '/manifest.json',
  // Add static assets that should be available offline
  '/next.svg',
  '/vercel.svg',
  '/file.svg',
  '/globe.svg',
  '/window.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
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

// Estrategia de caché: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es buena, clonamos y guardamos en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Solo cachear GET requests
            if (event.request.method === 'GET') {
              cache.put(event.request, responseClone);
            }
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentamos desde caché
        return caches.match(event.request)
          .then((response) => {
            // Si tenemos en caché, lo devolvemos
            if (response) {
              return response;
            }
            
            // Si es un request de navegación, mostramos página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            
            // En otro caso, devolvemos un error
            return new Response('Sin conexión a Internet', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
