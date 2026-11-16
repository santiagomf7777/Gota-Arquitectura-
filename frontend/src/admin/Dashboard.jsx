import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const moneda = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const fecha = (f) =>
  f ? new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) : "—";

const ETIQUETA_ESTADO = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

function Dashboard() {
  const { request } = useAdminApi();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await request("/dashboard");
      setDatos(respuesta);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [request]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Panel de control</p>
          <h1>Dashboard</h1>
          <p className="ap-sub">Resumen del negocio al día de hoy.</p>
        </div>
        <button type="button" className="ap-btn" onClick={cargar} disabled={cargando}>
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      {error && <p className="ap-error">{error}</p>}
      {cargando && !datos && <p className="ap-empty">Cargando resumen...</p>}

      {datos && (
        <>
          <div className="ap-cards">
            <div className="ap-card">
              <span className="ap-card__label">Ventas de hoy</span>
              <strong className="ap-card__value">{moneda(datos.ventas_hoy)}</strong>
              <span className="ap-card__hint">{datos.pedidos_hoy} pedido(s)</span>
            </div>

            <div className="ap-card">
              <span className="ap-card__label">Ventas del mes</span>
              <strong className="ap-card__value">{moneda(datos.ventas_mes)}</strong>
              <span className="ap-card__hint">Sin cancelados</span>
            </div>

            <div className="ap-card ap-card--warn">
              <span className="ap-card__label">Pedidos pendientes</span>
              <strong className="ap-card__value">{datos.pedidos_pendientes}</strong>
              <span className="ap-card__hint">Por atender</span>
            </div>

            <div className="ap-card">
              <span className="ap-card__label">Clientes nuevos</span>
              <strong className="ap-card__value">{datos.clientes_nuevos}</strong>
              <span className="ap-card__hint">Últimos 30 días</span>
            </div>
          </div>

          <div className="ap-grid-2">
            <div className="ap-panel">
              <div className="ap-panel__head">
                <h2>Stock que requiere atención</h2>
                <span className="ap-sub">{datos.alertas.length} presentación(es)</span>
              </div>

              {datos.alertas.length === 0 ? (
                <p className="ap-empty">Todo el inventario está por encima del mínimo.</p>
              ) : (
                <ul className="ap-list">
                  {datos.alertas.map((a) => (
                    <li key={a.id} className="ap-list__item">
                      <span>
                        <strong className="ap-strong">{a.nombre}</strong>
                        <span className="ap-sub">
                          {a.tipo === "DECANT" ? "Decant" : "Frasco"} · {a.tamano_ml} ml
                        </span>
                      </span>
                      <span className={`ap-badge ap-badge--${a.stock_actual <= 0 ? "sin" : "bajo"}`}>
                        {a.stock_actual <= 0 ? "Sin stock" : `${a.stock_actual} und.`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="ap-panel">
              <div className="ap-panel__head">
                <h2>Pedidos recientes</h2>
              </div>

              {datos.recientes.length === 0 ? (
                <p className="ap-empty">Todavía no hay pedidos.</p>
              ) : (
                <ul className="ap-list">
                  {datos.recientes.map((p) => (
                    <li key={p.id} className="ap-list__item">
                      <span>
                        <strong className="ap-strong">
                          #{p.id} · {p.cliente || "Cliente sin nombre"}
                        </strong>
                        <span className="ap-sub">
                          {fecha(p.fecha_pedido)} · {ETIQUETA_ESTADO[p.estado] || p.estado}
                        </span>
                      </span>
                      <span className="ap-num">{moneda(p.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;