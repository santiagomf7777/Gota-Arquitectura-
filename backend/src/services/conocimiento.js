// Conocimiento general de perfumería para el asistente (sin IA, texto fijo).
// Cada tema tiene palabras clave (ya normalizadas: minúsculas, sin tildes;
// "*" al final = prefijo) y una respuesta. Los textos son orientativos:
// no prometen resultados ni afirman datos de productos concretos.

function unirLista(numeros) {
  if (numeros.length === 0) return "";
  if (numeros.length === 1) return String(numeros[0]);
  return `${numeros.slice(0, -1).join(", ")} y ${numeros[numeros.length - 1]}`;
}

// Tamaños de decant que realmente existen en el catálogo (desde la base de datos)
function tamanosDecant(catalogo) {
  const tamanos = new Set();

  for (const p of catalogo || []) {
    for (const v of p.variantes || []) {
      if (v.tipo === "DECANT" && v.tamano_ml > 0) tamanos.add(v.tamano_ml);
    }
  }

  return [...tamanos].sort((a, b) => a - b);
}

const TEMAS = [
  {
    id: "decants",
    palabras: ["decant*", "miniatura*", "muestras de perfume", "muestrita*"],
    texto: (catalogo) => {
      const tamanos = tamanosDecant(catalogo);
      const tamanosTexto =
        tamanos.length > 0
          ? ` En la tienda los manejamos en ${unirLista(tamanos)} ml (cada perfume tiene los tamaños que ves en su ficha).`
          : "";

      return (
        "Un decant es una porción de un perfume pasada a un frasco pequeño con atomizador. " +
        "Es el mismo perfume del frasco completo, solo que en menos cantidad: sirve para probarlo antes de comprar el frasco, " +
        "llevarlo de viaje o tener varios aromas sin gastar tanto." +
        tamanosTexto +
        "\n\nSe usa igual que cualquier perfume y se guarda lejos del calor y de la luz directa."
      );
    },
    opciones: [
      "¿Cómo pruebo un perfume?",
      "¿Qué son las concentraciones?",
      "Recomiéndame un perfume",
    ],
  },

  {
    id: "concentraciones",
    palabras: [
      "concentracion*",
      "eau de parfum",
      "eau de toilette",
      "eau de cologne",
      "edp",
      "edt",
      "edc",
      "extrait",
      "colonia",
      "colonias",
      "elixir",
      "parfum",
      "intense",
    ],
    texto: () =>
      "La concentración indica cuánto aceite de perfume tiene la fórmula frente al alcohol. " +
      "En general, a más concentración, más intensidad y duración (aunque también depende de la fórmula y de tu piel):\n\n" +
      "• Parfum o Extrait: la más alta, aprox. 20–30%.\n" +
      "• Eau de Parfum (EDP): aprox. 15–20%. Intensa y de buena duración.\n" +
      "• Eau de Toilette (EDT): aprox. 5–15%. Más ligera y fresca.\n" +
      "• Eau de Cologne (EDC): aprox. 2–5%. Muy suave y de corta duración.\n\n" +
      "Los porcentajes son una referencia y cambian según la casa de perfumes. " +
      "Los nombres \"Elixir\" o \"Intense\" no son una categoría oficial: suelen indicar una versión más intensa de la misma línea.\n\n" +
      "Si me dices un perfume, te cuento cuál es su concentración.",
    opciones: [
      "¿Qué es un decant?",
      "¿Qué es la proyección?",
      "Recomiéndame un perfume",
    ],
  },

  {
    id: "notas",
    palabras: [
      "piramide*",
      "notas de salida",
      "notas de corazon",
      "notas de fondo",
      "notas de cabeza",
      "notas olfativas",
    ],
    texto: () =>
      "La pirámide olfativa describe cómo evoluciona un perfume sobre la piel:\n\n" +
      "• Notas de salida: lo primero que hueles. Son ligeras y se desvanecen pronto (cítricos, menta, frutas).\n" +
      "• Notas de corazón: aparecen después y definen el carácter del perfume (flores, especias).\n" +
      "• Notas de fondo: se quedan por más tiempo y le dan profundidad (maderas, ámbar, vainilla, almizcle).\n\n" +
      "Por eso un perfume puede oler distinto a los 5 minutos que a las 3 horas.",
    opciones: [
      "¿Cómo pruebo un perfume?",
      "¿Qué es la proyección?",
      "Recomiéndame un perfume",
    ],
  },

  {
    id: "rendimiento",
    palabras: ["estela", "sillage", "proyeccion", "fijacion", "longevidad"],
    texto: () =>
      "Son tres conceptos que se suelen confundir:\n\n" +
      "• Fijación o duración: cuánto tiempo se percibe el perfume en tu piel.\n" +
      "• Proyección: qué tan lejos se nota mientras lo llevas puesto.\n" +
      "• Estela (sillage): el rastro de aroma que dejas al pasar.\n\n" +
      "Un perfume puede durar muchas horas y proyectar poco, o al revés. " +
      "Las horas que ves en las fichas son una referencia: varían según tu piel, el clima y cuánto apliques.",
    opciones: [
      "¿Qué son las concentraciones?",
      "¿Cómo se aplica un perfume?",
      "Recomiéndame un perfume",
    ],
  },

  {
    id: "probar",
    palabras: [
      "como probar",
      "como pruebo",
      "como se prueba",
      "probar un perfume",
      "probar perfumes",
    ],
    texto: () =>
      "Para probar un perfume: aplícalo directamente en la piel (muñeca o pliegue del codo), sin frotar, " +
      "y espera 20 a 30 minutos para sentir cómo evoluciona; lo primero que hueles es la salida y cambia con el tiempo. " +
      "Evita probar más de 2 o 3 aromas seguidos, porque la nariz se cansa.\n\n" +
      "Si no estás seguro, un decant es una forma económica de usarlo varios días antes de decidir.",
    opciones: [
      "¿Qué es un decant?",
      "¿Por qué huele distinto en cada persona?",
      "Recomiéndame un perfume",
    ],
  },

  {
    id: "piel",
    palabras: [
      "huele distinto",
      "huele diferente",
      "cada persona",
      "quimica de la piel",
      "distinto en mi",
      "diferente en mi",
    ],
    texto: () =>
      "Cada piel es distinta: el pH, la hidratación, la temperatura y el clima influyen en cómo se desarrolla un perfume. " +
      "Por eso el mismo aroma puede oler un poco diferente, o durar más o menos, en cada persona. " +
      "Aplicarlo sobre piel hidratada ayuda a que dure más.",
    opciones: [
      "¿Cómo pruebo un perfume?",
      "¿Qué es un decant?",
      "Recomiéndame un perfume",
    ],
  },

  {
    id: "clima",
    palabras: ["clima", "calor", "caluros*", "frio", "temporada", "epoca"],
    texto: () =>
      "En clima cálido y de día funcionan mejor los aromas frescos: cítricos, acuáticos, verdes y aromáticos. " +
      "Con frío o de noche lucen más los cálidos e intensos: dulces, orientales, especiados y amaderados. " +
      "Es una guía, no una regla: lo importante es que te guste cómo huele.",
    opciones: ["Más fresco", "Más dulce", "Recomiéndame un perfume"],
  },

  {
    id: "unisex",
    palabras: ["unisex"],
    texto: () =>
      "Unisex significa que el perfume no está pensado solo para hombre o solo para mujer. " +
      "En perfumería los aromas no tienen género: la clasificación es una orientación y cada persona puede usar el que más le guste.",
    opciones: ["Recomiéndame un perfume", "Los más económicos"],
  },

  {
    id: "oud",
    palabras: ["oud", "agarwood"],
    texto: () =>
      "El oud (o agarwood) es una madera resinosa y oscura que se obtiene de ciertos árboles del género Aquilaria. " +
      "Huele intenso, amaderado, ahumado y a veces un poco animal o medicinal. " +
      "Es muy característico de la perfumería árabe y oriental.",
    opciones: ["Para una salida de noche", "Recomiéndame un perfume"],
  },

  {
    id: "ambar",
    palabras: ["ambar*"],
    texto: () =>
      "En perfumería, el ámbar suele ser un acorde (una mezcla) de aroma cálido, dulce, resinoso y un poco empolvado, " +
      "armado con resinas, vainilla y otras notas. No se refiere a la gema. " +
      "Aporta calidez y duración al fondo del perfume.",
    opciones: ["Para una salida de noche", "Recomiéndame un perfume"],
  },

  {
    id: "gourmand",
    palabras: ["gourmand"],
    texto: () =>
      "Gourmand es una familia de aromas que evocan comida y postres: vainilla, caramelo, café, dátiles, chocolate o frutos secos. " +
      "Suelen ser dulces y envolventes, y se disfrutan más con clima fresco y por la noche.",
    opciones: ["Más dulce", "Para una cita", "Recomiéndame un perfume"],
  },
];

// coincideAlguna(texto, palabras) viene del asistente principal.
function buscarTema(msgNormalizado, coincideAlguna) {
  return TEMAS.find((t) => coincideAlguna(msgNormalizado, t.palabras)) || null;
}

module.exports = { TEMAS, buscarTema };