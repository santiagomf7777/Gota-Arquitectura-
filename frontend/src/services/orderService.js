const API_URL = "http://localhost:3000/api/pedidos";

export async function createOrderRequest(token, orderData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al crear el pedido");
  }

  return data;
}