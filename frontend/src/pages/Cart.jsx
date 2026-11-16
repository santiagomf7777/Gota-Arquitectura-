import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
}

function Cart() {
  const {
    cart,
    resumen,
    errorCarrito,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Cantidad de productos que el cliente agregó (los regalos no cuentan)
  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.cantidad || 0),
    0
  );

  // Las líneas que se muestran vienen del servidor (precios, promos y regalos)
  const lineas = resumen.items;
  const calculando = cart.length > 0 && lineas.length === 0 && !errorCarrito;

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  }

  function handleImageError(event) {
    event.currentTarget.style.display = "none";
    event.currentTarget.parentElement.classList.add("image-error");
  }

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <p className="cart-eyebrow">GOTA PERFUMERÍA</p>
          <h1>Tu carrito está vacío</h1>
          <p>
            Descubre nuestra colección y encuentra una fragancia que vaya contigo.
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
        <p>Revisa tus productos antes de continuar con tu compra.</p>
        <span className="cart-items-count">
          {totalItems} {totalItems === 1 ? "producto" : "productos"}
        </span>
      </section>

      <section className="cart-content">
        <div className="cart-products">
          {errorCarrito && (
            <p className="cart-error" role="alert">
              {errorCarrito}
            </p>
          )}

          {calculando && (
            <p className="cart-loading">Calculando tu carrito...</p>
          )}

          {lineas.map((item) => (
            <article
              className={`cart-item${item.regalo ? " is-gift" : ""}`}
              key={`${item.regalo ? "regalo" : "compra"}-${item.variante_id}`}
            >
              <div className="cart-item-image">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    onError={handleImageError}
                  />
                ) : null}
                <span className="cart-image-fallback">GOTA</span>
              </div>

              <div className="cart-item-info">
                <p className="cart-item-brand">{item.marca}</p>
                <h2>{item.nombre}</h2>
                <p className="cart-item-presentation">
                  {item.tipo === "DECANT" ? "Decant · " : ""}
                  {item.tamano_ml} ml
                </p>

                <div className="cart-unit-price">
                  <span>
                    {item.regalo ? "Regalo de promoción" : "Precio unitario"}
                  </span>
                  {item.precio_original > 0 &&
                    item.precio !== item.precio_original && (
                      <s className="cart-price-original">
                        {formatPrice(item.precio_original)}
                      </s>
                    )}
                  <strong>
                    {item.regalo ? "Gratis" : formatPrice(item.precio)}
                  </strong>
                </div>
              </div>

              {!item.regalo && (
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Disminuir cantidad de ${item.nombre}`}
                      disabled={Number(item.cantidad) <= 1}
                      onClick={() =>
                        updateQuantity(item.variante_id, Number(item.cantidad) - 1)
                      }
                    >
                      −
                    </button>

                    <span>{item.cantidad}</span>

                    <button
                      type="button"
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                      onClick={() =>
                        updateQuantity(item.variante_id, Number(item.cantidad) + 1)
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
              )}

              <div className="cart-item-subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(item.subtotal)}</strong>
              </div>
            </article>
          ))}

          <button type="button" className="clear-cart" onClick={clearCart}>
            Vaciar carrito
          </button>
        </div>

        <aside className="cart-summary">
          <p className="summary-eyebrow">TU PEDIDO</p>
          <h2>Resumen de compra</h2>

          <div className="summary-row">
            <span>Productos ({totalItems})</span>
            <strong>{formatPrice(resumen.subtotal)}</strong>
          </div>

          {resumen.combos.map((c) => (
            <div className="summary-row summary-promo" key={c.promocion_id}>
              <span>{c.nombre}</span>
              <span className="shipping-pending">
                Regalo incluido · ahorras {formatPrice(c.ahorro)}
              </span>
            </div>
          ))}

          <div className="summary-row">
            <span>Envío</span>
            <span className="shipping-pending">Se calculará después</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(resumen.total)}</strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={handleCheckout}
            disabled={calculando || Boolean(errorCarrito)}
          >
            Continuar con la compra
          </button>

          <Link to="/" className="continue-link">
            ← Seguir comprando
          </Link>

          <div className="summary-security">
            <span>Compra en GOTA PERFUMERÍA</span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Cart;