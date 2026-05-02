// Terra Nova · Service Worker (v2)
// 목적: 항상 최신 자원 우선 제공, 캐시는 오프라인 폴백으로만 사용.
//
// v1 (cache-first) 문제: 사용자가 사이트 들어가면 옛날 shared.css/JS 그대로 보여서
// 매번 Ctrl+Shift+R로 강제 새로고침해야 했음. v2는 network-first 전략으로 항상
// 최신 받음. 네트워크 2.5s 안에 응답 없으면 캐시 폴백.
//
// CACHE_VERSION은 deploy.bat이 매 배포마다 timestamp로 자동 갱신 (yyyyMMdd-HHmm).
// 새 버전이 install되면 activate 단계에서 옛 캐시 일괄 삭제.

const CACHE_VERSION = 'tn-v2-20260503-2300';
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

// network-first w/ 2.5s timeout, cache fallback for offline.
async function networkFirst(request) {
  try {
    const networkRes = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('sw-timeout')), 2500)
      )
    ]);
    // Update cache only on successful, same-origin, GET responses.
    if (networkRes && networkRes.ok && request.method === 'GET') {
      const copy = networkRes.clone();
      caches.open(CACHE_VERSION).then((c) => c.put(request, copy)).catch(() => {});
    }
    return networkRes;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate' || request.destination === 'document') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cross-origin (Google Fonts, Supabase, jsdelivr) — pass through to network.
  if (url.origin !== location.origin) return;

  // Supabase API paths — always network (auth/data integrity).
  if (
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/storage/v1/')
  ) return;

  // Only handle GET (POST/PUT etc. should always go to network).
  if (event.request.method !== 'GET') return;

  event.respondWith(networkFirst(event.request));
});
