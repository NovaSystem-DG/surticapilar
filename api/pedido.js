// api/pedido.js — Vercel Serverless Function
// Recibe el pedido de la tienda y crea una remisión en EFFI

const EFFI_BASE = 'https://effi.com.co/app';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const EFFI_EMAIL = process.env.EFFI_EMAIL;
  const EFFI_PASSWORD = process.env.EFFI_PASSWORD;

  if (!EFFI_EMAIL || !EFFI_PASSWORD) {
    console.error('Faltan variables de entorno EFFI_EMAIL o EFFI_PASSWORD');
    return res.status(500).json({ error: 'Configuracion incompleta en el servidor' });
  }

  const { nombre, cedula, telefono, correo, departamento, ciudad, direccion, items, subtotal, envio, total } = req.body;

  if (!nombre || !cedula || !telefono || !items || !items.length) {
    return res.status(400).json({ error: 'Faltan datos del pedido' });
  }

  try {
    // ── PASO 1: Login en EFFI ─────────────────────────────────────────
    console.log('Iniciando login EFFI para:', EFFI_EMAIL);

    const loginRes = await fetch(`${EFFI_BASE}/login/ingresar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://effi.com.co',
        'Referer': 'https://effi.com.co/app/login',
      },
      body: new URLSearchParams({
        usuario: EFFI_EMAIL,
        password: EFFI_PASSWORD,
      }).toString(),
      redirect: 'manual',
    });

    console.log('Login status:', loginRes.status);

    const allCookies = loginRes.headers.get('set-cookie') || '';
    console.log('Cookies recibidas:', allCookies.substring(0, 150));

    const sessionMatch = allCookies.match(/ci_session=[^;]+/);
    if (!sessionMatch) {
      const body = await loginRes.text();
      console.error('No se obtuvo ci_session. Body:', body.substring(0, 400));
      return res.status(502).json({
        error: 'Login EFFI fallido - credenciales incorrectas o sesion no iniciada',
        detail: body.substring(0, 200)
      });
    }

    const sessionCookie = sessionMatch[0];
    console.log('Sesion EFFI obtenida correctamente');

    // ── PASO 2: Construir texto del pedido ────────────────────────────
    const productosTexto = items.map(i =>
      `${i.name}${i.sizeLabel ? ' (' + i.sizeLabel + ')' : ''} x${i.qty} = $${Math.round(i.price * i.qty).toLocaleString('es-CO')}`
    ).join(' | ');

    const observacion = [
      'PEDIDO TIENDA ONLINE',
      `Cliente: ${nombre} | CC: ${cedula} | Tel: ${telefono}`,
      correo ? `Correo: ${correo}` : '',
      `Envio a: ${direccion}, ${ciudad}, ${departamento}`,
      `Productos: ${productosTexto}`,
      `Subtotal: $${Math.round(subtotal).toLocaleString('es-CO')} | Envio: $${Math.round(envio).toLocaleString('es-CO')} | TOTAL: $${Math.round(total).toLocaleString('es-CO')}`,
    ].filter(Boolean).join('\n');

    // ── PASO 3: Crear remision de venta en EFFI ───────────────────────
    const formData = new URLSearchParams({
      sucursal: '1',
      bodega: '1',
      centro_costos: 'default',
      fecha_entrega: new Date().toISOString().split('T')[0],
      divisa: 'COP',
      trm: '1',
      cliente: '',
      direccion_cliente: 'default',
      vendedor: 'default',
      tercero: '',
      descuento_global: '0.00',
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
      'caja_medio_pago[]': '1DZ1',
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

    console.log('Enviando remision a EFFI...');

    const crearRes = await fetch(`${EFFI_BASE}/remision_v/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': sessionCookie,
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://effi.com.co',
        'Referer': 'https://effi.com.co/app/remision_v',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148.0.0.0 Safari/537.36',
      },
      body: formData.toString(),
    });

    const responseText = await crearRes.text();
    console.log('Crear remision status:', crearRes.status);
    console.log('Crear remision respuesta:', responseText.substring(0, 500));

    if (crearRes.status === 200) {
      return res.status(200).json({ ok: true, message: 'Remision creada en EFFI exitosamente' });
    } else {
      return res.status(502).json({
        error: 'EFFI no acepto la remision',
        status: crearRes.status,
        detail: responseText.substring(0, 300)
      });
    }

  } catch (err) {
    console.error('Error integracion EFFI:', err);
    return res.status(500).json({ error: 'Error interno', detail: err.message });
  }
};