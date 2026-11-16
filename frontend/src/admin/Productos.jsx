import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const moneda = (v) => (v == null ? "—" : `$${Number(v).toLocaleString("es-CO")}`);

const FILTROS = [
  { clave: "TODOS", etiqueta: "Todos" },
  { clave: "ACTIVO", etiqueta: "En catálogo" },
  { clave: "INACTIVO", etiqueta: "Quitados" },
];

function Productos() {
  const { request } = useAdminApi();

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(null);
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const datos = await request("/productos");
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

  const termino = busqueda.trim().toLowerCase();

  const filtrados = useMemo(
    () =>
      items.filter((p) => {
        if (filtro !== "TODOS" && p.estado !== filtro) return false;
        if (!termino) return true;
        return [p.nombre, p.marca, p.proveedor].some((c) =>
          String(c || "").toLowerCase().includes(termino)
        );
      }),
    [items, filtro, termino]
  );

  const resumen = useMemo(
    () => ({
      total: items.length,
      activos: items.filter((p) => p.estado === "ACTIVO").length,
      inactivos: items.filter((p) => p.estado === "INACTIVO").length,
    }),
    [items]
  );

  async function cambiarEstado(producto, nuevoEstado) {
    if (
      nuevoEstado === "INACTIVO" &&
      !window.confirm(
        `¿Quitar "${producto.nombre}" del catálogo? Dejará de verse en la tienda, pero se conserva su historial.`
      )
    ) {
      return;
    }

    setOcupado(producto.id);
    setError("");
    setMensaje("");
    try {
      await request(`/productos/${producto.id}/estado`, {
        method: "PATCH",
        body: { estado: nuevoEstado },
      });
      setItems((lista) =>
        lista.map((p) => (p.id === producto.id ? { ...p, estado: nuevoEstado } : p))
      );
      setMensaje(
        nuevoEstado === "INACTIVO" ? "Producto quitado del catálogo." : "Producto reactivado."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(null);
    }
  }

  async function eliminar(producto) {
    if (
      !window.confirm(
        `¿Eliminar definitivamente "${producto.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setOcupado(producto.id);
    setError("");
    setMensaje("");
    try {
      await request(`/productos/${producto.id}`, { method: "DELETE" });
      setItems((lista) => lista.filter((p) => p.id !== producto.id));
      setMensaje("Producto eliminado.");
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
          <p className="ap-eyebrow">Catálogo</p>
          <h1>Productos</h1>
          <p className="ap-sub">
            {resumen.activos} en catálogo · {resumen.inactivos} quitados
          </p>
        </div>
        <button type="button" className="ap-btn" onClick={cargar} disabled={cargando}>
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      <div className="ap-panel">
        <div className="ap-tabs" role="tablist" aria-label="Estado del producto">
          {FILTROS.map((f) => (
            <button
              key={f.clave}
              type="button"
              role="tab"
              aria-selected={filtro === f.clave}
              className={`ap-tab${filtro === f.clave ? " is-active" : ""}`}
              onClick={() => setFiltro(f.clave)}
            >
              {f.etiqueta}{" "}
              <span className="ap-tab__count">
                {f.clave === "TODOS"
                  ? resumen.total
                  : f.clave === "ACTIVO"
                  ? resumen.activos
                  : resumen.inactivos}
              </span>
            </button>
          ))}
        </div>

        <div className="ap-toolbar ap-toolbar--row">
          <input
            type="search"
            className="ap-input"
            placeholder="Buscar por perfume, marca o proveedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>

        {mensaje && <p className="ap-ok">{mensaje}</p>}
        {error && <p className="ap-error">{error}</p>}
        {cargando && <p className="ap-empty">Cargando productos...</p>}

        {!cargando && filtrados.length === 0 && (
          <p className="ap-empty">No hay productos que coincidan.</p>
        )}

        {!cargando && filtrados.length > 0 && (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Proveedor</th>
                  <th className="ap-num">Frasco</th>
                  <th className="ap-num">Decant</th>
                  <th className="ap-num">Stock</th>
                  <th>Estado</th>
                  <th className="ap-num">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const inactivo = p.estado === "INACTIVO";
                  const deshabilitado = ocupado === p.id;

                  return (
                    <tr key={p.id} className={inactivo ? "ap-row--muted" : ""}>
                      <td>
                        <div className="ap-product">
                          <span className="ap-thumb">
                            {p.imagen_url ? (
                              <img src={p.imagen_url} alt="" loading="lazy" />
                            ) : (
                              "G"
                            )}
                          </span>
                          <span>
                            <strong className="ap-strong">{p.nombre}</strong>
                            <span className="ap-sub">{p.marca || "Sin marca"}</span>
                          </span>
                        </div>
                      </td>
                      <td>{p.proveedor || "—"}</td>
                      <td className="ap-num">{moneda(p.precio_frasco)}</td>
                      <td className="ap-num">{moneda(p.precio_decant)}</td>
                      <td className="ap-num">{p.stock_total}</td>
                      <td>
                        <span
                          className={`ap-badge ${inactivo ? "ap-badge--sin" : "ap-badge--normal"}`}
                        >
                          {inactivo ? "Quitado" : "En catálogo"}
                        </span>
                      </td>
                      <td className="ap-num">
                        <div className="ap-acciones">
                          {inactivo ? (
                            <button
                              type="button"
                              className="ap-btn"
                              disabled={deshabilitado}
                              onClick={() => cambiarEstado(p, "ACTIVO")}
                            >
                              Reactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="ap-btn ap-btn--ghost"
                              disabled={deshabilitado}
                              onClick={() => cambiarEstado(p, "INACTIVO")}
                            >
                              Quitar del catálogo
                            </button>
                          )}
                          <button
                            type="button"
                            className="ap-btn ap-btn--danger"
                            disabled={deshabilitado}
                            onClick={() => eliminar(p)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
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

export default Productos;