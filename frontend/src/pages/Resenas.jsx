import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import "./Resenas.css";

const VACIO = { calificacion: 5, comentario: "" };

export default function Resenas() {
  const { isAuthenticated, auth } = useAuth();
  const token = auth?.token;

  const [resenas, setResenas] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/resenas`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setResenas)
      .catch(() => setResenas([]));
  }, []);

  async function enviar(e) {
    e.preventDefault();
    setMensaje("");
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/resenas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(datos.mensaje || "No se pudo enviar la reseña.");
      setMensaje("¡Gracias! Tu reseña se publicará después de revisarla.");
      setForm(VACIO);
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="resenas-page">
      <h1>Reseñas de clientes</h1>

      <div className="resenas-lista">
        {resenas.length === 0 && <p>Aún no hay reseñas publicadas.</p>}
        {resenas.map((r) => (
          <article key={r.id} className="resena">
            <strong>
              {"★".repeat(r.calificacion)}
              {"☆".repeat(5 - r.calificacion)}
            </strong>
            <p>{r.comentario}</p>
            <span>— {r.nombre}</span>
          </article>
        ))}
      </div>

      {!isAuthenticated ? (
        <div className="resenas-form">
          <h2>Deja tu reseña</h2>
          <p>Inicia sesión para dejar tu opinión.</p>
          <Link to="/auth">Iniciar sesión</Link>
        </div>
      ) : (
        <form onSubmit={enviar} className="resenas-form">
          <h2>Deja tu reseña</h2>
          <select
            value={form.calificacion}
            onChange={(e) => setForm({ ...form, calificacion: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrellas
              </option>
            ))}
          </select>
          <textarea
            rows={4}
            maxLength={400}
            placeholder="Cuéntanos tu experiencia"
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            required
          />
          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar reseña"}
          </button>
          {mensaje && <p>{mensaje}</p>}
        </form>
      )}
    </main>
  );
}