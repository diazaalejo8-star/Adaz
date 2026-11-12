const CACHE = 'adaz-shell-v38';
const SHELL_FILES = [
  './', './index.html', './rescate.html', './manifest.webmanifest', './icon.svg',
  './icon-192.png', './icon-512.png', './adaz-apple.css',
  './adaz-extra.js', './adaz-integrations.js', './adaz-academy.js', './adaz-experience.js',
  './adaz-business-health.js', './adaz-personal-finance-training.js', './adaz-year-plan.js',
  './family.html', './adaz-family.js', './adaz-family-link.js', './manifest-family.webmanifest',
  './adaz-academy-curriculum.js'
];
const absolute = path => new URL(path, self.registration.scope).href;
const indexUrl = absolute('./index.html');

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(SHELL_FILES.map(async path => {
      const url = absolute(path);
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok && response.type !== 'opaque') await cache.put(url, response);
      } catch (_) {
        // Optional resources can be cached on a later online request.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('adaz-shell-') && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE);
          // Cache each route under its own URL so Family remains an offline
          // route instead of being accidentally stored as index.html.
          await cache.put(request.url, fresh.clone());
        }
        return fresh;
      } catch (_) {
        const cached = await caches.match(request) || await caches.match(indexUrl);
        return cached || new Response(
          'ADAZ no está disponible sin conexión. Conéctate a internet y vuelve a abrir la aplicación.',
          { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (_) {
      return new Response('ADAZ: recurso temporalmente no disponible.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
