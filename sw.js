// ============================================
// GEMPAR Service Worker - Versi Bersih 2026
// ============================================

const CACHE_NAME = 'gempar-v2-clean-2026';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/images/poster.png',
  '/images/mascot-cool.png',
  '/images/mascot-reward.png',
  '/images/logogempar.png'
];

// INSTALL: Cache semua asset
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: Hapus cache lama
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: Network first, fallback cache
self.addEventListener('fetch', (e) => {
  // Skip request ke domain eksternal yang bermasalah
  const url = new URL(e.request.url);
  if (url.hostname.includes('gempa-waraka')) {
    console.warn('[SW] Blocked old domain:', url.href);
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Update cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Fallback ke cache
        return caches.match(e.request);
      })
  );
});
