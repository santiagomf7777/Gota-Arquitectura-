import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "gota_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error al leer la sesión guardada:", error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (auth) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error al guardar la sesión:", error);
    }
  }, [auth]);

  const loginUsuario = (data) => {
    setAuth({
      token: data.token,
      usuario: data.usuario,
    });
  };

  const logout = () => {
    setAuth(null);
  };

  const isAuthenticated = !!auth;
  const isAdmin = auth?.usuario?.rol === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        auth,
        loginUsuario,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}