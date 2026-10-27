import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import "./Catalog.css";

function Catalog() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("Todas");
  const [brand, setBrand] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mantiene el buscador sincronizado con la URL (?search=...)
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = [
    "Todas",
    ...new Set(
      products.map((product) => product.categoria).filter(Boolean)
    ),
  ];

  const brands = [
    "Todas",
    ...new Set(
      products.map((product) => product.marca).filter(Boolean)
    ),
  ];

  const filteredProducts = products.filter((product) => {
    const termino = search.toLowerCase();

    const matchesSearch =
      product.nombre?.toLowerCase().includes(termino) ||
      product.marca?.toLowerCase().includes(termino);

    const matchesCategory =
      category === "Todas" || product.categoria === category;

    const matchesBrand =
      brand === "Todas" || product.marca === brand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (loading) {
    return (
      <div className="catalog-message">
        <h2>Cargando catálogo...</h2>
        <p>Estamos buscando nuestros perfumes.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-message error">
        <h2>Algo salió mal</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main className="catalog-page">
      <section className="catalog-header">
        <p className="catalog-eyebrow">GOTA PERFUMERÍA</p>

        <h1>Descubre tu esencia</h1>

        <p>
          Explora nuestra colección de perfumes árabes, de diseñador y
          fragancias exclusivas.
        </p>
      </section>

      <section className="catalog-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar perfume o marca..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
        >
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </section>

      <div className="catalog-results">
        <p>
          Mostrando <strong>{filteredProducts.length}</strong> perfumes
        </p>
      </div>

      <section className="products-grid">
        {filteredProducts.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-image">
              {product.imagen_url ? (
                <img
                  src={product.imagen_url}
                  alt={product.nombre}
                />
              ) : (
                <div className="image-placeholder">
                  <span>GOTA</span>
                </div>
              )}
            </div>

            <div className="product-info">
              <p className="product-brand">
                {product.marca || "Marca"}
              </p>

              <h2>{product.nombre}</h2>

              <p className="product-category">
                {product.categoria || "Fragancia"}
              </p>

              <div className="product-details">
                <span>{product.tamano_ml} ml</span>

                <span>
                  Stock: {product.stock_actual}
                </span>
              </div>

              <p className="product-price">
                ${Number(product.precio).toLocaleString("es-CO")}
              </p>

              <Link
                to={`/perfumes/${product.id}`}
                className="product-button"
              >
                Ver producto
              </Link>
            </div>
          </article>
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <div className="catalog-message">
          <h2>No encontramos perfumes</h2>
          <p>Prueba con otro nombre, marca o categoría.</p>
        </div>
      )}
    </main>
  );
}

export default Catalog;