import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">
            GOTA <em>Perfumería</em>
          </span>
          <p>Perfumes árabes, de diseñador y fragancias exclusivas.</p>
        </div>

        <nav className="footer-links" aria-label="Enlaces del sitio">
          <Link to="/perfumes">Catálogo</Link>
          <Link to="/carrito">Carrito</Link>
          <Link to="/auth">Iniciar sesión</Link>
        </nav>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} GOTA Perfumería. Todos los derechos
        reservados.
      </p>
    </footer>
  );
}

export default Footer;