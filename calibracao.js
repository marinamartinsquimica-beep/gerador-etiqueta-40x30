// Calibracao independente: executa mesmo se o script principal falhar.
(function () {
  function start() {
    // Ajustes permanecem acessiveis, mas iniciam recolhidos a cada abertura.
    const settings = document.querySelector('details.font-settings');
    if (settings) settings.open = false;

    // O Data Matrix de 40 x 30 acompanha a largura de 33 mm do campo do lote.
    // As duas dimensoes crescem na mesma proporcao (28 x 11,2 -> 33 x 13,2).
    // As regras sao aplicadas por ultimo, sem mudar as etiquetas de 33 x 21.
    const style = document.createElement('style');
    style.textContent = '@media print {' +
      'html[data-label-size="40x30"] .print-copy .print-qr,' +
      'html[data-label-size="40x30"] .print-copy .print-qr canvas {' +
      'width:33mm !important;height:13.2mm !important;' +
      'min-width:33mm !important;max-width:33mm !important;' +
      'min-height:13.2mm !important;max-height:13.2mm !important;' +
      'flex-basis:auto !important;object-fit:fill !important;}' +
      '}' +
      '@media screen {' +
      'html[data-label-size="40x30"] .screen-label .qr-code,' +
      'html[data-label-size="40x30"] .screen-label .qr-code canvas {' +
      'width:330px !important;height:132px !important;' +
      'min-width:330px !important;max-width:330px !important;' +
      'min-height:132px !important;max-height:132px !important;}' +
      'html[data-label-size="40x30"] .screen-label .qr-code {' +
      'flex-basis:132px !important;}' +
      '}';
    document.head.appendChild(style);

    const x = document.getElementById('label-offset-x');
    const m = document.getElementById('matrix-scale');
    const xo = document.getElementById('offset-x-value');
    const mo = document.getElementById('matrix-scale-value');
    if (!x || !m || !xo || !mo) return;
    function read(key, fallback) { try { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) ? v : fallback; } catch (_) { return fallback; } }
    function clamp(input, value) { const min=Number(input.min), max=Number(input.max); return Math.min(max,Math.max(min,value)); }
    x.value=String(clamp(x,read('labelOffsetX-v1',0)));
    m.value=String(clamp(m,read('matrixScale-v1',100)));
    function apply() {
      const offset=Number(x.value), size=Number(m.value);
      document.documentElement.style.setProperty('--label-offset-x',offset+'mm');
      document.documentElement.style.setProperty('--label-offset-preview',(offset*10)+'px');
      document.documentElement.style.setProperty('--matrix-scale',String(size/100));
      xo.textContent=offset.toFixed(1).replace('.',',')+' mm';
      mo.textContent=size+'%';
      try { localStorage.setItem('labelOffsetX-v1',String(offset)); localStorage.setItem('matrixScale-v1',String(size)); } catch (_) {}
    }
    x.addEventListener('input',apply); m.addEventListener('input',apply);
    [['offset-left',x,-0.2],['offset-right',x,0.2],['matrix-smaller',m,-5],['matrix-bigger',m,5]].forEach(function (entry) {
      const button=document.getElementById(entry[0]); if (!button) return;
      button.addEventListener('click',function () {
        const input=entry[1]; input.value=String(clamp(input,Math.round((Number(input.value)+entry[2])*10)/10)); apply();
      });
    });
    apply();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
