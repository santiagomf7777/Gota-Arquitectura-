import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrderRequest } from "../services/orderService";
import "./Checkout.css";

// Los valores se mantienen igual que en el backend
const METODOS = [
  {
    valor: "Contraentrega",
    titulo: "Contraentrega",
    texto: "Paga al recibir tu pedido.",
  },
  {
    valor: "Transferencia",
    titulo: "Transferencia bancaria",
    texto: "Recibirás las instrucciones después de confirmar.",
  },
];

const formatPrecio = (valor) => `$${Number(valor || 0).toLocaleString("es-CO")}`;

function Checkout() {
  const { cart, resumen, errorCarrito, clearCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    observaciones: "",
    metodoPago: "Contraentrega",
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Las líneas y los totales salen del servidor, nunca del navegador
  const lineas = resumen.items;
  const calculando = cart.length > 0 && lineas.length === 0 && !errorCarrito;
  const puedeConfirmar = !enviando && !calculando && !errorCarrito && lineas.length > 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!puedeConfirmar) return;

    setError("");
    setEnviando(true);

    try {
      // Solo se envían ids y cantidades: el servidor recalcula precios y promociones
      const items = cart.map((item) => ({
        variante_id: item.variante_id,
        cantidad: item.cantidad,
      }));

      const resultado = await createOrderRequest(auth.token, {
        items,
        metodoPago: form.metodoPago,
        direccion: form.direccion,
        telefono: form.telefono,
        ciudad: form.ciudad,
        observaciones: form.observaciones,
      });

      clearCart();
      navigate("/pedido-confirmado", {
        state: { pedidoId: resultado.pedidoId, total: resultado.total },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="checkout-eyebrow">GOTA PERFUMERÍA</p>
          <h1>Tu carrito está vacío</h1>
          <p>Agrega al menos un perfume antes de continuar con la compra.</p>
          <Link to="/" className="checkout-back-button">
            Explorar perfumes
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link to="/carrito" className="checkout-back-link">
          ← Volver al carrito
        </Link>
        <p className="checkout-eyebrow">GOTA PERFUMERÍA</p>
        <h1>Finalizar compra</h1>
        <p>Completa tus datos para preparar tu pedido.</p>
      </header>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-section">
            <h2>Datos de entrega</h2>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="300 000 0000"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Calle, carrera, número..."
                autoComplete="street-address"
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="ciudad">Ciudad</label>
                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Ibagué"
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Observaciones</label>
                <input
                  id="observaciones"
                  name="observaciones"
                  type="text"
                  value={form.observaciones}
                  onChange={handleChange}
                  placeholder="Información adicional"
                />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Método de pago</h2>

            <div className="payment-options" role="radiogroup" aria-label="Método de pago">
              {METODOS.map((metodo) => {
                const activo = form.metodoPago === metodo.valor;

                return (
                  <label
                    key={metodo.valor}
                    className={`payment-option${activo ? " is-active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value={metodo.valor}
                      checked={activo}
                      onChange={handleChange}
                    />
                    <span className="payment-option__body">
                      <span className="payment-option__title">{metodo.titulo}</span>
                      <span className="payment-option__text">{metodo.texto}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {error && <p className="checkout-error">{error}</p>}

          <button
            type="submit"
            className="confirm-order-button"
            disabled={!puedeConfirmar}
          >
            {enviando ? "Procesando..." : "Confirmar pedido"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Resumen del pedido</h2>

          {errorCarrito && <p className="checkout-error">{errorCarrito}</p>}
          {calculando && <p className="checkout-note">Calculando tu pedido...</p>}

          <div className="checkout-lines">
            {lineas.map((item) => (
              <div
                key={`${item.regalo ? "regalo" : "compra"}-${item.variante_id}`}
                className={`checkout-line${item.regalo ? " checkout-line--gift" : ""}`}
              >
                <div className="checkout-line__info">
                  <span className="checkout-line__name">{item.nombre}</span>
                  <span className="checkout-line__detail">
                    {item.tipo === "DECANT"
                      ? `Decant ${item.tamano_ml} ml`
                      : `${item.tamano_ml} ml`}
                    {" · "}
                    {item.regalo
                      ? "Regalo de promoción"
                      : `${item.cantidad} × ${formatPrecio(item.precio)}`}
                  </span>
                </div>

                <span className="checkout-line__price">
                  {item.precio_original > 0 && item.precio !== item.precio_original && (
                    <s className="checkout-line__original">
                      {formatPrecio(item.precio_original)}
                    </s>
                  )}
                  {item.regalo ? "Gratis" : formatPrecio(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-row">
            <span>Productos ({cart.reduce((n, i) => n + i.cantidad, 0)})</span>
            <span>{formatPrecio(resumen.subtotal)}</span>
          </div>

          {resumen.combos.map((combo) => (
            <div className="checkout-row checkout-row--promo" key={combo.promocion_id}>
              <span>{combo.nombre}</span>
              <span>Ahorras {formatPrecio(combo.ahorro)}</span>
            </div>
          ))}

          <div className="checkout-row">
            <span>Envío</span>
            <span>Se calculará después</span>
          </div>

          <div className="checkout-total">
            <span>Total</span>
            <strong>{formatPrecio(resumen.total)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;