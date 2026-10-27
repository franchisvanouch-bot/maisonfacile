const CACHE = 'maison-facile-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord : les annonces et messages restent toujours à jour
self.addEventListener('push', e => {
  let data = { title: 'Maison Facile', body: 'Nouveau message' };
  try { data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title || 'Maison Facile', {
    body: data.body || 'Nouveau message',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: data.url || './' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus();
      return self.clients.openWindow(e.notification.data.url || './');
    })
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
