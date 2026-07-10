// ═══════════════════════════════════════════════════════
// /api/promo.js — Función serverless de Vercel
// Valida y canjea códigos promocionales sin exponer la
// Master Key de JSONBin al navegador del cliente.
//
// CONFIGURACIÓN REQUERIDA EN VERCEL:
//   Settings → Environment Variables →
//   JSONBIN_MASTER_KEY = tu Master Key de jsonbin.io
// ═══════════════════════════════════════════════════════

const BIN_ID = '6a21c113da38895dfe88176d';
const MIN_COMPRA = 150000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  const KEY = process.env.JSONBIN_MASTER_KEY;
  if (!KEY) return res.status(500).json({ ok: false, error: 'server_not_configured' });

  const { action, code, subtotal, cliente } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ ok: false, error: 'missing_code' });
  }
  if (action !== 'check' && action !== 'redeem') {
    return res.status(400).json({ ok: false, error: 'bad_action' });
  }

  try {
    const getRes = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest', {
      headers: { 'X-Master-Key': KEY, 'X-Bin-Meta': 'false' }
    });
    if (!getRes.ok) throw new Error('fetch_failed');
    const data = await getRes.json();
    const products = data.products || [];
    const promoCodes = data.promoCodes || [];

    const idx = promoCodes.findIndex(
      c => (c.code || '').toUpperCase() === code.toUpperCase()
    );
    if (idx === -1) return res.status(200).json({ ok: false, error: 'not_found' });

    const promo = promoCodes[idx];
    if (promo.usado) return res.status(200).json({ ok: false, error: 'used' });

    const sub = Number(subtotal) || 0;
    if (sub < MIN_COMPRA) return res.status(200).json({ ok: false, error: 'min_purchase', minCompra: MIN_COMPRA });

    if (action === 'check') {
      return res.status(200).json({ ok: true, nombre: promo.nombre });
    }

    // action === 'redeem'
    promoCodes[idx] = {
      ...promo,
      usado: true,
      usadoPor: (cliente || 'Cliente').toString().slice(0, 120),
      usadoFecha: new Date().toISOString().slice(0, 10)
    };

    const putRes = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': KEY },
      body: JSON.stringify({ products, promoCodes })
    });
    if (!putRes.ok) throw new Error('save_failed');

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
}