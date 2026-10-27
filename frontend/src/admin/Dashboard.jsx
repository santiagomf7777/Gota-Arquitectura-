function Dashboard() {
  return (
    <div>
      <p style={{ color: "#a08345", fontSize: 12, letterSpacing: 2, fontWeight: 600 }}>
        PANEL DE CONTROL
      </p>
      <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, margin: "6px 0" }}>
        Dashboard
      </h1>
      <p style={{ color: "#777" }}>
        Bienvenida de nuevo.
      </p>

      <p style={{ marginTop: 40, color: "#999" }}>
        Aquí irán las métricas (ventas, pedidos, stock) — las conectamos al
        backend en el siguiente paso.
      </p>
    </div>
  );
}

export default Dashboard;