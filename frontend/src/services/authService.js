const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth`;

export async function loginRequest(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al iniciar sesión");
  }

  return data;
}

export async function registerRequest(nombre, email, password, telefono) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password, telefono }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al crear la cuenta");
  }

  return data;
}