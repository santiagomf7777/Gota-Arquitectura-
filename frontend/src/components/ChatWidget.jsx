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
  "¿Qué es un decant?",
];

const MENSAJE_BIENVENIDA = {
  role: "bot",
  content:
    "¡Hola! Soy el asistente de Gota Perfumería. Te ayudo a elegir tu fragancia según la ocasión, tu estilo y tu presupuesto. ¿Por dónde empezamos?",
  opciones: OPCIONES_INICIALES,
};

const RUTAS_CHAT = {
  "/pqrs": "formulario de PQRS",
  "/resenas": "reseñas",
};

function conEnlaces(texto) {
  const partes = String(texto || "").split(/(\/pqrs|\/resenas)/g);

  return partes.map((parte, i) =>
    RUTAS_CHAT[parte] ? (
      <Link key={i} to={parte} className="chat-link">
        {RUTAS_CHAT[parte]}
      </Link>
    ) : (
      <span key={i}>{parte}</span>
    )
  );
}

// ---------- Íconos ----------

const propsIcono = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function IconoChat() {
  return (
    <svg {...propsIcono} width="22" height="22">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconoAbajo() {
  return (
    <svg {...propsIcono} width="24" height="24">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconoCerrar() {
  return (
    <svg {...propsIcono} width="16" height="16">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconoEnviar() {
  return (
    <svg {...propsIcono} width="18" height="18">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [contexto, setContexto] = useState(null);
  const finRef = useRef(null);
  const inputRef = useRef(null);
  const enviarRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensajes, cargando, abierto]);

  // Al abrir el chat, el cursor queda listo en el campo de texto
  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  // Cerrar con la tecla Esc
  useEffect(() => {
    if (!abierto) return undefined;

    function alPresionar(event) {
      if (event.key === "Escape") setAbierto(false);
    }

    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [abierto]);

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

  // Siempre apunta a la versión más reciente de "enviar" (evita datos viejos
  // dentro del listener de abajo)
  enviarRef.current = enviar;

  // Permite abrir el chat desde otras partes de la página, por ejemplo las
  // tarjetas de ocasión del inicio:
  // window.dispatchEvent(new CustomEvent("gota:abrir-chat", { detail: { mensaje: "Para una cita" } }))
  useEffect(() => {
    function alAbrirDesdeFuera(event) {
      setAbierto(true);

      const mensaje = event.detail?.mensaje;
      if (mensaje) enviarRef.current?.(mensaje);
    }

    window.addEventListener("gota:abrir-chat", alAbrirDesdeFuera);
    return () =>
      window.removeEventListener("gota:abrir-chat", alAbrirDesdeFuera);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    enviar(texto);
  }

  // Los botones solo se muestran en el último mensaje del asistente
  const ultimoBot = mensajes.map((m) => m.role).lastIndexOf("bot");

  return (
    <div className="chat-widget">
      {abierto && (
        <div
          className="chat-panel"
          role="dialog"
          aria-label="Asistente de Gota Perfumería"
        >
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
              <IconoCerrar />
            </button>
          </div>

          <div className="chat-messages" role="log" aria-live="polite">
            {mensajes.map((m, i) => (
              <div key={i} className={`chat-row ${m.role}`}>
               <div className={`chat-bubble ${m.role}`}>
  {m.role === "bot" ? conEnlaces(m.content) : m.content}
</div>

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
              ref={inputRef}
              type="text"
              placeholder="Escribe tu pregunta..."
              aria-label="Escribe tu pregunta"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={300}
            />
            <button
              type="submit"
              className="chat-send"
              aria-label="Enviar mensaje"
              disabled={cargando || texto.trim() === ""}
            >
              <IconoEnviar />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-toggle"
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? "Minimizar chat" : "Abrir chat"}
        aria-expanded={abierto}
      >
        <span className={`chat-toggle__icon ${abierto ? "" : "is-active"}`}>
          <IconoChat />
        </span>
        <span className={`chat-toggle__icon ${abierto ? "is-active" : ""}`}>
          <IconoAbajo />
        </span>
      </button>
    </div>
  );
}

export default ChatWidget;