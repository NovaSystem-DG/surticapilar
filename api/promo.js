// ═══════════════════════════════════════════════════════
// /api/promo.js — Función serverless de Vercel
// Valida y "canjea" códigos promocionales sin exponer la
// Master Key de JSONBin al navegador del cliente.
//
// CAMBIO: los códigos ya NO son de un solo uso. Un código
// sigue funcionando siempre que:
//   1) el nombre escrito coincida con el nombre registrado, y
//   2) la compra supere el mínimo ($150.000)
// Cada vez que se usa, se actualiza "usadoPor"/"usadoFecha"
// solo como historial informativo (última clienta que lo usó),
// pero eso YA NO bloquea usos futuros.
//
// Usa las variables de entorno que ya tienes en Vercel:
//   JSONBIN_API_KEY → tu Master Key
//   JSONBIN_ID      → el ID de tu bin
// No necesitas crear ninguna variable nueva.
// ═══════════════════════════════════════════════════════

const DEFAULT_BIN_ID = '6a21c113da38895dfe88176d';
const MIN_COMPRA = 150000;

// Normaliza un nombre para comparar sin importar mayúsculas, tildes o espacios extra
function normalizeName(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/\s+/g, ' ');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  // Acepta cualquiera de estos nombres de variable de entorno (usa la que ya
  // tengas configurada en Vercel; no hace falta crear una nueva si ya existe).
  const KEY = process.env.JSONBIN_API_KEY || process.env.JSONBIN_MASTER_KEY;
  const BIN_ID = process.env.JSONBIN_ID || DEFAULT_BIN_ID;
  if (!KEY) return res.status(500).json({ ok: false, error: 'server_not_configured' });

  const { action, code, subtotal, cliente, nombreCliente } = req.body || {};
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

    // ── Ya NO se bloquea por "usado". El código es de uso ilimitado. ──
    // (se eliminó el chequeo: if (promo.usado) return ... 'used')

    // El nombre que escribe la clienta debe coincidir con el nombre registrado
    // para ese código (sin importar mayúsculas, tildes o espacios extra)
    if (promo.nombre && normalizeName(nombreCliente) !== normalizeName(promo.nombre)) {
      return res.status(200).json({ ok: false, error: 'name_mismatch' });
    }

    const sub = Number(subtotal) || 0;
    if (sub < MIN_COMPRA) return res.status(200).json({ ok: false, error: 'min_purchase', minCompra: MIN_COMPRA });

    if (action === 'check') {
      return res.status(200).json({ ok: true, nombre: promo.nombre });
    }

    // action === 'redeem'
    // Se guarda como historial (última vez usado / contador), pero
    // "usado" se mantiene en false para que el código nunca quede bloqueado.
    promoCodes[idx] = {
      ...promo,
      usado: false,
      usosTotales: (promo.usosTotales || 0) + 1,
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