const pool = require("./src/config/database");

const imagenes = {
  "Sceptre": "Sceptre.jpg",
  "Emeer": "Emeer.jpg",
  "Eros": "Eros.jpg",

  "Khamrah Waha": "khamrahWaha.jpg",
  "Khamrah Original": "KhamrahOriginal.jpg",
  "Khamrah Dukhan": "khamrahDukhan.jpg",
  "Khamrah Qahwa": "khamrahQahwa.jpg",

  "Asad Bourbon": "AsadBourbon.jpg",
  "Asad Zanzibar": "asadZanzibar.jpg",
  "Asad Elixir": "AsadElixir.jpg",

  "Yara Candy": "YaraCandy.jpg",
  "Yara Tous": "yaraTous.jpg",

  "Bade'e Al Oud Honor & Glory": "BadeeAlOudHonor&Glory.jpg",
  "Bade'e Al Oud - Oud for Glory": "BadeeAlOudForGlory.jpg",
  "Bade'e Al Oud Sublime": "BadeeAlOudSublime.jpg",
  "Bade'e Al Oud Amethyst": "BadeeAlOudAmethyst.jpg",

  "Qaed Al Fursan Original": "QaedAlFursanOriginal.jpg",
  "Qaed Al Fursan Untamed": "QaedAlFursanUntamed.jpg",
  "Qaed Al Fursan Unlimited": "QaedAlFursanUnlimited.jpg",

  "Hayaati Black": "HayaatiBlack.jpg",
  "Hayaati Gold Elixir": "HayaatiGoldElixir.jpg",
  "Hayaati Al Maleky": "HayaatiAlMaleky.jpg",

  "Ana Abiyedh Scarlet": "AnaAbiyedhScarlet.jpg",

  "Fakhar Extrait": "FakharExtrait.jpg"
};

async function actualizarImagenes() {
  try {
    console.log("\n=== ACTUALIZANDO IMÁGENES ===\n");

    for (const [nombre, archivo] of Object.entries(imagenes)) {
      const ruta = `/Images/imagenesPerfumes/${archivo}`;

      const [resultado] = await pool.query(
        "UPDATE productos SET imagen_url = ? WHERE nombre = ?",
        [ruta, nombre]
      );

      if (resultado.affectedRows > 0) {
        console.log(`✅ ${nombre} -> ${ruta}`);
      } else {
        console.log(`⚠️ No encontrado: ${nombre}`);
      }
    }

    console.log("\n=== PROCESO TERMINADO ===\n");

    const [productos] = await pool.query(
      "SELECT id, nombre, imagen_url FROM productos"
    );

    console.table(productos);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

actualizarImagenes();