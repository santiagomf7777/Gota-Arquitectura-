import { Link } from "react-router-dom";
import "./FeaturedProducts.css";

function FeaturedProducts({ perfumes = [] }) {
  if (perfumes.length === 0) return null;

  return (
    <section className="featured">
      <div className="featured-header">
        <p className="featured-eyebrow">SELECCIÓN GOTA</p>
        <h2 className="featured-title">
          Fragancias para <em>descubrir</em>
        </h2>
      </div>

      <div className="featured-grid">
        {perfumes.map((p) => (
          <Link key={p.id} to={`/perfumes/${p.id}`} className="featured-card">
            <div className="featured-image">
              <img src={p.imagen_url} alt={p.nombre} />
            </div>

            <div className="featured-info">
              <span className="featured-brand">{p.marca}</span>
              <h3 className="featured-name">{p.nombre}</h3>
              <span className="featured-price">
                ${Number(p.precio).toLocaleString("es-CO")}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="featured-cta">
        <Link to="/perfumes" className="featured-link">
          VER TODO EL CATÁLOGO
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}

export default FeaturedProducts;