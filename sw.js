/* Recovery service worker — v1.1.31. Remove caches antigos e se desregistra. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.map(name=>caches.delete(name)));await self.registration.unregister();const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients)client.postMessage({type:'EME_SW_REMOVED',version:'1.1.31'});})());});
