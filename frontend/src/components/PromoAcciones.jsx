import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./PromoAcciones.css";

const detener = (e) => e.stopPropagation();

export default function PromoAcciones({ promo, mostrarVer = true }) {
  const { agregarPromo } = useCart();
  const [agregado, setAgregado] = useState(false);

  // Los regalos los agrega el servidor; el cliente solo agrega lo que compra
  const items = (promo.items || []).filter((i) => !i.es_regalo);
  const esCombo = promo.tipo === "COMBO";

  // Un descuento con varios perfumes no se agrega completo: el cliente debe elegir
  const puedeAgregar = items.length > 0 && (esCombo || items.length === 1);

  useEffect(() => {
    if (!agregado) return;
    const timer = setTimeout(() => setAgregado(false), 2000);
    return () => clearTimeout(timer);
  }, [agregado]);

  function handleAgregar() {
    if (!puedeAgregar) return;
    agregarPromo(items);
    setAgregado(true);
  }

  return (
    <div className="promo-acciones" onClick={detener} onKeyDown={detener}>
      {puedeAgregar && (
        <button type="button" className="promo-add" onClick={handleAgregar}>
          {agregado ? "✓ Agregado al carrito" : "Agregar al carrito"}
        </button>
      )}

      {mostrarVer && (
        <Link to="/perfumes" className="promo-link">
          Ver perfumes →
        </Link>
      )}
    </div>
  );
}