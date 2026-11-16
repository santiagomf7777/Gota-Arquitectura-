require("dotenv").config();

// Importa el "Catálogo Maestro para Chatbot" (texto) a la base de datos.
//
//   node importarPerfiles.js            -> vista previa (no cambia nada)
//   node importarPerfiles.js --aplicar  -> crea la tabla perfiles_perfume y guarda los datos
//
// El archivo debe estar en backend/data/catalogo-chatbot.txt, guardado en UTF-8.
// Se puede correr las veces que quieras: actualiza lo que ya existe.

const fs = require("fs");
const path = require("path");
const pool = require("./src/config/database");

const ARCHIVO = path.join(__dirname, "data", "catalogo-chatbot.txt");

// Entradas del documento cuyo nombre no coincide con el de la base de datos.
//   "Nombre en el documento": "Nombre en la base de datos"
const ALIAS = {};

const CREAR_TABLA = `
  CREATE TABLE IF NOT EXISTS perfiles_perfume (
    producto_id INT NOT NULL PRIMARY KEY,
    familia_olfativa VARCHAR(200) NULL,
    concentracion VARCHAR(200) NULL,
    piramide TEXT NULL,
    notas_salida TEXT NULL,
    notas_corazon TEXT NULL,
    notas_fondo TEXT NULL,
    rendimiento TEXT NULL,
    estacion_uso TEXT NULL,
    publico TEXT NULL,
    frase_chatbot TEXT NULL,
    genero ENUM('MASCULINO','FEMENINO','UNISEX') NULL,
    estaciones VARCHAR(80) NULL,
    ocasiones VARCHAR(80) NULL,
    longevidad_min TINYINT NULL,
    longevidad_max TINYINT NULL,
    CONSTRAINT fk_perfil_producto FOREIGN KEY (producto_id)
      REFERENCES productos(id) ON DELETE CASCADE
  ) CHARACTER SET utf8mb4
`;

const GUARDAR = `
  REPLACE INTO perfiles_perfume
    (producto_id, familia_olfativa, concentracion, piramide, notas_salida,
     notas_corazon, notas_fondo, rendimiento, estacion_uso, publico,
     frase_chatbot, genero, estaciones, ocasiones, longevidad_min, longevidad_max)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// Etiqueta del documento (sin tildes ni espacios) -> columna
const ETIQUETAS = {
  familiaolfativa: "familia_olfativa",
  familiaoriental: "familia_olfativa", // por si alguna línea quedó con ese nombre
  concentracionyformato: "concentracion",
  piramideolfativa: "piramide",
  rendimiento: "rendimiento",
  estacionyusoideal: "estacion_uso",
  publicoobjetivoestilo: "publico",
};

const PATRONES_OCASION = {
  diario: /\b(diario|casual|casuales|universidad|cotidian\w*|informal\w*|paseos?|playa|piscina|deport\w*|entrena\w*|aire libre|todos los dias|dia a dia)\b/,
  trabajo: /\b(oficina|trabajo|ejecutiv\w*|negocios?|corporativ\w*|entrevistas?)\b/,
  cita: /\b(citas?|romantic\w*|pareja|enamor\w*|aniversario|seduc\w*)\b/,
  noche: /\b(noches?|fiestas?|discotecas?|antros?|rumba|gala|eventos?|bodas?|cenas?|bares?)\b/,
};

// Sin tildes ni símbolos, todo pegado: sirve para comparar nombres
function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Sin tildes ni símbolos, conserva los espacios: sirve para buscar palabras
function limpiar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function leerEntradas(texto) {
  const entradas = [];
  let actual = null;
  let enFrase = false;

  for (const linea of texto.split(/\r?\n/)) {
    const limpia = linea.trim();
    if (!limpia) continue;

    // "12. Lattafa – Yara Moi (detalle)"
    const encabezado = limpia.match(/^(\d+)\.\s*(.+?)\s+[–-]\s+(.+)$/);

    if (encabezado) {
      actual = {
        numero: Number(encabezado[1]),
        marca: encabezado[2].trim(),
        nombre: encabezado[3].replace(/\s*\([^)]*\)\s*$/, "").trim(),
        campos: {},
        frase: "",
        ignoradas: [],
      };
      entradas.push(actual);
      enFrase = false;
      continue;
    }

    if (!actual) continue;

    if (/^perfil conversacional/i.test(limpia)) {
      enFrase = true;
      continue;
    }

    if (/^perfil t[eé]cnico/i.test(limpia)) {
      enFrase = false;
      continue;
    }

    if (enFrase) {
      const sinComillas = limpia.replace(/^["“”«]+|["“”»]+$/g, "");
      actual.frase += (actual.frase ? " " : "") + sinComillas;
      continue;
    }

    const separador = limpia.indexOf(":");
    if (separador === -1) continue;

    const etiqueta = limpia.slice(0, separador);
    const columna = ETIQUETAS[normalizar(etiqueta)];

    if (columna) {
      actual.campos[columna] = limpia.slice(separador + 1).trim();
    } else {
      actual.ignoradas.push(etiqueta);
    }
  }

  return entradas;
}

function separarPiramide(texto) {
  const m = String(texto || "").match(
    /salida\s+de\s+(.+?);\s*coraz[oó]n\s+de\s+(.+?);\s*fondo\s+de\s+(.+?)\.?\s*$/i
  );

  return m
    ? { salida: m[1].trim(), corazon: m[2].trim(), fondo: m[3].trim() }
    : { salida: null, corazon: null, fondo: null };
}

function derivarGenero(publico) {
  const segmento = limpiar(String(publico || "").split(";")[0]);

  if (segmento.includes("unisex")) return "UNISEX";
  if (segmento.includes("femenino")) return "FEMENINO";
  if (segmento.includes("masculino")) return "MASCULINO";
  return null;
}

function derivarEstaciones(texto) {
  const t = limpiar(texto);
  const encontradas = [];

  if (/\bprimavera\b/.test(t)) encontradas.push("primavera");
  if (/\bverano\b/.test(t)) encontradas.push("verano");
  if (/\botono\b/.test(t)) encontradas.push("otoño");
  if (/\binvierno\b/.test(t)) encontradas.push("invierno");

  if (encontradas.length === 0 && /todo el ano/.test(t)) {
    return "primavera,verano,otoño,invierno";
  }

  return encontradas.length ? encontradas.join(",") : null;
}

function derivarOcasiones(texto) {
  const t = limpiar(texto);

  const encontradas = Object.entries(PATRONES_OCASION)
    .filter(([, patron]) => patron.test(t))
    .map(([clave]) => clave);

  return encontradas.length ? encontradas.join(",") : null;
}

function derivarLongevidad(texto) {
  const t = limpiar(texto);

  const rango = t.match(/(\d{1,2})\s+(?:a\s+)?(\d{1,2})\s+horas/);
  if (rango) return { min: Number(rango[1]), max: Number(rango[2]) };

  const unica = t.match(/(\d{1,2})\s+horas/);
  if (unica) return { min: Number(unica[1]), max: Number(unica[1]) };

  return { min: null, max: null };
}

async function main() {
  const aplicar = process.argv.includes("--aplicar");

  if (!fs.existsSync(ARCHIVO)) {
    console.error(`No encuentro el archivo: ${ARCHIVO}`);
    console.error("Guarda el catálogo como backend/data/catalogo-chatbot.txt (UTF-8).");
    process.exit(1);
  }

  const texto = fs.readFileSync(ARCHIVO, "utf8").replace(/^\uFEFF/, "");
  const entradas = leerEntradas(texto);

  console.log("Base de datos:", process.env.DB_HOST, "/", process.env.DB_NAME);
  console.log(`Entradas leídas del documento: ${entradas.length}`);
  console.log(aplicar ? "Modo: APLICAR\n" : "Modo: solo vista previa (no se guarda nada)\n");

  const [productos] = await pool.query("SELECT id, nombre FROM productos ORDER BY id");

  const porNombre = new Map();
  for (const producto of productos) {
    const clave = normalizar(producto.nombre);
    porNombre.set(clave, [...(porNombre.get(clave) || []), producto]);
  }

  if (aplicar) await pool.query(CREAR_TABLA);

  const conPerfil = new Set();
  const sinProducto = [];
  let piramidesSeparadas = 0;

  for (const entrada of entradas) {
    const nombreBD = ALIAS[entrada.nombre] || entrada.nombre;
    const coincidencias = porNombre.get(normalizar(nombreBD));

    if (!coincidencias) {
      sinProducto.push(entrada);
      continue;
    }

    const c = entrada.campos;
    const piramide = separarPiramide(c.piramide);
    const genero = derivarGenero(c.publico);
    const estaciones = derivarEstaciones(c.estacion_uso);
    const ocasiones = derivarOcasiones(c.estacion_uso);
    const longevidad = derivarLongevidad(c.rendimiento);

    if (piramide.salida) piramidesSeparadas++;

    const faltantes = ["familia_olfativa", "piramide", "rendimiento", "estacion_uso", "publico"]
      .filter((clave) => !c[clave])
      .concat(entrada.frase ? [] : ["frase"]);

    console.log(
      `✅ #${entrada.numero} ${entrada.nombre} -> ids [${coincidencias.map((p) => p.id).join(", ")}]` +
        ` | ${genero || "género ?"}` +
        ` | ${estaciones || "estaciones ?"}` +
        ` | ${ocasiones || "ocasiones ?"}` +
        ` | ${longevidad.min ? `${longevidad.min}-${longevidad.max} h` : "duración ?"}` +
        (faltantes.length ? `  ⚠️ falta: ${faltantes.join(", ")}` : "") +
        (entrada.ignoradas.length ? `  (etiquetas ignoradas: ${entrada.ignoradas.join(", ")})` : "")
    );

    for (const producto of coincidencias) {
      conPerfil.add(producto.id);

      if (aplicar) {
        await pool.query(GUARDAR, [
          producto.id,
          c.familia_olfativa || null,
          c.concentracion || null,
          c.piramide || null,
          piramide.salida,
          piramide.corazon,
          piramide.fondo,
          c.rendimiento || null,
          c.estacion_uso || null,
          c.publico || null,
          entrada.frase || null,
          genero,
          estaciones,
          ocasiones,
          longevidad.min,
          longevidad.max,
        ]);
      }
    }
  }

  console.log("\n--- ENTRADAS DEL DOCUMENTO SIN PRODUCTO (agrégalas a ALIAS) ---");
  sinProducto.forEach((e) => console.log(`⬜ #${e.numero} ${e.nombre}`));

  console.log("\n--- PRODUCTOS DE LA TIENDA SIN PERFIL ---");
  productos
    .filter((p) => !conPerfil.has(p.id))
    .forEach((p) => console.log(`⬜ [${p.id}] ${p.nombre}`));

  console.log(
    `\nResumen: ${entradas.length - sinProducto.length} entradas emparejadas, ` +
      `${sinProducto.length} sin producto. ` +
      `Pirámides separadas en salida/corazón/fondo: ${piramidesSeparadas}.`
  );

  if (!aplicar) {
    console.log("Si todo se ve bien, corre:  node importarPerfiles.js --aplicar");
  }

  await pool.end();
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});