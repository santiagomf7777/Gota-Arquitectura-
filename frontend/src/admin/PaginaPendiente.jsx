import "./PaginaPendiente.css";

// Pantalla temporal para las secciones del panel que aún no se construyen.
// Evita que la ruta caiga en la tienda y se vea una pantalla negra.
function PaginaPendiente({ titulo = "Sección", texto }) {
  return (
    <section className="pendiente">
      <p className="pendiente__eyebrow">Panel de control</p>
      <h1>{titulo}</h1>
      <p className="pendiente__texto">
        {texto || "Esta sección se está construyendo y estará disponible pronto."}
      </p>
    </section>
  );
}

export default PaginaPendiente;