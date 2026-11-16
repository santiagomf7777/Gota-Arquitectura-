import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getPromociones } from "../services/promocionService";
import ProductCard from "../components/ProductCard";
import PromocionesBanner from "../components/PromocionesBanner";
import { useEsAdmin } from "../hooks/useEsAdmin";
import "./Catalog.css";

// Precio que cobra el servidor (ya incluye la promoción si aplica)
const precioDe = (p) => Number(p.precio_final ?? p.precio) || 0;

const ORDENES = {
  relevancia: { etiqueta: "Destacados", fn: null },
  precioAsc: { etiqueta: "Precio: menor a mayor", fn: (a, b) => precioDe(a) - precioDe(b) },
  precioDesc: { etiqueta: "Precio: mayor a menor", fn: (a, b) => precioDe(b) - precioDe(a) },
  nombre: {
    etiqueta: "Nombre (A–Z)",
    fn: (a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"),
  },
};

const moneda = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

function textoEtiqueta(promo) {
  if (promo.tipo === "DESCUENTO_PORCENTAJE") return `${promo.valor}% OFF`;
  if (promo.tipo === "DESCUENTO_MONTO") return `-${moneda(promo.valor)}`;
  return "Combo";
}

function Catalog() {
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("Todas");
  const [brand, setBrand] = useState("Todas");
  const [orden, setOrden] = useState("relevancia");
  const [soloPromo, setSoloPromo] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const esAdmin = useEsAdmin();

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [data, promosData] = await Promise.all([
          getProducts(),
          getPromociones().catch(() => []),
        ]);
        setProducts(data);
        setPromos(promosData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Solo para mostrar la etiqueta "Combo"; el precio no sale de aquí
  const enCombo = useMemo(
    () =>
      new Set(
        promos
          .filter((p) => p.tipo === "COMBO")
          .flatMap((p) => p.items.map((i) => i.producto_id))
      ),
    [promos]
  );

  const enPromo = useMemo(
    () => new Set(promos.flatMap((p) => p.items.map((i) => i.producto_id))),
    [promos]
  );

  const idsPromo = useMemo(() => {
    if (!promoId) return null;
    const promo = promos.find((p) => p.id === promoId);
    return new Set(promo?.items.map((i) => i.producto_id) || []);
  }, [promos, promoId]);

  const familias = useMemo(() => {
    const conteo = {};
    products.forEach((p) => {
      if (p.categoria) conteo[p.categoria] = (conteo[p.categoria] || 0) + 1;
    });
    return Object.entries(conteo).sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [products]);

  const marcas = useMemo(
    () => [
      "Todas",
      ...[...new Set(products.map((p) => p.marca).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es")
      ),
    ],
    [products]
  );

  const termino = search.trim().toLowerCase();

  const filtrados = useMemo(
    () =>
      products
        .filter((p) => {
          const coincideBusqueda =
            !termino ||
            p.nombre?.toLowerCase().includes(termino) ||
            p.marca?.toLowerCase().includes(termino) ||
            p.categoria?.toLowerCase().includes(termino);

          const coincideFamilia = category === "Todas" || p.categoria === category;
          const coincideMarca = brand === "Todas" || p.marca === brand;
          const coincidePromo = idsPromo
            ? idsPromo.has(p.id)
            : !soloPromo || enPromo.has(p.id);

          return coincideBusqueda && coincideFamilia && coincideMarca && coincidePromo;
        })
        .sort(ORDENES[orden].fn || (() => 0)),
    [products, termino, category, brand, soloPromo, enPromo, idsPromo, orden]
  );

  const hayFiltros =
    termino !== "" || category !== "Todas" || brand !== "Todas" || soloPromo || promoId !== null;

  function seleccionarPromo(promo) {
    if (promoId === promo.id) {
      setPromoId(null);
      setSoloPromo(false);
      return;
    }
    setPromoId(promo.id);
    setSoloPromo(true);
    setCategory("Todas");
    setBrand("Todas");
    setSearch("");
    document.querySelector(".catalog-toolbar")?.scrollIntoView({ behavior: "smooth" });
  }

  function limpiarFiltros() {
    setSearch("");
    setCategory("Todas");
    setBrand("Todas");
    setSoloPromo(false);
    setPromoId(null);
    setOrden("relevancia");
  }

  const cuerpo = () => {
    if (loading) {
      return (
        <section className="products-grid" aria-label="Cargando perfumes">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </section>
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

    if (filtrados.length === 0) {
      return (
        <div className="catalog-message">
          <h2>No encontramos perfumes</h2>
          <p>Prueba con otro nombre, marca o familia.</p>
          {hayFiltros && (
            <button type="button" className="catalog-clear" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      );
    }

    return (
      <section className="products-grid">
        {filtrados.map((product) => {
          const base = Number(product.precio) || 0;
          const final = precioDe(product);
          const conDescuento = Boolean(product.promo) && final < base;
          const esCombo = enCombo.has(product.id);

          let clase = "catalog-card-wrap";
          if (conDescuento) clase += " is-promo";
          else if (esCombo) clase += " is-combo";

          return (
            <div key={product.id} className={clase}>
              {conDescuento && (
                <span className="catalog-promo-tag" title={product.promo.nombre}>
                  {textoEtiqueta(product.promo)}
                </span>
              )}

              {!conDescuento && esCombo && (
                <span className="catalog-promo-tag" title="Combo disponible">
                  Combo
                </span>
              )}

              <ProductCard product={{ ...product, precio: final }} esAdmin={esAdmin} />

              {conDescuento && (
                <p className="catalog-precio-antes">Antes {moneda(base)}</p>
              )}
            </div>
          );
        })}
      </section>
    );
  };

  return (
    <main className="catalog-page">
      <section className="catalog-header">
        <p className="catalog-eyebrow">GOTA PERFUMERÍA</p>
        <h1>Descubre tu esencia</h1>
        <p>
          Explora nuestra colección de perfumes árabes, de diseñador y fragancias
          exclusivas.
        </p>
      </section>

      <PromocionesBanner
        titulo="Promociones activas"
        limite={3}
        mostrarEnlace={false}
        onSelectPromo={seleccionarPromo}
        promoActivaId={promoId}
      />

      <section className="catalog-toolbar">
        <div className="catalog-search">
          <input
            type="search"
            placeholder="Buscar perfume, marca o familia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar perfumes"
          />
          {search && (
            <button
              type="button"
              className="catalog-search__clear"
              onClick={() => setSearch("")}
              aria-label="Borrar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="catalog-selects">
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            aria-label="Filtrar por marca"
          >
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m === "Todas" ? "Todas las marcas" : m}
              </option>
            ))}
          </select>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            aria-label="Ordenar productos"
          >
            {Object.entries(ORDENES).map(([clave, o]) => (
              <option key={clave} value={clave}>
                {o.etiqueta}
              </option>
            ))}
          </select>

          <label className={`catalog-toggle${soloPromo ? " is-on" : ""}`}>
            <input
              type="checkbox"
              checked={soloPromo}
              onChange={(e) => {
                setSoloPromo(e.target.checked);
                if (!e.target.checked) setPromoId(null);
              }}
            />
            Solo en promoción
          </label>
        </div>
      </section>

      <div className="cat-chips" role="tablist" aria-label="Familias olfativas">
        <button
          type="button"
          role="tab"
          aria-selected={category === "Todas"}
          className={`cat-chip${category === "Todas" ? " is-active" : ""}`}
          onClick={() => setCategory("Todas")}
        >
          Todas <span className="cat-chip__count">{products.length}</span>
        </button>

        {familias.map(([nombre, n]) => (
          <button
            key={nombre}
            type="button"
            role="tab"
            aria-selected={category === nombre}
            className={`cat-chip${category === nombre ? " is-active" : ""}`}
            onClick={() => setCategory(nombre)}
          >
            {nombre} <span className="cat-chip__count">{n}</span>
          </button>
        ))}
      </div>

      <div className="catalog-results">
        <p>
          Mostrando <strong>{loading ? "..." : filtrados.length}</strong> perfumes
        </p>

        {hayFiltros && (
          <button type="button" className="catalog-clear" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {cuerpo()}
    </main>
  );
}

export default Catalog;