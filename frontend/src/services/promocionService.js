import { API_URL } from "../config/api";

export async function getPromociones() {
  const res = await fetch(`${API_URL}/promociones`);
  if (!res.ok) throw new Error("No se pudieron obtener las promociones");
  return res.json();
}