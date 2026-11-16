import { useEffect, useState } from "react";
import { getPromociones } from "../services/promocionService";
import PromoAcciones from "./PromoAcciones";
import "./PromocionesBanner.css";

const moneda = (v) => `$${Number(v || 0).toLocaleString("es-CO")}`;

function textoCombo(p) {
  const compra = (p.items || [])
    .filter((i) => !i.es_regalo)
    .map((i) => `${i.cantidad} × ${i.nombre} ${i.tamano_ml} ml`)
    .join(" + ");

  const regalo = (p.items || [])
    .filter((i) => i.es_regalo)
    .map((i) => `${i.cantidad} × ${i.nombre} ${i.tamano_ml} ml`)
    .join(" + ");

  if (!regalo) return compra;
  return `Compra ${compra} y te regalamos ${regalo}`;
}

function textoPromo(p) {
  if (p.tipo === "COMBO") return textoCombo(p);
  if (p.tipo === "DESCUENTO_PORCENTAJE") return `${p.valor}% de descuento en selección`;
  return `${moneda(p.valor)} menos por unidad`;
}

function etiquetaBadge(p) {
  if (p.tipo === "COMBO") return "Combo";
  if (p.tipo === "DESCUENTO_PORCENTAJE") return `-${p.valor}%`;
  return `-${moneda(p.valor)}`;
}

export default function PromocionesBanner({
  titulo = "Promociones",
  limite = 6,
  mostrarEnlace = true,
  onSelectPromo,
  promoActivaId = null,
}) {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    getPromociones().then(setPromos).catch(() => setPromos([]));
  }, []);

  if (promos.length === 0) return null;

  const clicable = typeof onSelectPromo === "function";

  return (
    <section className="promos">
      <div className="promos__head">
        <span className="promos__eyebrow">Ofertas</span>
        <h2>{titulo}</h2>
      </div>

      <div className="promos__grid">
        {promos.slice(0, limite).map((p) => {
          const activa = p.id === promoActivaId;

          return (
            <article
              key={p.id}
              className={`promo-card${activa ? " is-active" : ""}${clicable ? " is-clickable" : ""}`}
              onClick={clicable ? () => onSelectPromo(p) : undefined}
              onKeyDown={
                clicable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectPromo(p);
                      }
                    }
                  : undefined
              }
              role={clicable ? "button" : undefined}
              tabIndex={clicable ? 0 : undefined}
              aria-pressed={clicable ? activa : undefined}
            >
              <span className="promo-card__badge">{etiquetaBadge(p)}</span>
              <h3>{p.nombre}</h3>
              {p.descripcion && <p className="promo-card__desc">{p.descripcion}</p>}
              <p className="promo-card__texto">{textoPromo(p)}</p>

              <PromoAcciones promo={p} mostrarVer={mostrarEnlace} />
            </article>
          );
        })}
      </div>
    </section>
  );
}