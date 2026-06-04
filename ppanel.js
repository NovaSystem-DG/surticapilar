// ═══════════════════════════════════════════
// CONFIGURACIÓN ADMIN
// ═══════════════════════════════════════════
const ADMIN_KEY = 'surticapilar2025';
const BIN_ID    = '6a21c113da38895dfe88176d';
const BASE      = 'https://surticapilar.com/wp-content/uploads/';

const tagNames = {
  shampoo:'Shampoo', acondicionador:'Acondicionador', mascarilla:'Mascarilla',
  tratamiento:'Tratamiento', leavein:'Leave-In', oleo:'Oleo',
  alisadora:'Alisadora', accesorio:'Accesorio', tinte:'Tinte'
};

// ═══════════════════════════════════════════
// AUTENTICACIÓN — BLOQUEO TOTAL SIN KEY
// Si no tiene la key correcta: página en blanco, sin contenido visible
// ═══════════════════════════════════════════
(function checkAuth() {
  const params = new URLSearchParams(window.location.search);
  const blocked = document.getElementById('blocked');

  if (params.get('key') !== ADMIN_KEY) {
    // Ocultar todo el contenido del admin
    document.getElementById('mainNav').style.display = 'none';
    document.getElementById('mainPage').style.display = 'none';
    // Mostrar pantalla bloqueada con mensaje genérico
    blocked.innerHTML = '<div style="text-align:center;color:#999;font-family:sans-serif;font-size:.9rem"><p>Página no encontrada</p></div>';
    blocked.style.display = 'flex';
    blocked.style.alignItems = 'center';
    blocked.style.justifyContent = 'center';
    blocked.style.position = 'fixed';
    blocked.style.inset = '0';
    blocked.style.background = '#fff';
    // Detener toda ejecución posterior
    return;
  }

  // Key correcta: mostrar el panel
  document.getElementById('mainNav').style.display = 'flex';
  document.getElementById('mainPage').style.display = 'block';
  init();
})();

// ═══════════════════════════════════════════
// API KEY — guardada en localStorage
// Solo se usa para ESCRIBIR (el índex lee sin key)
// ═══════════════════════════════════════════
function getApiKey() { return localStorage.getItem('sc_api_key') || ''; }
function isConfigured() { return !!getApiKey(); }

function saveConfig() {
  const apiKey = document.getElementById('cfgApiKey').value.trim();
  const binId  = document.getElementById('cfgBinId').value.trim();
  if (!apiKey) { toast('Completa la Master Key', 'error'); return; }
  localStorage.setItem('sc_api_key', apiKey);
  if (binId) localStorage.setItem('sc_bin_id', binId);
  toast('Configuración guardada ✓', 'success');
  document.getElementById('setupCard').style.display = 'none';
  init();
}

// ═══════════════════════════════════════════
// JSONBIN — LEER y ESCRIBIR
// ═══════════════════════════════════════════
async function fetchProducts() {
  setStatus('saving', '⏳ Cargando...');
  try {
    const headers = { 'X-Bin-Meta': 'false' };
    const apiKey = getApiKey();
    if (apiKey) headers['X-Master-Key'] = apiKey;
    const res = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest', { headers });
    if (!res.ok) throw new Error('fetch failed ' + res.status);
    const data = await res.json();
    const prods = data.record ? data.record.products : data.products;
    setStatus('ok', '✓ Conectado');
    return prods && prods.length > 0 ? prods : getDefaultProducts();
  } catch (e) {
    setStatus('err', '✗ Error de conexión');
    toast('No se pudo conectar a JSONBin. Revisa la API Key.', 'error');
    return getDefaultProducts();
  }
}

async function pushProducts() {
  if (!isConfigured()) {
    toast('Guarda la API Key primero para poder hacer cambios visibles a todos.', 'error');
    document.getElementById('setupCard').style.display = 'block';
    return false;
  }
  setStatus('saving', '⏳ Guardando...');
  try {
    const res = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': getApiKey()
      },
      body: JSON.stringify({ products })
    });
    if (!res.ok) throw new Error('push failed ' + res.status);
    setStatus('ok', '✓ Guardado para todos');
    return true;
  } catch (e) {
    setStatus('err', '✗ Error al guardar');
    toast('No se pudo guardar. Revisa tu conexión o la API Key.', 'error');
    return false;
  }
}

// ═══════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════
let products = [];

function setStatus(type, msg) {
  const el = document.getElementById('statusPill');
  if (!el) return;
  el.className = 'status-pill ' + type;
  el.textContent = msg;
}

// ═══════════════════════════════════════════
// TABLA INVENTARIO
// ═══════════════════════════════════════════
function renderTable() {
  const q   = document.getElementById('tblSearch').value.toLowerCase().trim();
  const cat = document.getElementById('tblCat').value;
  const stk = document.getElementById('tblStock').value;
  const list = products.filter(p => {
    if (cat && p.cat !== cat) return false;
    if (stk === 'in'  && !p.instock) return false;
    if (stk === 'out' &&  p.instock) return false;
    if (q && !p.name.toLowerCase().includes(q) && !(p.brand||'').toLowerCase().includes(q)) return false;
    return true;
  });
  const tbody = document.getElementById('invTbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#aaa">No se encontraron productos</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><img class="t-img" src="${p.img}" onerror="this.style.background='#f0e0e5';this.src=''"></td>
      <td><p class="t-name">${p.name}</p>${p.brand ? '<p class="t-brand">'+p.brand+'</p>' : ''}</td>
      <td style="font-weight:600;color:#5c0a1f">$${Math.round(p.price).toLocaleString('es-CO')}${p.priceMax ? '<br><span style="font-size:.7rem;color:#6b3a46">hasta $'+Math.round(p.priceMax).toLocaleString('es-CO')+'</span>' : ''}</td>
      <td>${tagNames[p.cat]||p.cat}</td>
      <td><span class="stock-badge ${p.instock?'in':'out'}">${p.instock?'● En stock':'● Agotado'}</span></td>
      <td><div class="act-row">
        <button class="act-btn toggle-stock" onclick="toggleStock(${p.id})">${p.instock?'Marcar agotado':'Marcar en stock'}</button>
        <button class="act-btn edit" onclick="openEdit(${p.id})">✏️ Editar</button>
        <button class="act-btn del" onclick="confirmDelete(${p.id})">🗑️</button>
      </div></td>
    </tr>`).join('');
  updateStats();
}

function updateStats() {
  const inStock = products.filter(p => p.instock).length;
  document.getElementById('statTotal').textContent    = products.length;
  document.getElementById('statInStock').textContent  = inStock;
  document.getElementById('statOutStock').textContent = products.length - inStock;
  document.getElementById('statCats').textContent     = new Set(products.map(p => p.cat)).size;
}

// ═══════════════════════════════════════════
// ACCIONES
// ═══════════════════════════════════════════
async function toggleStock(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.instock = !p.instock;
  renderTable();
  const ok = await pushProducts();
  if (ok) toast(p.instock ? 'Marcado en stock ✓' : 'Marcado como agotado ✓', 'success');
}

let pendingDeleteId = null;
function confirmDelete(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  pendingDeleteId = id;
  document.getElementById('confirmTitle').textContent = '¿Eliminar producto?';
  document.getElementById('confirmMsg').textContent   = '"' + p.name + '" se eliminará del catálogo permanentemente.';
  document.getElementById('confirmOkBtn').onclick = doDelete;
  document.getElementById('confirmOverlay').classList.add('open');
}
async function doDelete() {
  closeConfirm();
  products = products.filter(x => x.id !== pendingDeleteId);
  renderTable();
  const ok = await pushProducts();
  if (ok) toast('Producto eliminado', 'success');
}
function closeConfirm() { document.getElementById('confirmOverlay').classList.remove('open'); }

// ═══════════════════════════════════════════
// EDITAR PRODUCTO
// ═══════════════════════════════════════════
function openEdit(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editId').value       = id;
  document.getElementById('editName').value     = p.name;
  document.getElementById('editBrand').value    = p.brand || '';
  document.getElementById('editPrice').value    = p.price;
  document.getElementById('editCat').value      = p.cat;
  document.getElementById('editImg').value      = p.img;
  document.getElementById('editDesc').value     = p.desc || '';
  document.getElementById('editWasPrice').value = p.wasPrice || '';
  previewImg('editImg', 'editImgPreview');
  const sl = document.getElementById('editSizesList');
  sl.innerHTML = '';
  if (p.sizes && p.sizes.length > 1) p.sizes.forEach(s => addSizeRow('editSizesList', s.label, s.price));
  document.getElementById('editModal').classList.add('open');
}

async function saveEdit() {
  const id = parseInt(document.getElementById('editId').value);
  const p  = products.find(x => x.id === id);
  if (!p) return;
  p.name     = document.getElementById('editName').value.trim();
  p.brand    = document.getElementById('editBrand').value.trim();
  p.price    = parseFloat(document.getElementById('editPrice').value) || p.price;
  p.cat      = document.getElementById('editCat').value;
  p.img      = document.getElementById('editImg').value.trim();
  p.desc     = document.getElementById('editDesc').value.trim();
  const wp   = parseFloat(document.getElementById('editWasPrice').value);
  p.wasPrice = wp || undefined;
  p.sizes    = getSizesFrom('editSizesList');
  p.priceMax = p.sizes && p.sizes.length > 1 ? Math.max(...p.sizes.map(s => s.price)) : undefined;
  closeModal('editModal');
  renderTable();
  const ok = await pushProducts();
  if (ok) toast('Producto actualizado ✓', 'success');
}

// ═══════════════════════════════════════════
// AGREGAR PRODUCTO
// ═══════════════════════════════════════════
async function saveNewProduct() {
  const name  = document.getElementById('addName').value.trim();
  const price = parseFloat(document.getElementById('addPrice').value);
  if (!name || !price) { toast('Escribe el nombre y el precio', 'error'); return; }
  const sizes = getSizesFrom('addSizesList');
  const wp    = parseFloat(document.getElementById('addWasPrice').value);
  const newId = products.length ? Math.max(...products.map(x => x.id)) + 1 : 1;
  const img   = document.getElementById('addImg').value.trim()
    || (BASE + '2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png');
  const newProd = {
    id: newId, name, price,
    cat:      document.getElementById('addCat').value,
    img,
    instock:  true,
    brand:    document.getElementById('addBrand').value.trim(),
    desc:     document.getElementById('addDesc').value.trim(),
    wasPrice: wp || undefined,
    sizes:    sizes.length > 1 ? sizes : undefined,
    priceMax: sizes.length > 1 ? Math.max(...sizes.map(s => s.price)) : undefined,
  };
  products.unshift(newProd);
  renderTable();
  clearAddForm();
  showTab('inv', document.querySelectorAll('.tab')[0]);
  const ok = await pushProducts();
  if (ok) toast('Producto agregado al catálogo ✓', 'success');
}

function clearAddForm() {
  ['addName','addBrand','addPrice','addImg','addDesc','addWasPrice'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('addSizesList').innerHTML = '';
  document.getElementById('addImgPreview').className = 'img-preview';
}

// ═══════════════════════════════════════════
// SIZES HELPERS
// ═══════════════════════════════════════════
function addSizeRow(listId, label = '', price = '') {
  const row = document.createElement('div');
  row.className = 'size-row';
  row.innerHTML = '<input type="text" placeholder="Tamaño (ej: 300ml)" value="' + label + '" style="flex:1.2"/>'
    + '<input type="number" placeholder="Precio COP" value="' + price + '" style="flex:1"/>'
    + '<button class="rm-size" onclick="this.parentElement.remove()">✕</button>';
  document.getElementById(listId).appendChild(row);
}

function getSizesFrom(listId) {
  const rows = document.querySelectorAll('#' + listId + ' .size-row');
  const out = [];
  rows.forEach(r => {
    const inputs = r.querySelectorAll('input');
    const lbl = inputs[0].value.trim();
    const prc = parseFloat(inputs[1].value);
    if (lbl && prc) out.push({ label: lbl, price: prc });
  });
  return out;
}

// ═══════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════
function showTab(tab, btn) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  const id = 'panel' + tab.charAt(0).toUpperCase() + tab.slice(1);
  document.getElementById(id).classList.add('on');
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function previewImg(inputId, previewId) {
  const url = document.getElementById(inputId).value.trim();
  const img = document.getElementById(previewId);
  if (url) {
    img.src = url;
    img.className = 'img-preview show';
    img.onerror = () => img.className = 'img-preview';
  } else {
    img.className = 'img-preview';
  }
}

function toast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => t.className = 'toast', 2500);
}

// ═══════════════════════════════════════════
// PRODUCTOS POR DEFECTO
// ═══════════════════════════════════════════
function getDefaultProducts() {
  return [
    {id:1,name:'Flash Mask Mantenimiento de Color x300ml',price:77800,cat:'mascarilla',img:BASE+'2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png',instock:true,brand:'Hair Lab',desc:'Mascarilla de mantenimiento de color.'},
    {id:2,name:'Acondicionador Glow x500ml',price:64900,cat:'acondicionador',img:BASE+'2026/05/Copia-de-Copia-de-pagina-web-2-300x300.png',instock:true,brand:'Yellow',desc:'Acondicionador con efecto brillo intenso.'},
    {id:3,name:'Shampoo Hidro-Nutritivo x500ml',price:62900,cat:'shampoo',img:BASE+'2026/05/Copia-de-Copia-de-pagina-web-4-300x300.png',instock:true,brand:'Yellow',desc:'Shampoo con nutricion profunda.'},
    {id:4,name:'Molecular Serum x150ml',price:62900,cat:'leavein',img:BASE+'2026/05/Copia-de-Copia-de-pagina-web-3-300x300.png',instock:true,brand:'Organic Fiber',desc:'Serum molecular de accion profunda.'},
    {id:5,name:'Protector Thermal Yellow x250ml',price:69000,cat:'tratamiento',img:BASE+'2026/01/Copia-de-Copia-de-pagina-web-23-300x300.png',instock:true,brand:'Yellow',desc:'Termoprotector Yellow hasta 230C.'},
    {id:6,name:'Dark & Lovely Alisador Regular Sin Lejia',price:69000,cat:'alisadora',img:BASE+'2025/05/Dark-LovelyDark-Lovely-Alisador-300x300.png',instock:true,brand:'Dark & Lovely',desc:'Alisador Dark & Lovely Regular Sin Lejia.'},
  ];
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
async function init() {
  const apiKey = getApiKey();
  if (apiKey) {
    document.getElementById('cfgApiKey').value = apiKey;
    document.getElementById('setupCard').style.display = 'none';
  }
  products = await fetchProducts();
  renderTable();
}