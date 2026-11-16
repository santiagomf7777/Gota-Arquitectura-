import "./InfoTienda.css";

const PASOS = [
  {
    numero: "1",
    titulo: "Elige tu perfume",
    texto: "Escoge el frasco completo o un decant, según lo que quieras.",
  },
  {
    numero: "2",
    titulo: "Agrégalo al carrito",
    texto: "Puedes combinar varios perfumes y presentaciones en un mismo pedido.",
  },
  {
    numero: "3",
    titulo: "Confirma y paga",
    texto:
      "Paga por contraentrega o transferencia bancaria. Los detalles de envío los ves al confirmar.",
  },
];

const PREGUNTAS = [
  {
    pregunta: "¿Qué es un decant?",
    respuesta:
      "Es una porción del mismo perfume en un frasco pequeño con atomizador. Sirve para probarlo antes de comprar el frasco completo, llevarlo de viaje o tener varios aromas sin gastar tanto.",
  },
  {
    pregunta: "¿Qué diferencia hay entre EDP y EDT?",
    respuesta:
      "El Eau de Parfum (EDP) tiene más concentración de esencia que el Eau de Toilette (EDT), así que suele ser más intenso y durar más. Aun así, depende de la fórmula y de tu piel.",
  },
  {
    pregunta: "¿Cuánto dura un perfume?",
    respuesta:
      "Las horas de cada ficha son una referencia: varían según tu piel, el clima y cuánto apliques. Aplicarlo sobre piel hidratada ayuda a que se fije mejor.",
  },
  {
    pregunta: "¿Cómo puedo pagar?",
    respuesta:
      "Por contraentrega o transferencia bancaria. Agrega tus perfumes al carrito y completa el pedido desde allí.",
  },
  {
    pregunta: "¿Cómo conservo mi perfume?",
    respuesta:
      "Guárdalo lejos de la luz directa y del calor, en un lugar fresco y seco (evita el baño).",
  },
];

// Abre el asistente. Si "mensaje" viene vacío, solo abre el chat.
function abrirChat(mensaje = "") {
  window.dispatchEvent(
    new CustomEvent("gota:abrir-chat", { detail: { mensaje } })
  );
}

function InfoTienda() {
  return (
    <>
      {/* Decants */}
      <section className="info info--decants" aria-labelledby="decants-titulo">
        <div className="info__decants">
          <p className="info__eyebrow">Decants</p>

          <h2 id="decants-titulo" className="info__titulo">
            Prueba antes de <em>comprar</em>
          </h2>

          <p className="info__texto">
            Un decant es una porción del mismo perfume en un frasco pequeño con
            atomizador. Es ideal para probarlo varios días, llevarlo de viaje o
            armar tu colección sin gastar tanto. Cada perfume muestra en su
            ficha los tamaños que tiene disponibles.
          </p>

          <button
            type="button"
            className="info__boton"
            onClick={() => abrirChat("¿Qué es un decant?")}
          >
            Preguntar al asistente
          </button>
        </div>
      </section>

      {/* Cómo comprar */}
      <section className="info" aria-labelledby="comprar-titulo">
        <p className="info__eyebrow">Cómo comprar</p>

        <h2 id="comprar-titulo" className="info__titulo">
          Tu pedido en tres <em>pasos</em>
        </h2>

        <ol className="info__pasos">
          {PASOS.map((p) => (
            <li key={p.numero} className="info__paso">
              <span className="info__numero" aria-hidden="true">
                {p.numero}
              </span>
              <strong>{p.titulo}</strong>
              <span>{p.texto}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Preguntas frecuentes */}
      <section className="info info--faq" aria-labelledby="faq-titulo">
        <p className="info__eyebrow">Preguntas frecuentes</p>

        <h2 id="faq-titulo" className="info__titulo">
          Resolvemos tus <em>dudas</em>
        </h2>

        <div className="info__faq">
          {PREGUNTAS.map((item) => (
            <details key={item.pregunta} className="info__item">
              <summary>{item.pregunta}</summary>
              <p>{item.respuesta}</p>
            </details>
          ))}
        </div>

        <button
          type="button"
          className="info__boton info__boton--claro"
          onClick={() => abrirChat("")}
        >
          ¿Otra duda? Abre el asistente
        </button>
      </section>
    </>
  );
}

export default InfoTienda;