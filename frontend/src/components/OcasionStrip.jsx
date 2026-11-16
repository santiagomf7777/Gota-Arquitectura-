import "./OcasionStrip.css";

// Los textos de "mensaje" coinciden con las opciones del chatbot,
// así el asistente responde con la misma lógica que ya tiene.
const OCASIONES = [
  {
    clave: "diario",
    titulo: "Diario",
    detalle: "Para todos los días",
    icono: "☀",
    mensaje: "Para el día a día",
  },
  {
    clave: "cita",
    titulo: "Cita",
    detalle: "Para dejar huella",
    icono: "♡",
    mensaje: "Para una cita",
  },
  {
    clave: "trabajo",
    titulo: "Trabajo",
    detalle: "Elegante y discreto",
    icono: "◇",
    mensaje: "Para el trabajo",
  },
  {
    clave: "noche",
    titulo: "Noche",
    detalle: "Para momentos especiales",
    icono: "☾",
    mensaje: "Para una salida de noche",
  },
];

function abrirChat(mensaje) {
  window.dispatchEvent(
    new CustomEvent("gota:abrir-chat", { detail: { mensaje } })
  );
}

function OcasionStrip() {
  return (
    <section className="ocasion" aria-labelledby="ocasion-titulo">
      <p className="ocasion__eyebrow">Elige por ocasión</p>

      <h2 id="ocasion-titulo" className="ocasion__titulo">
        ¿Para qué momento es tu <em>perfume</em>?
      </h2>

      <p className="ocasion__texto">
        Toca una opción y el asistente te recomienda perfumes disponibles.
      </p>

      <div className="ocasion__grid">
        {OCASIONES.map((o) => (
          <button
            key={o.clave}
            type="button"
            className="ocasion__card"
            onClick={() => abrirChat(o.mensaje)}
          >
            <span className="ocasion__icono" aria-hidden="true">
              {o.icono}
            </span>
            <span className="ocasion__nombre">{o.titulo}</span>
            <span className="ocasion__detalle">{o.detalle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default OcasionStrip;