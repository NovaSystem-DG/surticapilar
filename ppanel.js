// ═══════════════════════════════════════════
// CONFIGURACIÓN ADMIN
// ═══════════════════════════════════════════
const ADMIN_KEY = 'surticapilar2025';
const BIN_ID = '6a21c113da38895dfe88176d';
const BASE = 'https://surticapilar.com/wp-content/uploads/';
const PROMO_MIN_COMPRA = 150000;

const tagNames = {
  shampoo: 'Shampoo', acondicionador: 'Acondicionador', mascarilla: 'Mascarilla',
  Termoprotector: 'Termoprotector', leavein: 'Leave-In', oleo: 'Oleo',
  alisadora: 'Alisadora', accesorio: 'Accesorio', tinte: 'Tinte'
};

// ═══════════════════════════════════════════
// AUTENTICACIÓN
// ═══════════════════════════════════════════
(function checkAuth() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('key') !== ADMIN_KEY) {
    document.getElementById('mainNav').style.display = 'none';
    document.getElementById('mainPage').style.display = 'none';
    const blocked = document.getElementById('blocked');
    blocked.innerHTML = '<div style="text-align:center;color:#999;font-family:sans-serif;font-size:.9rem"><p>Página no encontrada</p></div>';
    blocked.style.cssText = 'display:flex;align-items:center;justify-content:center;position:fixed;inset:0;background:#fff';
    return;
  }
  document.getElementById('mainNav').style.display = 'flex';
  document.getElementById('mainPage').style.display = 'block';
  init();
})();

// ═══════════════════════════════════════════
// API KEY
// ═══════════════════════════════════════════
function getApiKey() { return localStorage.getItem('sc_api_key') || ''; }
function isConfigured() { return !!getApiKey(); }

function saveConfig() {
  const apiKey = document.getElementById('cfgApiKey').value.trim();
  const binId = document.getElementById('cfgBinId').value.trim();
  if (!apiKey) { toast('Completa la Master Key', 'error'); return; }
  localStorage.setItem('sc_api_key', apiKey);
  if (binId) localStorage.setItem('sc_bin_id', binId);
  toast('Configuración guardada ✓', 'success');
  document.getElementById('setupCard').style.display = 'none';
  init();
}

// ═══════════════════════════════════════════
// JSONBIN — LEER y ESCRIBIR (productos + códigos)
// ═══════════════════════════════════════════
let products = [];
let promoCodes = [];

function setStatus(type, msg) {
  const el = document.getElementById('statusPill');
  if (!el) return;
  el.className = 'status-pill ' + type;
  el.textContent = msg;
}

async function fetchProducts() {
  setStatus('saving', '⏳ Cargando...');
  try {
    const headers = { 'X-Bin-Meta': 'false' };
    const apiKey = getApiKey();
    if (apiKey) headers['X-Master-Key'] = apiKey;
    const res = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest', { headers });
    if (!res.ok) throw new Error('fetch failed ' + res.status);
    const data = await res.json();
    const d = data.record ? data.record : data;
    promoCodes = d.promoCodes || [];
    setStatus('ok', '✓ Conectado');
    const prods = d.products;
    return (prods && prods.length > 0) ? prods : getDefaultProducts();
  } catch (e) {
    setStatus('err', '✗ Error de conexión');
    toast('No se pudo conectar a JSONBin. Revisa la API Key.', 'error');
    return getDefaultProducts();
  }
}

async function pushProducts() {
  if (!isConfigured()) {
    toast('Guarda la API Key primero.', 'error');
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
      body: JSON.stringify({ products, promoCodes })
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
// HELPERS DE STOCK POR TALLA
// ═══════════════════════════════════════════
function getSizeInstock(p, sizeLabel) {
  if (p.sizes && p.sizes.length > 1 && sizeLabel) {
    const s = p.sizes.find(x => x.label === sizeLabel);
    if (!s) return false;
    if (typeof s.instock === 'boolean') return s.instock;
    if (s.stockQty !== undefined && s.stockQty !== null && parseInt(s.stockQty) <= 0) return false;
    return p.instock;
  }
  return p.instock;
}

// ═══════════════════════════════════════════
// TABLA INVENTARIO
// ═══════════════════════════════════════════
function renderTable() {
  const q = document.getElementById('tblSearch').value.toLowerCase().trim();
  const cat = document.getElementById('tblCat').value;
  const stk = document.getElementById('tblStock').value;
  const list = products.filter(p => {
    if (cat && p.cat !== cat) return false;
    if (stk === 'in' && !p.instock) return false;
    if (stk === 'out' && p.instock) return false;
    if (q && !p.name.toLowerCase().includes(q) && !(p.brand || '').toLowerCase().includes(q)) return false;
    return true;
  });
  const tbody = document.getElementById('invTbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#aaa">No se encontraron productos</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(p => {
    const hasSizes = p.sizes && p.sizes.length > 1;

    let stockCell = '';
    if (hasSizes) {
      stockCell = '<div class="size-stock-rows">'
        + p.sizes.map((s, idx) => {
          const sInstock = getSizeInstock(p, s.label);
          return `<div class="size-stock-row">
            <span class="size-stock-label">${s.label}</span>
            <input class="stock-qty-input" type="number" min="0"
              value="${s.stockQty !== undefined && s.stockQty !== null ? s.stockQty : ''}"
              placeholder="∞"
              onchange="updateSizeStockQty(${p.id}, ${idx}, this.value)"
              title="Unidades de ${s.label}" />
            <button class="size-toggle-btn ${sInstock ? 'in' : 'out'}"
              onclick="toggleSizeStock(${p.id}, ${idx})">${sInstock ? 'Disponible' : 'Agotado'}</button>
          </div>`;
        }).join('')
        + '</div>';
    } else {
      stockCell = p.stockQty !== undefined && p.stockQty !== null && p.stockQty !== ''
        ? `<input class="stock-qty-input" type="number" min="0" value="${p.stockQty}"
             onchange="updateStockQty(${p.id}, this.value)" title="Editar unidades" />`
        : '<span style="font-size:.75rem;color:#aaa">Sin conteo</span>';
    }

    let statusCell = '';
    if (hasSizes) {
      statusCell = p.sizes.map(s => {
        const si = getSizeInstock(p, s.label);
        const lowWarn = si && s.stockQty !== undefined && s.stockQty !== null && parseInt(s.stockQty) <= 5;
        return `<span class="stock-badge ${si ? (lowWarn ? 'warn' : 'in') : 'out'}" style="display:block;margin-bottom:3px">
          ${s.label}: ${si ? '● Stock' : '● Agotado'}${s.stockQty !== undefined && s.stockQty !== null ? ' (' + s.stockQty + ')' : ''}
        </span>`;
      }).join('');
    } else {
      const lowWarn = p.instock && p.stockQty !== undefined && p.stockQty !== null && parseInt(p.stockQty) <= 5;
      statusCell = `<span class="stock-badge ${p.instock ? (lowWarn ? 'warn' : 'in') : 'out'}">
        ${p.instock ? '● En stock' : '● Agotado'}
      </span>
      ${p.stockQty !== undefined && p.stockQty !== null && p.stockQty !== ''
          ? '<br><span style="font-size:.72rem;color:#6b3a46">' + p.stockQty + ' uds.</span>'
          : ''}`;
    }

    return `<tr>
      <td><img class="t-img" src="${p.img}" onerror="this.style.background='#f0e0e5';this.src=''"></td>
      <td>
        <p class="t-name">${p.name}</p>
        ${p.brand ? '<p class="t-brand">' + p.brand + '</p>' : ''}
        ${hasSizes ? '<p class="t-brand">' + p.sizes.map(s => s.label).join(' · ') + '</p>' : ''}
      </td>
      <td style="font-weight:600;color:#5c0a1f">
        $${Math.round(p.price).toLocaleString('es-CO')}
        ${p.priceMax ? '<br><span style="font-size:.7rem;color:#6b3a46">hasta $' + Math.round(p.priceMax).toLocaleString('es-CO') + '</span>' : ''}
        ${p.bulkPrice && p.bulkPrice.minQty && p.bulkPrice.price
        ? '<br><span style="font-size:.7rem;color:#804a10">Desde ' + p.bulkPrice.minQty + 'u: $' + Math.round(p.bulkPrice.price).toLocaleString('es-CO') + '</span>'
        : ''}
      </td>
      <td>${tagNames[p.cat] || p.cat}</td>
      <td>${stockCell}</td>
      <td>${statusCell}</td>
      <td>
        <div class="act-row">
          ${!hasSizes ? `<button class="act-btn toggle-stock" onclick="toggleStock(${p.id})">${p.instock ? 'Marcar agotado' : 'Marcar en stock'}</button>` : ''}
          <button class="act-btn edit" onclick="openEdit(${p.id})">✏️ Editar</button>
          <button class="act-btn del" onclick="confirmDelete(${p.id})">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
  updateStats();
}

async function updateStockQty(id, val) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const parsed = val.trim() !== '' ? parseInt(val) : undefined;
  p.stockQty = parsed;
  if (parsed !== undefined && parsed <= 0) {
    p.instock = false;
    p.stockQty = 0;
    toast('Stock en 0 → marcado como agotado', 'success');
  }
  renderTable();
  const ok = await pushProducts();
  if (ok) toast('Unidades actualizadas ✓', 'success');
}

async function updateSizeStockQty(productId, sizeIdx, val) {
  const p = products.find(x => x.id === productId);
  if (!p || !p.sizes || !p.sizes[sizeIdx]) return;
  const s = p.sizes[sizeIdx];
  const parsed = val.trim() !== '' ? parseInt(val) : undefined;
  s.stockQty = parsed;
  if (parsed !== undefined && parsed <= 0) {
    s.instock = false;
    s.stockQty = 0;
    toast(s.label + ' llegó a 0 → marcado como agotado', 'success');
  } else if (parsed > 0 && s.instock === false) {
    s.instock = true;
  }
  renderTable();
  const ok = await pushProducts();
  if (ok) toast('Stock de ' + s.label + ' actualizado ✓', 'success');
}

async function toggleSizeStock(productId, sizeIdx) {
  const p = products.find(x => x.id === productId);
  if (!p || !p.sizes || !p.sizes[sizeIdx]) return;
  const s = p.sizes[sizeIdx];
  const currentInstock = getSizeInstock(p, s.label);
  s.instock = !currentInstock;
  if (!s.instock) {
    if (s.stockQty !== undefined && s.stockQty !== null) s.stockQty = 0;
  }
  renderTable();
  const ok = await pushProducts();
  if (ok) toast(s.label + (s.instock ? ' → disponible ✓' : ' → agotado ✓'), 'success');
}

function updateStats() {
  const inStock = products.filter(p => p.instock).length;
  const lowStock = products.filter(p => p.instock && p.stockQty !== undefined && p.stockQty !== null && parseInt(p.stockQty) <= 5).length;
  document.getElementById('statTotal').textContent = products.length;
  document.getElementById('statInStock').textContent = inStock;
  document.getElementById('statOutStock').textContent = products.length - inStock;
  document.getElementById('statLow').textContent = lowStock;
  document.getElementById('statCats').textContent = new Set(products.map(p => p.cat)).size;
}

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
  document.getElementById('confirmMsg').textContent = '"' + p.name + '" se eliminará del catálogo permanentemente.';
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

function openEdit(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = p.name;
  document.getElementById('editBrand').value = p.brand || '';
  document.getElementById('editPrice').value = p.price;
  document.getElementById('editCat').value = p.cat;
  document.getElementById('editImg').value = p.img;
  document.getElementById('editDesc').value = p.desc || '';
  document.getElementById('editWasPrice').value = p.wasPrice || '';
  document.getElementById('editStockQty').value = (p.stockQty !== undefined && p.stockQty !== null) ? p.stockQty : '';
  document.getElementById('editBulkMinQty').value = (p.bulkPrice && p.bulkPrice.minQty) ? p.bulkPrice.minQty : '';
  document.getElementById('editBulkPrice').value = (p.bulkPrice && p.bulkPrice.price) ? p.bulkPrice.price : '';
  previewImg('editImg', 'editImgPreview');
  loadSizesIntoForm('editSizesList', p.sizes);
  document.getElementById('editModal').classList.add('open');
}

async function saveEdit() {
  const id = parseInt(document.getElementById('editId').value);
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.name = document.getElementById('editName').value.trim();
  p.brand = document.getElementById('editBrand').value.trim();
  p.price = parseFloat(document.getElementById('editPrice').value) || p.price;
  p.cat = document.getElementById('editCat').value;
  p.img = document.getElementById('editImg').value.trim();
  p.desc = document.getElementById('editDesc').value.trim();
  const wp = parseFloat(document.getElementById('editWasPrice').value);
  p.wasPrice = wp || undefined;
  const sq = document.getElementById('editStockQty').value.trim();
  p.stockQty = sq !== '' ? parseInt(sq) : undefined;
  if (p.stockQty !== undefined && p.stockQty <= 0) {
    p.instock = false;
    p.stockQty = 0;
  }
  const bulkMinQty = parseInt(document.getElementById('editBulkMinQty').value);
  const bulkPriceVal = parseFloat(document.getElementById('editBulkPrice').value);
  p.bulkPrice = (bulkMinQty > 0 && bulkPriceVal > 0) ? { minQty: bulkMinQty, price: bulkPriceVal } : undefined;
  const sizes = getSizes('editSizesList');
  p.sizes = sizes.length > 0 ? sizes : undefined;
  p.priceMax = sizes.length > 1 ? Math.max(...sizes.map(s => s.price)) : undefined;
  closeModal('editModal');
  renderTable();
  const ok = await pushProducts();
  if (ok) toast('Producto actualizado ✓', 'success');
}

async function saveNewProduct() {
  const name = document.getElementById('addName').value.trim();
  const price = parseFloat(document.getElementById('addPrice').value);
  if (!name || !price) { toast('Escribe el nombre y el precio', 'error'); return; }
  const sizes = getSizes('addSizesList');
  const wp = parseFloat(document.getElementById('addWasPrice').value);
  const stockQtyVal = document.getElementById('addStockQty').value.trim();
  const bulkMinQty = parseInt(document.getElementById('addBulkMinQty').value);
  const bulkPriceVal = parseFloat(document.getElementById('addBulkPrice').value);
  const newId = products.length ? Math.max(...products.map(x => x.id)) + 1 : 1;
  const img = document.getElementById('addImg').value.trim()
    || (BASE + '2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png');
  const newProd = {
    id: newId,
    name,
    price,
    cat: document.getElementById('addCat').value,
    img,
    instock: true,
    brand: document.getElementById('addBrand').value.trim(),
    desc: document.getElementById('addDesc').value.trim(),
    wasPrice: wp || undefined,
    stockQty: stockQtyVal !== '' ? parseInt(stockQtyVal) : undefined,
    bulkPrice: (bulkMinQty > 0 && bulkPriceVal > 0) ? { minQty: bulkMinQty, price: bulkPriceVal } : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
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
  ['addName', 'addBrand', 'addPrice', 'addImg', 'addDesc', 'addWasPrice', 'addStockQty', 'addBulkMinQty', 'addBulkPrice'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('addSizesList').innerHTML = '';
  document.getElementById('addImgPreview').className = 'img-preview';
}

function addSizeRow(listId, sizeData) {
  const list = document.getElementById(listId);
  const row = document.createElement('div');
  row.className = 'size-row';
  const currentInstock = sizeData ? (typeof sizeData.instock === 'boolean' ? sizeData.instock : true) : true;
  row.innerHTML =
    '<input type="text"   placeholder="Etiqueta  (ej: 500ml, 1L)"   value="' + (sizeData ? (sizeData.label || '') : '') + '" />'
    + '<input type="number" placeholder="Precio  (ej: 85000)"         value="' + (sizeData ? (sizeData.price || '') : '') + '" style="max-width:110px" />'
    + '<input type="number" placeholder="Uds." min="0"                value="' + (sizeData && sizeData.stockQty !== undefined && sizeData.stockQty !== null ? sizeData.stockQty : '') + '" style="max-width:75px" title="Unidades disponibles (vacío = sin conteo)" />'
    + '<select class="size-instock-sel" title="Estado de esta presentación" style="max-width:110px;padding:5px 6px;border:1.5px solid #d4b0ba;border-radius:7px;font-size:.8rem;font-family:Inter,sans-serif">'
    + '<option value="true"' + (currentInstock ? ' selected' : '') + '>En stock</option>'
    + '<option value="false"' + (!currentInstock ? ' selected' : '') + '>Agotado</option>'
    + '</select>'
    + '<input type="text"   placeholder="URL imagen (opcional)"       value="' + (sizeData ? (sizeData.img || '') : '') + '" style="flex:2" />'
    + '<button class="rm-size" onclick="this.parentElement.remove()">✕</button>';
  list.appendChild(row);
}

function getSizes(listId) {
  const sizes = [];
  document.querySelectorAll('#' + listId + ' .size-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const sel = row.querySelector('.size-instock-sel');
    const label = inputs[0].value.trim();
    const price = parseFloat(inputs[1].value);
    const stockQtyRaw = inputs[2].value.trim();
    const img = inputs[3] ? inputs[3].value.trim() : '';
    const instockVal = sel ? sel.value === 'true' : true;
    if (label && !isNaN(price)) {
      const s = { label, price, instock: instockVal };
      if (stockQtyRaw !== '') s.stockQty = parseInt(stockQtyRaw);
      if (img) s.img = img;
      sizes.push(s);
    }
  });
  return sizes;
}

function loadSizesIntoForm(listId, sizes) {
  const list = document.getElementById(listId);
  list.innerHTML = '';
  if (sizes && sizes.length > 0) {
    sizes.forEach(s => addSizeRow(listId, s));
  }
}

// ═══════════════════════════════════════════
// CÓDIGOS PROMOCIONALES (envío gratis, un solo uso)
// ═══════════════════════════════════════════
function renderPromos() {
  const tbody = document.getElementById('promoTbody');
  if (!tbody) return;
  if (!promoCodes.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#aaa">No hay códigos creados todavía</td></tr>';
    return;
  }
  tbody.innerHTML = promoCodes.map((c, idx) => `
    <tr>
      <td>
        <code style="font-size:.95rem;color:#5c0a1f;font-weight:700;background:#f4e8ec;padding:5px 12px;border-radius:7px;letter-spacing:.1em;display:inline-block">${c.code}</code>
      </td>
      <td>${c.nombre || '—'}</td>
      <td style="font-weight:600;font-size:.8rem;color:#155a2a">
        Envío gratis<br><span style="font-weight:400;color:#6b3a46;font-size:.72rem">Compras &gt; $150.000</span>
      </td>
      <td>
        <span class="stock-badge ${c.usado ? 'out' : 'in'}">
          ${c.usado ? '● Usado' : '● Disponible'}
        </span>
        ${c.usado && c.usadoPor ? '<br><small style="color:#6b3a46;font-size:.72rem">' + c.usadoPor + (c.usadoFecha ? ' · ' + c.usadoFecha : '') + '</small>' : ''}
      </td>
      <td>
        <div class="act-row">
          ${!c.usado ? `<button class="act-btn toggle-stock" onclick="resetPromo(${idx})">↺ Restablecer</button>` : `<button class="act-btn toggle-stock" onclick="resetPromo(${idx})">↺ Restablecer</button>`}
          <button class="act-btn del" onclick="deletePromo(${idx})">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function generarCodigoAleatorio() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function crearPromo() {
  const nombre = document.getElementById('promoNombre').value.trim();
  if (!nombre) { toast('Ingresa el nombre de la clienta', 'error'); return; }

  const code = generarCodigoAleatorio();
  promoCodes.push({
    code, nombre,
    usado: false,
    creadoFecha: new Date().toISOString().slice(0, 10)
  });
  document.getElementById('promoNombre').value = '';

  renderPromos();
  const ok = await pushProducts();
  if (ok) {
    const box = document.getElementById('promoCreado');
    box.innerHTML =
      '✓ Código creado para <strong>' + nombre + '</strong>:<br>'
      + '<span style="font-family:monospace;font-size:1.4rem;font-weight:800;background:#5c0a1f;color:#fff;padding:6px 18px;border-radius:8px;letter-spacing:.15em;display:inline-block;margin-top:6px">'
      + code + '</span><br>'
      + '<small style="color:#6b3a46;font-size:.8rem;margin-top:4px;display:block">Cópialo y compártelo con la clienta — otorga envío gratis en compras superiores a $' + PROMO_MIN_COMPRA.toLocaleString('es-CO') + '. Solo puede usarse una vez.</small>';
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 20000);
    toast('Código creado ✓', 'success');
  }
}

async function deletePromo(idx) {
  if (!confirm('¿Eliminar este código?')) return;
  promoCodes.splice(idx, 1);
  renderPromos();
  const ok = await pushProducts();
  if (ok) toast('Código eliminado', 'success');
}

async function resetPromo(idx) {
  promoCodes[idx].usado = false;
  delete promoCodes[idx].usadoPor;
  delete promoCodes[idx].usadoFecha;
  renderPromos();
  const ok = await pushProducts();
  if (ok) toast('Código restablecido — puede usarse de nuevo ✓', 'success');
}

// ═══════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════
function showTab(tab, btn) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('panel' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('on');
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function previewImg(inputId, previewId) {
  const url = document.getElementById(inputId).value.trim();
  const img = document.getElementById(previewId);
  if (url) {
    img.src = url;
    img.className = 'img-preview show';
    img.onerror = () => { img.className = 'img-preview'; };
  } else {
    img.className = 'img-preview';
  }
}

function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => { t.className = 'toast'; }, 2500);
}

// ═══════════════════════════════════════════
// PRODUCTOS POR DEFECTO
// ═══════════════════════════════════════════
function getDefaultProducts() {
  return [
    { id: 1, name: 'Flash Mask Mantenimiento de Color x300ml', price: 77800, cat: 'mascarilla', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Mascarilla de mantenimiento de color.' },
    { id: 2, name: 'Acondicionador Glow x500ml', price: 64900, cat: 'acondicionador', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-2-300x300.png', instock: true, brand: 'Yellow', desc: 'Acondicionador con efecto brillo intenso.' },
    { id: 6, name: 'Dark & Lovely Alisador Regular Sin Lejia', price: 69000, cat: 'alisadora', img: BASE + '2025/05/Dark-LovelyDark-Lovely-Alisador-300x300.png', instock: true, brand: 'Dark & Lovely', desc: 'Alisador Dark & Lovely Regular Sin Lejia.' },
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
  renderPromos();
}