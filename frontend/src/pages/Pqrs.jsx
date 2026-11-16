import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import "./Pqrs.css";

const TIPOS = [
  { valor: "PETICION", etiqueta: "Petición" },
  { valor: "QUEJA", etiqueta: "Queja" },
  { valor: "RECLAMO", etiqueta: "Reclamo" },
  { valor: "SUGERENCIA", etiqueta: "Sugerencia" },
];

const VACIO = {
  tipo: "QUEJA",
  nombre: "",
  email: "",
  telefono: "",
  pedido_codigo: "",
  asunto: "",
  mensaje: "",
};

export default function Pqrs() {
  const { isAuthenticated, auth } = useAuth();
  const token = auth?.token;

  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/pqrs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(datos.mensaje || "No se pudo enviar.");
      setEnviado(true);
      setForm(VACIO);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="pqrs-page">
        <div className="pqrs-card">
          <h1>Inicia sesión para continuar</h1>
          <p>Necesitamos tu cuenta para atender tu solicitud.</p>
          <Link to="/auth">Iniciar sesión</Link>
        </div>
      </main>
    );
  }

  if (enviado) {
    return (
      <main className="pqrs-page">
        <div className="pqrs-card">
          <h1>¡Recibimos tu mensaje!</h1>
          <p>Te responderemos al correo que nos diste.</p>
          <button type="button" onClick={() => setEnviado(false)}>
            Enviar otro
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pqrs-page">
      <div className="pqrs-card">
        <h1>Peticiones, quejas, reclamos y sugerencias</h1>
        <p>Cuéntanos qué pasó y lo revisaremos.</p>

        <form onSubmit={enviar}>
          <label>
            Tipo
            <select name="tipo" value={form.tipo} onChange={cambiar}>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nombre
            <input name="nombre" value={form.nombre} onChange={cambiar} required />
          </label>
          <label>
            Correo
            <input type="email" name="email" value={form.email} onChange={cambiar} required />
          </label>
          <label>
            Teléfono
            <input name="telefono" value={form.telefono} onChange={cambiar} />
          </label>
          <label>
            Código de pedido (opcional)
            <input name="pedido_codigo" value={form.pedido_codigo} onChange={cambiar} />
          </label>
          <label>
            Asunto
            <input name="asunto" value={form.asunto} onChange={cambiar} required />
          </label>
          <label>
            Mensaje
            <textarea name="mensaje" rows={5} value={form.mensaje} onChange={cambiar} required />
          </label>

          {error && <p className="pqrs-error">{error}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}