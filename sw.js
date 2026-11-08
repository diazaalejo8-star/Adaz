const CACHE = 'adaz-shell-v29';
const SHELL_FILES = [
  './', './index.html', './rescate.html', './manifest.webmanifest', './icon.svg',
  './icon-192.png', './icon-512.png', './adaz-apple.css',
  './adaz-extra.js', './adaz-integrations.js', './adaz-academy.js', './adaz-experience.js',
  './adaz-business-health.js', './adaz-personal-finance-training.js'
];
const absolute = path => new URL(path, self.registration.scope).href;
const indexUrl = absolute('./index.html');

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Cache each asset independently: a single optional asset must not block
    // the whole application shell from installing.
    await Promise.all(SHELL_FILES.map(async path => {
      const url = absolute(path);
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok && response.type !== 'opaque') {
          await cache.put(url, response);
        }
      } catch (error) {
        // A later online request can populate this asset.
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

  // Always check the network for page navigations so a repaired release can
  // replace an older cached HTML shell. Keep a local copy for offline opening.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(indexUrl, fresh.clone());
        }
        return fresh;
      } catch (error) {
        const cached = await caches.match(indexUrl);
        return cached || new Response(
          'ADAZ no está disponible sin conexión. Conéctate a internet y vuelve a abrir la aplicación.',
          { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  // For scripts, styles and images, never return index.html as a fallback:
  // browsers could otherwise execute HTML as JavaScript and stop initialization.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      return new Response('ADAZ: recurso temporalmente no disponible.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
