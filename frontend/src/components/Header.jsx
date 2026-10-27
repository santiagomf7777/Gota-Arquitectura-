import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { cartCount } = useCart();
  const { isAuthenticated, isAdmin, auth, logout } = useAuth();
  const navigate = useNavigate();

  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [termino, setTermino] = useState("");

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleBuscar(event) {
    event.preventDefault();

    if (termino.trim() === "") return;

    navigate(
      `/perfumes?search=${encodeURIComponent(termino.trim())}`
    );

    setBusquedaAbierta(false);
    setTermino("");
  }

  return (
    <header className="site-header">

      <Link to="/" className="header-logo">
        GOTA PERFUMERÍA
      </Link>

      <div className="header-right">

        {busquedaAbierta ? (
          <form
            className="header-search-form"
            onSubmit={handleBuscar}
          >
            <input
              type="text"
              autoFocus
              placeholder="Buscar perfume o marca..."
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              onBlur={() => {
                if (termino.trim() === "") {
                  setBusquedaAbierta(false);
                }
              }}
            />

           <button
  type="submit"
  className="header-search-submit"
  aria-label="Buscar"
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
</button>
          </form>

        ) : (

          <button
  type="button"
  className="header-search-icon"
  onClick={() => setBusquedaAbierta(true)}
  aria-label="Buscar"
>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
</button>

        )}

        {isAdmin && (
          <Link
            to="/admin"
            className="header-admin-link"
          >
            Panel de administración
          </Link>
        )}

        {isAuthenticated ? (
          <div className="header-session">

            <span className="header-user">
              Hola, {auth.usuario.nombre.split(" ")[0]}
            </span>

            <button
              type="button"
              className="header-logout"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>

          </div>

        ) : (

          <Link
            to="/auth"
            className="header-login"
          >
            Iniciar sesión
          </Link>

        )}

       <Link
  to="/carrito"
  className="header-cart-link"
  aria-label="Carrito de compras"
>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="18" cy="20" r="1.2" />
  </svg>

  {cartCount > 0 && (
    <span className="cart-badge">{cartCount}</span>
  )}
</Link>

      </div>

    </header>
  );
}

export default Header;