import { useEffect, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

function Campo({ etiqueta, ayuda, ...props }) {
  return (
    <label className="ap-field">
      <span className="ap-field__label">{etiqueta}</span>
      <input className="ap-input" {...props} />
      {ayuda && <span className="ap-sub">{ayuda}</span>}
    </label>
  );
}

function Configuracion() {
  const { request } = useAdminApi();

  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const datos = await request("/configuracion");
        if (activo) setForm(datos);
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

  function cambiar(clave, valor) {
    setForm((f) => ({ ...f, [clave]: valor }));
    setMensaje("");
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const datos = await request("/configuracion", { method: "PUT", body: form });
      setForm(datos);
      setMensaje("Configuración guardada.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Sistema</p>
          <h1>Configuración</h1>
          <p className="ap-sub">Datos generales de la tienda y reglas de operación.</p>
        </div>
      </header>

      {cargando && <p className="ap-empty">Cargando configuración...</p>}
      {error && <p className="ap-error">{error}</p>}

      {form && (
        <form className="ap-panel ap-form" onSubmit={guardar}>
          <fieldset className="ap-fieldset">
            <legend>Tienda</legend>
            <Campo
              etiqueta="Nombre de la tienda"
              value={form.tienda_nombre}
              onChange={(e) => cambiar("tienda_nombre", e.target.value)}
              maxLength={100}
              required
            />
            <Campo
              etiqueta="Correo de contacto"
              type="email"
              value={form.tienda_email}
              onChange={(e) => cambiar("tienda_email", e.target.value)}
              maxLength={120}
              ayuda="Aparece en la tienda y en los correos a clientes."
            />
            <Campo
              etiqueta="Teléfono"
              value={form.tienda_telefono}
              onChange={(e) => cambiar("tienda_telefono", e.target.value)}
              maxLength={20}
            />
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Envíos</legend>
            <Campo
              etiqueta="Costo de envío (COP)"
              type="number"
              min="0"
              step="100"
              value={form.envio_costo}
              onChange={(e) => cambiar("envio_costo", e.target.value)}
            />
            <Campo
              etiqueta="Envío gratis desde (COP)"
              type="number"
              min="0"
              step="1000"
              value={form.envio_gratis_desde}
              onChange={(e) => cambiar("envio_gratis_desde", e.target.value)}
              ayuda="Compras iguales o mayores a este monto no pagan envío. Pon 0 para desactivarlo."
            />
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Inventario</legend>
            <Campo
              etiqueta="Stock mínimo por defecto (unidades)"
              type="number"
              min="0"
              step="1"
              value={form.stock_minimo_default}
              onChange={(e) => cambiar("stock_minimo_default", e.target.value)}
              ayuda="Se usa en presentaciones que no tienen mínimo propio."
            />
          </fieldset>

          {mensaje && <p className="ap-ok">{mensaje}</p>}

          <div className="ap-acciones">
            <button type="submit" className="ap-btn" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default Configuracion;