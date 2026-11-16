import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";
import "./Footer.css";

const CONTACTO = {
  nombre: "GOTA Perfumería",
  email: "emendezfierro@gmail.com",
  telefono: "+57 320 898 2349",
  ciudad: "Ibagué, Tolima, Colombia",
};

export default function Footer() {
  const [tienda, setTienda] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/config/tienda`)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setTienda)
      .catch(() => setTienda({}));
  }, []);

  const nombre = tienda.tienda_nombre || CONTACTO.nombre;
  const email = tienda.tienda_email || CONTACTO.email;
  const telefono = tienda.tienda_telefono || CONTACTO.telefono;
  const anio = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Pie de página">
      <div className="site-footer__inner">
        <div className="site-footer__col">
          <span className="site-footer__brand">{nombre}</span>
          <p className="site-footer__texto">
            Perfumes árabes, de diseñador y decants. Asesoría personalizada
            para encontrar tu fragancia.
          </p>
        </div>

        <nav className="site-footer__col" aria-label="Enlaces del sitio">
          <h4>Tienda</h4>
          <Link to="/perfumes">Catálogo</Link>
          <Link to="/carrito">Carrito</Link>
          <Link to="/auth">Cuenta</Link>
          <Link to="/pqrs">PQRS y contacto</Link>
          <Link to="/resenas">Reseñas</Link>
        </nav>

        <div className="site-footer__col">
          <h4>Contacto</h4>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={`tel:${telefono.replace(/\s/g, "")}`}>{telefono}</a>
          <span className="site-footer__ciudad">{CONTACTO.ciudad}</span>
        </div>
      </div>

      <div className="site-footer__bottom">
        © {anio} {nombre}. Todos los derechos reservados.
      </div>
    </footer>
  );
}