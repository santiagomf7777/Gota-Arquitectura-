import { useAuth } from "../context/AuthContext";

// Usa el mismo AuthContext que el panel de administración.
// ⚠️ Si en tu tabla "usuarios" el campo del rol no se llama "rol",
// cambia "rol" por el nombre real (por ejemplo "tipo" o "role").
const ROLES_ADMIN = ["admin", "administrador"];

export function useEsAdmin() {
  const { auth } = useAuth();

  const rol = String(
    auth?.usuario?.rol ?? auth?.usuario?.role ?? ""
  ).toLowerCase();

  return ROLES_ADMIN.includes(rol);
}

export default useEsAdmin;