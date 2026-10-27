const API_URL = "http://localhost:3000/api/admin/inventario";

export async function getInventoryRequest(token) {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al obtener el inventario");
  }

  return data;
}