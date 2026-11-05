// Vincula las fotos de public/Images/imagenesPerfumes con cada perfume.
//
//   node vincularImagenes.js            -> solo muestra qué haría (no cambia nada)
//   node vincularImagenes.js --aplicar  -> guarda los cambios en la base de datos
//
// Convención de nombres:
//   NombrePerfume1.ext -> foto SOLO del frasco     (se muestra en los listados)
//   NombrePerfume.ext  -> foto del frasco con caja (segunda foto del detalle)

const fs = require("fs");
const path = require("path");
const pool = require("./src/config/database");

const CARPETA = path.join(
  __dirname,
  "..",
  "frontend",
  "public",
  "Images",
  "imagenesPerfumes"
);
const RUTA_PUBLICA = "/Images/imagenesPerfumes";
const EXTENSIONES = [".webp", ".jpg", ".jpeg", ".png"]; // preferencia si hay duplicados
const IGNORAR = ["imagendecants"];

// Para perfumes cuyo nombre en la base de datos no se parece al del archivo.
//   "Nombre del perfume en la BD": "NombreBaseDelArchivo" (sin el 1 ni la extensión)
const ALIAS = {
  "Caramelo Yara": "YaraCandy",
};

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const aliasNormalizado = Object.fromEntries(
  Object.entries(ALIAS).map(([bd, archivo]) => [
    normalizar(bd),
    normalizar(archivo),
  ])
);

// nombre normalizado del archivo (sin extensión) -> nombre real del archivo
function leerArchivos() {
  const porNombre = new Map();

  for (const archivo of fs.readdirSync(CARPETA)) {
    const extension = path.extname(archivo).toLowerCase();
    if (!EXTENSIONES.includes(extension)) continue;

    const nombre = normalizar(path.basename(archivo, path.extname(archivo)));
    if (IGNORAR.includes(nombre)) continue;

    const actual = porNombre.get(nombre);
    const mejor =
      !actual ||
      EXTENSIONES.indexOf(extension) <
        EXTENSIONES.indexOf(path.extname(actual).toLowerCase());

    if (mejor) porNombre.set(nombre, archivo);
  }

  return porNombre;
}

// "Bases" = fotos de frasco con caja (las que no son "otra foto + 1")
function obtenerBases(porNombre) {
  return [...porNombre.keys()].filter(
    (nombre) => !(nombre.endsWith("1") && porNombre.has(nombre.slice(0, -1)))
  );
}

function buscarBase(nombreProducto, porNombre, bases) {
  const n = normalizar(nombreProducto);

  const alias = aliasNormalizado[n];
  if (alias && (porNombre.has(alias) || porNombre.has(alias + "1"))) {
    return { base: alias, tipo: "alias" };
  }

  if (porNombre.has(n) || porNombre.has(n + "1")) {
    return { base: n, tipo: "exacta" };
  }

  // Aproximada: el nombre del archivo está dentro del perfume (o al revés)
  const candidatas = bases
    .filter((b) => b.length >= 5 && n.length >= 4 && (n.includes(b) || b.includes(n)))
    .sort((a, b) => b.length - a.length);

  if (candidatas.length > 0) {
    return { base: candidatas[0], tipo: "aproximada", otras: candidatas.slice(1) };
  }

  return null;
}

async function main() {
  const aplicar = process.argv.includes("--aplicar");

  if (!fs.existsSync(CARPETA)) {
    console.error(`No existe la carpeta: ${CARPETA}`);
    process.exit(1);
  }

  const porNombre = leerArchivos();
  const bases = obtenerBases(porNombre);

  console.log(`Carpeta: ${CARPETA}`);
  console.log(`Imágenes encontradas: ${porNombre.size}`);
  console.log(aplicar ? "Modo: APLICAR cambios\n" : "Modo: solo vista previa (no se guarda nada)\n");

  const [productos] = await pool.query(
    "SELECT id, nombre FROM productos ORDER BY nombre"
  );

  const usados = new Set();
  const sinImagen = [];
  const sinFrasco = [];
  let asignados = 0;

  for (const producto of productos) {
    const encontrado = buscarBase(producto.nombre, porNombre, bases);

    if (!encontrado) {
      sinImagen.push(producto);
      continue;
    }

    const caja = porNombre.get(encontrado.base) || null;
    const frasco = porNombre.get(encontrado.base + "1") || null;

    usados.add(encontrado.base);
    usados.add(encontrado.base + "1");

    // Si no hay foto de solo frasco, el listado usa la del frasco con caja
    const principal = frasco || caja;
    const secundaria = frasco && caja ? caja : null;

    if (!frasco) sinFrasco.push(producto.nombre);

    const icono = encontrado.tipo === "aproximada" ? "≈ " : "✅";
    const extra =
      encontrado.tipo === "alias"
        ? "  (alias)"
        : encontrado.tipo === "aproximada"
        ? `  (aproximada${encontrado.otras.length ? ", otras posibles: " + encontrado.otras.join(", ") : ""})`
        : "";

    console.log(
      `${icono} [${producto.id}] ${producto.nombre} -> frasco: ${frasco || "(no hay)"} | con caja: ${caja || "(no hay)"}${extra}`
    );

    if (aplicar) {
      await pool.query(
        "UPDATE productos SET imagen_url = ?, imagen_caja_url = ? WHERE id = ?",
        [
          `${RUTA_PUBLICA}/${principal}`,
          secundaria ? `${RUTA_PUBLICA}/${secundaria}` : null,
          producto.id,
        ]
      );
    }

    asignados++;
  }

  console.log("\n--- PERFUMES SIN IMAGEN (no se tocan) ---");
  sinImagen.forEach((p) => console.log(`⬜ [${p.id}] ${p.nombre}`));

  console.log("\n--- PERFUMES SIN FOTO DE SOLO FRASCO (usan la del frasco con caja) ---");
  sinFrasco.forEach((nombre) => console.log(`⚠️  ${nombre}`));

  console.log("\n--- ARCHIVOS QUE NINGÚN PERFUME USÓ ---");
  [...porNombre.entries()]
    .filter(([nombre]) => !usados.has(nombre))
    .forEach(([, archivo]) => console.log(`📁 ${archivo}`));

  console.log(
    `\nResumen: ${asignados} perfumes con imagen, ${sinImagen.length} sin imagen.`
  );
  if (!aplicar) {
    console.log("Si todo se ve bien, corre:  node vincularImagenes.js --aplicar");
  }

  await pool.end();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});