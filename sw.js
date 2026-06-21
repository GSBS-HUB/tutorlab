/* ============================================================
   GSBS Tutor Skill Lab — Service Worker
   Strategy:
   - App shell (index.html, manifest) → Cache First, always fresh on install
   - Tailwind CDN → Cache First (stale-while-revalidate)
   - /api/* → Network First, fall back to offline response
   ============================================================ */

const CACHE_NAME = "gsbs-lab-v1";
const OFFLINE_API = JSON.stringify({ ok: false, offline: true, message: "You are offline. Your work is saved on this device and will sync when you reconnect." });

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

const CDN_URLS = [
  "https://cdn.tailwindcss.com"
];

/* ---------- INSTALL: cache the app shell ---------- */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn("[SW] Shell cache partial:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE: remove old caches ---------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ---------- FETCH ---------- */
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  /* API calls → Network First, graceful offline fallback */
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(OFFLINE_API, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  /* Tailwind CDN → Cache First (stale-while-revalidate) */
  if (CDN_URLS.some(cdn => event.request.url.startsWith(cdn))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  /* Everything else → Cache First, fall back to network */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => caches.match("/index.html"));
    })
  );
});
