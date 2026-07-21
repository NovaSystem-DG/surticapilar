// ═══════════════════════════════════════════════════════
// /api/order.js — Función serverless de Vercel
// Descuenta el stock de los productos comprados al confirmar
// un pedido, sin exponer la Master Key de JSONBin al navegador.
//
// Se llama desde iindex.js justo antes de abrir WhatsApp con
// el pedido. Si falla (sin internet, JSONBin caído, etc.) NO
// bloquea el pedido — solo significa que el stock no se pudo
// actualizar automáticamente esa vez.
//
// Usa las mismas variables de entorno que /api/promo.js:
//   JSONBIN_API_KEY → tu Master Key
//   JSONBIN_ID      → el ID de tu bin
// ═══════════════════════════════════════════════════════

const DEFAULT_BIN_ID = '6a21c113da38895dfe88176d';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  const KEY = process.env.JSONBIN_API_KEY || process.env.JSONBIN_MASTER_KEY;
  const BIN_ID = process.env.JSONBIN_ID || DEFAULT_BIN_ID;
  if (!KEY) return res.status(500).json({ ok: false, error: 'server_not_configured' });

  const { items } = req.body || {};
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ ok: false, error: 'missing_items' });
  }

  try {
    const getRes = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest', {
      headers: { 'X-Master-Key': KEY, 'X-Bin-Meta': 'false' }
    });
    if (!getRes.ok) throw new Error('fetch_failed');
    const data = await getRes.json();
    const products = data.products || [];
    const promoCodes = data.promoCodes || [];

    let changed = false;
    const notFound = [];

    for (const raw of items) {
      const id = parseInt(raw && raw.id);
      const qty = parseInt(raw && raw.qty);
      const sizeLabel = raw && raw.sizeLabel ? String(raw.sizeLabel) : null;
      if (!id || !qty || qty <= 0) continue;

      const p = products.find(x => x.id === id);
      if (!p) { notFound.push(id); continue; }

      if (p.sizes && p.sizes.length > 1 && sizeLabel) {
        const s = p.sizes.find(x => x.label === sizeLabel);
        if (s && s.stockQty !== undefined && s.stockQty !== null) {
          const current = parseInt(s.stockQty) || 0;
          const next = Math.max(0, current - qty);
          s.stockQty = next;
          if (next <= 0) s.instock = false;
          changed = true;
        }
      } else if (p.stockQty !== undefined && p.stockQty !== null) {
        const current = parseInt(p.stockQty) || 0;
        const next = Math.max(0, current - qty);
        p.stockQty = next;
        if (next <= 0) p.instock = false;
        changed = true;
      }
      // Si el producto no tiene stockQty definido ("sin conteo"), no se toca.
    }

    if (changed) {
      const putRes = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': KEY },
        body: JSON.stringify({ products, promoCodes })
      });
      if (!putRes.ok) throw new Error('save_failed');
    }

    return res.status(200).json({ ok: true, updated: changed, notFound });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
}