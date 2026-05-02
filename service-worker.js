// Terra Nova 쨌 Service Worker (v2)
// 紐⑹쟻: ??긽 理쒖떊 ?먯썝 ?곗꽑 ?쒓났, 罹먯떆???ㅽ봽?쇱씤 ?대갚?쇰줈留??ъ슜.
//
// v1 (cache-first) 臾몄젣: ?ъ슜?먭? ?ъ씠???ㅼ뼱媛硫??쏅궇 shared.css/JS 洹몃?濡?蹂댁뿬??// 留ㅻ쾲 Ctrl+Shift+R濡?媛뺤젣 ?덈줈怨좎묠?댁빞 ?덉쓬. v2??network-first ?꾨왂?쇰줈 ??긽
// 理쒖떊 諛쏆쓬. ?ㅽ듃?뚰겕 2.5s ?덉뿉 ?묐떟 ?놁쑝硫?罹먯떆 ?대갚.
//
// CACHE_VERSION? deploy.bat??留?諛고룷留덈떎 timestamp濡??먮룞 媛깆떊 (yyyyMMdd-HHmm).
// ??踰꾩쟾??install?섎㈃ activate ?④퀎?먯꽌 ??罹먯떆 ?쇨큵 ??젣.

const CACHE_VERSION = 'tn-v2-20260503-0733';
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

  // Cross-origin (Google Fonts, Supabase, jsdelivr) ??pass through to network.
  if (url.origin !== location.origin) return;

  // Supabase API paths ??always network (auth/data integrity).
  if (
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/storage/v1/')
  ) return;

  // Only handle GET (POST/PUT etc. should always go to network).
  if (event.request.method !== 'GET') return;

  event.respondWith(networkFirst(event.request));
});
