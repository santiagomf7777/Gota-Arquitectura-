import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getInventoryRequest } from "../services/inventoryService";
import "./Inventario.css";

const nivelLabel = {
  NORMAL: "NORMAL",
  BAJO: "BAJO",
  CRITICO: "CRÍTICO",
  SIN_STOCK: "SIN STOCK",
};

function Inventario() {
  const { auth } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getInventoryRequest(auth.token);
        setResumen(data.resumen);
        setInventario(data.inventario);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [auth.token]);

  const filtrado = inventario.filter((item) => {
    if (filtro === "TODOS") return true;
    if (filtro === "STOCK_BAJO") return item.nivel === "BAJO" || item.nivel === "CRITICO";
    if (filtro === "SIN_STOCK") return item.nivel === "SIN_STOCK";
    return true;
  });

  if (loading) return <p>Cargando inventario...</p>;
  if (error) return <p style={{ color: "#9b3333" }}>{error}</p>;

  return (
    <div className="inventario-page">
      <p className="inv-eyebrow">CONTROL DE STOCK</p>
      <h1>Inventario</h1>

      <div className="inv-cards">
        <div className="inv-card">
          <span className="inv-card-label">PRODUCTOS TOTALES</span>
          <strong className="inv-card-value">{resumen.productos_totales}</strong>
          <span className="inv-card-sub">{resumen.stock_normal} con stock normal</span>
        </div>

        <div className="inv-card inv-card-warning">
          <span className="inv-card-label">STOCK BAJO</span>
          <strong className="inv-card-value">{resumen.stock_bajo}</strong>
          <span className="inv-card-sub">Menos de 10 unidades</span>
        </div>

        <div className="inv-card inv-card-danger">
          <span className="inv-card-label">SIN STOCK</span>
          <strong className="inv-card-value">{resumen.sin_stock}</strong>
          <span className="inv-card-sub">Requieren reposición urgente</span>
        </div>
      </div>

      <div className="inv-table-container">
        <div className="inv-table-header">
          <h2>Stock actual por producto</h2>

          <div className="inv-filter-buttons">
            <button
              className={filtro === "TODOS" ? "active" : ""}
              onClick={() => setFiltro("TODOS")}
            >
              TODOS
            </button>
            <button
              className={filtro === "STOCK_BAJO" ? "active" : ""}
              onClick={() => setFiltro("STOCK_BAJO")}
            >
              STOCK BAJO
            </button>
            <button
              className={filtro === "SIN_STOCK" ? "active" : ""}
              onClick={() => setFiltro("SIN_STOCK")}
            >
              SIN STOCK
            </button>
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>MARCA</th>
              <th>STOCK ACTUAL</th>
              <th>NIVEL</th>
              <th>PRECIO UNIT.</th>
              <th>VALOR TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {filtrado.map((item) => (
              <tr key={item.variante_id}>
                <td className="inv-product-cell">
                  <div className="inv-thumb">
                    {item.imagen_url ? (
                      <img src={item.imagen_url} alt={item.nombre} />
                    ) : (
                      <span>G</span>
                    )}
                  </div>
                     <span>
     {item.nombre}
     <span className="inv-size">
       {item.tipo === "DECANT" ? " · Decant " : " · "}
       {item.tamano_ml} ml
     </span>
   </span>
                </td>
                <td>{item.marca}</td>
                <td>{item.stock_actual}</td>
                <td>
                  <span className={`inv-badge inv-badge-${item.nivel.toLowerCase()}`}>
                    {nivelLabel[item.nivel]}
                  </span>
                </td>
                <td>${Number(item.precio).toLocaleString("es-CO")}</td>
                <td>${Number(item.valor_total).toLocaleString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrado.length === 0 && (
          <p className="inv-empty">No hay productos en esta categoría.</p>
        )}
      </div>
    </div>
  );
}

export default Inventario;