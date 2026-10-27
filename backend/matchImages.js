const pool = require("./config/database");

// Mapa manual: nombre normalizado del archivo -> nombre de archivo real
// (normalizado = minúsculas, sin espacios, sin tildes)
const imagenesDisponibles = {
  "sceptre": "Sceptre.jpg",
  "emeer": "Emeer.jpg",
  "eros": "Eros.jpg",
  "khamrahwaha": "khamrahWaha.jpg",
  "khamrahdukhan": "khamrahDukhan.jpg",
  "khamrahoriginal": "KhamrahOriginal.jpg",
  "asadbourbon": "AsadBourbon.jpg",
  "asadzanzibar": "asadZanzibar.jpg",
  "asadelixir": "AsadElixir.jpg",
  "asadyara": "AsadYara.jpg",
  "yaratous": "yaraTous.jpg",
};

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/\s+/g, ""); // quita espacios
}

async function matchImages() {
  const [productos] = await pool.query("SELECT id, nombre FROM productos");

  const encontrados = [];
  const noEncontrados = [];

  for (const producto of productos) {
    const nombreNormalizado = normalizar(producto.nombre);
    const archivo = imagenesDisponibles[nombreNormalizado];

    if (archivo) {
      const rutaImagen = `/Images/imagenesPerfumes/${archivo}`;

      await pool.query(
        "UPDATE productos SET imagen_url = ? WHERE id = ?",
        [rutaImagen, producto.id]
      );

      encontrados.push(`✅ [${producto.id}] ${producto.nombre} -> ${rutaImagen}`);
    } else {
      noEncontrados.push(`⬜ [${producto.id}] ${producto.nombre}`);
    }
  }

  console.log("\n--- IMÁGENES ASIGNADAS ---");
  encontrados.forEach((linea) => console.log(linea));

  console.log("\n--- SIN IMAGEN (quedan con placeholder) ---");
  noEncontrados.forEach((linea) => console.log(linea));

  console.log(`\nTotal: ${encontrados.length} asignadas, ${noEncontrados.length} pendientes.`);

  process.exit(0);
}

matchImages().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});