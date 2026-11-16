// Asistente SIN IA: reglas + palabras clave + datos reales de la base de datos.

const { buscarTema } = require("./conocimiento");

// ---------- Opciones y textos ----------

const OPCIONES_BASE = [
  "Recomiéndame un perfume",
  "Para una cita",
  "Para el trabajo",
  "Para el día a día",
  "Para una salida de noche",
  "Los más económicos",
  "¿Qué es un decant?",
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
  "Puedo recomendarte perfumes según la ocasión, el estilo o tu presupuesto, contarte sobre un perfume en particular, y resolver dudas como qué es un decant, qué significan las concentraciones (EDP, EDT), cuándo usar cada familia olfativa o cómo aplicar y conservar tu perfume.";

const TEXTO_FALLBACK =
  "No estoy seguro de haberte entendido. Puedo recomendarte perfumes por ocasión, estilo o presupuesto, o contarte sobre alguno en particular.";

// ---------- Ocasiones ----------

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

// ---------- Familias olfativas ----------

const FAMILIAS = {
  citrico: {
    etiqueta: "cítricos",
    palabras: ["citric*", "citrus", "limon", "naranja", "bergamota", "fresc*"],
  },
  acuatico: {
    etiqueta: "acuáticos",
    palabras: ["acuatic*", "marin*", "agua", "oceano", "fresc*"],
  },
  verde: {
    etiqueta: "verdes",
    palabras: ["verde*", "hojas", "pasto", "vegetal*"],
  },
  dulce: {
    etiqueta: "dulces",
    palabras: ["dulce*", "vainilla", "gourmand", "caramelo", "azucar*"],
  },
  frutal: {
    etiqueta: "frutales",
    palabras: ["frutal*", "afrutad*", "fruta", "frutas", "frutos"],
  },
  oriental: {
    etiqueta: "orientales",
    palabras: ["oriental*", "ambar*", "arabe*", "oud", "resina*", "incienso"],
  },
  amaderado: {
    etiqueta: "amaderados",
    palabras: ["amader*", "madera*", "cedro", "sandalo", "vetiver"],
  },
  floral: {
    etiqueta: "florales",
    palabras: ["floral*", "flor", "flores", "rosa", "rosas", "jazmin"],
  },
  especiado: {
    etiqueta: "especiados",
    palabras: ["especia*", "picante*", "pimienta", "canela"],
  },
  aromatico: {
    etiqueta: "aromáticos",
    palabras: ["aromatic*", "lavanda", "herbal*", "fougere"],
  },
  chipre: {
    etiqueta: "chipre",
    palabras: ["chipre", "musgo", "pachuli", "patchouli"],
  },
  cuero: {
    etiqueta: "de cuero",
    palabras: ["cuero", "ahumad*", "leather"],
  },
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

// ---------- Consejos ----------

const TIPS = {
  aplicar: {
    palabras: ["aplic*", "pulveriz*", "rociar", "ponerme", "como se usa", "como usar"],
    texto: "Aplícalo sobre piel limpia y seca, en los puntos de pulso: muñecas, cuello y detrás de las orejas. Con 2 a 4 pulverizaciones es suficiente. Evita frotar las muñecas, porque eso rompe las notas del perfume.",
  },
  conservar: {
    palabras: ["conserv*", "guardar", "almacen*", "caduc*", "venc*"],
    texto: "Guárdalo lejos de la luz directa y del calor, en un lugar fresco y seco (evita el baño). Bien conservado, un perfume puede mantenerse en buen estado por varios años.",
  },
  duracion: {
    palabras: ["dura", "duran", "duracion", "duradero*", "fijacion", "proyeccion"],
    texto: "La duración depende de la concentración del perfume, de tu piel y del clima. En general, un eau de parfum dura más que un eau de toilette. Aplicarlo sobre piel hidratada ayuda a que se fije mejor.",
  },
  concentracion: {
    palabras: ["eau de parfum", "eau de toilette", "edp", "edt", "concentracion"],
    texto: "El eau de parfum tiene más concentración de esencia, así que suele ser más intenso y durar más que un eau de toilette. La duración real depende de la fórmula, la piel y las condiciones de uso.",
  },
  compra: {
    palabras: ["envio*", "domicilio", "pago*", "pagar", "comprar", "compra", "compras", "carrito", "contraentrega", "transferencia", "pedido*"],
    texto: "Puedes agregar tus perfumes al carrito y finalizar la compra desde allí. Los métodos de pago disponibles son contraentrega y transferencia bancaria, y los detalles de envío los ves al confirmar tu pedido.",
  },
};

const PALABRAS_ECONOMICO = [
  "barat*",
  "economic*",
  "accesible*",
  "buen precio",
  "bajo presupuesto",
];

const PALABRAS_RECOMENDACION = [
  "recomiend*",
  "recomend*",
  "suger*",
  "sugier*",
  "ayuda*",
  "elegir",
  "escoger",
  "que perfume",
  "cual perfume",
  "busco",
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

function coincide(texto, palabra) {
  let regex = cacheRegex.get(palabra);

  if (!regex) {
    const esPrefijo = palabra.endsWith("*");
    const base = escaparRegex(esPrefijo ? palabra.slice(0, -1) : palabra);

    regex = new RegExp(
      `(^|[^a-z0-9])${base}${esPrefijo ? "" : "($|[^a-z0-9])"}`
    );

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

function asegurarPunto(texto) {
  return /[.!?]$/.test(texto) ? texto : `${texto}.`;
}

function percentil(valores, p) {
  if (valores.length === 0) return null;

  const ordenados = [...valores].sort((a, b) => a - b);
  const indice = Math.min(
    ordenados.length - 1,
    Math.floor(ordenados.length * p)
  );

  return ordenados[indice];
}

// ---------- Contexto ----------

const contextoVacio = () => ({
  ocasion: null,
  familias: [],
  maxPrecio: null,
  productoId: null,
});

function normalizarContexto(ctx) {
  const base = contextoVacio();

  if (!ctx || typeof ctx !== "object") return base;

  return {
    ocasion:
      typeof ctx.ocasion === "string" && tiene(OCASIONES, ctx.ocasion)
        ? ctx.ocasion
        : null,

    familias: Array.isArray(ctx.familias)
      ? ctx.familias.filter(
          (f) => typeof f === "string" && tiene(FAMILIAS, f)
        )
      : [],

    maxPrecio: Number(ctx.maxPrecio) > 0 ? Number(ctx.maxPrecio) : null,

    productoId:
      Number.isInteger(Number(ctx.productoId)) &&
      Number(ctx.productoId) > 0
        ? Number(ctx.productoId)
        : null,
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

function prepararCatalogo(filas) {
  const porId = new Map();

  for (const fila of filas) {
    if (!fila.id || !fila.nombre) continue;

    const id = Number(fila.id);
    let item = porId.get(id);

    if (!item) {
      const nombreNorm = normalizar(fila.nombre);

      item = {
        id,
        nombre: fila.nombre,
        descripcion: fila.descripcion || "",
        marca: fila.marca || "",
        categoria: fila.categoria || "",
        imagen_url: fila.imagen_url,

        // Datos de detalle_perfumes
        familia_olfativa: fila.familia_olfativa || null,
        concentracion: fila.concentracion || null,
        notas_salida: fila.notas_salida || null,
        notas_corazon: fila.notas_corazon || null,
        notas_fondo: fila.notas_fondo || null,
        rendimiento: fila.rendimiento || null,
        uso_ideal: fila.uso_ideal || null,
        publico_objetivo: fila.publico_objetivo || null,
        descripcion_corta: fila.descripcion_corta || null,
        descripcion_chatbot: fila.descripcion_chatbot || null,
        observaciones: fila.observaciones || null,

        nombreNorm,
        marcaNorm: normalizar(fila.marca),

        puntosFamilia: calcularPuntosFamilia(
          normalizar(`${fila.categoria || ""} ${fila.familia_olfativa || ""}`),
          normalizar(`${fila.descripcion || ""} ${fila.descripcion_chatbot || ""}`)
        ),

        variantes: [],
      };

      porId.set(id, item);
    }

    // Evitar agregar dos veces la misma variante
    const varianteExiste = item.variantes.some(
      (v) => Number(v.id) === Number(fila.variante_id)
    );

    if (!varianteExiste && fila.variante_id) {
      item.variantes.push({
  id: Number(fila.variante_id),
  tipo: fila.tipo || "FRASCO",
  tamano_ml: Number(fila.tamano_ml) || 0,
  precio: Number(fila.precio) || 0,
  stock_actual: Number(fila.stock_actual) || 0,
  disponible: Number(fila.stock_actual) > 0,
});
    }
  }

  return [...porId.values()].map((item) => {
    const variantes = item.variantes.sort((a, b) => {
  if (a.tamano_ml !== b.tamano_ml) {
    return a.tamano_ml - b.tamano_ml;
  }

  return a.tipo.localeCompare(b.tipo);
});

    return {
      ...item,
      disponible: variantes.some((v) => v.disponible),
      precio: (() => {
        const validos = variantes.map((v) => v.precio).filter((x) => x > 0);
        return validos.length > 0 ? Math.min(...validos) : 0;
      })(),
      variantes,
    };
  });
}


function resumirProducto(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    marca: p.marca,
    categoria: p.categoria,
    familia_olfativa: p.familia_olfativa,
    descripcion_corta: p.descripcion_corta,
    imagen_url: p.imagen_url,
    disponible: p.disponible,
    precio: p.precio,
    variantes: p.variantes.map((v) => ({
      id: v.id,
      tipo: v.tipo,
      tamano_ml: v.tamano_ml,
      precio: v.precio,
      stock_actual: v.stock_actual,
      disponible: v.disponible,
    })),
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

function detectarPresupuesto(msg) {
  const regex = /(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(mil|k)?\b/g;

  let maximo = null;
  let match;

  while ((match = regex.exec(msg)) !== null) {
    let valor = Number(match[1].replace(/[.,]/g, ""));

    if (match[2]) valor *= 1000;

    if (valor >= 30000) maximo = valor;
  }

  return maximo;
}

function detectarMarca(msg, catalogo) {
  const marcas = new Map();

  catalogo.forEach((p) => {
    if (p.marcaNorm.length >= 3) {
      marcas.set(p.marcaNorm, p.marca);
    }
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
  const coincidencias = catalogo.filter((p) =>
    coincide(msg, p.nombreNorm)
  );

  if (coincidencias.length === 0) return [];

  const largoMaximo = Math.max(
    ...coincidencias.map((p) => p.nombreNorm.length)
  );

  return coincidencias.filter(
    (p) => p.nombreNorm.length === largoMaximo
  );
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

  if (!hayCriterios) {
    return candidatos
      .sort((a, b) => a.precio - b.precio)
      .slice(0, 3);
  }

  return candidatos
    .map((p) => {
      let puntos = 0;

      for (const f of familias) {
        puntos += (p.puntosFamilia[f] || 0) * 2;
      }

      for (const f of familiasOcasion) {
        puntos += p.puntosFamilia[f] || 0;
      }

      return { p, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || a.p.precio - b.p.precio)
    .slice(0, 3)
    .map((x) => x.p);
}

function describirBusqueda(ctx, marca) {
  const partes = [];

  if (ctx.ocasion) {
    partes.push(`para ${OCASIONES[ctx.ocasion].etiqueta}`);
  }

  if (ctx.familias.length > 0) {
    partes.push(
      `de estilo ${ctx.familias.map((f) => FAMILIAS[f].etiqueta).join(" o ")}`
    );
  }

  if (marca) partes.push(`de ${marca.original}`);

  if (ctx.maxPrecio) {
    partes.push(`hasta $${formatoPrecio(ctx.maxPrecio)} COP`);
  }

  return partes.join(", ");
}

// ---------- Promociones ----------

function describirPromo(p) {
  const nombre = (i) => `${i.nombre} ${i.tamano_ml} ml`;
  const lista = (items) =>
    items
      .map((i) => `${i.cantidad > 1 ? `${i.cantidad} × ` : ""}${nombre(i)}`)
      .join(" + ");

  if (p.tipo === "COMBO") {
    const compra = lista(p.items.filter((i) => !i.es_regalo));
    const regalo = lista(p.items.filter((i) => i.es_regalo));

    return regalo
      ? `compra ${compra} y te regalamos ${regalo}.`
      : `${compra} por $${formatoPrecio(p.precio_combo)} COP.`;
  }

  const aplica = p.items.map(nombre).join(", ");

  if (p.tipo === "DESCUENTO_PORCENTAJE") {
    return `${p.valor}% de descuento en ${aplica}.`;
  }

  return `$${formatoPrecio(p.valor)} menos por unidad en ${aplica}.`;
}

function textoPromociones(promos) {
  if (promos.length === 0) {
    return "Por ahora no tenemos promociones activas. Si quieres, te recomiendo perfumes según la ocasión o tu presupuesto.";
  }

  const lista = promos
    .map((p) => `• ${p.nombre}: ${describirPromo(p)}`)
    .join("\n");

  return `Estas son nuestras promociones activas:\n\n${lista}`;
}

// Promociones de descuento (no combos) que aplican a un perfume
function promosDeProducto(productoId, promos) {
  return promos.filter(
    (p) =>
      p.tipo !== "COMBO" &&
      p.items.some((i) => Number(i.producto_id) === Number(productoId))
  );
}

// ---------- Función principal ----------

function procesarMensaje(mensaje, contextoEntrante, filas, promos = []) {
  const catalogo = prepararCatalogo(filas);
  const contexto = normalizarContexto(contextoEntrante);

  const msg = normalizar(mensaje);

  const sinSaludo = msg
    .replace(/buenas (noches|tardes)|buenos dias|buen dia/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const saludo =
    sinSaludo !== msg ||
    coincideAlguna(msg, ["hola", "hey", "buenas", "saludos"]);

  const ocasion = detectarOcasion(sinSaludo);
  const familias = detectarFamilias(sinSaludo);
  const marca = detectarMarca(sinSaludo, catalogo);

  let maxPrecio = detectarPresupuesto(sinSaludo);

  if (!maxPrecio && coincideAlguna(sinSaludo, PALABRAS_ECONOMICO)) {
    maxPrecio = percentil(
      catalogo
        .filter((p) => p.disponible && p.precio > 0)
        .map((p) => p.precio),
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
      {
        productos: resultados,
        opciones: OPCIONES_REFINAR,
        contexto: ctx,
      }
    );

    
  };

  // ---------- Respuesta sobre un producto ----------

  const responderProducto = (p, mensajeUsuario = "") => {
    const nombre = `${p.nombre}${p.marca ? ` (${p.marca})` : ""}`;

    const contextoProducto = {
      ...contexto,
      productoId: Number(p.id),
    };

    const mensaje = normalizar(mensajeUsuario);

        // Preguntas sobre precios, presentaciones y disponibilidad
    const preguntaPrecio =
      /\b(precio|precios|cuesta|cuestan|vale|valen|valor|cuanto pago|cuanto sale)\b/.test(
        mensaje
      );

    const preguntaPresentaciones =
      /\b(presentacion|presentaciones|tamano|tamanos|mililitros|ml|frasco|frascos|decant|decants)\b/.test(
        mensaje
      );

    const preguntaDisponibilidad =
      /\b(disponible|disponibilidad|agotado|agotada|agotados|agotadas|stock|existencia|existencias|tienen|hay)\b/.test(
        mensaje
      );

    const tamanoMatch = mensaje.match(/\b(\d{1,3})\s*ml\b/);

    const tamanoSolicitado = tamanoMatch
      ? Number(tamanoMatch[1])
      : null;

    const tipoSolicitado = /\b(decant|decants)\b/.test(mensaje)
      ? "DECANT"
      : /\b(frasco|frascos|original)\b/.test(mensaje)
        ? "FRASCO"
        : null;

    const variantesFiltradas = p.variantes.filter((v) => {
      const coincideTamano =
        !tamanoSolicitado || v.tamano_ml === tamanoSolicitado;

      const coincideTipo =
        !tipoSolicitado || v.tipo === tipoSolicitado;

      return coincideTamano && coincideTipo;
    });

    const listarPresentaciones = (variantes) => {
      if (variantes.length === 0) {
        return "No tengo esa presentación registrada para este perfume.";
      }

      return variantes
        .map((v) => {
          const tipo = v.tipo === "DECANT" ? "Decant" : "Frasco";
          const estado = v.disponible ? "Disponible" : "Agotado";

          return `${tipo} de ${v.tamano_ml} ml: $${formatoPrecio(v.precio)} COP (${estado})`;
        })
        .join("; ");
    };

    const preguntaNotas =
      /\b(notas?|salida|corazon|fondo)\b/.test(mensaje);

    const preguntaComoHuele =
      /\b(como huele|a que huele|como es su aroma|como es el aroma|describeme|cuentame como huele|que aroma tiene)\b/.test(mensaje);

    const preguntaDuracion =
      /\b(cuanto dura|cuanto tiempo|duracion|dura|duran|rendimiento|fijacion|proyeccion)\b/.test(mensaje);

    const preguntaOcasion =
      /\b(ocasion|ideal|cuando usar|donde usar|para que momento)\b/.test(mensaje);

    const preguntaFamilia =
      /\b(familia|olfativa)\b/.test(mensaje);

    const preguntaConcentracion =
      /\b(concentracion|eau de parfum|eau de toilette|edp|edt)\b/.test(mensaje);

    const preguntaPublico =
      /\b(publico|masculino|femenino|unisex|hombre|mujer)\b/.test(mensaje);

    const responderSeguimiento = (texto) =>
      responder(texto, {
        opciones: [
          "¿Cuáles son sus notas?",
          "Cuéntame cómo huele",
          "¿Cuánto dura?",
          "¿Para qué ocasión es ideal?",
        ],
        contexto: contextoProducto,
      });

          // 0. Preguntas sobre presentaciones, precios y disponibilidad

    if (
      preguntaPrecio ||
      preguntaPresentaciones ||
      preguntaDisponibilidad
    ) {
      if (variantesFiltradas.length === 0) {
        return responderSeguimiento(
          `No tengo registrada una presentación de ${tamanoSolicitado ? `${tamanoSolicitado} ml` : ""}${tipoSolicitado ? ` tipo ${tipoSolicitado.toLowerCase()}` : ""} para ${p.nombre}.`
        );
      }

      const resultado = listarPresentaciones(variantesFiltradas);

      if (preguntaDisponibilidad) {
        return responderSeguimiento(
          `Estas son las presentaciones registradas de ${p.nombre} y su disponibilidad: ${resultado}.`
        );
      }

      if (preguntaPrecio) {
        return responderSeguimiento(
          `Estos son los precios de ${p.nombre}: ${resultado}.`
        );
      }

      return responderSeguimiento(
        `Estas son las presentaciones de ${p.nombre}: ${resultado}.`
      );
    }

    // 1. Pregunta sobre duración
    if (preguntaDuracion) {
      if (p.rendimiento) {
        return responderSeguimiento(
          `¡Tiene buen rendimiento! Según la ficha de ${p.nombre}, ${p.rendimiento}. En ropa puede permanecer más tiempo, aunque depende del tejido y de la cantidad aplicada.`
        );
      }

      return responderSeguimiento(
        `No tengo una duración exacta registrada para ${p.nombre}. Puede variar según tu piel, el clima y la cantidad que apliques.`
      );
    }

    // 2. Pregunta sobre cómo huele
    if (preguntaComoHuele) {
      const notas = [];

      if (p.notas_salida) {
        notas.push(`Al principio se perciben ${p.notas_salida}`);
      }

      if (p.notas_corazon) {
        notas.push(`después aparecen ${p.notas_corazon}`);
      }

      if (p.notas_fondo) {
        notas.push(`y al final destacan ${p.notas_fondo}`);
      }

      if (notas.length > 0) {
        return responderSeguimiento(
          `${p.nombre} tiene un aroma ${p.familia_olfativa || "particular"}. ${notas.join(", ")}.`
        );
      }

      return responderSeguimiento(
        p.descripcion_corta
          ? p.descripcion_corta
          : `Todavía no tengo suficientes detalles para describirte el aroma de ${p.nombre}.`
      );
    }

    // 3. Pregunta sobre las notas
    if (preguntaNotas) {
      const partes = [];

      if (p.notas_salida) {
        partes.push(`De salida: ${p.notas_salida}`);
      }

      if (p.notas_corazon) {
        partes.push(`De corazón: ${p.notas_corazon}`);
      }

      if (p.notas_fondo) {
        partes.push(`De fondo: ${p.notas_fondo}`);
      }

      if (partes.length === 0) {
        return responderSeguimiento(
          `Todavía no tengo las notas de ${p.nombre} registradas en el catálogo.`
        );
      }

      return responderSeguimiento(
        `¡Claro! Estas son las notas de ${p.nombre}:\n\n${partes.join("\n\n")}`
      );
    }

    // 4. Pregunta sobre ocasión
    if (preguntaOcasion) {
      return responderSeguimiento(
        p.uso_ideal
          ? `Yo lo recomendaría para ${p.uso_ideal.toLowerCase()}. Es una buena opción si buscas una fragancia con personalidad.`
          : `No tengo una ocasión específica registrada para ${p.nombre}, pero puedo ayudarte a elegir según el tipo de aroma que buscas.`
      );
    }

    // 5. Pregunta sobre familia olfativa
    if (preguntaFamilia) {
      return responderSeguimiento(
        p.familia_olfativa
          ? `${p.nombre} pertenece a la familia ${p.familia_olfativa.toLowerCase()}.`
          : `No tengo registrada la familia olfativa de ${p.nombre}.`
      );
    }

    // 6. Pregunta sobre concentración
    if (preguntaConcentracion) {
      return responderSeguimiento(
        p.concentracion
          ? `${p.nombre} es una fragancia ${p.concentracion}.`
          : `No tengo registrada la concentración de ${p.nombre}.`
      );
    }

    // 7. Pregunta sobre público
    if (preguntaPublico) {
      return responderSeguimiento(
        p.publico_objetivo
          ? `En el catálogo, ${p.nombre} está clasificado para público ${p.publico_objetivo.toLowerCase()}.`
          : `No tengo registrado el público objetivo de ${p.nombre}.`
      );
    }

    // 8. Respuesta inicial o consulta general
    const descripcion = p.descripcion_chatbot || p.descripcion_corta;

    const intro = descripcion
      ? `${nombre}: ${asegurarPunto(descripcion)}`
      : `${nombre}. Todavía no tengo una descripción registrada.`;

      const promoDelPerfume = promosDeProducto(p.id, promos);
    const textoPromo = promoDelPerfume.length
      ? ` Tiene una promoción activa: ${promoDelPerfume.map(describirPromo).join(" ")}`
      : "";

    const presentaciones =
      p.variantes.length > 0
        ? listarPresentaciones(p.variantes)
        : "No hay presentaciones registradas";

    return responder(
      `${intro}${textoPromo} Estas son sus presentaciones: ${presentaciones}.`,
      {
        productos: [p],
        opciones: [
          "¿Cuáles son sus notas?",
          "Cuéntame cómo huele",
          "¿Cuánto dura?",
          "¿Para qué ocasión es ideal?",
        ],
        contexto: contextoProducto,
      }
    );
     };
  // ---------- 1. Reiniciar conversación ----------

  if (
    /(empezar de nuevo|empecemos de nuevo|reiniciar|nueva busqueda|volver a empezar)/.test(
      msg
    )
  ) {
    return responder("Listo, empecemos de nuevo. ¿Qué estás buscando?", {
      opciones: OPCIONES_BASE,
      contexto: contextoVacio(),
    });
  }

  // ---------- 2. Cortesía y ayuda ----------

  if (!hayFiltros) {
    if (coincideAlguna(msg, ["gracias", "agradezco"])) {
      return responder(
        "¡Con gusto! Si quieres, seguimos explorando opciones.",
        { opciones: OPCIONES_BASE }
      );
    }

    if (
      coincideAlguna(msg, ["adios", "chao", "hasta luego", "nos vemos", "bye"])
    ) {
      return responder("¡Hasta pronto! Que disfrutes tu fragancia.");
    }

    if (
      coincideAlguna(msg, [
        "que puedes hacer",
        "que haces",
        "como funcionas",
        "para que sirves",
      ])
    ) {
      return responder(TEXTO_AYUDA, { opciones: OPCIONES_BASE });
    }
  }


    // ---------- 2b. PQRS y reseñas ----------

  const quiereQueja = coincideAlguna(sinSaludo, [
    "queja",
    "quejas",
    "reclamo",
    "reclamos",
    "reclamar",
    "peticion",
    "peticiones",
    "sugerencia",
    "sugerencias",
    "pqrs",
    "pqr",
  ]);

  if (quiereQueja) {
    return responder(
      "Puedes enviarnos tu petición, queja, reclamo o sugerencia desde el formulario de PQRS. Lo revisamos y te respondemos al correo que nos dejes.\n\nFormulario: /pqrs",
      {
        opciones: ["Quiero dejar una reseña", "Recomiéndame un perfume", "Empezar de nuevo"],
      }
    );
  }

  const quiereResena = coincideAlguna(sinSaludo, [
    "resena",
    "resenas",
    "opinion",
    "opiniones",
    "calificar",
    "calificacion",
    "comentario",
    "comentar",
  ]);

  if (quiereResena) {
    return responder(
      "¡Nos encantaría leer tu experiencia! Deja tu reseña aquí y la publicaremos después de revisarla.\n\nReseñas: /resenas",
      {
        opciones: ["Quiero enviar una queja", "Recomiéndame un perfume", "Empezar de nuevo"],
      }
    );
  }

  // ---------- 2c. Promociones activas ----------

  const preguntaPromos = coincideAlguna(sinSaludo, [
    "promo*",
    "oferta*",
    "descuento*",
    "combo*",
  ]);

  const mencionaUnPerfume =
    buscarPorNombreExacto(sinSaludo, catalogo).length > 0 ||
    buscarPorPrimeraPalabra(sinSaludo, catalogo).length > 0;

  if (preguntaPromos && !mencionaUnPerfume) {
    return responder(textoPromociones(promos), {
      opciones: ["Recomiéndame un perfume", "Los más económicos", "Empezar de nuevo"],
    });
  }

  // ---------- 3. Buscar producto por nombre ----------

  const exactos = buscarPorNombreExacto(sinSaludo, catalogo);

  if (exactos.length === 1) {
    return responderProducto(exactos[0], sinSaludo);
  }

  if (exactos.length > 1) {
    return responder("Encontré estas opciones:", {
      productos: exactos.slice(0, 4),
      opciones: ["Recomiéndame un perfume", "Empezar de nuevo"],
    });
  }

  // ---------- 3b. Conocimiento general de perfumería ----------
  // Preguntas conceptuales (qué es un decant, concentraciones, notas...).
  // Van antes del seguimiento de producto para que "¿qué es un decant?"
  // no se responda con las presentaciones del perfume anterior.

  const esPreguntaConcepto =
    /\b(que (es|son|significa|significan|quiere decir|quieren decir)|a que se refiere|diferencia|diferencias|explica|explicame|como (se )?(prueba|pruebo|probar)|por que)\b/.test(
      sinSaludo
    );

  const temaGeneral = buscarTema(sinSaludo, coincideAlguna);

  if (
    temaGeneral &&
    (esPreguntaConcepto ||
      (sinSaludo.split(" ").length <= 4 && !contexto.productoId && !hayFiltros))
  ) {
    return responder(temaGeneral.texto(catalogo), {
      opciones: temaGeneral.opciones,
    });
  }

  // ---------- 4. Seguimiento del producto anterior ----------

   const preguntaSeguimientoProducto =
    /\b(notas?|salida|corazon|fondo|familia|olfativa|concentracion|eau de parfum|eau de toilette|edp|edt|rendimiento|duracion|dura|duran|cuanto dura|proyeccion|fijacion|publico|masculino|femenino|unisex|hombre|mujer|ocasion|ideal|uso|huele|oler|aroma|olor|describeme|precio|precios|cuesta|cuestan|vale|valen|valor|presentacion|presentaciones|tamano|tamanos|ml|decant|decants|frasco|frascos|disponible|disponibilidad|agotado|agotada|stock|existencia|existencias)\b/.test(
      sinSaludo
    );

  if (preguntaSeguimientoProducto && contexto.productoId) {
    const productoContexto = catalogo.find(
      (p) => Number(p.id) === Number(contexto.productoId)
    );

    if (productoContexto) {
      return responderProducto(productoContexto, sinSaludo);
    }
  }

  // ---------- 5. Consejos generales ----------

  const mencionaProducto =
    buscarPorPrimeraPalabra(sinSaludo, catalogo).length > 0;

  if (!mencionaProducto) {
    for (const clave of ["aplicar", "conservar", "duracion", "concentracion"]) {
      if (coincideAlguna(sinSaludo, TIPS[clave].palabras)) {
        return responder(TIPS[clave].texto, {
          opciones: OPCIONES_BASE,
        });
      }
    }
  }

  // ---------- 6. Pregunta sobre una familia olfativa ----------

  const preguntaInfo =
    /(para que|cuando|que ocasion|sirve|que es|que son|ideal)/.test(
      sinSaludo
    );

  if (familias.length > 0 && !ocasion && !maxPrecio && preguntaInfo) {
    const principales = familias.slice(0, 2);

    return responder(
      principales.map((f) => INFO_FAMILIAS[f]).join(" "),
      {
        opciones: principales
          .map((f) => `Ver perfumes ${FAMILIAS[f].etiqueta}`)
          .concat(["Empezar de nuevo"]),
      }
    );
  }

  // ---------- 7. Recomendación ----------

  if (hayFiltros) {
    const nuevo = {
      ocasion: ocasion || contexto.ocasion,
      familias:
        familias.length > 0
          ? familias
          : ocasion
            ? []
            : contexto.familias,
      maxPrecio: maxPrecio || contexto.maxPrecio,
    };

    return responderRecomendacion(nuevo, marca);
  }

  // ---------- 8. Perfumes de una marca ----------

  if (marca) {
    const deLaMarca = catalogo
      .filter((p) => p.marcaNorm === marca.norm && p.disponible)
      .sort((a, b) => a.precio - b.precio)
      .slice(0, 4);

    if (deLaMarca.length === 0) {
      return responder(
        `De ${marca.original} no tengo perfumes disponibles ahora mismo.`,
        { opciones: OPCIONES_BASE }
      );
    }

    return responder(`Estos son algunos perfumes de ${marca.original}:`, {
      productos: deLaMarca,
      opciones: ["Recomiéndame un perfume", "Empezar de nuevo"],
    });
  }

  // ---------- 9. Tipos de perfume disponibles ----------

  if (
    coincideAlguna(sinSaludo, [
      "tipos de perfume",
      "familias olfativas",
      "que tipos",
      "que familias",
      "clases de perfume",
      "categorias",
    ])
  ) {
    const categorias = [
      ...new Set(catalogo.map((p) => p.categoria).filter(Boolean)),
    ].sort();

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

  // ---------- 10. Compra, envío y pago ----------

  if (coincideAlguna(sinSaludo, TIPS.compra.palabras)) {
    return responder(TIPS.compra.texto, {
      opciones: OPCIONES_BASE,
    });
  }

  // ---------- 11. Recomendación sin criterios ----------

  if (coincideAlguna(sinSaludo, PALABRAS_RECOMENDACION)) {
    if (
      contexto.ocasion ||
      contexto.familias.length > 0 ||
      contexto.maxPrecio
    ) {
      return responderRecomendacion(contexto, null);
    }

    return responder(
      "Con gusto. ¿Para qué ocasión buscas tu perfume?",
      { opciones: OPCIONES_OCASION }
    );
  }

  // ---------- 12. Nombre parcial ----------

  const parciales = buscarPorPrimeraPalabra(sinSaludo, catalogo);

  if (parciales.length === 1) {
    return responderProducto(parciales[0], sinSaludo);
  }

  if (parciales.length > 1) {
    return responder("Encontré estas opciones:", {
      productos: parciales.slice(0, 4),
      opciones: ["Recomiéndame un perfume", "Empezar de nuevo"],
    });
  }

  // ---------- 13. Saludo ----------

  if (saludo) {
    return responder(TEXTO_BIENVENIDA, {
      opciones: OPCIONES_BASE,
    });
  }

  // ---------- 14. No entendió ----------

  return responder(TEXTO_FALLBACK, {
    opciones: OPCIONES_BASE,
  });
}

module.exports = {
  procesarMensaje,
  normalizar,
  detectarOcasion,
  detectarFamilias,
  detectarPresupuesto,
};