// Atualização PWA v1.1.26 — fluxo único e confiável.
(function () {
  'use strict';
  const VERSION='1.1.26';
  let registration=null;
  let targetWorker=null;
  let reloading=false;
  const banner=()=>document.getElementById('update-banner');
  const message=()=>document.getElementById('update-message');
  const button=()=>document.getElementById('update-button');
  function show(text,allowUpdate){
    if(message()) message().textContent=text;
    if(button()) { button().hidden=!allowUpdate; button().disabled=false; button().textContent='ATUALIZAR AGORA'; }
    if(banner()) banner().hidden=false;
  }
  function offer(worker){ targetWorker=worker; show('Nova versão '+VERSION+' disponível.',true); }
  function watch(worker){
    if(!worker)return;
    const inspect=()=>{
      if(worker.state==='installed'){
        if(navigator.serviceWorker.controller) offer(worker);
        else location.reload();
      }
    };
    worker.addEventListener('statechange',inspect); inspect();
  }
  async function check(){
    if(!registration)return;
    try{
      if(registration.waiting){offer(registration.waiting);return;}
      await registration.update();
      if(registration.waiting)offer(registration.waiting);
      else if(registration.installing)watch(registration.installing);
    }catch(e){console.error('Falha ao verificar atualização',e);}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const v=document.getElementById('app-version'); if(v)v.textContent=VERSION;
    const updateBtn=button();
    if(updateBtn){
      updateBtn.replaceWith(updateBtn.cloneNode(true));
      button().addEventListener('click',()=>{
        const worker=targetWorker || (registration&&registration.waiting);
        if(!worker){ show('Preparando atualização...',false); check(); return; }
        button().disabled=true; button().textContent='ATUALIZANDO...';
        show('Atualizando para '+VERSION+'...',false);
        worker.postMessage({type:'SKIP_WAITING'});
        setTimeout(()=>{ if(!reloading) location.reload(); },2500);
      });
    }
  });
  if('serviceWorker' in navigator && location.protocol!=='file:'){
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(reloading)return; reloading=true; location.reload();
    });
    window.addEventListener('load',async()=>{
      try{
        registration=await navigator.serviceWorker.register('./sw.js?v=126',{updateViaCache:'none'});
        registration.addEventListener('updatefound',()=>watch(registration.installing));
        if(registration.waiting)offer(registration.waiting);
        if(registration.installing)watch(registration.installing);
        await check();
      }catch(e){console.error('Falha ao registrar atualização',e);}
    });
  }
})();
