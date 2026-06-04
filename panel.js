
        const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;; // Cambia esto — es la clave que va en la URL
        const BASE = 'https://surticapilar.com/wp-content/uploads/';
        const tagNames = { shampoo: 'Shampoo', acondicionador: 'Acondicionador', mascarilla: 'Mascarilla', tratamiento: 'Tratamiento', leavein: 'Leave-In', oleo: 'Oleo', alisadora: 'Alisadora', accesorio: 'Accesorio', tinte: 'Tinte' };

        // ═══════════════════════════════════════════════
        // AUTENTICACIÓN POR URL
        // ═══════════════════════════════════════════════
        (function checkAuth() {
            const params = new URLSearchParams(window.location.search);
            if (params.get('key') !== ADMIN_KEY) {
                // Sin key correcto — pantalla en blanco
                document.getElementById('blocked').classList.add('show');
                document.body.style.background = '#fff';
            } else {
                document.getElementById('mainNav').style.display = 'flex';
                document.getElementById('mainPage').style.display = 'block';
            }
        })();

        // ═══════════════════════════════════════════════
        // JSONBIN CONFIG (guardada en localStorage del browser de tu mamá)
        // ═══════════════════════════════════════════════
        function loadConfig() {
            return {
                binId: localStorage.getItem('sc_bin_id') || '',
                apiKey: localStorage.getItem('sc_api_key') || ''
            };
        }
        function saveConfig() {
            const binId = document.getElementById('cfgBinId').value.trim();
            const apiKey = document.getElementById('cfgApiKey').value.trim();
            if (!binId || !apiKey) { toast('Completa los dos campos', 'error'); return; }
            localStorage.setItem('sc_bin_id', binId);
            localStorage.setItem('sc_api_key', apiKey);
            toast('Configuración guardada ✓', 'success');
            document.getElementById('setupCard').style.display = 'none';
            init();
        }
        function isConfigured() { const c = loadConfig(); return c.binId && c.apiKey; }

        // ═══════════════════════════════════════════════
        // JSONBIN API
        // ═══════════════════════════════════════════════
        async function fetchProducts() {
            if (!isConfigured()) return getDefaultProducts();
            setStatus('saving', '⏳ Cargando...');
            try {
                const { binId, apiKey } = loadConfig();
                const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                    headers: { 'X-Master-Key': apiKey }
                });
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                setStatus('ok', '✓ Conectado');
                return data.record.products || getDefaultProducts();
            } catch (e) {
                setStatus('err', '✗ Error de conexión');
                toast('No se pudo conectar a JSONBin. Revisa la configuración.', 'error');
                return getDefaultProducts();
            }
        }
        async function pushProducts() {
            if (!isConfigured()) {
                localStorage.setItem('sc_products_local', JSON.stringify(products));
                return true;
            }

            try {
                const { binId, apiKey } = loadConfig();

                console.log('Enviando a JSONBin:', {
                    binId,
                    products
                });

                const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': apiKey
                    },
                    body: JSON.stringify({ products })
                });

                console.log('Status:', res.status);

                const data = await res.text();

                console.log('Respuesta:', data);

                return true;

            } catch (err) {
                console.error(err);
                return false;
            }
        }

        // ═══════════════════════════════════════════════
        // ESTADO
        // ═══════════════════════════════════════════════
        let products = [];

        function setStatus(type, msg) {
            const el = document.getElementById('statusPill');
            el.className = 'status-pill ' + type;
            el.textContent = msg;
        }

        // ═══════════════════════════════════════════════
        // RENDER TABLE
        // ═══════════════════════════════════════════════
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
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#aaa">No se encontraron productos</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(p => `
    <tr>
      <td><img class="t-img" src="${p.img}" onerror="this.style.background='#f0e0e5';this.src=''"></td>
      <td><p class="t-name">${p.name}</p>${p.brand ? `<p class="t-brand">${p.brand}</p>` : ''}</td>
      <td style="font-weight:600;color:var(--v)">$${Math.round(p.price).toLocaleString('es-CO')}${p.priceMax ? `<br><span style="font-size:.7rem;color:var(--txt2)">hasta $${Math.round(p.priceMax).toLocaleString('es-CO')}</span>` : ''}</td>
      <td>${tagNames[p.cat] || p.cat}</td>
      <td><span class="stock-badge ${p.instock ? 'in' : 'out'}">${p.instock ? '● En stock' : '● Agotado'}</span></td>
      <td><div class="act-row">
        <button class="act-btn toggle-stock" onclick="toggleStock(${p.id})">${p.instock ? 'Marcar agotado' : 'Marcar en stock'}</button>
        <button class="act-btn edit" onclick="openEdit(${p.id})">✏️ Editar</button>
        <button class="act-btn del" onclick="confirmDelete(${p.id})">🗑️</button>
      </div></td>
    </tr>`).join('');
            updateStats();
        }

        function updateStats() {
            const inStock = products.filter(p => p.instock).length;
            document.getElementById('statTotal').textContent = products.length;
            document.getElementById('statInStock').textContent = inStock;
            document.getElementById('statOutStock').textContent = products.length - inStock;
            document.getElementById('statCats').textContent = new Set(products.map(p => p.cat)).size;
        }

        // ═══════════════════════════════════════════════
        // ACCIONES INVENTARIO
        // ═══════════════════════════════════════════════
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
            document.getElementById('confirmMsg').textContent = `"${p.name}" se eliminará del catálogo permanentemente.`;
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

        // ═══════════════════════════════════════════════
        // EDITAR PRODUCTO
        // ═══════════════════════════════════════════════
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
            previewImg('editImg', 'editImgPreview');

            // Sizes
            const sl = document.getElementById('editSizesList');
            sl.innerHTML = '';
            if (p.sizes && p.sizes.length > 1) p.sizes.forEach(s => addSizeRow('editSizesList', s.label, s.price));

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
            p.sizes = getSizesFrom('editSizesList');
            p.priceMax = p.sizes && p.sizes.length > 1 ? Math.max(...p.sizes.map(s => s.price)) : undefined;
            closeModal('editModal');
            renderTable();
            const ok = await pushProducts();
            if (ok) toast('Producto actualizado ✓', 'success');
        }

        // ═══════════════════════════════════════════════
        // AGREGAR PRODUCTO
        // ═══════════════════════════════════════════════
        async function saveNewProduct() {
            const name = document.getElementById('addName').value.trim();
            const price = parseFloat(document.getElementById('addPrice').value);
            if (!name || !price) { toast('Escribe el nombre y el precio', 'error'); return; }
            const sizes = getSizesFrom('addSizesList');
            const wp = parseFloat(document.getElementById('addWasPrice').value);
            const newId = Date.now();
            const img = document.getElementById('addImg').value.trim() || (BASE + '2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png');
            const newProd = {
                id: newId, name, price,
                cat: document.getElementById('addCat').value,
                img,
                instock: true,
                brand: document.getElementById('addBrand').value.trim(),
                desc: document.getElementById('addDesc').value.trim(),
                wasPrice: wp || undefined,
                sizes: sizes.length > 1 ? sizes : undefined,
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
            ['addName', 'addBrand', 'addPrice', 'addImg', 'addDesc', 'addWasPrice'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('addSizesList').innerHTML = '';
            document.getElementById('addImgPreview').className = 'img-preview';
        }

        // ═══════════════════════════════════════════════
        // SIZES HELPERS
        // ═══════════════════════════════════════════════
        function addSizeRow(listId, label = '', price = '') {
            const row = document.createElement('div');
            row.className = 'size-row';
            row.innerHTML = `
    <input type="text" placeholder="Tamaño (ej: 300ml)" value="${label}" style="flex:1.2"/>
    <input type="number" placeholder="Precio COP" value="${price}" style="flex:1"/>
    <button class="rm-size" onclick="this.parentElement.remove()">✕</button>`;
            document.getElementById(listId).appendChild(row);
        }
        function getSizesFrom(listId) {
            const rows = document.querySelectorAll(`#${listId} .size-row`);
            const out = [];
            rows.forEach(r => {
                const inputs = r.querySelectorAll('input');
                const lbl = inputs[0].value.trim();
                const prc = parseFloat(inputs[1].value);
                if (lbl && prc) out.push({ label: lbl, price: prc });
            });
            return out;
        }

        // ═══════════════════════════════════════════════
        // UI HELPERS
        // ═══════════════════════════════════════════════
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
            if (url) { img.src = url; img.className = 'img-preview show'; img.onerror = () => img.className = 'img-preview'; }
            else { img.className = 'img-preview'; }
        }

        function toast(msg, type = '') {
            const t = document.getElementById('toast');
            t.textContent = msg; t.className = 'toast show' + (type ? ' ' + type : '');
            setTimeout(() => t.className = 'toast', 2500);
        }

        // ═══════════════════════════════════════════════
        // PRODUCTOS POR DEFECTO
        // ═══════════════════════════════════════════════
        function getDefaultProducts() {
            return [
                { id: 1, name: 'Flash Mask Mantenimiento de Color x300ml', price: 77800, cat: 'mascarilla', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Mascarilla de mantenimiento de color para cabello tratado.' },
                { id: 2, name: 'Acondicionador Glow x500ml', price: 64900, cat: 'acondicionador', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-2-300x300.png', instock: true, brand: 'Yellow', desc: 'Acondicionador con efecto brillo intenso.' },
                { id: 3, name: 'Shampoo Hidro-Nutritivo x500ml', price: 62900, cat: 'shampoo', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-4-300x300.png', instock: true, brand: 'Yellow', desc: 'Shampoo con nutricion profunda e hidratacion intensa.' },
                { id: 4, name: 'Molecular Serum x150ml', price: 62900, cat: 'leavein', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-3-300x300.png', instock: true, brand: 'Organic Fiber', desc: 'Serum molecular de accion profunda.' },
                { id: 5, name: 'Protector Thermal Yellow x250ml', price: 69000, cat: 'tratamiento', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-23-300x300.png', instock: true, brand: 'Yellow', desc: 'Termoprotector Yellow hasta 230C.' },
                { id: 6, name: 'Crema de Peinar Curly Yellow x200ml', price: 43900, cat: 'leavein', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-22-300x300.png', instock: true, brand: 'Yellow', desc: 'Crema definidora de rizos Yellow.' },
                { id: 7, name: 'Shampoo Curly Yellow x500ml', price: 62900, cat: 'shampoo', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-21-300x300.png', instock: true, brand: 'Yellow', desc: 'Shampoo Yellow especial para rizos.' },
                { id: 8, name: 'Acondicionador Curly Yellow x500ml', price: 64900, cat: 'acondicionador', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-20-300x300.png', instock: true, brand: 'Yellow', desc: 'Acondicionador Yellow para rizos.' },
                { id: 9, name: 'Mascarilla Reparadora Yellow x300ml', price: 62900, cat: 'mascarilla', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-19-300x300.png', instock: true, brand: 'Yellow', desc: 'Mascarilla reparadora Yellow con keratina.' },
                { id: 10, name: 'Shampoo Liss Yellow x500ml', price: 62900, cat: 'shampoo', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-18-300x300.png', instock: true, brand: 'Yellow', desc: 'Shampoo Yellow para cabello liso.' },
                { id: 11, name: 'Mascarilla Nutritiva Yellow', price: 62900, cat: 'mascarilla', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-17-300x300.png', instock: true, brand: 'Yellow', sizes: [{ label: '200ml', price: 62900 }, { label: '500ml', price: 85700 }], priceMax: 85700, desc: 'Mascarilla nutritiva Yellow disponible en dos tamanios.' },
                { id: 12, name: 'Reparative Mask Reestructurante', price: 98900, cat: 'mascarilla', img: BASE + '2025/12/Copia-de-Copia-de-pagina-web-10-300x300.png', instock: true, brand: 'Yellow', sizes: [{ label: '200ml', price: 98900 }, { label: '500ml', price: 170000 }], priceMax: 170000, desc: 'Mascarilla reestructurante de alto rendimiento.' },
                { id: 13, name: 'Illuminating Mask 200ml', price: 106000, cat: 'mascarilla', img: BASE + '2025/12/Copia-de-Copia-de-pagina-web-14-300x300.png', instock: true, brand: 'Yellow', desc: 'Mascarilla nutritiva iluminadora.' },
                { id: 14, name: 'Thermal Protector 300ml', price: 93500, cat: 'tratamiento', img: BASE + '2025/12/Copia-de-Copia-de-pagina-web-15-300x300.png', instock: true, brand: 'Organic Fiber', desc: 'Termoprotector sin fijacion hasta 230C.' },
                { id: 15, name: 'Shampoo Hydratation Terra by Lendan', price: 59700, cat: 'shampoo', img: BASE + '2025/05/SHAMPOO-HYDRATION-PROFUNDA-TERRA-BYLENDAN-300x300.png', instock: true, brand: 'Terra by Lendan', sizes: [{ label: '300ml', price: 59700 }, { label: '1L', price: 120000 }], priceMax: 120000, desc: 'Shampoo Terra by Lendan para cabello color.' },
                { id: 16, name: 'Conditioner Hydratation Terra by Lendan', price: 67000, cat: 'acondicionador', img: BASE + '2025/05/CONDITIONER-HYDRATATION-CUIDA-COLOR-TERRA-BYLENDAN-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Acondicionador Terra by Lendan cuida el color.' },
                { id: 17, name: 'Leave-In Tratamiento Profundo Terra', price: 63500, cat: 'leavein', img: BASE + '2025/05/TERRA_CURLY_ACTIVATOR_275ml_-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Leave-In sin enjuague Terra by Lendan.' },
                { id: 18, name: 'Tratamiento Reparador Profundo Terra', price: 55000, cat: 'tratamiento', img: BASE + '2025/05/TRATAMIENTO-REPARADOR-PROFUNDO-TERRABY-LENDAN-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Tratamiento reparador intensivo Terra by Lendan.' },
                { id: 19, name: 'Mascarilla Nutricion Cuida Color Terra 500ml', price: 98900, cat: 'mascarilla', img: BASE + '2025/05/MASCARILLA-NUTRICION-CUIDA-COLOR-TERRABY-LENDAN-500M-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Mascarilla Terra by Lendan nutre y protege el color.' },
                { id: 20, name: 'Shampoo Plex Forte N.4 x300ml', price: 57900, cat: 'shampoo', img: BASE + '2025/05/SHAMPOO-PLEX-FORTE-N4-LENDAN-300x300.png', instock: true, brand: 'Lendan', desc: 'Shampoo Lendan Plex Forte N.4.' },
                { id: 21, name: 'Acondicionador Plex Forte N.5 x300ml', price: 62900, cat: 'acondicionador', img: BASE + '2025/05/ACONDICIONADOR-PLEX-FORTE-N5-LENDAN-300x300.png', instock: true, brand: 'Lendan', desc: 'Acondicionador Lendan Plex Forte N.5.' },
                { id: 22, name: 'Ampolla Plex Forte N.3', price: 39000, cat: 'tratamiento', img: BASE + '2025/05/AMPOLLA-PLEX-FORTE-N3-LENDAN-300x300.png', instock: true, brand: 'Lendan', sizes: [{ label: '1 ampolla (13ml)', price: 39000 }, { label: 'Caja x12', price: 186000 }], priceMax: 186000, desc: 'Ampolla Lendan Plex Forte N.3 reparacion instantanea.' },
                { id: 23, name: 'Oleo Capilar Plex Forte N.6 75ml', price: 114000, cat: 'oleo', img: BASE + '2025/05/OLEO-CAPILAR-REPARADOR-Y-PROTECTORLENDAN-PLEX-FORTE-N6-300x300.png', instock: true, brand: 'Lendan', desc: 'Oleo Lendan Plex Forte N.6 sellado y proteccion final.' },
                { id: 24, name: 'Mascarilla Salerm 21 Original', price: 33700, cat: 'mascarilla', img: BASE + '2025/05/Salerm-21-Original-Hair-Lab-Salerm-Cosmetic-Mascarilla_surticapilar-300x300.png', instock: true, brand: 'Salerm', desc: 'Mascarilla clasica Salerm 21.' },
                { id: 25, name: 'Salerm 21 Jazmin y Ambar', price: 37500, cat: 'mascarilla', img: BASE + '2025/05/SALERM-21-JAZMIN-AMBAR-300x300.png', instock: true, brand: 'Salerm', desc: 'Salerm 21 con aroma a Jazmin y Ambar.' },
                { id: 26, name: 'Mascarilla Nutricion Germen de Trigo 200ml', price: 65900, cat: 'mascarilla', img: BASE + '2025/05/MASCARILLA-NUTRICION-GERMEN-DE-TRIGO-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Mascarilla Hair Lab con germen de trigo.' },
                { id: 27, name: 'Mascarilla Lisos Anti Frizz Hair Lab 300ml', price: 55000, cat: 'mascarilla', img: BASE + '2025/05/mascarilla_para_alisado_hair_lab_cosmetic-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Mascarilla anti-frizz Hair Lab.' },
                { id: 28, name: 'Shampoo Control Caspa Hair Lab 300ml', price: 35000, cat: 'shampoo', img: BASE + '2025/05/Shampoo-Control-Caspa-Hair-Lab-Salerm-Cosmetic-Shampoo-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Shampoo anticaspa Hair Lab.' },
                { id: 29, name: 'Impermeabilizante Protector Capilar Hair Lab', price: 48900, cat: 'tratamiento', img: BASE + '2025/05/Spray-Impermeabilizante-Hair-Lab-Salerm-Cosmetic-Spray_surticapilar-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Spray impermeabilizante Hair Lab.' },
                { id: 30, name: 'Acondicionador Color Hair Lab 300ml', price: 45000, cat: 'acondicionador', img: BASE + '2025/05/ACONDICIONADOR-HIDRATANTE-PROTECTOR-COLOR-HAIRLAB-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Acondicionador Hair Lab para cabello con color.' },
                { id: 31, name: 'Tratamiento Moisture Kick Bonacure 200ml', price: 82000, cat: 'tratamiento', img: BASE + '2025/05/TRATAMIENTO-MOISTURE-KICK-BONACURE-300x300.png', instock: true, brand: 'Bonacure', desc: 'Tratamiento Schwarzkopf Bonacure Moisture Kick.' },
                { id: 32, name: 'Dark & Lovely Alisador Regular Sin Lejia', price: 69000, cat: 'alisadora', img: BASE + '2025/05/Dark-LovelyDark-Lovely-Alisador-300x300.png', instock: true, brand: 'Dark & Lovely', desc: 'Alisador Dark & Lovely Regular Sin Lejia.' },
                { id: 33, name: 'SheaMoisture Mascarilla Miel de Manuka 326gr', price: 88000, cat: 'mascarilla', img: BASE + '2025/05/SHEAMOISTURE-MASCARILLA-MIEL-MANUKA-300x300.png', instock: true, brand: 'SheaMoisture', desc: 'Mascarilla SheaMoisture con miel de manuka.' },
                { id: 34, name: 'OGX Aceite de Argan de Marruecos 100ml', price: 53900, cat: 'oleo', img: BASE + '2025/05/aceite-de-argan-OGX-300x300.png', instock: true, wasPrice: 68000, brand: 'OGX', desc: 'Aceite de argan OGX hidrata y da brillo.' },
                { id: 35, name: 'Oleo Extraordinario Elvive 100ml', price: 47300, cat: 'oleo', img: BASE + '2025/05/OLEO-EXTRAORDINARIO-ACEITE-CAPILAR-ELVIVE-300x300.png', instock: true, brand: "L'Oreal", desc: 'Oleo Elvive Extraordinario.' },
                { id: 36, name: 'Termoprotector Leche Pal Pelo', price: 36500, cat: 'tratamiento', img: BASE + '2025/05/TERMOPROTECTOR-LECHE-PAL-PELO-300x300.png', instock: true, brand: 'Leche Pal Pelo', desc: 'Termoprotector Leche Pal Pelo.' },
                { id: 37, name: 'Rulos 1 Pulgada 3/4 x12 – Morado', price: 26000, cat: 'accesorio', img: BASE + '2025/05/RULOS-1-PULGADA-TRES-CUARTO-MORADO-300x300.png', instock: true, brand: 'Accesorios', desc: 'Set de 12 rulos medianos morados.' },
                { id: 38, name: 'Rulos 2 Pulgadas x12 – Verde Oscuro', price: 29500, cat: 'accesorio', img: BASE + '2025/05/RULOS-2-PULGADAS-VERDE-OSCURO-300x300.png', instock: true, brand: 'Accesorios', desc: 'Set de 12 rulos grandes verde oscuro.' },
                { id: 39, name: 'Gorro Malla para Rulos – Negro', price: 37500, cat: 'accesorio', img: BASE + '2025/05/GORRO-MALLA-REDECILLA-RULOS-NEGRO-300x300.png', instock: true, brand: 'Accesorios', desc: 'Gorro de malla para proteger los rulos.' },
            ];
        }

        // ═══════════════════════════════════════════════
        // INIT
        // ═══════════════════════════════════════════════
        async function init() {
            // Mostrar/ocultar setup card
            const cfg = loadConfig();
            if (cfg.binId) {
                document.getElementById('cfgBinId').value = cfg.binId;
                document.getElementById('cfgApiKey').value = cfg.apiKey;
                document.getElementById('setupCard').style.display = 'none';
            }
            products = await fetchProducts();
            renderTable();
        }

        // Solo inicializa si tiene el key correcto
        const params = new URLSearchParams(window.location.search);
        if (params.get('key') === ADMIN_KEY) init();