// src/pages/Home.jsx
import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import PromocionesBanner from "../components/PromocionesBanner";
import OcasionStrip from "../components/OcasionStrip";
import FeaturedProducts from "../components/FeaturedProducts";
import InfoTienda from "../components/InfoTienda";
import ResenasDestacadas from "../components/ResenasDestacadas";
import MarcasStrip from "../components/MarcasStrip";
import { getProducts } from "../services/productService";
import "./Home.css";

const HERO_CANTIDAD = 5;
const DESTACADOS_CANTIDAD = 4;

function seleccionarPerfumes(productos) {
  const vistos = new Set();

  return productos.filter((p) => {
    if (!p.imagen_url || Number(p.stock_actual) <= 0) return false;

    const clave = p.nombre?.trim().toLowerCase();
    if (!clave || vistos.has(clave)) return false;

    vistos.add(clave);
    return true;
  });
}

function Home() {
  const [todos, setTodos] = useState([]);
  const [perfumes, setPerfumes] = useState([]);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setTodos(data);
        setPerfumes(seleccionarPerfumes(data));
      })
      .catch((error) => console.error(error));
  }, []);

  // Marcas desde el catálogo completo, no solo los perfumes filtrados
  const marcas = [...new Set(todos.map((p) => p.marca).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es")
  );

  return (
    <main className="home">
      <Hero perfumes={perfumes.slice(0, HERO_CANTIDAD)} />

      <section className="section section--light">
        <PromocionesBanner />
      </section>

      <section className="section section--dark">
        <OcasionStrip />
      </section>

      <FeaturedProducts
        perfumes={perfumes.slice(HERO_CANTIDAD, HERO_CANTIDAD + DESTACADOS_CANTIDAD)}
      />

      <section className="section section--light">
        <InfoTienda />
      </section>

      {/* Reseñas en fondo claro: el negro queda solo para marcas y pie */}
      <section className="section section--light">
        <ResenasDestacadas limite={3} />
      </section>

      {/* Última banda antes del pie: marcas */}
      <section className="marcas-final">
        <MarcasStrip marcas={marcas} />
      </section>
    </main>
  );
}

export default Home;