const test = require("node:test");
const assert = require("node:assert");
const {
  procesarMensaje,
  detectarOcasion,
  detectarPresupuesto,
} = require("./chatbotService");

const filas = [
  { id: 1, nombre: "Sceptre", marca: "Sceptre", categoria: "Cítrico", descripcion: "Fragancia fresca de carácter cítrico.", tamano_ml: 100, precio: 200000, stock_actual: 8, imagen_url: null },
  { id: 2, nombre: "Emeer", marca: "Lattafa", categoria: "Oriental / Ámbar", descripcion: "Fragancia oriental cálida.", tamano_ml: 100, precio: 300000, stock_actual: 20, imagen_url: null },
  { id: 3, nombre: "Eros", marca: "Versace", categoria: "Acuático", descripcion: "Fragancia fresca de carácter acuático.", tamano_ml: 100, precio: 430000, stock_actual: 0, imagen_url: null },
];

test("detecta el presupuesto en distintos formatos", () => {
  assert.strictEqual(detectarPresupuesto("menos de 250.000"), 250000);
  assert.strictEqual(detectarPresupuesto("hasta 250 mil"), 250000);
  assert.strictEqual(detectarPresupuesto("quiero 100 ml"), null);
});

test("detecta la ocasión sin confundir palabras parecidas", () => {
  assert.strictEqual(detectarOcasion("algo para una cita"), "cita");
  assert.strictEqual(detectarOcasion("me excita"), null);
});

test("para una cita recomienda solo perfumes disponibles y adecuados", () => {
  const r = procesarMensaje("Para una cita", null, filas);
  assert.strictEqual(r.productos.length, 1);
  assert.strictEqual(r.productos[0].nombre, "Emeer");
  assert.strictEqual(r.contexto.ocasion, "cita");
});

test("informa cuando un perfume está agotado", () => {
  const r = procesarMensaje("cuánto cuesta el Eros", null, filas);
  assert.ok(r.reply.includes("agotado"));
  assert.strictEqual(r.productos[0].id, 3);
});

test("ante una pregunta fuera de tema ofrece opciones", () => {
  const r = procesarMensaje("quién ganó el partido", null, filas);
  assert.strictEqual(r.productos.length, 0);
  assert.ok(r.opciones.length > 0);
});