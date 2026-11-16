const { calcularCarrito } = require("../utils/promociones");

const calcular = async (req, res) => {
  try {
    const resultado = await calcularCarrito(req.body.items || []);
    res.json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

module.exports = { calcular };