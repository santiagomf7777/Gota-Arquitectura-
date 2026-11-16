import { useEffect, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const moneda = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

function fecha(valor) {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Clientes() {
  const { request } = useAdminApi();

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const datos = await request("/clientes");
        if (activo) setClientes(datos);
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [request]);

  const termino = busqueda.trim().toLowerCase();
  const visibles = clientes.filter((c) =>
    [c.nombre, c.email, c.telefono]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(termino))
  );

  const conCompras = clientes.filter((c) => Number(c.pedidos) > 0).length;
  const totalVendido = clientes.reduce(
    (suma, c) => suma + Number(c.total_comprado || 0),
    0
  );

  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Gestión</p>
          <h1>Clientes</h1>
        </div>
      </header>

      <div className="ap-cards">
        <div className="ap-card">
          <span className="ap-card__label">Clientes registrados</span>
          <strong className="ap-card__value">{clientes.length}</strong>
        </div>
        <div className="ap-card">
          <span className="ap-card__label">Con compras</span>
          <strong className="ap-card__value">{conCompras}</strong>
        </div>
        <div className="ap-card">
          <span className="ap-card__label">Total comprado</span>
          <strong className="ap-card__value">{moneda(totalVendido)}</strong>
        </div>
      </div>

      <div className="ap-panel">
        <div className="ap-toolbar">
          <input
            type="search"
            className="ap-input"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar clientes"
          />
        </div>

        {cargando && <p className="ap-empty">Cargando clientes...</p>}
        {error && <p className="ap-error">{error}</p>}

        {!cargando && !error && visibles.length === 0 && (
          <p className="ap-empty">No hay clientes que coincidan.</p>
        )}

        {!cargando && !error && visibles.length > 0 && (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th className="ap-num">Pedidos</th>
                  <th className="ap-num">Total comprado</th>
                  <th>Último pedido</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((c) => (
                  <tr key={c.id}>
                    <td className="ap-strong">{c.nombre}</td>
                    <td>{c.email}</td>
                    <td>{c.telefono || "—"}</td>
                    <td className="ap-num">{c.pedidos}</td>
                    <td className="ap-num">{moneda(c.total_comprado)}</td>
                    <td>{fecha(c.ultimo_pedido)}</td>
                    <td>{fecha(c.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Clientes;