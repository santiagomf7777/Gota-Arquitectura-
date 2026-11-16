import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const moneda = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

// Fecha local en formato YYYY-MM-DD
const aTexto = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const hacePorDias = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return aTexto(d);
};

const RANGOS = [
  { dias: 7, etiqueta: "7 días" },
  { dias: 30, etiqueta: "30 días" },
  { dias: 90, etiqueta: "90 días" },
];

function Reportes() {
  const { request } = useAdminApi();

  const [desde, setDesde] = useState(hacePorDias(30));
  const [hasta, setHasta] = useState(aTexto(new Date()));
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await request(
        `/reportes?desde=${desde}&hasta=${hasta}`
      );
      setDatos(respuesta);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [request, desde, hasta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const maxVentaDia = Math.max(1, ...(datos?.por_dia || []).map((d) => d.ventas));

  function exportarCSV() {
    if (!datos) return;

    const filas = [
      ["Fecha", "Pedidos", "Ventas"],
      ...datos.por_dia.map((d) => [d.dia, d.pedidos, d.ventas]),
    ];
    const contenido = filas.map((f) => f.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `ventas_${datos.desde}_${datos.hasta}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Análisis</p>
          <h1>Reportes</h1>
          <p className="ap-sub">Las ventas excluyen pedidos cancelados.</p>
        </div>
        <button
          type="button"
          className="ap-btn"
          onClick={exportarCSV}
          disabled={!datos || datos.por_dia.length === 0}
        >
          Exportar ventas (CSV)
        </button>
      </header>

      <div className="ap-panel">
        <div className="ap-toolbar ap-toolbar--row">
          <div className="ap-chips">
            {RANGOS.map((r) => (
              <button
                key={r.dias}
                type="button"
                className="ap-chip"
                onClick={() => {
                  setDesde(hacePorDias(r.dias));
                  setHasta(aTexto(new Date()));
                }}
              >
                {r.etiqueta}
              </button>
            ))}
          </div>

          <label className="ap-sub">
            Desde{" "}
            <input type="date" className="ap-input" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </label>
          <label className="ap-sub">
            Hasta{" "}
            <input type="date" className="ap-input" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </label>
        </div>

        {error && <p className="ap-error">{error}</p>}
        {cargando && !datos && <p className="ap-empty">Generando reporte...</p>}
      </div>

      {datos && (
        <>
          <div className="ap-cards">
            <div className="ap-card">
              <span className="ap-card__label">Ventas del periodo</span>
              <strong className="ap-card__value">{moneda(datos.resumen.ventas)}</strong>
              <span className="ap-card__hint">Sin cancelados</span>
            </div>
            <div className="ap-card">
              <span className="ap-card__label">Pedidos</span>
              <strong className="ap-card__value">{datos.resumen.pedidos}</strong>
              <span className="ap-card__hint">En el periodo</span>
            </div>
            <div className="ap-card">
              <span className="ap-card__label">Ticket promedio</span>
              <strong className="ap-card__value">{moneda(datos.resumen.ticket_promedio)}</strong>
              <span className="ap-card__hint">Por pedido</span>
            </div>
            <div className="ap-card ap-card--warn">
              <span className="ap-card__label">Sin movimiento</span>
              <strong className="ap-card__value">{datos.sin_movimiento.length}</strong>
              <span className="ap-card__hint">Con stock y sin ventas</span>
            </div>
          </div>

          <div className="ap-panel">
            <div className="ap-panel__head">
              <h2>Ventas por día</h2>
              <span className="ap-sub">{datos.por_dia.length} día(s) con ventas</span>
            </div>

            {datos.por_dia.length === 0 ? (
              <p className="ap-empty">No hubo ventas en este periodo.</p>
            ) : (
              <div className="ap-bars">
                {datos.por_dia.map((d) => (
                  <div key={d.dia} className="ap-bar" title={`${d.dia}: ${moneda(d.ventas)} (${d.pedidos} pedido(s))`}>
                    <span
                      className="ap-bar__fill"
                      style={{ height: `${(d.ventas / maxVentaDia) * 100}%` }}
                    />
                    <span className="ap-bar__label">{d.dia.slice(8, 10)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ap-grid-2">
            <div className="ap-panel">
              <div className="ap-panel__head">
                <h2>Más vendidos</h2>
              </div>
              {datos.top_productos.length === 0 ? (
                <p className="ap-empty">Sin ventas en el periodo.</p>
              ) : (
                <ul className="ap-list">
                  {datos.top_productos.map((t, i) => (
                    <li key={`${t.id}-${t.tipo}-${t.tamano_ml}`} className="ap-list__item">
                      <span>
                        <strong className="ap-strong">
                          {i + 1}. {t.nombre}
                        </strong>
                        <span className="ap-sub">
                          {t.tipo === "DECANT" ? "Decant" : "Frasco"} · {t.tamano_ml} ml · {t.unidades} und.
                        </span>
                      </span>
                      <span className="ap-num">{moneda(t.ingresos)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="ap-panel">
              <div className="ap-panel__head">
                <h2>Sin movimiento</h2>
                <span className="ap-sub">Stock disponible, sin ventas</span>
              </div>
              {datos.sin_movimiento.length === 0 ? (
                <p className="ap-empty">Todo el stock tuvo movimiento.</p>
              ) : (
                <ul className="ap-list">
                  {datos.sin_movimiento.map((s) => (
                    <li key={s.id} className="ap-list__item">
                      <span>
                        <strong className="ap-strong">{s.nombre}</strong>
                        <span className="ap-sub">
                          {s.tipo === "DECANT" ? "Decant" : "Frasco"} · {s.tamano_ml} ml
                        </span>
                      </span>
                      <span className="ap-num">{s.stock_actual} und.</span>
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

export default Reportes;