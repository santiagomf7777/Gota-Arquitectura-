// Rutas del panel de administración: proveedores, clientes, inventario,
// dashboard, productos, pedidos, reportes, configuración y promociones.
// Todas exigen un usuario con rol ADMIN (verificarAdmin).
const pool = require("../config/database");
const express = require("express");
const { verificarAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verificarAdmin);

// ---------- Utilidades ----------

function texto(valor, max) {
  const limpio = String(valor ?? "").trim();
  return limpio === "" ? null : limpio.slice(0, max);
}

function validarProveedor(body) {
  const nombre_empresa = texto(body.nombre_empresa, 100);
  const ciudad = texto(body.ciudad, 100);
  const contacto = texto(body.contacto, 100);
  const telefono = texto(body.telefono, 20);
  const email = texto(body.email, 120);

  if (!nombre_empresa) {
    return { error: "El nombre de la empresa es obligatorio." };
  }

  if (telefono && !/^[0-9+()\-\s]{6,20}$/.test(telefono)) {
    return { error: "El teléfono solo puede tener números, espacios, + - ( )." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El correo no tiene un formato válido." };
  }

  return { datos: { nombre_empresa, ciudad, contacto, telefono, email } };
}

function errorServidor(res, err) {
  console.error(err);
  return res.status(500).json({ mensaje: "Error en el servidor." });
}

// ---------- Proveedores ----------

router.get("/proveedores", async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT pr.id, pr.nombre_empresa, pr.ciudad, pr.contacto, pr.telefono,
              pr.email, COUNT(p.id) AS productos
       FROM proveedores pr
       LEFT JOIN productos p ON p.proveedor_id = pr.id
       GROUP BY pr.id, pr.nombre_empresa, pr.ciudad, pr.contacto, pr.telefono, pr.email
       ORDER BY pr.nombre_empresa`
    );
    res.json(filas);
  } catch (err) {
    errorServidor(res, err);
  }
});

router.post("/proveedores", async (req, res) => {
  const { error, datos } = validarProveedor(req.body || {});
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const [r] = await pool.query(
      `INSERT INTO proveedores (nombre_empresa, ciudad, contacto, telefono, email)
       VALUES (?, ?, ?, ?, ?)`,
      [datos.nombre_empresa, datos.ciudad, datos.contacto, datos.telefono, datos.email]
    );
    res.status(201).json({ id: r.insertId, ...datos, productos: 0 });
  } catch (err) {
    errorServidor(res, err);
  }
});

router.put("/proveedores/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  const { error, datos } = validarProveedor(req.body || {});
  if (error) return res.status(400).json({ mensaje: error });

  try {
    const [existe] = await pool.query("SELECT id FROM proveedores WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado." });
    }

    await pool.query(
      `UPDATE proveedores
       SET nombre_empresa = ?, ciudad = ?, contacto = ?, telefono = ?, email = ?
       WHERE id = ?`,
      [datos.nombre_empresa, datos.ciudad, datos.contacto, datos.telefono, datos.email, id]
    );
    res.json({ id, ...datos });
  } catch (err) {
    errorServidor(res, err);
  }
});

router.delete("/proveedores/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  try {
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM productos WHERE proveedor_id = ?",
      [id]
    );

    if (total > 0) {
      return res.status(409).json({
        mensaje: `No se puede eliminar: tiene ${total} producto(s) asignado(s).`,
      });
    }

    const [r] = await pool.query("DELETE FROM proveedores WHERE id = ?", [id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado." });
    }
    res.json({ ok: true });
  } catch (err) {
    errorServidor(res, err);
  }
});

// ---------- Clientes ----------
// Nunca se selecciona password_hash.

router.get("/clientes", async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.fecha_creacion,
              COUNT(p.id) AS pedidos,
              COALESCE(SUM(CASE WHEN p.estado <> 'CANCELADO' THEN p.total END), 0) AS total_comprado,
              MAX(p.fecha_pedido) AS ultimo_pedido
       FROM usuarios u
       LEFT JOIN pedidos p ON p.usuario_id = u.id
       WHERE u.rol = 'CLIENTE'
       GROUP BY u.id, u.nombre, u.email, u.telefono, u.fecha_creacion
       ORDER BY total_comprado DESC, u.nombre`
    );
    res.json(filas);
  } catch (err) {
    errorServidor(res, err);
  }
});

// ---------- Inventario ----------

router.get("/inventario", async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT v.id, v.producto_id, p.nombre, m.nombre AS marca, p.imagen_url,
              v.tipo, v.tamano_ml, v.sku, v.precio, v.stock_actual, v.stock_minimo
       FROM inventario_variantes v
       JOIN productos p ON p.id = v.producto_id
       LEFT JOIN marcas m ON m.id = p.marca_id
       WHERE p.estado = 'ACTIVO'
       ORDER BY p.nombre, v.tipo, v.tamano_ml`
    );
    res.json(filas);
  } catch (err) {
    errorServidor(res, err);
  }
});

// ---------- Dashboard ----------

router.get("/dashboard", async (req, res) => {
  try {
    const [[hoy]] = await pool.query(
      `SELECT COUNT(*) AS pedidos, COALESCE(SUM(total), 0) AS ventas
       FROM pedidos
       WHERE DATE(fecha_pedido) = CURDATE() AND estado <> 'CANCELADO'`
    );

    const [[mes]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS ventas
       FROM pedidos
       WHERE YEAR(fecha_pedido) = YEAR(CURDATE())
         AND MONTH(fecha_pedido) = MONTH(CURDATE())
         AND estado <> 'CANCELADO'`
    );

    const [[pendientes]] = await pool.query(
      "SELECT COUNT(*) AS total FROM pedidos WHERE estado = 'PENDIENTE'"
    );

    const [[clientesNuevos]] = await pool.query(
      `SELECT COUNT(*) AS total FROM usuarios
       WHERE rol = 'CLIENTE' AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    const [alertas] = await pool.query(
      `SELECT v.id, p.nombre, v.tipo, v.tamano_ml, v.stock_actual, v.stock_minimo
       FROM inventario_variantes v
       JOIN productos p ON p.id = v.producto_id
       WHERE p.estado = 'ACTIVO'
         AND v.stock_actual < IF(v.stock_minimo > 0, v.stock_minimo, 10)
       ORDER BY v.stock_actual ASC
       LIMIT 8`
    );

    const [recientes] = await pool.query(
      `SELECT p.id, p.total, p.estado, p.fecha_pedido, u.nombre AS cliente
       FROM pedidos p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       ORDER BY p.fecha_pedido DESC
       LIMIT 6`
    );

    res.json({
      pedidos_hoy: hoy.pedidos,
      ventas_hoy: Number(hoy.ventas),
      ventas_mes: Number(mes.ventas),
      pedidos_pendientes: pendientes.total,
      clientes_nuevos: clientesNuevos.total,
      alertas,
      recientes,
    });
  } catch (err) {
    errorServidor(res, err);
  }
});

// ---------- Productos ----------

router.get("/productos", async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT p.id, p.nombre, p.imagen_url, p.estado,
              m.nombre AS marca,
              pr.nombre_empresa AS proveedor,
              (SELECT MIN(v.precio) FROM inventario_variantes v
                WHERE v.producto_id = p.id AND v.tipo = 'FRASCO') AS precio_frasco,
              (SELECT MIN(v.precio) FROM inventario_variantes v
                WHERE v.producto_id = p.id AND v.tipo = 'DECANT') AS precio_decant,
              (SELECT COALESCE(SUM(v.stock_actual), 0) FROM inventario_variantes v
                WHERE v.producto_id = p.id) AS stock_total
       FROM productos p
       LEFT JOIN marcas m ON m.id = p.marca_id
       LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
       ORDER BY p.estado, p.nombre`
    );
    res.json(filas);
  } catch (err) {
    errorServidor(res, err);
  }
});

// Cambia entre ACTIVO e INACTIVO. Un producto inactivo no aparece en la tienda.
router.patch("/productos/:id/estado", async (req, res) => {
  const id = Number(req.params.id);
  const estado = String(req.body?.estado ?? "").toUpperCase();

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }
  if (!["ACTIVO", "INACTIVO"].includes(estado)) {
    return res.status(400).json({ mensaje: "Estado inválido." });
  }

  try {
    const [r] = await pool.query("UPDATE productos SET estado = ? WHERE id = ?", [estado, id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }
    res.json({ id, estado });
  } catch (err) {
    errorServidor(res, err);
  }
});

// Eliminación definitiva. Falla si el producto tiene pedidos o inventario ligado.
router.delete("/productos/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  try {
    const [r] = await pool.query("DELETE FROM productos WHERE id = ?", [id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(409).json({
        mensaje:
          "No se puede eliminar porque tiene pedidos o inventario asociado. Quítalo del catálogo en su lugar.",
      });
    }
    errorServidor(res, err);
  }
});

// ---------- Pedidos ----------

const ESTADOS_PEDIDO = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

router.get("/pedidos", async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT p.id, p.total, p.estado, p.fecha_pedido,
              u.nombre AS cliente, u.email,
              (SELECT COUNT(*) FROM detalle_pedidos d WHERE d.pedido_id = p.id) AS items
       FROM pedidos p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       ORDER BY p.fecha_pedido DESC`
    );
    res.json(filas);
  } catch (err) {
    errorServidor(res, err);
  }
});

router.get("/pedidos/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  try {
    const [[pedido]] = await pool.query(
      `SELECT p.id, p.total, p.estado, p.fecha_pedido,
              u.nombre AS cliente, u.email, u.telefono
       FROM pedidos p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id = ?`,
      [id]
    );
    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado." });
    }

    const [items] = await pool.query(
      `SELECT d.cantidad, d.precio_unitario, pr.nombre, v.tipo, v.tamano_ml
       FROM detalle_pedidos d
       LEFT JOIN productos pr ON pr.id = d.producto_id
       LEFT JOIN inventario_variantes v ON v.id = d.variante_id
       WHERE d.pedido_id = ?`,
      [id]
    );

    res.json({ ...pedido, items });
  } catch (err) {
    errorServidor(res, err);
  }
});

// ---------- Reportes ----------

const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

router.get("/reportes", async (req, res) => {
  const hoy = new Date();
  const hace30 = new Date(Date.now() - 30 * 86400000);
  const aTexto = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const desde = FECHA_VALIDA.test(req.query.desde || "") ? req.query.desde : aTexto(hace30);
  const hasta = FECHA_VALIDA.test(req.query.hasta || "") ? req.query.hasta : aTexto(hoy);

  if (desde > hasta) {
    return res.status(400).json({ mensaje: "La fecha inicial no puede ser posterior a la final." });
  }

  try {
    const [[resumen]] = await pool.query(
      `SELECT COUNT(*) AS pedidos,
              COALESCE(SUM(total), 0) AS ventas,
              COALESCE(AVG(total), 0) AS ticket_promedio
       FROM pedidos
       WHERE estado <> 'CANCELADO' AND DATE(fecha_pedido) BETWEEN ? AND ?`,
      [desde, hasta]
    );

    const [porDia] = await pool.query(
      `SELECT DATE_FORMAT(fecha_pedido, '%Y-%m-%d') AS dia,
              COUNT(*) AS pedidos,
              COALESCE(SUM(total), 0) AS ventas
       FROM pedidos
       WHERE estado <> 'CANCELADO' AND DATE(fecha_pedido) BETWEEN ? AND ?
       GROUP BY dia
       ORDER BY dia`,
      [desde, hasta]
    );

    const [topProductos] = await pool.query(
      `SELECT pr.id, pr.nombre, v.tipo, v.tamano_ml,
              SUM(d.cantidad) AS unidades,
              SUM(d.subtotal) AS ingresos
       FROM detalle_pedidos d
       JOIN pedidos p ON p.id = d.pedido_id
       JOIN inventario_variantes v ON v.id = d.variante_id
       JOIN productos pr ON pr.id = v.producto_id
       WHERE p.estado <> 'CANCELADO' AND DATE(p.fecha_pedido) BETWEEN ? AND ?
       GROUP BY pr.id, pr.nombre, v.tipo, v.tamano_ml
       ORDER BY ingresos DESC
       LIMIT 10`,
      [desde, hasta]
    );

    const [sinMovimiento] = await pool.query(
      `SELECT v.id, pr.nombre, v.tipo, v.tamano_ml, v.stock_actual
       FROM inventario_variantes v
       JOIN productos pr ON pr.id = v.producto_id
       WHERE pr.estado = 'ACTIVO'
         AND v.stock_actual > 0
         AND v.id NOT IN (
           SELECT d.variante_id
           FROM detalle_pedidos d
           JOIN pedidos p ON p.id = d.pedido_id
           WHERE p.estado <> 'CANCELADO' AND DATE(p.fecha_pedido) BETWEEN ? AND ?
         )
       ORDER BY v.stock_actual DESC
       LIMIT 10`,
      [desde, hasta]
    );

    res.json({
      desde,
      hasta,
      resumen: {
        pedidos: resumen.pedidos,
        ventas: Number(resumen.ventas),
        ticket_promedio: Number(resumen.ticket_promedio),
      },
      por_dia: porDia.map((d) => ({ ...d, ventas: Number(d.ventas) })),
      top_productos: topProductos.map((t) => ({
        ...t,
        ingresos: Number(t.ingresos),
      })),
      sin_movimiento: sinMovimiento,
    });
  } catch (err) {
    errorServidor(res, err);
  }
});

// ---------- Configuración ----------

const CONFIG_DEFAULT = {
  tienda_nombre: "GOTA Perfumería",
  tienda_email: "",
  tienda_telefono: "",
  envio_costo: "0",
  envio_gratis_desde: "0",
  stock_minimo_default: "10",
};

const CONFIG_NUMERICA = ["envio_costo", "envio_gratis_desde", "stock_minimo_default"];

function validarConfiguracion(body) {
  const datos = {};

  for (const clave of Object.keys(CONFIG_DEFAULT)) {
    const valor = String(body[clave] ?? "").trim().slice(0, 255);

    if (CONFIG_NUMERICA.includes(clave)) {
      const n = Number(valor);
      if (valor === "" || !Number.isFinite(n) || n < 0) {
        return { error: `El valor de "${clave}" debe ser un número igual o mayor a 0.` };
      }
      if (clave === "stock_minimo_default" && !Number.isInteger(n)) {
        return { error: "El stock mínimo debe ser un número entero." };
      }
    }

    if (clave === "tienda_email" && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      return { error: "El correo de la tienda no tiene un formato válido." };
    }

    datos[clave] = valor;
  }

  return { datos };
}

router.get("/configuracion", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT clave, valor FROM configuracion");
    const salida = { ...CONFIG_DEFAULT };
    for (const f of filas) {
      if (f.clave in CONFIG_DEFAULT) salida[f.clave] = f.valor;
    }
    res.json(salida);
  } catch (err) {
    errorServidor(res, err);
  }
});

router.put("/configuracion", async (req, res) => {
  const { error, datos } = validarConfiguracion(req.body || {});
  if (error) return res.status(400).json({ mensaje: error });

  try {
    for (const [clave, valor] of Object.entries(datos)) {
      await pool.query(
        `INSERT INTO configuracion (clave, valor) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE valor = ?`,
        [clave, valor, valor]
      );
    }
    res.json(datos);
  } catch (err) {
    errorServidor(res, err);
  }
});

// ---------- Promociones ----------

const TIPOS_PROMO = ["DESCUENTO_PORCENTAJE", "DESCUENTO_MONTO", "COMBO"];

// Convierte "2026-11-13T18:00" (datetime-local) al formato de MySQL
function fechaSQL(valor) {
  if (!valor) return null;
  const t = String(valor).trim().replace("T", " ");
  return t.length === 16 ? `${t}:00` : t;
}

function numeroOpcional(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function esVerdadero(v) {
  return v === true || v === 1 || v === "1" || v === "true";
}

function validarPromocion(body) {
  const nombre = texto(body.nombre, 120);
  const descripcion = texto(body.descripcion, 255);
  const tipo = String(body.tipo ?? "").toUpperCase();
  const valor = numeroOpcional(body.valor);
  const precioCombo = numeroOpcional(body.precio_combo);
  const fecha_inicio = fechaSQL(body.fecha_inicio);
  const fecha_fin = fechaSQL(body.fecha_fin);
  const activa = body.activa === false ? 0 : 1;

  if (!nombre) return { error: "El nombre de la promoción es obligatorio." };
  if (!TIPOS_PROMO.includes(tipo)) return { error: "Tipo de promoción inválido." };

  if (tipo === "DESCUENTO_PORCENTAJE" && !(valor > 0 && valor <= 100)) {
    return { error: "El porcentaje debe estar entre 1 y 100." };
  }
  if (tipo === "DESCUENTO_MONTO" && !(valor > 0)) {
    return { error: "El descuento en pesos debe ser mayor a 0." };
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { error: "Agrega al menos un perfume o presentación." };
  }

  const vistos = new Set();
  const items = [];

  for (const it of body.items) {
    const variante_id = Number(it.variante_id);
    const cantidad = Number(it.cantidad ?? 1);
    const es_regalo = tipo === "COMBO" && esVerdadero(it.es_regalo);

    if (!Number.isInteger(variante_id) || variante_id <= 0) {
      return { error: "Presentación inválida." };
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return { error: "La cantidad debe ser un entero mayor a 0." };
    }
    if (vistos.has(variante_id)) {
      return { error: "Una presentación aparece repetida en la promoción." };
    }
    vistos.add(variante_id);

    items.push({
      variante_id,
      cantidad: tipo === "COMBO" ? cantidad : 1,
      es_regalo,
    });
  }

  if (tipo === "COMBO") {
    const compra = items.filter((i) => !i.es_regalo);
    const regalos = items.filter((i) => i.es_regalo);

    if (compra.length === 0) {
      return { error: "El combo necesita al menos un perfume que el cliente compre." };
    }
    if (regalos.length === 0) {
      return { error: "Marca al menos una presentación como regalo." };
    }
  }

  if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
    return { error: "La fecha de inicio no puede ser posterior a la de fin." };
  }

  return {
    datos: {
      nombre,
      descripcion,
      tipo,
      valor: tipo === "COMBO" ? null : valor,
      precio_combo: tipo === "COMBO" && precioCombo > 0 ? precioCombo : null,
      fecha_inicio,
      fecha_fin,
      activa,
      items,
    },
  };
}

async function guardarItems(conn, promocionId, items) {
  await conn.query("DELETE FROM promocion_items WHERE promocion_id = ?", [promocionId]);

  for (const it of items) {
    await conn.query(
      "INSERT INTO promocion_items (promocion_id, variante_id, cantidad, es_regalo) VALUES (?, ?, ?, ?)",
      [promocionId, it.variante_id, it.cantidad, it.es_regalo ? 1 : 0]
    );
  }
}

function errorPromocion(res, err) {
  if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
    return res.status(400).json({
      mensaje: "Una de las presentaciones ya no existe. Actualiza la lista e intenta de nuevo.",
    });
  }
  if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
    return res.status(409).json({
      mensaje: "La promoción tiene pedidos asociados. Desactívala en lugar de eliminarla.",
    });
  }
  return errorServidor(res, err);
}

router.get("/promociones", async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion, p.tipo, p.valor, p.precio_combo,
              DATE_FORMAT(p.fecha_inicio, '%Y-%m-%dT%H:%i') AS fecha_inicio,
              DATE_FORMAT(p.fecha_fin, '%Y-%m-%dT%H:%i') AS fecha_fin,
              p.activa,
              COUNT(i.id) AS presentaciones,
              CASE
                WHEN p.activa = 0 THEN 'PAUSADA'
                WHEN p.fecha_inicio IS NOT NULL AND p.fecha_inicio > NOW() THEN 'PROGRAMADA'
                WHEN p.fecha_fin IS NOT NULL AND p.fecha_fin < NOW() THEN 'VENCIDA'
                ELSE 'VIGENTE'
              END AS estado
       FROM promociones p
       LEFT JOIN promocion_items i ON i.promocion_id = p.id
       GROUP BY p.id
       ORDER BY p.fecha_creacion DESC`
    );
    res.json(filas);
  } catch (err) {
    errorServidor(res, err);
  }
});

router.get("/promociones/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  try {
    const [[promo]] = await pool.query(
      `SELECT id, nombre, descripcion, tipo, valor, precio_combo,
              DATE_FORMAT(fecha_inicio, '%Y-%m-%dT%H:%i') AS fecha_inicio,
              DATE_FORMAT(fecha_fin, '%Y-%m-%dT%H:%i') AS fecha_fin,
              activa
       FROM promociones WHERE id = ?`,
      [id]
    );
    if (!promo) {
      return res.status(404).json({ mensaje: "Promoción no encontrada." });
    }

    const [items] = await pool.query(
      `SELECT i.variante_id, i.cantidad, i.es_regalo, v.tipo, v.tamano_ml, v.precio,
              v.stock_actual, pr.nombre
       FROM promocion_items i
       JOIN inventario_variantes v ON v.id = i.variante_id
       JOIN productos pr ON pr.id = v.producto_id
       WHERE i.promocion_id = ?`,
      [id]
    );

    res.json({
      ...promo,
      activa: Boolean(promo.activa),
      items: items.map((i) => ({ ...i, es_regalo: Number(i.es_regalo) === 1 })),
    });
  } catch (err) {
    errorServidor(res, err);
  }
});

router.post("/promociones", async (req, res) => {
  const { error, datos } = validarPromocion(req.body || {});
  if (error) return res.status(400).json({ mensaje: error });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO promociones
         (nombre, descripcion, tipo, valor, precio_combo, fecha_inicio, fecha_fin, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [datos.nombre, datos.descripcion, datos.tipo, datos.valor, datos.precio_combo,
       datos.fecha_inicio, datos.fecha_fin, datos.activa]
    );

    await guardarItems(conn, r.insertId, datos.items);
    await conn.commit();
    res.status(201).json({ id: r.insertId });
  } catch (err) {
    await conn.rollback();
    errorPromocion(res, err);
  } finally {
    conn.release();
  }
});

router.put("/promociones/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  const { error, datos } = validarPromocion(req.body || {});
  if (error) return res.status(400).json({ mensaje: error });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existe] = await conn.query("SELECT id FROM promociones WHERE id = ?", [id]);
    if (existe.length === 0) {
      await conn.rollback();
      return res.status(404).json({ mensaje: "Promoción no encontrada." });
    }

    await conn.query(
      `UPDATE promociones
       SET nombre = ?, descripcion = ?, tipo = ?, valor = ?, precio_combo = ?,
           fecha_inicio = ?, fecha_fin = ?, activa = ?
       WHERE id = ?`,
      [datos.nombre, datos.descripcion, datos.tipo, datos.valor, datos.precio_combo,
       datos.fecha_inicio, datos.fecha_fin, datos.activa, id]
    );

    await guardarItems(conn, id, datos.items);
    await conn.commit();
    res.json({ id });
  } catch (err) {
    await conn.rollback();
    errorPromocion(res, err);
  } finally {
    conn.release();
  }
});

router.patch("/promociones/:id/activa", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  const activa = req.body?.activa ? 1 : 0;

  try {
    const [r] = await pool.query("UPDATE promociones SET activa = ? WHERE id = ?", [activa, id]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Promoción no encontrada." });
    }
    res.json({ id, activa: Boolean(activa) });
  } catch (err) {
    errorServidor(res, err);
  }
});

router.delete("/promociones/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador inválido." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM promocion_items WHERE promocion_id = ?", [id]);
    const [r] = await conn.query("DELETE FROM promociones WHERE id = ?", [id]);

    if (r.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ mensaje: "Promoción no encontrada." });
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    errorPromocion(res, err);
  } finally {
    conn.release();
  }
});

module.exports = router;