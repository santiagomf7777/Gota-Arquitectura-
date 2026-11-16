import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const NAV = [
  { to: "/admin", etiqueta: "Dashboard", end: true },
  { to: "/admin/promociones", etiqueta: "Promociones" },
  { to: "/admin/productos", etiqueta: "Productos" },
  { to: "/admin/inventario", etiqueta: "Inventario" },
  { to: "/admin/pedidos", etiqueta: "Pedidos" },
  { to: "/admin/clientes", etiqueta: "Clientes" },
  { to: "/admin/proveedores", etiqueta: "Proveedores" },
  { to: "/admin/reportes", etiqueta: "Reportes" },
  { to: "/admin/configuracion", etiqueta: "Configuración" },
];

function AdminLayout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-title">GOTA Perfumería</span>
          <span className="admin-brand-subtitle">PANEL ADMIN</span>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              {item.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="admin-user">
          <div className="admin-user-avatar">
            {auth?.usuario?.nombre?.charAt(0) || "A"}
          </div>
          <div className="admin-user-info">
            <strong>{auth?.usuario?.nombre}</strong>
            <span>Administrador</span>
          </div>
          <button type="button" onClick={handleLogout}>
            Cerrar sesión →
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-topbar">
          <Link to="/" className="admin-topbar-volver">
            ← Volver a la tienda
          </Link>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;