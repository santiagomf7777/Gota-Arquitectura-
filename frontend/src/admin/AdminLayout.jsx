import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const menuItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/inventario", label: "Inventario" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/clientes", label: "Clientes" },
  { to: "/admin/proveedores", label: "Proveedores" },
  { to: "/admin/reportes", label: "Reportes" },
  { to: "/admin/configuracion", label: "Configuración" },
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
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              {item.label}
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
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;