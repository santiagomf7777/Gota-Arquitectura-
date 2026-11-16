// Devuelve, por producto, la promoción más conveniente y el precio final
export function calcularPrecios(products, promos) {
  const mapa = new Map();

  for (const promo of promos) {
    for (const it of promo.items) {
      const actual = mapa.get(it.producto_id);
      const info = {
        promo,
        // Para descuentos, se guarda el precio por unidad con descuento
        precioFinal: null,
        textoPromo: "",
      };

      const precioBase = Number(it.precio);
      if (promo.tipo === "DESCUENTO_PORCENTAJE") {
        info.precioFinal = Math.round(precioBase * (1 - Number(promo.valor) / 100));
        info.textoPromo = `${Number(promo.valor)}% OFF`;
      } else if (promo.tipo === "DESCUENTO_MONTO") {
        info.precioFinal = Math.max(0, precioBase - Number(promo.valor));
        info.textoPromo = `-$${Number(promo.valor).toLocaleString("es-CO")}`;
      } else {
        // COMBO: el precio no baja por unidad, se muestra como oferta
        info.precioFinal = null;
        info.textoPromo = `${promo.items.length} × ${promo.precio_combo ? "combo" : ""}`.trim();
        info.textoPromo = "Combo";
      }

      // Si ya hay una promo para este producto, se queda la de mayor descuento
      if (!actual || (info.precioFinal ?? Infinity) < (actual.precioFinal ?? Infinity)) {
        mapa.set(it.producto_id, info);
      }
    }
  }

  return mapa;
}

// src/components/PromoAcciones.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function PromoAcciones({ promo }) {
  const { agregarPromo } = useCart();
  const [agregado, setAgregado] = useState(false);

  const items = promo.items || [];
  const esCombo = promo.tipo === "COMBO";

  // Un descuento con varios perfumes no se agrega completo: el cliente debe elegir
  const puedeAgregar = esCombo || items.length === 1;

  function handleAgregar() {
    if (!puedeAgregar) return;
    agregarPromo(items);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="promo-acciones">
      {puedeAgregar && (
        <button type="button" className="promo-add" onClick={handleAgregar}>
          {agregado
            ? "✓ Agregado al carrito"
            : esCombo
            ? "Agregar combo al carrito"
            : "Agregar al carrito"}
        </button>
      )}

      <Link to="/perfumes" className="promo-link">
        Ver perfumes →
      </Link>
    </div>
  );
}