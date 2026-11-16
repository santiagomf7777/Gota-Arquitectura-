import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// VITE_API_URL debe incluir /api, por ejemplo: http://localhost:3000/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function useAdminApi() {
  const { auth } = useAuth();
  const token = auth?.token;

  const request = useCallback(
    async (ruta, { method = "GET", body } = {}) => {
      let respuesta;

      try {
        respuesta = await fetch(`${API_URL}/admin${ruta}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch {
       throw new Error(
  datos?.mensaje ||
    `El servidor respondió ${respuesta.status} en /admin${ruta}.`
);
      }

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          datos?.message ||
            `El servidor respondió ${respuesta.status} en /admin${ruta}. Revisa que la ruta esté registrada en el backend.`
        );
      }

      if (datos === null) {
        throw new Error(
          `La respuesta de ${API_URL} no es JSON. Revisa que VITE_API_URL apunte al backend.`
        );
      }

      return datos;
    },
    [token]
  );

  return { request };
}