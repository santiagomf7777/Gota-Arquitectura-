const pool = require("../config/database");

const getProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.imagen_url,
        p.estado,
        m.nombre AS marca,
        c.nombre AS categoria,
        iv.id AS variante_id,
        iv.tamano_ml,
        iv.sku,
        iv.precio,
        iv.stock_actual
      FROM productos p
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN inventario_variantes iv
        ON p.id = iv.producto_id AND iv.tipo = 'FRASCO'
      WHERE p.estado = 'ACTIVO'
      ORDER BY p.id;
    `);

    res.json(products);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error obteniendo los productos",
      error: error.message
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.imagen_url,
        p.estado,
        m.nombre AS marca,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
        AND p.estado = 'ACTIVO'
      LIMIT 1;
    `, [id]);

    if (productos.length === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    const [variantes] = await pool.query(`
      SELECT
        id AS variante_id,
        tipo,
        tamano_ml,
        sku,
        precio,
        stock_actual,
        stock_minimo
      FROM inventario_variantes
      WHERE producto_id = ?
      ORDER BY (tipo = 'FRASCO') DESC, tamano_ml ASC;
    `, [id]);

    const principal =
      variantes.find((v) => v.tipo === "FRASCO") || variantes[0] || {};

    res.json({ ...productos[0], ...principal, variantes });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error obteniendo el producto",
      error: error.message
    });
  }
};


module.exports = {
  getProducts,
  getProductById
};