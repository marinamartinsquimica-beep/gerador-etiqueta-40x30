(()=>{'use strict';
/* Lote -> aviário. Mantém o formato de lote e Data Matrix do gerador. */
const BASE=Object.freeze({'20':'1','21':'15','23':'7','24':'2','25':'3','26':'16','27':'4','28':'8','29':'9','30':'10','31':'11','32':'18','33':'5','34':'14','35':'19'});
const KEY='eme-lotes-aviarios-v1';
const lote=document.getElementById('lot-part-one'),aviario=document.getElementById('lot-part-two');
if(!lote||!aviario)return;
let extras={},excluidos=[];
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved&&typeof saved==='object'){
  for(const [k,v] of Object.entries(saved.extras||{})){
   if(/^\d{2}$/.test(k)&&/^\d{1,2}$/.test(String(v))&&Number(v)>0)extras[k]=String(Number(v));
  }
  if(Array.isArray(saved.excluidos))excluidos=saved.excluidos.filter(k=>/^\d{2}$/.test(k));
 }
}catch(_){}
const el=id=>document.getElementById(id);
function catalogo(){const data={...BASE,...extras};for(const k of excluidos)delete data[k];return data;}
function salvar(){try{localStorage.setItem(KEY,JSON.stringify({extras,excluidos}));return true}catch(_){return false}}
function preencher(){
 const l=lote.value.replace(/\D/g,'').slice(0,2);
 const found=l.length===2?catalogo()[l]:undefined;
 const value=found?found.padStart(2,'0'):'';
 aviario.title=found?'Aviário '+found:l.length===2?'Lote não cadastrado':'Informe o lote';
 if(aviario.value!==value){
  aviario.value=value;
  aviario.dispatchEvent(new Event('input',{bubbles:true}));
 }
}
aviario.readOnly=true;
aviario.placeholder='Aviário';
aviario.setAttribute('aria-label','Aviário preenchido automaticamente pelo lote');
const menu=document.createElement('details');menu.id='aviary-manager';menu.className='sku-manager';
menu.innerHTML='<summary>CADASTRO DE LOTES E AVIÁRIOS — ABRIR PARA MANUTENÇÃO</summary><div class="sku-fields"><p>Cadastre ou exclua cada lote individualmente. Os dados ficam salvos neste navegador.</p><div class="aviary-form-row"><div><label for="aviary-lot">Novo lote</label><input id="aviary-lot" type="text" maxlength="2" inputmode="numeric" placeholder="Ex.: 36"></div><div><label for="aviary-number">Aviário</label><input id="aviary-number" type="text" maxlength="2" inputmode="numeric" placeholder="Ex.: 20"></div></div><button type="button" id="aviary-save">Salvar lote</button><p id="aviary-status" role="status" aria-live="polite"></p><div id="aviary-list" aria-label="Lotes e aviários cadastrados"></div></div>';
const products=document.querySelector('.sku-manager'),settings=document.querySelector('.font-settings');
if(products)products.insertAdjacentElement('afterend',menu);
else if(settings)settings.insertAdjacentElement('beforebegin',menu);
const novoLote=el('aviary-lot'),novoAviario=el('aviary-number'),status=el('aviary-status');
for(const input of [novoLote,novoAviario])input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,2)});
function listar(){
 const list=el('aviary-list');list.replaceChildren();
 const entries=Object.entries(catalogo()).sort((a,b)=>Number(a[0])-Number(b[0]));
 for(const [l,a] of entries){
  const row=document.createElement('div');row.className='aviary-row';
  const text=document.createElement('span');text.textContent='Lote '+l+' — Aviário '+a;
  const button=document.createElement('button');button.type='button';button.textContent='Excluir';
  button.setAttribute('aria-label','Excluir lote '+l);
  button.addEventListener('click',()=>{
   if(!confirm('Excluir lote '+l+' (aviário '+a+')?'))return;
   delete extras[l];if(!excluidos.includes(l))excluidos.push(l);
   status.textContent=salvar()?'Lote '+l+' excluído.':'Excluído nesta sessão; não foi possível salvar.';
   preencher();listar();
  });
  row.append(text,button);list.appendChild(row);
 }
 if(!entries.length)list.textContent='Nenhum lote cadastrado.';
}
el('aviary-save').addEventListener('click',()=>{
 const l=novoLote.value.trim(),a=novoAviario.value.trim();
 if(!/^\d{2}$/.test(l)||!/^\d{1,2}$/.test(a)||Number(a)<1){
  status.textContent='Informe lote com 2 dígitos e aviário de 1 a 99.';return;
 }
 const value=String(Number(a)),existing=catalogo()[l];
 if(existing===value){status.textContent='Este vínculo já está cadastrado.';return}
 if(existing&&!confirm('Lote '+l+' está no aviário '+existing+'. Substituir por '+value+'?'))return;
 extras[l]=value;excluidos=excluidos.filter(k=>k!==l);
 status.textContent=salvar()?'Lote '+l+' vinculado ao aviário '+value+'.':'Salvo nesta sessão; não foi possível gravar.';
 novoLote.value='';novoAviario.value='';preencher();listar();
});
lote.addEventListener('input',preencher,true);
preencher();listar();
})();
