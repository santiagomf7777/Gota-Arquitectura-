import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import PerfumeFinder from "../components/PerfumeFinder";
import FeaturedProducts from "../components/FeaturedProducts";
import Footer from "../components/Footer";
import { getProducts } from "../services/productService";
import "./Home.css";

const HERO_CANTIDAD = 5;
const DESTACADOS_CANTIDAD = 4;

function seleccionarPerfumes(productos) {
  const vistos = new Set();

  return productos.filter((p) => {
    if (!p.imagen_url || Number(p.stock_actual) <= 0) return false;

    const clave = p.nombre.trim().toLowerCase();
    if (vistos.has(clave)) return false;

    vistos.add(clave);
    return true;
  });
}

function Home() {
  const [perfumes, setPerfumes] = useState([]);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getProducts();
        setPerfumes(seleccionarPerfumes(data));
      } catch (error) {
        console.error(error);
      }
    }

    cargar();
  }, []);

  return (
    <main className="home">
      <Hero perfumes={perfumes.slice(0, HERO_CANTIDAD)} />
      <PerfumeFinder />
      <FeaturedProducts
        perfumes={perfumes.slice(
          HERO_CANTIDAD,
          HERO_CANTIDAD + DESTACADOS_CANTIDAD
        )}
      />
      <Footer />
    </main>
  );
}

export default Home;