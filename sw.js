const CACHE_NAME='eme-etiqueta-v1.1.29';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(names=>Promise.all(names.map(name=>caches.delete(name)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response&&response.status===200&&response.type!=='opaque'){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request)));});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});