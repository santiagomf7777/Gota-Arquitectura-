import { useState } from "react";
import "./PerfumeFinder.css";

const preguntas = [
  {
    titulo: "¿Para qué ocasión buscas tu perfume?",
    subtitulo: "Elige la situación en la que más lo usarías.",
    opciones: [
      {
        id: "diario",
        icono: "☀",
        nombre: "Diario",
        descripcion: "Para todos los días",
      },
      {
        id: "cita",
        icono: "♡",
        nombre: "Cita",
        descripcion: "Para dejar huella",
      },
      {
        id: "trabajo",
        icono: "◇",
        nombre: "Trabajo",
        descripcion: "Elegante y discreto",
      },
      {
        id: "noche",
        icono: "☾",
        nombre: "Noche",
        descripcion: "Para momentos especiales",
      },
    ],
  },
  {
    titulo: "¿Qué estilo de fragancia prefieres?",
    subtitulo: "Elige el carácter que más representa tu personalidad.",
    opciones: [
      {
        id: "fresco",
        icono: "◈",
        nombre: "Fresco",
        descripcion: "Ligero y refrescante",
      },
      {
        id: "dulce",
        icono: "✦",
        nombre: "Dulce",
        descripcion: "Cálido y envolvente",
      },
      {
        id: "intenso",
        icono: "◆",
        nombre: "Intenso",
        descripcion: "Fuerte y llamativo",
      },
      {
        id: "elegante",
        icono: "♢",
        nombre: "Elegante",
        descripcion: "Sofisticado y refinado",
      },
    ],
  },
  {
    titulo: "¿Qué presencia quieres proyectar?",
    subtitulo: "Cuéntanos cómo quieres que te recuerden.",
    opciones: [
      {
        id: "discreta",
        icono: "○",
        nombre: "Discreta",
        descripcion: "Sutil y agradable",
      },
      {
        id: "equilibrada",
        icono: "◐",
        nombre: "Equilibrada",
        descripcion: "Presencia moderada",
      },
      {
        id: "protagonista",
        icono: "✦",
        nombre: "Protagonista",
        descripcion: "Imposible de ignorar",
      },
    ],
  },
];

function PerfumeFinder() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  const pregunta = preguntas[paso];

  const seleccionar = (opcion) => {
    const nuevasRespuestas = {
      ...respuestas,
      [paso]: opcion.id,
    };

    setRespuestas(nuevasRespuestas);

    if (paso < preguntas.length - 1) {
      setPaso(paso + 1);
    } else {
      console.log("Respuestas:", nuevasRespuestas);
    }
  };

  return (
    <section className="finder">

      <div className="finder-header">

        <span className="finder-eyebrow">
          EXPERIENCIA GOTA
        </span>

        <h2>
          Encuentra tu <em>perfume</em>
        </h2>

        <p>
          No todos los perfumes cuentan la misma historia.
          Responde tres preguntas y descubre cuál podría
          ser tu esencia.
        </p>

      </div>

      <div className="finder-steps">

        {preguntas.map((_, index) => (
          <div
            key={index}
            className={`finder-step ${
              index === paso ? "active" : ""
            } ${
              index < paso ? "completed" : ""
            }`}
          >
            {index + 1}
          </div>
        ))}

      </div>

      <div className="finder-card">

        <div className="finder-star">✦</div>

        <h3>{pregunta.titulo}</h3>

        <p className="finder-subtitle">
          {pregunta.subtitulo}
        </p>

        <div
          className={`finder-options ${
            pregunta.opciones.length === 3
              ? "three"
              : ""
          }`}
        >

          {pregunta.opciones.map((opcion) => (

            <button
              key={opcion.id}
              className="finder-option"
              onClick={() => seleccionar(opcion)}
            >

              <span className="finder-icon">
                {opcion.icono}
              </span>

              <strong>{opcion.nombre}</strong>

              <small>{opcion.descripcion}</small>

            </button>

          ))}

        </div>

      </div>

    </section>
  );
}

export default PerfumeFinder;