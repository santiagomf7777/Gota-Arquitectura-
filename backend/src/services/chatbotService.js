// Asistente SIN IA: reglas + palabras clave + datos reales de la base de datos.

// ---------- Opciones y textos (edítalos a tu gusto) ----------

const OPCIONES_BASE = [
  "Recomiéndame un perfume",
  "Para una cita",
  "Para el trabajo",
  "Para el día a día",
  "Para una salida de noche",
  "Los más económicos",
];

const OPCIONES_OCASION = [
  "Para el día a día",
  "Para el trabajo",
  "Para una cita",
  "Para una salida de noche",
];

const OPCIONES_REFINAR = [
  "Más fresco",
  "Más dulce",
  "Más económico",
  "Empezar de nuevo",
];

const TEXTO_BIENVENIDA =
  "¡Hola! Soy el asistente de Gota Perfumería. Te ayudo a elegir tu fragancia según la ocasión, tu estilo y tu presupuesto. ¿Por dónde empezamos?";

const TEXTO_AYUDA =
  "Puedo recomendarte perfumes según la ocasión, el estilo o tu presupuesto, contarte sobre un perfume en particular, y resolver dudas como cuándo usar cada familia olfativa o cómo aplicar y conservar tu perfume.";

const TEXTO_FALLBACK =
  "No estoy seguro de haberte entendido. Puedo recomendarte perfumes por ocasión, estilo o presupuesto, o contarte sobre alguno en particular.";

// Ocasiones: palabras que las detectan y familias olfativas que les van bien.
// Una palabra que termina en * significa "empieza por" (ej. romantic* = romántico, romántica...).
const OCASIONES = {
  diario: {
    etiqueta: "el día a día",
    palabras: ["diario", "dia a dia", "todos los dias", "casual", "cotidian*", "universidad", "paseo"],
    familias: ["citrico", "acuatico", "floral", "aromatico", "frutal", "verde"],
  },
  trabajo: {
    etiqueta: "el trabajo",
    palabras: ["trabajo", "oficina", "formal", "reunion", "entrevista", "profesional", "empresa"],
    familias: ["citrico", "acuatico", "aromatico", "amaderado", "verde"],
  },
  cita: {
    etiqueta: "una cita",
    palabras: ["cita", "citas", "romantic*", "conquistar", "pareja", "novi*", "aniversario", "enamorar", "seducir"],
    familias: ["dulce", "oriental", "floral", "amaderado", "especiado", "frutal"],
  },
  noche: {
    etiqueta: "una salida de noche",
    palabras: ["noche", "noches", "fiesta", "discoteca", "rumba", "salir", "evento", "boda", "gala"],
    familias: ["oriental", "dulce", "especiado", "amaderado", "cuero", "chipre"],
  },
};

const FAMILIAS = {
  citrico: { etiqueta: "cítricos", palabras: ["citric*", "citrus", "limon", "naranja", "bergamota", "fresc*"] },
  acuatico: { etiqueta: "acuáticos", palabras: ["acuatic*", "marin*", "agua", "oceano", "fresc*"] },
  verde: { etiqueta: "verdes", palabras: ["verde*", "hojas", "pasto", "vegetal*"] },
  dulce: { etiqueta: "dulces", palabras: ["dulce*", "vainilla", "gourmand", "caramelo", "azucar*"] },
  frutal: { etiqueta: "frutales", palabras: ["frutal*", "afrutad*", "fruta", "frutas", "frutos"] },
  oriental: { etiqueta: "orientales", palabras: ["oriental*", "ambar*", "arabe*", "oud", "resina*", "incienso"] },
  amaderado: { etiqueta: "amaderados", palabras: ["amader*", "madera*", "cedro", "sandalo", "vetiver"] },
  floral: { etiqueta: "florales", palabras: ["floral*", "flor", "flores", "rosa", "rosas", "jazmin"] },
  especiado: { etiqueta: "especiados", palabras: ["especia*", "picante*", "pimienta", "canela"] },
  aromatico: { etiqueta: "aromáticos", palabras: ["aromatic*", "lavanda", "herbal*", "fougere"] },
  chipre: { etiqueta: "chipre", palabras: ["chipre", "musgo", "pachuli", "patchouli"] },
  cuero: { etiqueta: "de cuero", palabras: ["cuero", "ahumad*", "leather"] },
};

const INFO_FAMILIAS = {
  citrico: "Los perfumes cítricos son frescos, ligeros y energizantes. Van muy bien para el día a día, el trabajo y el clima cálido.",
  acuatico: "Los acuáticos evocan frescura marina y limpieza. Son ideales para el día, la oficina, el deporte y el calor.",
  verde: "Los verdes huelen a hojas, hierba recién cortada y naturaleza. Son muy frescos y vibrantes, ideales para el día, la primavera y el verano.",
  dulce: "Los dulces y gourmand son envolventes y cálidos (vainilla, caramelo, postres). Funcionan muy bien en citas y salidas de noche, y en clima fresco.",
  frutal: "Los frutales aportan notas jugosas y alegres (manzana, durazno, frutos rojos). Son juveniles y versátiles: van bien de día y en salidas casuales, sobre todo en clima cálido.",
  oriental: "Los orientales y de ámbar son intensos, cálidos y de gran duración. Son para la noche, eventos especiales y clima frío o templado.",
  amaderado: "Los amaderados transmiten elegancia y carácter. Sirven para el trabajo, reuniones formales y también para la noche.",
  floral: "Los florales son elegantes y delicados. Van bien de día, en citas románticas y en épocas templadas.",
  especiado: "Los especiados son cálidos y con personalidad. Son ideales para la noche y el clima frío.",
  aromatico: "Los aromáticos y fougère (lavanda, hierbas, helecho) son limpios y clásicos. Muy versátiles para el trabajo y el día a día.",
  chipre: "Los chipre combinan frescura cítrica con fondos de musgo y madera. Son sofisticados y elegantes, buenos para el trabajo formal, eventos y la noche.",
  cuero: "Los perfumes de cuero son intensos, ahumados y con mucha personalidad. Funcionan mejor de noche, en eventos y en clima fresco.",
};

const TIPS = {
  aplicar: {
    palabras: ["aplic*", "pulveriz*", "rociar", "ponerme", "como se usa", "como usar"],
    texto:
      "Aplícalo sobre piel limpia y seca, en los puntos de pulso: muñecas, cuello y detrás de las orejas. Con 2 a 4 pulverizaciones es suficiente. Evita frotar las muñecas, porque eso rompe las notas del perfume.",
  },
  conservar: {
    palabras: ["conserv*", "guardar", "almacen*", "caduc*", "venc*"],
    texto:
      "Guárdalo lejos de la luz directa y del calor, en un lugar fresco y seco (evita el baño). Bien conservado, un perfume puede mantenerse en buen estado por varios años.",
  },
  duracion: {
    palabras: ["dura", "duran", "duracion", "duradero*", "fijacion", "proyeccion"],
    texto:
      "La duración depende de la concentración del perfume, de tu piel y del clima. En general, un eau de parfum dura más que un eau de toilette. Aplicarlo sobre piel hidratada ayuda a que se fije mejor.",
  },
  concentracion: {
    palabras: ["eau de parfum", "eau de toilette", "edp", "edt", "concentracion"],
    texto:
      "El eau de parfum tiene más concentración de esencia, así que es más intenso y dura más (aproximadamente de 6 a 8 horas). El eau de toilette es más ligero y fresco, y dura menos (aproximadamente de 3 a 5 horas).",
  },
  compra: {
    palabras: ["envio*", "domicilio", "pago*", "pagar", "comprar", "compra", "compras", "carrito", "contraentrega", "transferencia", "pedido*"],
    texto:
      "Puedes agregar tus perfumes al carrito y finalizar la compra desde allí. Los métodos de pago disponibles son contraentrega y transferencia bancaria, y los detalles de envío los ves al confirmar tu pedido.",
  },
};

const PALABRAS_ECONOMICO = ["barat*", "economic*", "accesible*", "buen precio", "bajo presupuesto"];

const PALABRAS_RECOMENDACION = [
  "recomiend*", "recomend*", "suger*", "sugier*", "ayuda*",
  "elegir", "escoger", "que perfume", "cual perfume", "busco",
];

// ---------- Utilidades ----------

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9'\s.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const cacheRegex = new Map();

// true si "palabra" aparece como palabra completa (o como prefijo si termina en *)
function coincide(texto, palabra) {
  let regex = cacheRegex.get(palabra);

  if (!regex) {
    const esPrefijo = palabra.endsWith("*");
    const base = escaparRegex(esPrefijo ? palabra.slice(0, -1) : palabra);
    regex = new RegExp(`(^|[^a-z0-9])${base}${esPrefijo ? "" : "($|[^a-z0-9])"}`);
    cacheRegex.set(palabra, regex);
  }

  return regex.test(texto);
}

function coincideAlguna(texto, palabras) {
  return palabras.some((palabra) => coincide(texto, palabra));
}

function tiene(objeto, clave) {
  return Object.prototype.hasOwnProperty.call(objeto, clave);
}

function formatoPrecio(valor) {
  return Number(valor).toLocaleString("es-CO");
}

function unir(lista) {
  if (lista.length <= 1) return lista.join("");
  return `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}`;
}

function asegurarPunto(texto) {
  return /[.!?]$/.test(texto) ? texto : `${texto}.`;
}

function percentil(valores, p) {
  if (valores.length === 0) return null;
  const ordenados = [...valores].sort((a, b) => a - b);
  const indice = Math.min(ordenados.length - 1, Math.floor(ordenados.length * p));
  return ordenados[indice];
}

const contextoVacio = () => ({ ocasion: null, familias: [], maxPrecio: null });

function normalizarContexto(ctx) {
  const base = contextoVacio();
  if (!ctx || typeof ctx !== "object") return base;

  return {
    ocasion: typeof ctx.ocasion === "string" && tiene(OCASIONES, ctx.ocasion) ? ctx.ocasion : null,
    familias: Array.isArray(ctx.familias)
      ? ctx.familias.filter((f) => typeof f === "string" && tiene(FAMILIAS, f))
      : [],
    maxPrecio: Number(ctx.maxPrecio) > 0 ? Number(ctx.maxPrecio) : null,
  };
}

// ---------- Catálogo ----------

function calcularPuntosFamilia(categoriaNorm, descripcionNorm) {
  const puntos = {};

  for (const [clave, familia] of Object.entries(FAMILIAS)) {
    let total = 0;
    if (coincideAlguna(categoriaNorm, familia.palabras)) total += 3;
    if (coincideAlguna(descripcionNorm, familia.palabras)) total += 1;
    if (total > 0) puntos[clave] = total;
  }

  return puntos;
}

// Une filas repetidas (mismo nombre) y calcula datos de búsqueda
function prepararCatalogo(filas) {
  const porNombre = new Map();

  for (const fila of filas) {
    const nombreNorm = normalizar(fila.nombre);
    if (!nombreNorm) continue;

    const item = {
      id: fila.id,
      nombre: fila.nombre,
      descripcion: fila.descripcion || "",
      marca: fila.marca || "",
      categoria: fila.categoria || "",
      tamano_ml: fila.tamano_ml,
      precio: Number(fila.precio) || 0,
      imagen_url: fila.imagen_url,
      disponible: Number(fila.stock_actual) > 0,
      nombreNorm,
      marcaNorm: normalizar(fila.marca),
      puntosFamilia: calcularPuntosFamilia(
        normalizar(fila.categoria),
        normalizar(fila.descripcion)
      ),
    };

    const previo = porNombre.get(nombreNorm);
    if (!previo || (!previo.disponible && item.disponible)) {
      porNombre.set(nombreNorm, item);
    }
  }

  return [...porNombre.values()];
}

function resumirProducto(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    marca: p.marca,
    categoria: p.categoria,
    tamano_ml: p.tamano_ml,
    precio: p.precio,
    imagen_url: p.imagen_url,
  };
}

// ---------- Detección ----------

function detectarOcasion(msg) {
  for (const [clave, ocasion] of Object.entries(OCASIONES)) {
    if (coincideAlguna(msg, ocasion.palabras)) return clave;
  }
  return null;
}

function detectarFamilias(msg) {
  return Object.entries(FAMILIAS)
    .filter(([, familia]) => coincideAlguna(msg, familia.palabras))
    .map(([clave]) => clave);
}

// Devuelve el presupuesto máximo si el mensaje trae un monto (250.000, 250000, 250 mil, 250k)
function detectarPresupuesto(msg) {
  const regex = /(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(mil|k)?\b/g;
  let maximo = null;
  let match;

  while ((match = regex.exec(msg)) !== null) {
    let valor = Number(match[1].replace(/[.,]/g, ""));
    if (match[2]) valor *= 1000;
    if (valor >= 30000) maximo = valor; // ignora números chicos como "100 ml"
  }

  return maximo;
}

function detectarMarca(msg, catalogo) {
  const marcas = new Map();
  catalogo.forEach((p) => {
    if (p.marcaNorm.length >= 3) marcas.set(p.marcaNorm, p.marca);
  });

  let mejor = null;
  for (const [norm, original] of marcas) {
    if (coincide(msg, norm) && (!mejor || norm.length > mejor.norm.length)) {
      mejor = { norm, original };
    }
  }

  return mejor;
}

function buscarPorNombreExacto(msg, catalogo) {
  const coincidencias = catalogo.filter((p) => coincide(msg, p.nombreNorm));
  if (coincidencias.length === 0) return [];

  const largoMaximo = Math.max(...coincidencias.map((p) => p.nombreNorm.length));
  return coincidencias.filter((p) => p.nombreNorm.length === largoMaximo);
}

function buscarPorPrimeraPalabra(msg, catalogo) {
  return catalogo.filter((p) => {
    const primera = p.nombreNorm.split(" ")[0];
    return primera.length >= 4 && coincide(msg, primera);
  });
}

// ---------- Recomendación ----------

function recomendar(catalogo, { ocasion, familias, maxPrecio, marca }) {
  const familiasOcasion = ocasion ? OCASIONES[ocasion].familias : [];
  const hayCriterios = familias.length > 0 || familiasOcasion.length > 0;

  const candidatos = catalogo.filter(
    (p) =>
      p.disponible &&
      (!maxPrecio || p.precio <= maxPrecio) &&
      (!marca || p.marcaNorm === marca)
  );

  // Solo presupuesto: los más económicos primero
  if (!hayCriterios) {
    return candidatos.sort((a, b) => a.precio - b.precio).slice(0, 3);
  }

  return candidatos
    .map((p) => {
      let puntos = 0;
      for (const f of familias) puntos += (p.puntosFamilia[f] || 0) * 2;
      for (const f of familiasOcasion) puntos += p.puntosFamilia[f] || 0;
      return { p, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || a.p.precio - b.p.precio)
    .slice(0, 3)
    .map((x) => x.p);
}

function describirBusqueda(ctx, marca) {
  const partes = [];

  if (ctx.ocasion) partes.push(`para ${OCASIONES[ctx.ocasion].etiqueta}`);
  if (ctx.familias.length > 0) {
    partes.push(`de estilo ${ctx.familias.map((f) => FAMILIAS[f].etiqueta).join(" o ")}`);
  }
  if (marca) partes.push(`de ${marca.original}`);
  if (ctx.maxPrecio) partes.push(`hasta $${formatoPrecio(ctx.maxPrecio)} COP`);

  return partes.join(", ");
}

// ---------- Función principal ----------

function procesarMensaje(mensaje, contextoEntrante, filas) {
  const catalogo = prepararCatalogo(filas);
  const contexto = normalizarContexto(contextoEntrante);

  const msg = normalizar(mensaje);
  const sinSaludo = msg
    .replace(/buenas (noches|tardes)|buenos dias|buen dia/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const saludo =
    sinSaludo !== msg || coincideAlguna(msg, ["hola", "hey", "buenas", "saludos"]);

  const ocasion = detectarOcasion(sinSaludo);
  const familias = detectarFamilias(sinSaludo);
  const marca = detectarMarca(sinSaludo, catalogo);

  let maxPrecio = detectarPresupuesto(sinSaludo);
  if (!maxPrecio && coincideAlguna(sinSaludo, PALABRAS_ECONOMICO)) {
    maxPrecio = percentil(
      catalogo.filter((p) => p.disponible && p.precio > 0).map((p) => p.precio),
      0.4
    );
  }

  const hayFiltros = Boolean(ocasion || familias.length > 0 || maxPrecio);

  const responder = (reply, extra = {}) => ({
    reply,
    productos: (extra.productos || []).map(resumirProducto),
    opciones: extra.opciones || [],
    contexto: extra.contexto || contexto,
  });

  const responderRecomendacion = (ctx, marcaFiltro) => {
    const resultados = recomendar(catalogo, {
      ...ctx,
      marca: marcaFiltro ? marcaFiltro.norm : null,
    });

    if (resultados.length === 0) {
      return responder(
        "No encontré perfumes disponibles con esas características. Puedes probar quitando algún criterio o empezar de nuevo.",
        {
          opciones: ["Empezar de nuevo", "Los más económicos", "Para una cita"],
          contexto: ctx,
        }
      );
    }

    const descripcion = describirBusqueda(ctx, marcaFiltro);

    return responder(
      `Estas son mis recomendaciones${descripcion ? ` ${descripcion}` : ""}:`,
      { productos: resultados, opciones: OPCIONES_REFINAR, contexto: ctx }
    );
  };

  const responderProducto = (p) => {
    const familiasProducto = Object.entries(p.puntosFamilia)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([clave]) => clave);

    const ocasiones = Object.values(OCASIONES)
      .filter((o) => o.familias.some((f) => familiasProducto.includes(f)))
      .map((o) => o.etiqueta);

    const intro = p.descripcion
      ? `${p.nombre}${p.marca ? ` (${p.marca})` : ""}: ${asegurarPunto(p.descripcion)}`
      : `${p.nombre}${p.marca ? ` de ${p.marca}` : ""}${
          p.categoria ? `, familia ${p.categoria.toLowerCase()}` : ""
        }.`;

    const tamano = p.tamano_ml ? `Viene en ${p.tamano_ml} ml` : "Su presentación";
    const detalle = p.disponible
      ? `${tamano}, cuesta $${formatoPrecio(p.precio)} COP y está disponible.`
      : `${tamano} y cuesta $${formatoPrecio(p.precio)} COP, pero ahora mismo está agotado.`;

    const partes = [intro, detalle];
    if (ocasiones.length > 0) partes.push(`Va muy bien para ${unir(ocasiones)}.`);

    return responder(partes.join(" "), {
      productos: [p],
      opciones: ["Recomiéndame un perfume", "Los más económicos", "Empezar de nuevo"],
    });
  };

  // 1. Reiniciar la conversación
  if (/(empezar de nuevo|empecemos de nuevo|reiniciar|nueva busqueda|volver a empezar)/.test(msg)) {
    return responder("Listo, empecemos de nuevo. ¿Qué estás buscando?", {
      opciones: OPCIONES_BASE,
      contexto: contextoVacio(),
    });
  }

  // 2. Cortesía y ayuda
  if (!hayFiltros) {
    if (coincideAlguna(msg, ["gracias", "agradezco"])) {
      return responder("¡Con gusto! Si quieres, seguimos explorando opciones.", {
        opciones: OPCIONES_BASE,
      });
    }

    if (coincideAlguna(msg, ["adios", "chao", "hasta luego", "nos vemos", "bye"])) {
      return responder("¡Hasta pronto! Que disfrutes tu fragancia.");
    }

    if (coincideAlguna(msg, ["que puedes hacer", "que haces", "como funcionas", "para que sirves"])) {
      return responder(TEXTO_AYUDA, { opciones: OPCIONES_BASE });
    }
  }

  // 3. Consejos generales (aplicar, conservar, duración)
  for (const clave of ["aplicar", "conservar", "duracion"]) {
    if (coincideAlguna(sinSaludo, TIPS[clave].palabras)) {
      return responder(TIPS[clave].texto, { opciones: OPCIONES_BASE });
    }
  }

  // 4. Perfume mencionado por su nombre
  const exactos = buscarPorNombreExacto(sinSaludo, catalogo);
  if (exactos.length === 1) return responderProducto(exactos[0]);
  if (exactos.length > 1) {
    return responder("Encontré estas opciones:", {
      productos: exactos.slice(0, 4),
      opciones: ["Recomiéndame un perfume", "Empezar de nuevo"],
    });
  }

  // 5. Eau de parfum vs eau de toilette
  if (coincideAlguna(sinSaludo, TIPS.concentracion.palabras)) {
    return responder(TIPS.concentracion.texto, { opciones: OPCIONES_BASE });
  }

  // 6. Pregunta sobre una familia olfativa
  const preguntaInfo = /(para que|cuando|que ocasion|sirve|que es|que son|ideal)/.test(sinSaludo);
  if (familias.length > 0 && !ocasion && !maxPrecio && preguntaInfo) {
    const principales = familias.slice(0, 2);
    return responder(principales.map((f) => INFO_FAMILIAS[f]).join(" "), {
      opciones: principales
        .map((f) => `Ver perfumes ${FAMILIAS[f].etiqueta}`)
        .concat(["Empezar de nuevo"]),
    });
  }

  // 7. Recomendación (el mensaje trae ocasión, estilo o presupuesto)
  if (hayFiltros) {
    const nuevo = {
      ocasion: ocasion || contexto.ocasion,
      familias: familias.length > 0 ? familias : ocasion ? [] : contexto.familias,
      maxPrecio: maxPrecio || contexto.maxPrecio,
    };
    return responderRecomendacion(nuevo, marca);
  }

  // 8. Perfumes de una marca
  if (marca) {
    const deLaMarca = catalogo
      .filter((p) => p.marcaNorm === marca.norm && p.disponible)
      .sort((a, b) => a.precio - b.precio)
      .slice(0, 4);

    if (deLaMarca.length === 0) {
      return responder(`De ${marca.original} no tengo perfumes disponibles ahora mismo.`, {
        opciones: OPCIONES_BASE,
      });
    }

    return responder(`Estos son algunos perfumes de ${marca.original}:`, {
      productos: deLaMarca,
      opciones: ["Recomiéndame un perfume", "Empezar de nuevo"],
    });
  }

  // 9. Tipos de perfume disponibles
  if (
    coincideAlguna(sinSaludo, [
      "tipos de perfume", "familias olfativas", "que tipos",
      "que familias", "clases de perfume", "categorias",
    ])
  ) {
    const categorias = [...new Set(catalogo.map((p) => p.categoria).filter(Boolean))].sort();
    const familiasPresentes = Object.keys(FAMILIAS).filter((f) =>
      catalogo.some((p) => (p.puntosFamilia[f] || 0) >= 3)
    );

    return responder(
      `En la tienda tenemos perfumes de estas familias: ${categorias.join(", ")}. Pregúntame cuándo usar cada una.`,
      {
        opciones: familiasPresentes
          .slice(0, 4)
          .map((f) => `Perfumes ${FAMILIAS[f].etiqueta}: ¿cuándo usarlos?`),
      }
    );
  }

  // 10. Compra, envío y pago
  if (coincideAlguna(sinSaludo, TIPS.compra.palabras)) {
    return responder(TIPS.compra.texto, { opciones: OPCIONES_BASE });
  }

  // 11. Pide una recomendación sin dar criterios
  if (coincideAlguna(sinSaludo, PALABRAS_RECOMENDACION)) {
    if (contexto.ocasion || contexto.familias.length > 0 || contexto.maxPrecio) {
      return responderRecomendacion(contexto, null);
    }

    return responder("Con gusto. ¿Para qué ocasión buscas tu perfume?", {
      opciones: OPCIONES_OCASION,
    });
  }

  // 12. Nombre parcial (ej. "khamrah" cuando hay varios Khamrah)
  const parciales = buscarPorPrimeraPalabra(sinSaludo, catalogo);
  if (parciales.length === 1) return responderProducto(parciales[0]);
  if (parciales.length > 1) {
    return responder("Encontré estas opciones:", {
      productos: parciales.slice(0, 4),
      opciones: ["Recomiéndame un perfume", "Empezar de nuevo"],
    });
  }

  // 13. Saludo
  if (saludo) return responder(TEXTO_BIENVENIDA, { opciones: OPCIONES_BASE });

  // 14. No entendió
  return responder(TEXTO_FALLBACK, { opciones: OPCIONES_BASE });
}

module.exports = {
  procesarMensaje,
  normalizar,
  detectarOcasion,
  detectarFamilias,
  detectarPresupuesto,
};