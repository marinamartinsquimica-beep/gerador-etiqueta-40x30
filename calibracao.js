// Calibracao independente: executa mesmo se o script principal falhar.
(function () {
  // Os ajustes de impressão são carregados pelo stylesheet versionado no HTML.

  function start() {
    const settings = document.querySelector('details.font-settings');
    if (settings) settings.open = false;

    const x = document.getElementById('label-offset-x');
    const y = document.getElementById('label-offset-y');
    const m = document.getElementById('matrix-scale');
    const xo = document.getElementById('offset-x-value');
    const yo = document.getElementById('offset-y-value');
    const mo = document.getElementById('matrix-scale-value');
    if (!x || !y || !m || !xo || !yo || !mo) return;
    function read(key, fallback) { try { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) ? v : fallback; } catch (_) { return fallback; } }
    function clamp(input, value) { const min=Number(input.min), max=Number(input.max); return Math.min(max,Math.max(min,value)); }
    x.value=String(clamp(x,read('labelOffsetX-v1',0)));
    y.value=String(clamp(y,read('labelOffsetY-v1',0)));
    m.value=String(clamp(m,read('matrixScale-v1',100)));
    function apply() {
      const offset=Number(x.value), offsetY=Number(y.value), size=Number(m.value);
      document.documentElement.style.setProperty('--label-offset-x',offset+'mm');
      document.documentElement.style.setProperty('--label-offset-preview',(offset*10)+'px');
      document.documentElement.style.setProperty('--label-offset-y',offsetY+'mm');
      document.documentElement.style.setProperty('--matrix-scale',String(size/100));
      xo.textContent=offset.toFixed(1).replace('.',',')+' mm';
      yo.textContent=offsetY.toFixed(1).replace('.',',')+' mm';
      mo.textContent=size+'%';
      try { localStorage.setItem('labelOffsetX-v1',String(offset)); localStorage.setItem('labelOffsetY-v1',String(offsetY)); localStorage.setItem('matrixScale-v1',String(size)); } catch (_) {}
    }
    x.addEventListener('input',apply); y.addEventListener('input',apply); m.addEventListener('input',apply);
    [['offset-left',x,-0.2],['offset-right',x,0.2],['offset-up',y,-0.2],['offset-down',y,0.2],['matrix-smaller',m,-5],['matrix-bigger',m,5]].forEach(function (entry) {
      const button=document.getElementById(entry[0]); if (!button) return;
      button.addEventListener('click',function () {
        const input=entry[1]; input.value=String(clamp(input,Math.round((Number(input.value)+entry[2])*10)/10)); apply();
      });
    });
    apply();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
