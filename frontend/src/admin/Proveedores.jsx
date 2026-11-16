import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "../api/adminApi";
import "./AdminPages.css";

const VACIO = {
  nombre_empresa: "",
  ciudad: "",
  contacto: "",
  telefono: "",
  email: "",
};

function Proveedores() {
  const { request } = useAdminApi();

  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [modal, setModal] = useState(null); // null | { id?: number }
  const [form, setForm] = useState(VACIO);
  const [errorForm, setErrorForm] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setProveedores(await request("/proveedores"));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [request]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Cerrar el formulario con Esc
  useEffect(() => {
    if (!modal) return undefined;
    const alPresionar = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [modal]);

  function abrirNuevo() {
    setForm(VACIO);
    setErrorForm("");
    setModal({});
  }

  function abrirEditar(p) {
    setForm({
      nombre_empresa: p.nombre_empresa || "",
      ciudad: p.ciudad || "",
      contacto: p.contacto || "",
      telefono: p.telefono || "",
      email: p.email || "",
    });
    setErrorForm("");
    setModal({ id: p.id });
  }

  function cambiar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(event) {
    event.preventDefault();
    setGuardando(true);
    setErrorForm("");

    try {
      if (modal.id) {
        await request(`/proveedores/${modal.id}`, { method: "PUT", body: form });
      } else {
        await request("/proveedores", { method: "POST", body: form });
      }
      setModal(null);
      await cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(p) {
    if (!window.confirm(`¿Eliminar al proveedor "${p.nombre_empresa}"?`)) return;

    try {
      await request(`/proveedores/${p.id}`, { method: "DELETE" });
      await cargar();
    } catch (err) {
      window.alert(err.message);
    }
  }

  const termino = busqueda.trim().toLowerCase();
  const visibles = proveedores.filter((p) =>
    [p.nombre_empresa, p.ciudad, p.contacto, p.email]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(termino))
  );

  return (
    <section className="ap">
      <header className="ap-header">
        <div>
          <p className="ap-eyebrow">Gestión</p>
          <h1>Proveedores</h1>
        </div>

        <button type="button" className="ap-btn ap-btn--primary" onClick={abrirNuevo}>
          + Nuevo proveedor
        </button>
      </header>

      <div className="ap-cards">
        <div className="ap-card">
          <span className="ap-card__label">Proveedores</span>
          <strong className="ap-card__value">{proveedores.length}</strong>
        </div>
        <div className="ap-card">
          <span className="ap-card__label">Sin productos</span>
          <strong className="ap-card__value">
            {proveedores.filter((p) => Number(p.productos) === 0).length}
          </strong>
        </div>
      </div>

      <div className="ap-panel">
        <div className="ap-toolbar">
          <input
            type="search"
            className="ap-input"
            placeholder="Buscar por empresa, ciudad, contacto o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar proveedores"
          />
        </div>

        {cargando && <p className="ap-empty">Cargando proveedores...</p>}
        {error && <p className="ap-error">{error}</p>}

        {!cargando && !error && visibles.length === 0 && (
          <p className="ap-empty">No hay proveedores que coincidan.</p>
        )}

        {!cargando && !error && visibles.length > 0 && (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Ciudad</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th className="ap-num">Productos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id}>
                    <td className="ap-strong">{p.nombre_empresa}</td>
                    <td>{p.ciudad || "—"}</td>
                    <td>{p.contacto || "—"}</td>
                    <td>{p.telefono || "—"}</td>
                    <td>{p.email || "—"}</td>
                    <td className="ap-num">{p.productos}</td>
                    <td className="ap-actions">
                      <button type="button" className="ap-link" onClick={() => abrirEditar(p)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="ap-link ap-link--danger"
                        onClick={() => eliminar(p)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="ap-overlay" onMouseDown={() => setModal(null)}>
          <form
            className="ap-modal"
            role="dialog"
            aria-label={modal.id ? "Editar proveedor" : "Nuevo proveedor"}
            onMouseDown={(e) => e.stopPropagation()}
            onSubmit={guardar}
          >
            <h2>{modal.id ? "Editar proveedor" : "Nuevo proveedor"}</h2>

            <label>
              Empresa *
              <input
                className="ap-input"
                value={form.nombre_empresa}
                onChange={(e) => cambiar("nombre_empresa", e.target.value)}
                maxLength={100}
                required
                autoFocus
              />
            </label>

            <div className="ap-grid-2">
              <label>
                Ciudad
                <input
                  className="ap-input"
                  value={form.ciudad}
                  onChange={(e) => cambiar("ciudad", e.target.value)}
                  maxLength={100}
                />
              </label>

              <label>
                Contacto
                <input
                  className="ap-input"
                  value={form.contacto}
                  onChange={(e) => cambiar("contacto", e.target.value)}
                  maxLength={100}
                />
              </label>
            </div>

            <div className="ap-grid-2">
              <label>
                Teléfono
                <input
                  className="ap-input"
                  value={form.telefono}
                  onChange={(e) => cambiar("telefono", e.target.value)}
                  maxLength={20}
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  className="ap-input"
                  value={form.email}
                  onChange={(e) => cambiar("email", e.target.value)}
                  maxLength={120}
                />
              </label>
            </div>

            {errorForm && <p className="ap-error">{errorForm}</p>}

            <div className="ap-modal__actions">
              <button type="button" className="ap-btn" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="submit" className="ap-btn ap-btn--primary" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Proveedores;