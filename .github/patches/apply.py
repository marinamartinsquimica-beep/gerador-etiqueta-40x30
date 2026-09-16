from pathlib import Path


def replace_once(text, old, new, file):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{file}: esperado 1 trecho, encontrado {count}: {old[:65]!r}')
    return text.replace(old, new, 1)


app = Path('app.js')
s = app.read_text(encoding='utf-8')
s = replace_once(s, "const APP_VERSION = '1.1.3';", "const APP_VERSION = '1.1.5-teste-2';", 'app.js')
s = replace_once(s, "const FONT_STORAGE_KEY = 'configEtiqueta-v1.1';", '''const FONT_STORAGE_KEY = 'configEtiqueta-v1.1';
const LABEL_SIZE_STORAGE_KEY = 'tamanhoEtiqueta-v1';
const LABEL_SIZES = { '33x21': {width:33,height:21,perRow:3,gap:1.5}, '40x30': {width:40,height:30,perRow:2,gap:2} };
const labelSizeInput = document.querySelector('#label-size');
let selectedLabelSize = '33x21';
try { if (LABEL_SIZES[localStorage.getItem(LABEL_SIZE_STORAGE_KEY)]) selectedLabelSize = localStorage.getItem(LABEL_SIZE_STORAGE_KEY); } catch (_) {}
if (labelSizeInput) labelSizeInput.value = selectedLabelSize;
function labelConfig() { return LABEL_SIZES[selectedLabelSize]; }
function fontMax(rule) { return selectedLabelSize === '40x30' ? ({sku: 27, lotLabel: 10, lotValue: 20}[rule] || FONT_RULES[rule].max) : FONT_RULES[rule].max; }
function refreshLabelSize() {
  const cfg = labelConfig();
  document.querySelector('#label-page-size').textContent = `@page { size: ${cfg.width * cfg.perRow + cfg.gap * (cfg.perRow - 1)}mm ${cfg.height}mm; margin: 0; }`;
  document.documentElement.dataset.labelSize = selectedLabelSize;
  document.querySelector('#preview-size').textContent = `${cfg.width} × ${cfg.height} mm`;
  document.querySelector('#printer-size').textContent = `${cfg.width} × ${cfg.height} mm`;
  document.querySelector('#printer-count').textContent = `${cfg.perRow} etiquetas por fileira`;
  document.querySelector('#quantity-hint').textContent = `Exemplo: 30 etiquetas = ${Math.ceil(30 / cfg.perRow)} fileiras de ${cfg.perRow} etiquetas.`;
  const clamped = Object.entries(FONT_RULES).some(([key]) => { if (fontSettings[key] > fontMax(key)) { fontSettings[key] = fontMax(key); return true; } return false; });
  if (clamped) applyFontSettings();
  updateLabel();
}
''', 'app.js')
s = replace_once(s, 'value <= rule.max', 'value <= fontMax(key)', 'app.js')
s = replace_once(s, 'nextValue >\n            rule.max', 'nextValue >\n            fontMax(key)', 'app.js')
s = replace_once(s, '/* =========================================================\n   DATA\n   ========================================================= */', '''if (labelSizeInput) labelSizeInput.addEventListener('change', () => {
  selectedLabelSize = LABEL_SIZES[labelSizeInput.value] ? labelSizeInput.value : '33x21';
  try { localStorage.setItem(LABEL_SIZE_STORAGE_KEY, selectedLabelSize); } catch (_) {}
  refreshLabelSize();
});

/* =========================================================
   DATA
   ========================================================= */''', 'app.js')
s = replace_once(s, 'quantity / 3', 'quantity / labelConfig().perRow', 'app.js')
s = replace_once(s, 'position < 3;', 'position < labelConfig().perRow;', 'app.js')
s = replace_once(s, 'pageIndex * 3 +', 'pageIndex * labelConfig().perRow +', 'app.js')
s = replace_once(s, 'de até 3 etiquetas.', 'de até ${labelConfig().perRow} etiquetas.', 'app.js')
app.write_text(s, encoding='utf-8')

html = Path('index.html')
s = html.read_text(encoding='utf-8')
s = replace_once(s, '<link rel="stylesheet" href="theme-raiar.css">', '<link rel="stylesheet" href="theme-raiar.css">\n  <link rel="stylesheet" href="label-sizes.css">', 'index.html')
s = replace_once(s, '<strong>30 etiquetas = 10 fileiras de 3 etiquetas.</strong>', '<strong><span id="quantity-hint">Exemplo: 30 etiquetas = 10 fileiras de 3 etiquetas.</span></strong>', 'index.html')
s = replace_once(s, '<details class="font-settings">', '<details class="font-settings" open>', 'index.html')
s = replace_once(s, '<span>AJUSTES DA ETIQUETA</span>', '<span>AJUSTES DA ETIQUETA — ESCOLHER TAMANHO</span>', 'index.html')
s = replace_once(s, '<div class="settings-content">', '''<div class="settings-content">
          <label for="label-size">ESCOLHER TAMANHO DE ETIQUETA</label>
          <select id="label-size" aria-label="Escolher tamanho de etiqueta">
            <option value="33x21">33 × 21 mm — 3 etiquetas por fileira</option>
            <option value="40x30">40 × 30 mm — 2 etiquetas por fileira</option>
          </select>
          <p class="info-box">O tamanho maior permite ampliar mais as fontes de SKU e lote nos botões + abaixo.</p>''', 'index.html')
s = replace_once(s, 'PRÉ-VISUALIZAÇÃO DA ETIQUETA (33 × 21 mm)', 'PRÉ-VISUALIZAÇÃO DA ETIQUETA (<span id="preview-size">33 × 21 mm</span>)', 'index.html')
s = replace_once(s, '<p><strong>Etiqueta:</strong> 33 × 21 mm</p>', '<p><strong>Etiqueta:</strong> <span id="printer-size">33 × 21 mm</span></p>', 'index.html')
s = replace_once(s, '<p><strong>Impressão:</strong> 3 etiquetas por fileira</p>', '<p><strong>Impressão:</strong> <span id="printer-count">3 etiquetas por fileira</span></p>', 'index.html')
s = replace_once(s, 'Cada fileira contém até <strong>3 etiquetas de 33 × 21 mm</strong>.', 'Escolha o tamanho em AJUSTES DA ETIQUETA antes de imprimir.', 'index.html')
s = replace_once(s, '<script src="vendor/zxing.min.js"></script>', '<style id="label-page-size">@page { size: 102mm 21mm; margin: 0; }</style>\n<script src="vendor/zxing.min.js"></script>', 'index.html')
html.write_text(s, encoding='utf-8')
print('Alterações de tamanho aplicadas a app.js e index.html.')
