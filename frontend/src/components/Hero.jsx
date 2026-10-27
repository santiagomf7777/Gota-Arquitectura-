import { useState } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero({ perfumes = [] }) {
  const [actual, setActual] = useState(0);

  const total = perfumes.length;

  if (total === 0) {
    return (
      <section className="hero">
        <div className="hero-background"></div>

        <div className="hero-fallback">
          <p className="hero-brand">GOTA PERFUMERÍA</p>
          <h2 className="hero-title">Descubre tu esencia</h2>
          <Link to="/perfumes" className="hero-primary">
            EXPLORAR COLECCIÓN
            <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  const irA = (indice) => setActual((indice + total) % total);
  const anterior = () => irA(actual - 1);
  const siguiente = () => irA(actual + 1);

  return (
    <section className="hero">
      <div className="hero-background"></div>

      <div className="hero-content">
        {perfumes.map((p, index) => (
          <article
            key={p.id}
            className={index === actual ? "hero-slide active" : "hero-slide"}
            aria-hidden={index !== actual}
          >
            <div className="hero-info">
              <div className="hero-label">
                <span></span>
                DESTACADO
              </div>

              <p className="hero-brand">{p.marca}</p>

              <h2 className="hero-title">{p.nombre}</h2>

              <div className="hero-category">
                {p.categoria}
                <span>•</span>
                Edición seleccionada
              </div>

              <p className="hero-description">{p.descripcion}</p>

              <div className="hero-price-container">
                <div>
                  <span className="hero-price-label">DESDE</span>
                  <p className="hero-price">
                    ${Number(p.precio).toLocaleString("es-CO")}
                  </p>
                </div>

                <div className="hero-meta">
                  <span>{p.tamano_ml} ML</span>
                  <span>En stock</span>
                </div>
              </div>

              <div className="hero-buttons">
                <Link to={`/perfumes/${p.id}`} className="hero-primary">
                  DESCUBRIR FRAGANCIA
                  <span>→</span>
                </Link>

                <Link to="/perfumes" className="hero-secondary">
                  EXPLORAR COLECCIÓN
                </Link>
              </div>
            </div>

            <div className="hero-image-container">
              <Link to={`/perfumes/${p.id}`} className="hero-image">
                <img src={p.imagen_url} alt={p.nombre} />
              </Link>
            </div>
          </article>
        ))}

        {total > 1 && (
          <>
            <button
              type="button"
              className="hero-arrow left"
              onClick={anterior}
              aria-label="Perfume anterior"
            >
              ←
            </button>

            <button
              type="button"
              className="hero-arrow right"
              onClick={siguiente}
              aria-label="Perfume siguiente"
            >
              →
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="hero-indicators">
          {perfumes.map((p, index) => (
            <button
              key={p.id}
              type="button"
              className={index === actual ? "active" : ""}
              onClick={() => irA(index)}
              aria-label={`Ver ${p.nombre}`}
            >
              {index === actual && (
                <span
                  key={actual}
                  className="hero-progress"
                  onAnimationEnd={siguiente}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="hero-signature">
        GOTA · CURADURÍA DE FRAGANCIAS
      </div>
    </section>
  );
}

export default Hero;