import { Link } from "react-router-dom";

const SLOGAN = "Tu esencia, a una gota de distancia.";

export default function Brand({ conSlogan = false, claro = false }) {
  return (
    <Link to="/" className={`brand${claro ? " brand--light" : ""}`}>
      <img
        src="/Images/logo/logo-gota-simbolo.png"
        alt=""
        className="brand__mark"
      />
      <span className="brand__text">
        <span className="brand__name">Gota Perfumería</span>
        {conSlogan && <span className="brand__slogan">{SLOGAN}</span>}
      </span>
    </Link>
  );
}