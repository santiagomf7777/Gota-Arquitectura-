import { Link, useLocation, Navigate } from "react-router-dom";

function OrderConfirmation() {
  const location = useLocation();
  const { pedidoId, total } = location.state || {};

  if (!pedidoId) {
    return <Navigate to="/" replace />;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        background: "#fdfcf9",
      }}
    >
      <p style={{ letterSpacing: "4px", fontSize: "12px", color: "#a08345", fontWeight: 600 }}>
        GOTA PERFUMERÍA
      </p>

      <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "34px", margin: "10px 0" }}>
        ¡Pedido confirmado!
      </h1>

      <p style={{ color: "#6c6c6c", marginBottom: "8px" }}>
        Tu número de pedido es <strong>#{pedidoId}</strong>
      </p>

      <p style={{ color: "#6c6c6c", marginBottom: "30px" }}>
        Total: <strong>${Number(total).toLocaleString("es-CO")}</strong>
      </p>

      <Link
        to="/"
        style={{
          background: "#1d1d1d",
          color: "white",
          padding: "12px 24px",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        Volver al catálogo
      </Link>
    </main>
  );
}

export default OrderConfirmation;