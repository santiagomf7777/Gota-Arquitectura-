import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { sendChatMessage } from "../services/chatService";
import "./ChatWidget.css";

const OPCIONES_INICIALES = [
  "Recomiéndame un perfume",
  "Para una cita",
  "Para el trabajo",
  "Para el día a día",
  "Para una salida de noche",
  "Los más económicos",
];

const MENSAJE_BIENVENIDA = {
  role: "bot",
  content:
    "¡Hola! Soy el asistente de Gota Perfumería. Te ayudo a elegir tu fragancia según la ocasión, tu estilo y tu presupuesto. ¿Por dónde empezamos?",
  opciones: OPCIONES_INICIALES,
};

function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [contexto, setContexto] = useState(null);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando, abierto]);

  async function enviar(contenido) {
    const limpio = contenido.trim();
    if (!limpio || cargando) return;

    setMensajes((prev) => [...prev, { role: "user", content: limpio }]);
    setTexto("");
    setError("");
    setCargando(true);

    try {
      const data = await sendChatMessage(limpio, contexto);

      setContexto(data.contexto);
      setMensajes((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.reply,
          productos: data.productos,
          opciones: data.opciones,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    enviar(texto);
  }

  // Los botones solo se muestran en el último mensaje del asistente
  const ultimoBot = mensajes.map((m) => m.role).lastIndexOf("bot");

  return (
    <div className="chat-widget">
      {abierto && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <strong>Asistente GOTA</strong>
              <span>Te ayudo a elegir tu perfume</span>
            </div>
            <button
              type="button"
              className="chat-close"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {mensajes.map((m, i) => (
              <div key={i} className={`chat-row ${m.role}`}>
                <div className={`chat-bubble ${m.role}`}>{m.content}</div>

                {m.productos?.length > 0 && (
                  <div className="chat-products">
                    {m.productos.map((p) => (
                      <Link
                        key={p.id}
                        to={`/perfumes/${p.id}`}
                        className="chat-product"
                      >
                        <div className="chat-product-img">
                          {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} />
                          ) : (
                            <span>G</span>
                          )}
                        </div>
                        <div className="chat-product-info">
                          <span className="chat-product-brand">{p.marca}</span>
                          <strong>{p.nombre}</strong>
                          <span className="chat-product-price">
                            ${Number(p.precio).toLocaleString("es-CO")}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {i === ultimoBot && !cargando && m.opciones?.length > 0 && (
                  <div className="chat-options">
                    {m.opciones.map((opcion) => (
                      <button
                        key={opcion}
                        type="button"
                        onClick={() => enviar(opcion)}
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {cargando && (
              <div className="chat-row bot">
                <div className="chat-bubble bot chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            {error && <p className="chat-error">{error}</p>}
            <div ref={finRef} />
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={300}
            />
            <button type="submit" disabled={cargando || texto.trim() === ""}>
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-toggle"
        onClick={() => setAbierto(!abierto)}
        aria-label="Abrir chat"
      >
        {abierto ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default ChatWidget;