import { useEffect, useState } from "react";
import { useAdminApi } from "../api/adminApi";

export default function ResenasAdmin() {
  const { request } = useAdminApi();
  const [resenas, setResenas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    setError("");
    request("/resenas")
      .then(setResenas)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarAprobada(id, aprobada) {
    setError("");
    try {
      await request(`/resenas/${id}`, { method: "PATCH", body: { aprobada } });
      setResenas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, aprobada: aprobada ? 1 : 0 } : r))
      );
    } catch (e) {
      setError(e.message);
    }
  }

  if (cargando) return <p>Cargando reseñas...</p>;

  return (
    <section>
      <h1>Reseñas</h1>
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Calificación</th>
            <th>Comentario</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {resenas.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.fecha).toLocaleDateString("es-CO")}</td>
              <td>{r.nombre}</td>
              <td>{"★".repeat(r.calificacion)}</td>
              <td>{r.comentario}</td>
              <td>
                <button
                  type="button"
                  onClick={() => cambiarAprobada(r.id, !r.aprobada)}
                >
                  {Number(r.aprobada) ? "Aprobada (ocultar)" : "Pendiente (aprobar)"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}