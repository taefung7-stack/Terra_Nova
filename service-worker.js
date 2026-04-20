// Terra Nova · Service Worker (v1)
// 목적: 오프라인 기본 대응, 정적 자원 캐싱

const CACHE_VERSION = 'tn-v1-2026-04-21';
const CORE_ASSETS = [
  './',
  './index.html',
  './shared.css',
  './logo.png',
  './og-cover.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase API, 외부 리소스는 패스 (항상 네트워크)
  if (
    url.origin !== location.origin ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/storage/v1/')
  ) return;

  // HTML: network-first (최신 콘텐츠 우선)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('./index.html')))
    );
    return;
  }

  // 정적 자원: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
