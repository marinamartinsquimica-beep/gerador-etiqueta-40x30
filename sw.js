const CACHE_NAME='eme-etiqueta-v1.1.28';

// Não pré-carrega arquivos no install: um único 404 durante a publicação
// não pode mais impedir o novo Service Worker de instalar/ativar.
self.addEventListener('install',event=>{
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(names=>Promise.all(names.map(name=>caches.delete(name))))
      .then(()=>self.clients.claim())
  );
});

// Rede primeiro. Cache é apenas contingência offline e nunca controla versão.
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        if(response && response.status===200 && response.type!=='opaque'){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});

self.addEventListener('message',event=>{
  if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});