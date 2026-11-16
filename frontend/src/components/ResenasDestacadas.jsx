import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";
import "./ResenasDestacadas.css";

export default function ResenasDestacadas({ limite = 3 }) {
  const [resenas, setResenas] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/resenas`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setResenas(data.slice(0, limite)))
      .catch(() => setResenas([]));
  }, [limite]);

  if (resenas.length === 0) return null;

  return (
    <section className="resenas-dest">
      <p className="resenas-dest__eyebrow">Lo que dicen nuestros clientes</p>
      <h2>Reseñas</h2>

      <div className="resenas-dest__grid">
        {resenas.map((r) => (
          <article key={r.id} className="resenas-dest__card">
            <strong>
              {"★".repeat(r.calificacion)}
              {"☆".repeat(5 - r.calificacion)}
            </strong>
            <p>{r.comentario}</p>
            <span>— {r.nombre}</span>
          </article>
        ))}
      </div>

      <Link to="/resenas" className="resenas-dest__link">
        Ver todas las reseñas →
      </Link>
    </section>
  );
}