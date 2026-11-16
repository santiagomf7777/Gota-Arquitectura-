import { API_URL } from "../config/api";

export async function sendChatMessage(message, context) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });

  const isJson = (response.headers.get("content-type") || "").includes("application/json");

  if (!isJson) {
    const text = await response.text();
    console.error(`[chat] ${response.status} desde ${API_URL}/chat:`, text.slice(0, 200));
    throw new Error(
      `El servidor respondió ${response.status} en ${API_URL}/chat en lugar de JSON. Revisa la URL y la ruta del backend.`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo contactar al asistente");
  }

  return data;
}