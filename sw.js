const cacheName = 'temporizador-v4';
const assets = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('temporizador-') && key !== cacheName)
      .map(key => caches.delete(key)),
  )));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !assets.some(asset =>
    new URL(asset, self.registration.scope).href === event.request.url
  )) return;

  event.respondWith(caches.open(cacheName).then(async cache =>
    (await cache.match(event.request)) ?? fetch(event.request),
  ));
});
