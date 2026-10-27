const API_URL = "http://localhost:3000/api/chat";

export async function sendChatMessage(message, context) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo contactar al asistente");
  }

  return data;
}