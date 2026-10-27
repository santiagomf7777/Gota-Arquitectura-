import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrderRequest } from "../services/orderService";
import "./Checkout.css";

function Checkout() {
  const { cart, total, clearCart } = useCart();
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const items = cart.map((item) => ({
        variante_id: item.variante_id,
        cantidad: item.cantidad,
      }));

      const orderData = {
        items,
        metodoPago: form.metodoPago,
        direccion: form.direccion,
        telefono: form.telefono,
        ciudad: form.ciudad,
        observaciones: form.observaciones,
      };

      const resultado = await createOrderRequest(auth.token, orderData);

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

          <p>
            Agrega al menos un perfume antes de continuar con la compra.
          </p>

          <Link to="/" className="checkout-back-button">
            Explorar perfumes
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">

      <div className="checkout-header">
        <Link to="/carrito" className="checkout-back-link">
          ← Volver al carrito
        </Link>

        <p className="checkout-eyebrow">
          GOTA PERFUMERÍA
        </p>

        <h1>Finalizar compra</h1>

        <p>
          Completa tus datos para preparar tu pedido.
        </p>
      </div>

      <section className="checkout-content">

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >

          <div className="checkout-section">

            <h2>Datos de entrega</h2>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre completo
                </label>

                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">
                  Teléfono
                </label>

                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="300 000 0000"
                  required
                />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="direccion">
                Dirección
              </label>

              <input
                id="direccion"
                name="direccion"
                type="text"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Calle, carrera, número..."
                required
              />
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="ciudad">
                  Ciudad
                </label>

                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Ibagué"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">
                  Observaciones
                </label>

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

          </div>

          <div className="checkout-section">

            <h2>Método de pago</h2>

            <div className="payment-options">

              <label className="payment-option">

                <input
                  type="radio"
                  name="metodoPago"
                  value="Contraentrega"
                  checked={form.metodoPago === "Contraentrega"}
                  onChange={handleChange}
                />

                <div>
                  <strong>Contraentrega</strong>
                  <span>
                    Paga al recibir tu pedido.
                  </span>
                </div>

              </label>

              <label className="payment-option">

                <input
                  type="radio"
                  name="metodoPago"
                  value="Transferencia"
                  checked={form.metodoPago === "Transferencia"}
                  onChange={handleChange}
                />

                <div>
                  <strong>Transferencia bancaria</strong>
                  <span>
                    Recibirás las instrucciones después de confirmar.
                  </span>
                </div>

              </label>

            </div>

          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button
            type="submit"
            className="confirm-order-button"
            disabled={enviando}
          >
            {enviando ? "Procesando..." : "Confirmar pedido"}
          </button>

        </form>

        <aside className="checkout-summary">

          <h2>Resumen del pedido</h2>

          <div className="checkout-products">

            {cart.map((item) => (
              <div
                className="checkout-product"
                key={item.variante_id}
              >

                <div>
                  <strong>
  {item.nombre}
  {item.tipo === "DECANT" ? ` (decant ${item.tamano_ml} ml)` : ""}
</strong>

                  <span>
                    {item.cantidad} × $
                    {Number(item.precio).toLocaleString("es-CO")}
                  </span>
                </div>

                <strong>
                  $
                  {(
                    Number(item.precio) * item.cantidad
                  ).toLocaleString("es-CO")}
                </strong>

              </div>
            ))}

          </div>

          <div className="checkout-total">

            <span>Total</span>

            <strong>
              ${total.toLocaleString("es-CO")}
            </strong>

          </div>

        </aside>

      </section>

    </main>
  );
}

export default Checkout;