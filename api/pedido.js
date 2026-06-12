// api/pedido.js — Vercel Serverless Function
// Recibe el pedido desde la tienda y lo crea en EFFI como remisión de venta

const EFFI_BASE = 'https://effi.com.co/app';
const EFFI_EMAIL = process.env.EFFI_EMAIL;       // surticapilar@gmail.com
const EFFI_PASSWORD = process.env.EFFI_PASSWORD; // contraseña de EFFI

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — permite que tu HTML llame a esta función
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { nombre, cedula, telefono, correo, departamento, ciudad, direccion, items, subtotal, envio, total } = req.body;

  // Validar campos mínimos
  if (!nombre || !cedula || !telefono || !items || !items.length) {
    return res.status(400).json({ error: 'Faltan datos del pedido' });
  }

  try {
    // ── PASO 1: Login en EFFI ──────────────────────────────────────────────
    const loginRes = await fetch(`${EFFI_BASE}/login/ingresar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: new URLSearchParams({
        usuario: EFFI_EMAIL,
        password: EFFI_PASSWORD,
      }).toString(),
      redirect: 'manual',
    });

    // Extraer cookie de sesión
    const setCookie = loginRes.headers.get('set-cookie') || '';
    const sessionMatch = setCookie.match(/ci_session=[^;]+/);
    if (!sessionMatch) {
      console.error('Login EFFI fallido. Status:', loginRes.status);
      return res.status(502).json({ error: 'No se pudo iniciar sesión en EFFI' });
    }
    const sessionCookie = sessionMatch[0];

    // ── PASO 2: Crear remisión de venta ────────────────────────────────────
    // Construir observación con todos los datos del pedido
    const productosTexto = items.map(i =>
      `${i.name}${i.sizeLabel ? ' (' + i.sizeLabel + ')' : ''} x${i.qty} = $${Math.round(i.price * i.qty).toLocaleString('es-CO')}`
    ).join(' | ');

    const observacion = [
      `PEDIDO TIENDA ONLINE`,
      `Cliente: ${nombre} | CC: ${cedula} | Tel: ${telefono}`,
      correo ? `Correo: ${correo}` : '',
      `Dirección: ${direccion}, ${ciudad}, ${departamento}`,
      `Productos: ${productosTexto}`,
      `Subtotal: $${Math.round(subtotal).toLocaleString('es-CO')} | Envío: $${Math.round(envio).toLocaleString('es-CO')} | TOTAL: $${Math.round(total).toLocaleString('es-CO')}`,
    ].filter(Boolean).join('\n');

    // Campos base que EFFI espera (según payload capturado)
    const formData = new URLSearchParams({
      sucursal: '1',
      bodega: '1',
      centro_costos: 'default',
      fecha_entrega: new Date().toISOString().split('T')[0],
      divisa: 'COP',
      trm: '1',
      cliente: '',           // EFFI usará cliente genérico / consumidor final
      direccion_cliente: 'default',
      vendedor: 'default',
      tercero: '',
      descuento_global: '0.00',
      // Concepto único — todos los productos en descripción libre
      'id_concepto[]': String(Date.now()),
      'alquiler[]': '0',
      'articulo[]': '',
      'descripcion[]': productosTexto,
      'observacion_concepto[]': '',
      'lote[]': '',
      'serie[]': '',
      'gift[]': '0',
      'cantidad[]': String(items.reduce((s, i) => s + i.qty, 0)),
      'precio[]': String(subtotal),
      'bruto[]': String(subtotal),
      'descuento[]': '0',
      'total_concepto[]': String(subtotal),
      garantia: '',
      observacion: observacion,
      'retencion[]': 'default',
      'base_retencion[]': '',
      'valor_retencion[]': '',
      bruto_transaccion: String(subtotal),
      total_descuento: '0',
      subtotal_transaccion: String(subtotal),
      propina: '0',
      total_impuesto: '0',
      total_retencion: '0',
      total_transaccion: String(total),
      prontopago: '',
      fecha_prontopago: '',
      't_forma_pago[]': '2',
      'valor_forma_pago[]': '0',
      total_contado: '0',
      recibido: '',
      cambio: '0',
      'medio_pago[]': 'default',
      'caja_medio_pago[]': '1DŽ1',
      'cuenta_medio_pago[]': 'default',
      'valor_medio_pago[]': '0',
      'observacion_medio_pago[]': '',
      action: '1',
      sucursal_cotizacion: '',
      id_cotizacion: '',
      json_ref: '',
      session_empresa: '48200',
      session_usuario: EFFI_EMAIL,
    });

    const crearRes = await fetch(`${EFFI_BASE}/remision_v/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie,
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://effi.com.co',
        'Referer': 'https://effi.com.co/app/remision_v',
      },
      body: formData.toString(),
    });

    const responseText = await crearRes.text();
    console.log('EFFI crear respuesta:', crearRes.status, responseText.substring(0, 200));

    if (crearRes.status === 200) {
      return res.status(200).json({ ok: true, message: 'Remisión creada en EFFI' });
    } else {
      return res.status(502).json({ error: 'EFFI no aceptó la remisión', detail: responseText.substring(0, 300) });
    }

  } catch (err) {
    console.error('Error integración EFFI:', err);
    return res.status(500).json({ error: 'Error interno', detail: err.message });
  }
}