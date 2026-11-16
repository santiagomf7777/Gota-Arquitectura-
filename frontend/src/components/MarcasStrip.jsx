import "./MarcasStrip.css";

export default function MarcasStrip({ marcas = [] }) {
  if (marcas.length === 0) return null;

  return (
    <div className="marcas">
      <h2 className="marcas__titulo">
        Marcas en la <em>tienda</em>
      </h2>

      <ul className="marcas__lista">
        {marcas.map((m) => (
          <li className="marcas__item" key={m}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}