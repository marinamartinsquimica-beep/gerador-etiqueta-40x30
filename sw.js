/*
 * Recovery service worker — v1.1.30
 *
 * Esta versão existe somente para retirar o Service Worker legado que
 * manteve alguns navegadores presos em versões antigas do aplicativo.
 * Não intercepta requisições e não cria novos caches.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({ type: 'EME_SW_REMOVED', version: '1.1.30' });
    }
  })());
});
