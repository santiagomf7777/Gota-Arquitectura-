require("dotenv").config();

// Copia TODA la base local (DB_*) a la base de la nube (NUBE_DB_*).
//
//   node copiarBaseANube.js            -> solo compara y muestra qué haría
//   node copiarBaseANube.js --aplicar  -> respalda la nube y la REEMPLAZA con la local
//
// Antes de reemplazar, guarda un respaldo de la nube en un archivo .json.

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const aplicar = process.argv.includes("--aplicar");
const LOTE = 200;

function configuracion(prefijo, ssl) {
  return {
    host: process.env[`${prefijo}HOST`],
    port: Number(process.env[`${prefijo}PORT`] || 3306),
    user: process.env[`${prefijo}USER`],
    password: process.env[`${prefijo}PASSWORD`],
    database: process.env[`${prefijo}NAME`],
    charset: "utf8mb4",
    connectTimeout: 15000,
    ssl,
  };
}

function sslNube() {
  const ruta = process.env.NUBE_DB_CA;

  if (ruta) return { ca: fs.readFileSync(ruta, "utf8") };

  console.log(
    "⚠️  Sin NUBE_DB_CA: la conexión va cifrada pero sin verificar el certificado."
  );
  return { rejectUnauthorized: false };
}

async function listarTablas(conexion) {
  const [filas] = await conexion.query(
    "SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'"
  );
  return filas.map((fila) => Object.values(fila)[0]);
}

async function contar(conexion, tabla) {
  try {
    const [[{ total }]] = await conexion.query(
      "SELECT COUNT(*) AS total FROM ??",
      [tabla]
    );
    return total;
  } catch {
    return "no existe";
  }
}

async function respaldar(nube, tablas) {
  const copia = {};

  for (const tabla of tablas) {
    const [filas] = await nube.query("SELECT * FROM ??", [tabla]);
    copia[tabla] = filas;
  }

  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  const archivo = path.join(__dirname, `respaldo-nube-${marca}.json`);
  fs.writeFileSync(archivo, JSON.stringify(copia, null, 2));

  return archivo;
}

async function crearTabla(nube, ddl) {
  try {
    await nube.query(ddl);
  } catch (error) {
    // Si el servidor de la nube no conoce la collation de MySQL 8, usa una equivalente
    if (/collation/i.test(error.message)) {
      await nube.query(ddl.replace(/utf8mb4_0900_ai_ci/g, "utf8mb4_unicode_ci"));
    } else {
      throw error;
    }
  }
}

async function copiarTabla(local, nube, tabla) {
  const [[creacion]] = await local.query("SHOW CREATE TABLE ??", [tabla]);

  await nube.query("DROP TABLE IF EXISTS ??", [tabla]);
  await crearTabla(nube, creacion["Create Table"]);

  const [filas] = await local.query("SELECT * FROM ??", [tabla]);
  if (filas.length === 0) return 0;

  const columnas = Object.keys(filas[0]);

  for (let i = 0; i < filas.length; i += LOTE) {
    const lote = filas
      .slice(i, i + LOTE)
      .map((fila) => columnas.map((columna) => fila[columna]));

    await nube.query("INSERT INTO ?? (??) VALUES ?", [tabla, columnas, lote]);
  }

  return filas.length;
}

async function main() {
  if (!process.env.NUBE_DB_HOST || !process.env.NUBE_DB_NAME) {
    console.error("Faltan NUBE_DB_HOST y NUBE_DB_NAME en backend/.env");
    process.exit(1);
  }

  if (
    process.env.NUBE_DB_HOST === process.env.DB_HOST &&
    process.env.NUBE_DB_NAME === process.env.DB_NAME
  ) {
    console.error("El destino es la misma base que el origen. Revisa el .env");
    process.exit(1);
  }

  console.log(`Origen  (local): ${process.env.DB_HOST} / ${process.env.DB_NAME}`);
  console.log(`Destino (nube) : ${process.env.NUBE_DB_HOST} / ${process.env.NUBE_DB_NAME}`);
  console.log(aplicar ? "Modo: APLICAR\n" : "Modo: solo vista previa (no cambia nada)\n");

  const local = await mysql.createConnection(configuracion("DB_"));
  const nube = await mysql.createConnection(
    configuracion("NUBE_DB_", sslNube())
  );

  try {
    const tablasLocal = await listarTablas(local);
    const tablasNube = await listarTablas(nube);

    console.log("Tabla".padEnd(28), "local".padEnd(10), "nube");
    for (const tabla of tablasLocal) {
      console.log(
        tabla.padEnd(28),
        String(await contar(local, tabla)).padEnd(10),
        await contar(nube, tabla)
      );
    }

    if (!aplicar) {
      console.log("\nSi todo se ve bien, corre:  node copiarBaseANube.js --aplicar");
      return;
    }

    const archivo = await respaldar(nube, tablasNube);
    console.log(`\n💾 Respaldo de la nube guardado en: ${archivo}\n`);

    await nube.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const tabla of tablasLocal) {
      const filas = await copiarTabla(local, nube, tabla);
      console.log(`✅ ${tabla}: ${filas} filas`);
    }

    await nube.query("SET FOREIGN_KEY_CHECKS = 1");

    const [categorias] = await nube.query(
      "SELECT nombre FROM categorias ORDER BY nombre LIMIT 5"
    );
    console.log(
      "\nVerificación de tildes en la nube:",
      categorias.map((c) => c.nombre).join(", ")
    );
  } finally {
    await local.end();
    await nube.end();
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});