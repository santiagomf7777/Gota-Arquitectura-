import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const moneda = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

const fecha = (f) =>
  f
    ? new Date(f).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const ESTADOS = [
  { clave: "PENDIENTE", etiqueta: "Pendiente", clase: "bajo" },
  { clave: "PAGADO", etiqueta: "Pagado", clase: "normal" },
  { clave: "ENVIADO", etiqueta: "Enviado", clase: "normal" },
  { clave: "ENTREGADO", etiqueta: "Entregado", clase: "normal" },
  { clave: "CANCELADO", etiqueta: "Cancelado", clase: "sin" },
];

// Siguiente paso lógico para cada estado
const SIGUIENTE = {
  PENDIENTE: "PAGADO",
  PAGADO: "ENVIADO",
  ENVIADO: "ENTREGADO",
};

const info = (clave) => ESTADOS.find((e) => e.clave === clave) || { etiqueta: clave, clase: "normal" };

function Pedidos() {
  const { request } = useAdminApi();

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(null);
  const [detalles, setDetalles] = useState({});
  const [ocupado, setOcupado] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const datos = await request("/pedidos");
      setItems(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [request]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const conteo = useMemo(() => {
    const c = { TODOS: items.length };
    ESTADOS.forEach((e) => (c[e.clave] = items.filter((p) => p.estado === e.clave).length));
    return c;
  }, [items]);

  const termino = busqueda.trim().toLowerCase();

  const filtrados = useMemo(
    () =>
      items.filter((p) => {
        if (filtro !== "TODOS" && p.estado !== filtro) return false;
        if (!termino) return true;
        return [p.id, p.cliente, p.email].some((c) =>
          String(c ?? "").toLowerCase().includes(termino)
        );
      }),
    [items, filtro, termino]
  );

  async function verDetalle(pedido) {
    if (abierto === pedido.id) {
      setAbierto(null);
      return;
    }
    setAbierto(pedido.id);

    if (detalles[pedido.id]) return;
    try {
      const datos = await request(`/pedidos/${pedido.id}`);
      setDetalles((d) => ({ ...d, [pedido.id]: datos }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function cambiarEstado(pedido, nuevoEstado) {
    if (
      nuevoEstado === "CANCELADO" &&
      !window.confirm(`¿Cancelar el pedido #${pedido.id}? Esta acción no se puede deshacer desde el panel.`)
    ) {
      return;
    }

    setOcupado(pedido.id);
    setError("");
    setMensaje("");
    try {
      await request(`/pedidos/${pedido.id}/estado`, {
        method: "PATCH",
        body: { estado: nuevoEstado },
      });
      setItems((lista) =>
        lista.map((p) => (p.id === pedido.id ? { ...p, estado: nuevoEstado } : p))
      );
      setMensaje(`Pedido #${pedido.id} marcado como ${info(nuevoEstado).etiqueta.toLowerCase()}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Ventas</p>
          <h1>Pedidos</h1>
          <p className="ap-sub">
            {conteo.PENDIENTE} pendiente(s) por atender
          </p>
        </div>
        <button type="button" className="ap-btn" onClick={cargar} disabled={cargando}>
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      <div className="ap-panel">
        <div className="ap-tabs" role="tablist" aria-label="Estado del pedido">
          {[{ clave: "TODOS", etiqueta: "Todos" }, ...ESTADOS].map((t) => (
            <button
              key={t.clave}
              type="button"
              role="tab"
              aria-selected={filtro === t.clave}
              className={`ap-tab${filtro === t.clave ? " is-active" : ""}`}
              onClick={() => setFiltro(t.clave)}
            >
              {t.etiqueta} <span className="ap-tab__count">{conteo[t.clave]}</span>
            </button>
          ))}
        </div>

        <div className="ap-toolbar ap-toolbar--row">
          <input
            type="search"
            className="ap-input"
            placeholder="Buscar por número, cliente o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar pedidos"
          />
        </div>

        {mensaje && <p className="ap-ok">{mensaje}</p>}
        {error && <p className="ap-error">{error}</p>}
        {cargando && <p className="ap-empty">Cargando pedidos...</p>}

        {!cargando && filtrados.length === 0 && (
          <p className="ap-empty">No hay pedidos que coincidan.</p>
        )}

        {!cargando && filtrados.length > 0 && (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th className="ap-num">Artículos</th>
                  <th className="ap-num">Total</th>
                  <th>Estado</th>
                  <th className="ap-num">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const estado = info(p.estado);
                  const siguiente = SIGUIENTE[p.estado];
                  const ocupadoEste = ocupado === p.id;
                  const detalle = detalles[p.id];

                  return (
                    <Fragmento key={p.id}>
                      <tr>
                        <td>
                          <strong className="ap-strong">#{p.id}</strong>
                        </td>
                        <td>
                          <span>{p.cliente || "Sin nombre"}</span>
                          <span className="ap-sub">{p.email || "—"}</span>
                        </td>
                        <td>{fecha(p.fecha_pedido)}</td>
                        <td className="ap-num">{p.items}</td>
                        <td className="ap-num">{moneda(p.total)}</td>
                        <td>
                          <span className={`ap-badge ap-badge--${estado.clase}`}>
                            {estado.etiqueta}
                          </span>
                        </td>
                        <td className="ap-num">
                          <div className="ap-acciones">
                            <button
                              type="button"
                              className="ap-btn ap-btn--ghost"
                              onClick={() => verDetalle(p)}
                            >
                              {abierto === p.id ? "Ocultar" : "Ver"}
                            </button>

                            {siguiente && (
                              <button
                                type="button"
                                className="ap-btn"
                                disabled={ocupadoEste}
                                onClick={() => cambiarEstado(p, siguiente)}
                              >
                                Marcar {info(siguiente).etiqueta.toLowerCase()}
                              </button>
                            )}

                            {p.estado !== "CANCELADO" && p.estado !== "ENTREGADO" && (
                              <button
                                type="button"
                                className="ap-btn ap-btn--danger"
                                disabled={ocupadoEste}
                                onClick={() => cambiarEstado(p, "CANCELADO")}
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {abierto === p.id && (
                        <tr className="ap-detalle">
                          <td colSpan={7}>
                            {!detalle && <p className="ap-empty">Cargando detalle...</p>}
                            {detalle && (
                              <ul className="ap-list">
                                {detalle.items.length === 0 && (
                                  <li className="ap-empty">Este pedido no tiene artículos registrados.</li>
                                )}
                                {detalle.items.map((it, i) => (
                                  <li key={i} className="ap-list__item">
                                    <span>
                                      <strong className="ap-strong">{it.nombre || "Producto eliminado"}</strong>
                                      <span className="ap-sub">
                                        {it.tipo === "DECANT" ? "Decant" : "Frasco"} · {it.tamano_ml} ml
                                      </span>
                                    </span>
                                    <span className="ap-num">
                                      {it.cantidad} × {moneda(it.precio_unitario)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragmento>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// Fragmento sin key visible: agrupa la fila principal y la del detalle
function Fragmento({ children }) {
  return <>{children}</>;
}

export default Pedidos;