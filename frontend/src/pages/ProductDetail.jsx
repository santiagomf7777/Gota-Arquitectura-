import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

// Foto general de los decants: se muestra de última en la galería
const IMAGEN_DECANTS = "/Images/imagenesPerfumes/ImagenDecants.jpg";

function formatoPrecio(valor) {
  return `$${Number(valor).toLocaleString("es-CO")}`;
}

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [varianteId, setVarianteId] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [fotosFallidas, setFotosFallidas] = useState([]);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Producto no encontrado");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  // Quita el aviso "Agregado" a los 2 segundos
  useEffect(() => {
    if (!agregado) return;

    const timer = setTimeout(() => setAgregado(false), 2000);
    return () => clearTimeout(timer);
  }, [agregado]);

  if (loading) {
    return (
      <div className="pd-message">
        <h2>Cargando producto...</h2>
      </div>
    );
  }

  const variantes = product?.variantes || [];
  const porDefecto = variantes.find((v) => v.stock_actual > 0) || variantes[0];
  const seleccionada =
    variantes.find((v) => v.variante_id === varianteId) || porDefecto;

  if (error || !product || !seleccionada) {
    return (
      <div className="pd-message">
        <h2>Producto no encontrado</h2>
        <Link to="/perfumes">Volver al catálogo</Link>
      </div>
    );
  }

  const tieneDecants = variantes.some((v) => v.tipo === "DECANT");

  // Galería: frasco -> frasco con caja -> decants
  const imagenes = [
    product.imagen_url,
    product.imagen_caja_url,
    tieneDecants ? IMAGEN_DECANTS : null,
  ].filter(
    (src, i, lista) =>
      src && lista.indexOf(src) === i && !fotosFallidas.includes(src)
  );

  const indice = imagenActiva < imagenes.length ? imagenActiva : 0;
  const fotoActual = imagenes[indice];

  const marcarFallida = (src) =>
    setFotosFallidas((prev) => (prev.includes(src) ? prev : [...prev, src]));

  const irAFoto = (posicion) =>
    setImagenActiva((posicion + imagenes.length) % imagenes.length);

  const disponible = seleccionada.stock_actual > 0;
  const quedanPocas =
    disponible &&
    seleccionada.stock_minimo > 0 &&
    seleccionada.stock_actual <= seleccionada.stock_minimo;
  const esDecant = seleccionada.tipo === "DECANT";

  function handleAgregar() {
    if (!disponible) return;

    addToCart({
      id: product.id,
      variante_id: seleccionada.variante_id,
      nombre: product.nombre,
      marca: product.marca,
      categoria: product.categoria,
      imagen_url: product.imagen_url,
      tipo: seleccionada.tipo,
      tamano_ml: seleccionada.tamano_ml,
      precio: seleccionada.precio,
      stock_actual: seleccionada.stock_actual,
    });

    setAgregado(true);
  }

  return (
    <main className="pd-page">
      <div className="pd-container">
        <Link to="/perfumes" className="pd-back">
          ← Volver al catálogo
        </Link>

        <section className="pd-layout">
          <div className="pd-gallery">
            <div className="pd-image-main">
              {fotoActual ? (
                <img
                  key={fotoActual}
                  src={fotoActual}
                  alt={product.nombre}
                  onError={() => marcarFallida(fotoActual)}
                />
              ) : (
                <div className="pd-placeholder">GOTA</div>
              )}

              {imagenes.length > 1 && (
                <>
                  <button
                    type="button"
                    className="pd-arrow left"
                    onClick={() => irAFoto(indice - 1)}
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="pd-arrow right"
                    onClick={() => irAFoto(indice + 1)}
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>

                  <span className="pd-counter">
                    {indice + 1} / {imagenes.length}
                  </span>
                </>
              )}
            </div>

            {imagenes.length > 1 && (
              <div className="pd-thumbs">
                {imagenes.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={i === indice ? "active" : ""}
                    onClick={() => setImagenActiva(i)}
                    aria-label={`Ver foto ${i + 1}`}
                  >
                    <img src={src} alt="" onError={() => marcarFallida(src)} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
            <p className="pd-brand">{product.marca}</p>
            <h1 className="pd-name">{product.nombre}</h1>

            {product.categoria && (
              <div className="pd-tags">
                <span>{product.categoria}</span>
              </div>
            )}

            <p className="pd-description">{product.descripcion}</p>

            <div className="pd-section">
              <p className="pd-label">Presentación</p>

              <div className="pd-options">
                {variantes.map((v) => {
                  const agotada = v.stock_actual <= 0;
                  const activa = v.variante_id === seleccionada.variante_id;

                  return (
                    <button
                      key={v.variante_id}
                      type="button"
                      className={`pd-option${activa ? " active" : ""}${
                        agotada ? " soldout" : ""
                      }`}
                      onClick={() => setVarianteId(v.variante_id)}
                    >
                      <span className="pd-option-type">
                        {v.tipo === "DECANT" ? "Decant" : "Frasco"}
                      </span>
                      <span className="pd-option-size">{v.tamano_ml} ml</span>
                      <span className="pd-option-price">
                        {agotada ? "Agotado" : formatoPrecio(v.precio)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pd-buy">
              <div className="pd-price-row">
                <span className="pd-price">
                  {formatoPrecio(seleccionada.precio)}
                </span>

                <span
                  className={`pd-stock ${
                    !disponible ? "out" : quedanPocas ? "low" : "ok"
                  }`}
                >
                  {!disponible
                    ? "Agotado"
                    : quedanPocas
                    ? `Últimas unidades: quedan ${seleccionada.stock_actual}`
                    : "Disponible"}
                </span>
              </div>

              <button
                type="button"
                className={`pd-add${agregado ? " added" : ""}`}
                disabled={!disponible}
                onClick={handleAgregar}
              >
                {!disponible
                  ? "Presentación agotada"
                  : agregado
                  ? "✓ Agregado al carrito"
                  : "Agregar al carrito"}
              </button>

              {agregado && (
                <Link to="/carrito" className="pd-go-cart">
                  Ver carrito →
                </Link>
              )}
            </div>

            {tieneDecants && (
              <aside className="pd-decant-info">
                <strong>¿Qué es un decant?</strong>
                <p>
                  Es una porción de este mismo perfume en un frasco pequeño con
                  atomizador: ideal para probarlo antes de comprar el frasco
                  completo, o para llevarlo de viaje.
                </p>
              </aside>
            )}

            <dl className="pd-details">
              <div>
                <dt>Familia olfativa</dt>
                <dd>{product.categoria || "—"}</dd>
              </div>
              <div>
                <dt>Tamaño</dt>
                <dd>{seleccionada.tamano_ml} ml</dd>
              </div>
              <div>
                <dt>Presentación</dt>
                <dd>{esDecant ? "Decant" : "Frasco completo"}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetail;