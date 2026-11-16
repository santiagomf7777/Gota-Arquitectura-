import { useNavigate } from "react-router-dom";

const STOCK_BAJO = 5;

function ProductCard({ product, esAdmin = false }) {
  const navigate = useNavigate();
  const irADetalle = () => navigate(`/perfumes/${product.id}`);

  const stock = product.stock_actual;
  const tieneStock = stock !== undefined && stock !== null;

  // Funciona aunque el servidor deje de enviar el stock a los clientes:
  // en ese caso usa el campo "disponible", si existe.
  const agotado =
    product.disponible === false || (tieneStock && Number(stock) <= 0);

  return (
    <article
      className={`product-card${agotado ? " is-agotado" : ""}`}
      onClick={irADetalle}
      onKeyDown={(e) => {
        if (e.key === "Enter") irADetalle();
      }}
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <div className="product-image">
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            <span>GOTA</span>
          </div>
        )}

        {agotado && <span className="product-badge">Agotado</span>}
      </div>

      <div className="product-info">
        <p className="product-brand">{product.marca || "Marca"}</p>

        <h2 title={product.nombre}>{product.nombre}</h2>

        <p className="product-category">{product.categoria || "Fragancia"}</p>

        <div className="product-bottom">
          <div className="product-details">
            <span>{product.tamano_ml} ml</span>

            {/* El stock solo lo ve el administrador */}
            {esAdmin && tieneStock && (
              <span
                className={`product-stock${
                  Number(stock) <= STOCK_BAJO ? " is-bajo" : ""
                }`}
              >
                Stock: {stock}
              </span>
            )}
          </div>

          <p className="product-price">
            ${Number(product.precio).toLocaleString("es-CO")}
          </p>

          <button
            type="button"
            className="product-button"
            onClick={(e) => {
              e.stopPropagation();
              irADetalle();
            }}
          >
            Ver producto
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;