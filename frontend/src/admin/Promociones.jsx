import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const moneda = (v) => (v == null || v === "" ? "—" : `$${Number(v).toLocaleString("es-CO")}`);
const etiquetaFecha = (f) => (f ? f.replace("T", " ") : "—");

const TIPOS = [
  { clave: "COMBO", etiqueta: "Combo a precio fijo" },
  { clave: "DESCUENTO_PORCENTAJE", etiqueta: "Descuento por porcentaje" },
  { clave: "DESCUENTO_MONTO", etiqueta: "Descuento en pesos" },
];

const FILTROS = ["TODAS", "VIGENTE", "PROGRAMADA", "PAUSADA", "VENCIDA"];
const CLASE_ESTADO = { VIGENTE: "normal", PROGRAMADA: "bajo", PAUSADA: "bajo", VENCIDA: "sin" };

const FORM_VACIO = {
  id: null,
  nombre: "",
  descripcion: "",
  tipo: "COMBO",
  valor: "",
  precio_combo: "",
  fecha_inicio: "",
  fecha_fin: "",
  activa: true,
  items: [],
};

const nombreTipo = (t) => TIPOS.find((x) => x.clave === t)?.etiqueta || t;

// Normaliza la respuesta de inventario. Si el backend cambia la forma, aquí se ajusta.
function normalizarCatalogo(datos) {
  const lista = Array.isArray(datos) ? datos : datos?.inventario ?? datos?.items ?? [];
  return lista.map((v) => ({
    variante_id: v.variante_id ?? v.id,
    nombre: v.nombre,
    marca: v.marca,
    sku: v.sku,
    tipo: v.tipo,
    tamano_ml: v.tamano_ml,
    precio: v.precio,
    stock_actual: v.stock_actual,
  }));
}

function resumenPromo(f) {
  const n = f.items.length;
  if (n === 0) return "Agrega al menos una presentación para ver el resumen.";

  if (f.tipo === "COMBO") {
    const partes = f.items
      .map((i) => `${i.cantidad} × ${i.nombre} ${i.tamano_ml} ml`)
      .join(" + ");
    return f.precio_combo ? `${partes} por ${moneda(f.precio_combo)}.` : `${partes}.`;
  }
  if (f.tipo === "DESCUENTO_PORCENTAJE") {
    return `${f.valor || 0}% de descuento en ${n} presentación(es).`;
  }
  return `${moneda(f.valor)} menos por unidad en ${n} presentación(es).`;
}

function Promociones() {
  const { request } = useAdminApi();

  const [items, setItems] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtro, setFiltro] = useState("TODAS");
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [busquedaCat, setBusquedaCat] = useState("");
  const [ocupado, setOcupado] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const datos = await request("/promociones");
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

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const datos = await request("/inventario");
        setCatalogo(normalizarCatalogo(datos));
      } catch {
        setCatalogo([]);
      }
    }
    cargarCatalogo();
  }, [request]);

  const conteo = useMemo(() => {
    const c = { TODAS: items.length };
    FILTROS.slice(1).forEach((e) => (c[e] = items.filter((p) => p.estado === e).length));
    return c;
  }, [items]);

  const listaFiltrada = useMemo(
    () => (filtro === "TODAS" ? items : items.filter((p) => p.estado === filtro)),
    [items, filtro]
  );

  const catalogoFiltrado = useMemo(() => {
    const t = busquedaCat.trim().toLowerCase();
    const usados = new Set((form?.items || []).map((i) => i.variante_id));

    return catalogo
      .filter((v) => !usados.has(v.variante_id))
      .filter(
        (v) =>
          !t ||
          [v.nombre, v.marca, v.sku].some((c) => String(c || "").toLowerCase().includes(t))
      )
      .slice(0, 8);
  }, [catalogo, busquedaCat, form]);

  function abrirNueva() {
    setForm({ ...FORM_VACIO, items: [] });
    setBusquedaCat("");
    setError("");
    setMensaje("");
  }

  async function editar(promo) {
    setError("");
    setMensaje("");
    try {
      const d = await request(`/promociones/${promo.id}`);
      setForm({
        id: d.id,
        nombre: d.nombre,
        descripcion: d.descripcion || "",
        tipo: d.tipo,
        valor: d.valor ?? "",
        precio_combo: d.precio_combo ?? "",
        fecha_inicio: d.fecha_inicio || "",
        fecha_fin: d.fecha_fin || "",
        activa: Boolean(d.activa),
        items: d.items.map((i) => ({
          variante_id: i.variante_id,
          cantidad: i.cantidad,
          nombre: i.nombre,
          tipo: i.tipo,
          tamano_ml: i.tamano_ml,
          precio: i.precio,
          stock_actual: i.stock_actual,
        })),
      });
      setBusquedaCat("");
    } catch (err) {
      setError(err.message);
    }
  }

  function agregarItem(v) {
    setForm((f) => ({
      ...f,
      items: [...f.items, { ...v, cantidad: 1 }],
    }));
    setBusquedaCat("");
  }

  function cambiarCantidad(varianteId, valor) {
    const n = Math.max(1, Math.floor(Number(valor) || 1));
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.variante_id === varianteId ? { ...i, cantidad: n } : i)),
    }));
  }

  function quitarItem(varianteId) {
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.variante_id !== varianteId) }));
  }

  function cambiarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");

    const body = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      tipo: form.tipo,
      valor: form.tipo === "COMBO" ? null : form.valor,
      precio_combo: form.tipo === "COMBO" ? form.precio_combo : null,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      activa: form.activa,
      items: form.items.map((i) => ({
        variante_id: i.variante_id,
        cantidad: i.cantidad,
      })),
    };

    try {
      if (form.id) {
        await request(`/promociones/${form.id}`, { method: "PUT", body });
      } else {
        await request("/promociones", { method: "POST", body });
      }
      setMensaje(form.id ? "Promoción actualizada." : "Promoción creada.");
      setForm(null);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarActiva(promo) {
    setOcupado(promo.id);
    setError("");
    setMensaje("");
    try {
      await request(`/promociones/${promo.id}/activa`, {
        method: "PATCH",
        body: { activa: !promo.activa },
      });
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(null);
    }
  }

  async function eliminar(promo) {
    if (!window.confirm(`¿Eliminar la promoción "${promo.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setOcupado(promo.id);
    setError("");
    setMensaje("");
    try {
      await request(`/promociones/${promo.id}`, { method: "DELETE" });
      setMensaje("Promoción eliminada.");
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(null);
    }
  }

  // ---------- Formulario ----------
  if (form) {
    const esCombo = form.tipo === "COMBO";

    return (
      <section className="ap">
        <header className="ap-header">
          <div>
            <p className="ap-eyebrow">Promociones</p>
            <h1>{form.id ? "Editar promoción" : "Nueva promoción"}</h1>
          </div>
          <button type="button" className="ap-btn ap-btn--ghost" onClick={() => setForm(null)}>
            Volver a la lista
          </button>
        </header>

        {error && <p className="ap-error">{error}</p>}

        <form className="ap-panel ap-form" onSubmit={guardar}>
          <div className="ap-form-grid">
            <label className="ap-field">
              <span className="ap-field__label">Nombre de la promoción</span>
              <input
                className="ap-input"
                value={form.nombre}
                onChange={(e) => cambiarCampo("nombre", e.target.value)}
                maxLength={120}
                required
              />
            </label>

            <label className="ap-field">
              <span className="ap-field__label">Tipo</span>
              <select
                className="ap-input"
                value={form.tipo}
                onChange={(e) => cambiarCampo("tipo", e.target.value)}
              >
                {TIPOS.map((t) => (
                  <option key={t.clave} value={t.clave}>
                    {t.etiqueta}
                  </option>
                ))}
              </select>
            </label>

            <label className="ap-field ap-field--full">
              <span className="ap-field__label">Descripción (opcional)</span>
              <input
                className="ap-input"
                value={form.descripcion}
                onChange={(e) => cambiarCampo("descripcion", e.target.value)}
                maxLength={255}
              />
            </label>

            {esCombo ? (
              <label className="ap-field">
                <span className="ap-field__label">Precio del combo (COP)</span>
              <input
  className="ap-input"
  type="number"
  min="1"
  step="1"
  value={form.precio_combo}
  onChange={(e) => cambiarCampo("precio_combo", e.target.value)}
  required
/>
              </label>
            ) : (
              <label className="ap-field">
                <span className="ap-field__label">
                  {form.tipo === "DESCUENTO_PORCENTAJE" ? "Porcentaje de descuento" : "Descuento por unidad (COP)"}
                </span>
                <input
                  className="ap-input"
                  type="number"
                  min="1"
                  max={form.tipo === "DESCUENTO_PORCENTAJE" ? 100 : undefined}
                  step={form.tipo === "DESCUENTO_PORCENTAJE" ? 1 : 100}
                  value={form.valor}
                  onChange={(e) => cambiarCampo("valor", e.target.value)}
                  required
                />
              </label>
            )}

            <label className="ap-field">
              <span className="ap-field__label">Inicio (opcional)</span>
              <input
                className="ap-input"
                type="datetime-local"
                value={form.fecha_inicio}
                onChange={(e) => cambiarCampo("fecha_inicio", e.target.value)}
              />
            </label>

            <label className="ap-field">
              <span className="ap-field__label">Fin (opcional)</span>
              <input
                className="ap-input"
                type="datetime-local"
                value={form.fecha_fin}
                onChange={(e) => cambiarCampo("fecha_fin", e.target.value)}
              />
            </label>

            <label className="ap-check ap-field--full">
              <input
                type="checkbox"
                checked={form.activa}
                onChange={(e) => cambiarCampo("activa", e.target.checked)}
              />
              <span>Promoción activa</span>
            </label>
          </div>

          <div className="ap-picker">
            <div className="ap-picker__head">
              <h2>{esCombo ? "Perfumes del combo" : "Presentaciones incluidas"}</h2>
              <span className="ap-sub">
                {esCombo
                  ? "Indica cuántas unidades de cada uno lleva el cliente."
                  : "Se aplica el descuento a estas presentaciones."}
              </span>
            </div>

            <input
              type="search"
              className="ap-input"
              placeholder="Buscar perfume, marca o SKU para agregar..."
              value={busquedaCat}
              onChange={(e) => setBusquedaCat(e.target.value)}
            />

            {busquedaCat.trim() && (
              <ul className="ap-list ap-picker__results">
                {catalogoFiltrado.length === 0 && (
                  <li className="ap-empty">No hay presentaciones que coincidan.</li>
                )}
                {catalogoFiltrado.map((v) => (
                  <li key={v.variante_id} className="ap-list__item">
                    <span>
                      <strong className="ap-strong">{v.nombre}</strong>
                      <span className="ap-sub">
                        {v.tipo === "DECANT" ? "Decant" : "Frasco"} · {v.tamano_ml} ml · {moneda(v.precio)}
                      </span>
                    </span>
                    <button type="button" className="ap-btn" onClick={() => agregarItem(v)}>
                      Agregar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {form.items.length === 0 ? (
              <p className="ap-empty">Todavía no has agregado presentaciones.</p>
            ) : (
              <ul className="ap-list">
                {form.items.map((i) => (
                  <li key={i.variante_id} className="ap-list__item">
                    <span>
                      <strong className="ap-strong">{i.nombre}</strong>
                      <span className="ap-sub">
                        {i.tipo === "DECANT" ? "Decant" : "Frasco"} · {i.tamano_ml} ml · stock {i.stock_actual}
                        {i.stock_actual < i.cantidad && (
                          <span className="ap-warn"> · Stock insuficiente</span>
                        )}
                      </span>
                    </span>

                    <div className="ap-acciones">
                      {esCombo && (
                        <input
                          type="number"
                          min="1"
                          className="ap-input ap-input--small"
                          value={i.cantidad}
                          onChange={(e) => cambiarCantidad(i.variante_id, e.target.value)}
                          aria-label={`Cantidad de ${i.nombre}`}
                        />
                      )}
                      <button
                        type="button"
                        className="ap-btn ap-btn--danger"
                        onClick={() => quitarItem(i.variante_id)}
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ap-preview">
            <span className="ap-eyebrow">Así se verá para el cliente</span>
            <p>{resumenPromo(form)}</p>
          </div>

          <div className="ap-acciones">
            <button type="button" className="ap-btn ap-btn--ghost" onClick={() => setForm(null)}>
              Cancelar
            </button>
            <button type="submit" className="ap-btn" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar promoción"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // ---------- Lista ----------
  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Ventas</p>
          <h1>Promociones</h1>
          <p className="ap-sub">
            {conteo.VIGENTE} vigente(s) · {conteo.PROGRAMADA} programada(s)
          </p>
        </div>
        <button type="button" className="ap-btn" onClick={abrirNueva}>
          Nueva promoción
        </button>
      </header>

      <div className="ap-panel">
        <div className="ap-tabs" role="tablist" aria-label="Estado de la promoción">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filtro === f}
              className={`ap-tab${filtro === f ? " is-active" : ""}`}
              onClick={() => setFiltro(f)}
            >
              {f === "TODAS" ? "Todas" : f.charAt(0) + f.slice(1).toLowerCase()}{" "}
              <span className="ap-tab__count">{conteo[f]}</span>
            </button>
          ))}
        </div>

        {mensaje && <p className="ap-ok">{mensaje}</p>}
        {error && <p className="ap-error">{error}</p>}
        {cargando && <p className="ap-empty">Cargando promociones...</p>}

        {!cargando && listaFiltrada.length === 0 && (
          <p className="ap-empty">No hay promociones en esta vista.</p>
        )}

        {!cargando && listaFiltrada.length > 0 && (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Promoción</th>
                  <th>Tipo</th>
                  <th className="ap-num">Presentaciones</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th className="ap-num">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((p) => {
                  const deshabilitado = ocupado === p.id;
                  return (
                    <tr key={p.id} className={p.estado === "VENCIDA" ? "ap-row--muted" : ""}>
                      <td>
                        <strong className="ap-strong">{p.nombre}</strong>
                        {p.descripcion && <span className="ap-sub">{p.descripcion}</span>}
                      </td>
                      <td>{nombreTipo(p.tipo)}</td>
                      <td className="ap-num">{p.presentaciones}</td>
                      <td>
                        <span className="ap-sub">
                          {etiquetaFecha(p.fecha_inicio)} → {etiquetaFecha(p.fecha_fin)}
                        </span>
                      </td>
                      <td>
                        <span className={`ap-badge ap-badge--${CLASE_ESTADO[p.estado] || "normal"}`}>
                          {p.estado.charAt(0) + p.estado.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="ap-num">
                        <div className="ap-acciones">
                          <button
                            type="button"
                            className="ap-btn ap-btn--ghost"
                            disabled={deshabilitado}
                            onClick={() => editar(p)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="ap-btn ap-btn--ghost"
                            disabled={deshabilitado}
                            onClick={() => cambiarActiva(p)}
                          >
                            {p.activa ? "Pausar" : "Activar"}
                          </button>
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

export default Promociones;