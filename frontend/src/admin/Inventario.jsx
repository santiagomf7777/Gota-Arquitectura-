import { useEffect, useMemo, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const STOCK_BAJO_POR_DEFECTO = 10;
const POR_PAGINA = 100;

const moneda = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

// Stock bajo = por debajo del mínimo de esa presentación
// (si no tiene mínimo definido, se usa 10 unidades)
function nivelDe(v) {
  const stock = Number(v.stock_actual) || 0;
  const minimo =
    Number(v.stock_minimo) > 0 ? Number(v.stock_minimo) : STOCK_BAJO_POR_DEFECTO;

  if (stock <= 0) return "sin";
  if (stock < minimo) return "bajo";
  return "normal";
}

const ETIQUETA_NIVEL = { normal: "Normal", bajo: "Stock bajo", sin: "Sin stock" };

function presentacion(v) {
  return `${v.tipo === "DECANT" ? "Decant" : "Frasco"} · ${v.tamano_ml} ml`;
}

function Inventario() {
  const { request } = useAdminApi();

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("TODO"); // TODO | FRASCO | DECANT
  const [nivel, setNivel] = useState("todos"); // todos | bajo | sin
  const [busqueda, setBusqueda] = useState("");
  const [limite, setLimite] = useState(POR_PAGINA);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const datos = await request("/inventario");
        console.log("Respuesta inventario:", datos);

        const lista = Array.isArray(datos) ? datos : datos?.inventario ?? [];
        if (activo) setItems(lista);
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

  const enriquecidos = useMemo(
    () =>
      items.map((v) => ({
        ...v,
        nivel: nivelDe(v),
        valor: Number(v.precio || 0) * Number(v.stock_actual || 0),
      })),
    [items]
  );

  const resumen = useMemo(
    () => ({
      perfumes: new Set(enriquecidos.map((v) => v.producto_id)).size,
      presentaciones: enriquecidos.length,
      bajo: enriquecidos.filter((v) => v.nivel === "bajo").length,
      sin: enriquecidos.filter((v) => v.nivel === "sin").length,
      valor: enriquecidos.reduce((suma, v) => suma + v.valor, 0),
      frascos: enriquecidos.filter((v) => v.tipo === "FRASCO").length,
      decants: enriquecidos.filter((v) => v.tipo === "DECANT").length,
    }),
    [enriquecidos]
  );

  const termino = busqueda.trim().toLowerCase();

  const filtrados = useMemo(
    () =>
      enriquecidos.filter((v) => {
        if (tab !== "TODO" && v.tipo !== tab) return false;
        if (nivel !== "todos" && v.nivel !== nivel) return false;
        if (!termino) return true;

        return [v.nombre, v.marca, v.sku].some((campo) =>
          String(campo || "").toLowerCase().includes(termino)
        );
      }),
    [enriquecidos, tab, nivel, termino]
  );

  // Al cambiar un filtro se vuelve a la primera página
  useEffect(() => {
    setLimite(POR_PAGINA);
  }, [tab, nivel, busqueda]);

  const visibles = filtrados.slice(0, limite);

  const TABS = [
    { clave: "TODO", etiqueta: "Todo", cantidad: resumen.presentaciones },
    { clave: "FRASCO", etiqueta: "Frascos", cantidad: resumen.frascos },
    { clave: "DECANT", etiqueta: "Decants", cantidad: resumen.decants },
  ];

  const NIVELES = [
    { clave: "todos", etiqueta: "Todos" },
    { clave: "bajo", etiqueta: "Stock bajo" },
    { clave: "sin", etiqueta: "Sin stock" },
  ];

  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Control de stock</p>
          <h1>Inventario</h1>
        </div>
      </header>

      <div className="ap-cards">
        <div className="ap-card">
          <span className="ap-card__label">Perfumes</span>
          <strong className="ap-card__value">{resumen.perfumes}</strong>
          <span className="ap-card__hint">{resumen.presentaciones} presentaciones</span>
        </div>

        <div className="ap-card ap-card--warn">
          <span className="ap-card__label">Stock bajo</span>
          <strong className="ap-card__value">{resumen.bajo}</strong>
          <span className="ap-card__hint">Por debajo del mínimo</span>
        </div>

        <div className="ap-card ap-card--danger">
          <span className="ap-card__label">Sin stock</span>
          <strong className="ap-card__value">{resumen.sin}</strong>
          <span className="ap-card__hint">Requieren reposición</span>
        </div>

        <div className="ap-card">
          <span className="ap-card__label">Valor del inventario</span>
          <strong className="ap-card__value">{moneda(resumen.valor)}</strong>
          <span className="ap-card__hint">Precio × stock</span>
        </div>
      </div>

      <div className="ap-panel">
        <div className="ap-tabs" role="tablist" aria-label="Tipo de presentación">
          {TABS.map((t) => (
            <button
              key={t.clave}
              type="button"
              role="tab"
              aria-selected={tab === t.clave}
              className={`ap-tab${tab === t.clave ? " is-active" : ""}`}
              onClick={() => setTab(t.clave)}
            >
              {t.etiqueta} <span className="ap-tab__count">{t.cantidad}</span>
            </button>
          ))}
        </div>

        <div className="ap-toolbar ap-toolbar--row">
          <input
            type="search"
            className="ap-input"
            placeholder="Buscar por perfume, marca o SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar en el inventario"
          />

          <div className="ap-chips">
            {NIVELES.map((n) => (
              <button
                key={n.clave}
                type="button"
                className={`ap-chip${nivel === n.clave ? " is-active" : ""}`}
                onClick={() => setNivel(n.clave)}
              >
                {n.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {cargando && <p className="ap-empty">Cargando inventario...</p>}
        {error && <p className="ap-error">{error}</p>}

        {!cargando && !error && filtrados.length === 0 && (
          <p className="ap-empty">No hay presentaciones que coincidan.</p>
        )}

        {!cargando && !error && filtrados.length > 0 && (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>SKU</th>
                    <th className="ap-num">Stock</th>
                    <th>Nivel</th>
                    <th className="ap-num">Precio</th>
                    <th className="ap-num">Valor total</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div className="ap-product">
                          <span className="ap-thumb">
                            {v.imagen_url ? (
                              <img src={v.imagen_url} alt="" loading="lazy" />
                            ) : (
                              "G"
                            )}
                          </span>
                          <span>
                            <strong className="ap-strong">{v.nombre}</strong>
                            <span className="ap-sub">{presentacion(v)}</span>
                          </span>
                        </div>
                      </td>
                      <td>{v.marca || "—"}</td>
                      <td>{v.sku || "—"}</td>
                      <td className="ap-num">{v.stock_actual}</td>
                      <td>
                        <span className={`ap-badge ap-badge--${v.nivel}`}>
                          {ETIQUETA_NIVEL[v.nivel]}
                        </span>
                      </td>
                      <td className="ap-num">{moneda(v.precio)}</td>
                      <td className="ap-num">{moneda(v.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ap-footer">
              <span>
                Mostrando {visibles.length} de {filtrados.length}
              </span>

              {visibles.length < filtrados.length && (
                <button
                  type="button"
                  className="ap-btn"
                  onClick={() => setLimite((n) => n + POR_PAGINA)}
                >
                  Ver más
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Inventario;