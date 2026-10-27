import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginRequest, registerRequest } from "../services/authService";
import "./Auth.css";

function Auth() {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginUsuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/carrito";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data =
        modo === "login"
          ? await loginRequest(email, password)
          : await registerRequest(nombre, email, password, telefono);

      loginUsuario(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">GOTA PERFUMERÍA</p>

        <h1>
          {modo === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>

        <p className="auth-subtitle">
          {modo === "login"
            ? "Ingresa para continuar con tu compra."
            : "Regístrate para finalizar tu pedido."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={modo === "login" ? "active" : ""}
            onClick={() => setModo("login")}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={modo === "registro" ? "active" : ""}
            onClick={() => setModo("registro")}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {modo === "registro" && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {modo === "registro" && (
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Procesando..."
              : modo === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>

        <Link to="/" className="auth-back">
          ← Volver al catálogo
        </Link>
      </section>
    </main>
  );
}

export default Auth;