import { useEffect, useState } from "react";
import { useAdminApi } from "../api/adminApi";

const ESTADOS = ["NUEVO", "EN_PROCESO", "RESUELTO"];
const TIPOS = ["TODOS", "PETICION", "QUEJA", "RECLAMO", "SUGERENCIA"];

export default function QuejasReclamos() {
  const { request } = useAdminApi();
  const [items, setItems] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = () => {
    setCargando(true);
    setError("");
    request("/pqrs")
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id, estado) {
    try {
      await request(`/pqrs/${id}`, { method: "PATCH", body: { estado } });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, estado } : i)));
    } catch (e) {
      setError(e.message);
    }
  }

  const visibles = items.filter(
    (i) =>
      (estadoFiltro === "TODOS" || i.estado === estadoFiltro) &&
      (tipoFiltro === "TODOS" || i.tipo === tipoFiltro)
  );

  if (cargando) return <p>Cargando solicitudes...</p>;

  return (
    <section>
      <h1>Quejas y reclamos</h1>
      {error && <p className="error">{error}</p>}

      <div className="filtros">
        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{t === "TODOS" ? "Todos los tipos" : t}</option>
          ))}
        </select>

        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="TODOS">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        <button type="button" onClick={cargar}>Actualizar</button>
      </div>

      {visibles.length === 0 ? (
        <p>No hay solicitudes con esos filtros.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Asunto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((i) => (
              <tr key={i.id}>
                <td>{new Date(i.creado_en).toLocaleString("es-CO")}</td>
                <td>{i.tipo}</td>
                <td>
                  {i.nombre}
                  <br />
                  <small>{i.email}</small>
                  {i.telefono && <><br /><small>{i.telefono}</small></>}
                </td>
                <td>
                  <strong>{i.asunto}</strong>
                  <p>{i.mensaje}</p>
                  {i.pedido_codigo && <small>Pedido: {i.pedido_codigo}</small>}
                </td>
                <td>
                  <select value={i.estado} onChange={(e) => cambiarEstado(i.id, e.target.value)}>
                    {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}