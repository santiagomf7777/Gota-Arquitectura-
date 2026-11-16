import { API_URL } from "../config/api";

const AUTH_URL = `${API_URL}/auth`;

async function leerRespuesta(response) {
  const texto = await response.text();
  try {
    return texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error("El servidor no respondió con datos válidos. Revisa la ruta del backend.");
  }
}

export async function loginRequest(email, password) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await leerRespuesta(response);

  if (!response.ok) {
    throw new Error(data.mensaje || data.message || "Error al iniciar sesión");
  }

  return data;
}

export async function registerRequest(nombre, email, password, telefono) {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password, telefono }),
  });

  const data = await leerRespuesta(response);

  if (!response.ok) {
    throw new Error(data.mensaje || data.message || "Error al crear la cuenta");
  }

  return data;
}