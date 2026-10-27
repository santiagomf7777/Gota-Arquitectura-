import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
  } = useCart();
const { isAuthenticated } = useAuth();
const navigate = useNavigate();

function handleCheckout() {
  if (!isAuthenticated) {
    navigate("/auth", { state: { from: "/checkout" } });
    return;
  }
  navigate("/checkout");
}
  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <p className="cart-eyebrow">GOTA PERFUMERÍA</p>

          <h1>Tu carrito está vacío</h1>

          <p>
            Descubre nuestra colección y encuentra una fragancia
            que vaya contigo.
          </p>

          <Link to="/" className="continue-shopping">
            Explorar perfumes
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-header">
        <p className="cart-eyebrow">GOTA PERFUMERÍA</p>
        <h1>Tu carrito</h1>
        <p>
          Revisa tus productos antes de continuar con tu compra.
        </p>
      </section>

      <section className="cart-content">

        <div className="cart-products">

          {cart.map((item) => (
            <article className="cart-item"key={item.variante_id}>

              <div className="cart-item-image">
                {item.imagen_url ? (
                  <img
                    src={`/src/assets/${item.imagen_url}`}
                    alt={item.nombre}
                  />
                ) : (
                  <span>GOTA</span>
                )}
              </div>

              <div className="cart-item-info">

                <p className="cart-item-brand">
                  {item.marca}
                </p>

                <h2>{item.nombre}</h2>

               <p>
  {item.tipo === "DECANT" ? "Decant · " : ""}
  {item.tamano_ml} ml
</p>

                <strong>
                  ${Number(item.precio).toLocaleString("es-CO")}
                </strong>

              </div>

              <div className="cart-item-actions">

                <div className="quantity-control">

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.variante_id,
                        item.cantidad - 1
                      )
                    }
                  >
                    −
                  </button>

                  <span>{item.cantidad}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.variante_id,
                        item.cantidad + 1
                      )
                    }
                  >
                    +
                  </button>

                </div>

                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeFromCart(item.variante_id)}
                >
                  Eliminar
                </button>

              </div>

              <div className="cart-item-subtotal">
                $
                {(
                  Number(item.precio) * item.cantidad
                ).toLocaleString("es-CO")}
              </div>

            </article>
          ))}

          <button
            type="button"
            className="clear-cart"
            onClick={clearCart}
          >
            Vaciar carrito
          </button>

        </div>

        <aside className="cart-summary">

          <h2>Resumen de compra</h2>

          <div className="summary-row">
            <span>Subtotal</span>

            <strong>
              ${total.toLocaleString("es-CO")}
            </strong>
          </div>

          <div className="summary-row">
            <span>Envío</span>
            <span>Se calculará después</span>
          </div>

          <div className="summary-total">
            <span>Total</span>

            <strong>
              ${total.toLocaleString("es-CO")}
            </strong>
          </div>

         <button
  type="button"
  className="checkout-button"
  onClick={handleCheckout}
>
  Continuar con la compra
</button>

          <Link
            to="/"
            className="continue-link"
          >
            ← Seguir comprando
          </Link>

        </aside>

      </section>
    </main>
  );
}

export default Cart;