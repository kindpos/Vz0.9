const CACHE_NAME = 'overseer-cache-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'styles/variables.css',
  'styles/overseer-shell.css',
  'styles/sidebar.css',
  'styles/workspace.css',
  'styles/components.css',
  'src/app.js',
  'assets/images/icon-192.png',
  'assets/images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});