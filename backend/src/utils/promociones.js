// src/utils/promociones.js
const pool = require("../config/database");

const toNum = (x) => Number(x) || 0;

function promoVigente(f, ahora = new Date()) {
  if (!f.activa) return false;
  if (f.fecha_inicio && new Date(f.fecha_inicio) > ahora) return false;
  if (f.fecha_fin && new Date(f.fecha_fin) < ahora) return false;
  return true;
}

function precioConPromo(precio, f) {
  if (f.tipo === "DESCUENTO_PORCENTAJE") {
    return Math.round(precio * (1 - toNum(f.valor) / 100));
  }
  if (f.tipo === "DESCUENTO_MONTO") {
    return Math.max(0, precio - toNum(f.valor));
  }
  return precio; // COMBO: no cambia el precio individual
}

// Items de descuento por presentación. Si se pasa productoId, solo los de ese perfume.
async function obtenerFilasPromo(productoId = null) {
  const where = productoId ? "WHERE iv.producto_id = ?" : "";
  const params = productoId ? [productoId] : [];

  const [filas] = await pool.query(
    `SELECT pi.variante_id, pr.id AS promocion_id, pr.nombre, pr.tipo, pr.valor,
            pr.precio_combo, pr.activa, pr.fecha_inicio, pr.fecha_fin,
            iv.producto_id
     FROM promocion_items pi
     JOIN promociones pr ON pr.id = pi.promocion_id
     JOIN inventario_variantes iv ON iv.id = pi.variante_id
     ${where}`,
    params
  );

  return filas;
}

// variantes: [{ variante_id, precio, ... }]
function aplicarPromociones(variantes, filas, ahora = new Date()) {
  return variantes.map((v) => {
    const precio = toNum(v.precio);
    let mejor = null;

    for (const f of filas) {
      if (Number(f.variante_id) !== Number(v.variante_id)) continue;
      if (f.tipo === "COMBO" || !promoVigente(f, ahora)) continue;

      const final = precioConPromo(precio, f);
      if (!mejor || final < mejor.precio_final) {
        mejor = {
          precio_final: final,
          promo: {
            id: f.promocion_id,
            nombre: f.nombre,
            tipo: f.tipo,
            valor: toNum(f.valor),
          },
        };
      }
    }

    return {
      ...v,
      precio,
      precio_final: mejor ? mejor.precio_final : precio,
      promo: mejor ? mejor.promo : null,
    };
  });
}

// ---------- Promociones activas (para el chatbot) ----------

async function obtenerPromocionesActivas(ahora = new Date()) {
  const [filas] = await pool.query(
    `SELECT pr.id, pr.nombre, pr.descripcion, pr.tipo, pr.valor, pr.precio_combo,
            pr.activa, pr.fecha_inicio, pr.fecha_fin,
            pi.cantidad, pi.es_regalo,
            iv.tamano_ml, p.id AS producto_id, p.nombre AS producto
     FROM promociones pr
     JOIN promocion_items pi ON pi.promocion_id = pr.id
     JOIN inventario_variantes iv ON iv.id = pi.variante_id
     JOIN productos p ON p.id = iv.producto_id
     WHERE pr.activa = 1 AND p.estado = 'ACTIVO'`
  );

  const mapa = new Map();

  for (const f of filas) {
    if (!promoVigente(f, ahora)) continue;

    if (!mapa.has(f.id)) {
      mapa.set(f.id, {
        id: f.id,
        nombre: f.nombre,
        descripcion: f.descripcion,
        tipo: f.tipo,
        valor: toNum(f.valor),
        precio_combo: toNum(f.precio_combo),
        items: [],
      });
    }

    mapa.get(f.id).items.push({
      producto_id: Number(f.producto_id),
      nombre: f.producto,
      tamano_ml: f.tamano_ml,
      cantidad: Number(f.cantidad) || 1,
      es_regalo: Number(f.es_regalo) === 1,
    });
  }

  return [...mapa.values()];
}

// ---------- Combos con regalo ----------

// Un combo tiene artículos que activan la promo (es_regalo = 0)
// y artículos que se regalan (es_regalo = 1).
async function obtenerCombosVigentes() {
  const [filas] = await pool.query(
    `SELECT pr.id, pr.nombre, pr.activa, pr.fecha_inicio, pr.fecha_fin,
            pi.variante_id, pi.cantidad, pi.es_regalo
     FROM promociones pr
     JOIN promocion_items pi ON pi.promocion_id = pr.id
     WHERE pr.tipo = 'COMBO' AND pr.activa = 1`
  );

  const combos = new Map();

  for (const f of filas) {
    if (!promoVigente(f)) continue;

    if (!combos.has(f.id)) {
      combos.set(f.id, { id: f.id, nombre: f.nombre, disparadores: [], regalos: [] });
    }

    const item = {
      variante_id: Number(f.variante_id),
      cantidad: Number(f.cantidad) || 1,
    };

    combos.get(f.id)[Number(f.es_regalo) === 1 ? "regalos" : "disparadores"].push(item);
  }

  return [...combos.values()].filter((c) => c.disparadores.length && c.regalos.length);
}

// lineas: [{ variante_id, cantidad }]
async function calcularCarrito(lineas = []) {
  const vacio = { items: [], combos: [], subtotal: 0, total: 0 };

  // 1. Sumar cantidades pedidas por presentación
  const pedido = new Map();
  for (const l of lineas) {
    const vid = Number(l.variante_id);
    const n = Math.max(1, Math.floor(Number(l.cantidad) || 1));
    pedido.set(vid, (pedido.get(vid) || 0) + n);
  }
  if (pedido.size === 0) return vacio;

  // 2. Combos activados: cuántas veces se cumple el disparador
  const combos = await obtenerCombosVigentes();
  const activos = [];

  for (const c of combos) {
    const sets = Math.min(
      ...c.disparadores.map((d) =>
        Math.floor((pedido.get(d.variante_id) || 0) / d.cantidad)
      )
    );
    if (sets < 1) continue;

    activos.push({
      combo: c,
      sets,
      regalos: c.regalos.map((r) => ({
        variante_id: r.variante_id,
        cantidad: r.cantidad * sets,
      })),
    });
  }

  // 3. Datos de todas las presentaciones (pedido + regalos)
  const ids = [
    ...new Set([
      ...pedido.keys(),
      ...activos.flatMap((a) => a.regalos.map((r) => r.variante_id)),
    ]),
  ];

  const [filas] = await pool.query(
    `SELECT iv.id AS variante_id, iv.producto_id, iv.tipo, iv.tamano_ml,
            iv.precio, iv.stock_actual, p.nombre, p.imagen_url, m.nombre AS marca
     FROM inventario_variantes iv
     JOIN productos p ON p.id = iv.producto_id
     LEFT JOIN marcas m ON m.id = p.marca_id
     WHERE iv.id IN (?)`,
    [ids]
  );

  const porId = new Map(filas.map((f) => [Number(f.variante_id), f]));

  // 4. Stock: pedido más regalos
  const unidades = new Map(pedido);
  for (const a of activos) {
    for (const r of a.regalos) {
      unidades.set(r.variante_id, (unidades.get(r.variante_id) || 0) + r.cantidad);
    }
  }

  for (const [vid, n] of unidades) {
    const v = porId.get(vid);
    if (!v) throw new Error(`La presentación ${vid} no existe`);
    if (n > v.stock_actual) {
      throw new Error(`Stock insuficiente de ${v.nombre} ${v.tamano_ml} ml`);
    }
  }

  // 5. Precio de cada presentación con su promoción individual
  const filasPromo = await obtenerFilasPromo();
  const precios = new Map(
    aplicarPromociones([...porId.values()], filasPromo).map((v) => [
      Number(v.variante_id),
      v,
    ])
  );

  const linea = (vid, cantidad, { regalo = false, promo = null } = {}) => {
    const base = porId.get(vid);
    const p = precios.get(vid);
    const precio = regalo ? 0 : p.precio_final;

    return {
      variante_id: vid,
      producto_id: base.producto_id,
      nombre: base.nombre,
      marca: base.marca,
      imagen_url: base.imagen_url,
      tipo: base.tipo,
      tamano_ml: base.tamano_ml,
      cantidad,
      precio,
      precio_original: p.precio,
      promo: regalo ? promo : p.promo,
      regalo,
      subtotal: precio * cantidad,
    };
  };

  // 6. Líneas del cliente (siempre a su precio)
  const items = [...pedido].map(([vid, n]) => linea(vid, n));

  // 7. Líneas de regalo (a $0, con el precio original como ahorro)
  const combosAplicados = [];

  for (const a of activos) {
    let ahorro = 0;

    for (const r of a.regalos) {
      const promo = { id: a.combo.id, nombre: a.combo.nombre, tipo: "REGALO", valor: 0 };
      items.push(linea(r.variante_id, r.cantidad, { regalo: true, promo }));
      ahorro += (precios.get(r.variante_id).precio || 0) * r.cantidad;
    }

    combosAplicados.push({
      promocion_id: a.combo.id,
      nombre: a.combo.nombre,
      veces: a.sets,
      ahorro,
    });
  }

  // 8. Totales: los regalos ya van en $0, así que no se vuelven a restar
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);

  return { items, combos: combosAplicados, subtotal, total: subtotal };
}

module.exports = {
  aplicarPromociones,
  obtenerFilasPromo,
  obtenerPromocionesActivas,
  calcularCarrito,
};