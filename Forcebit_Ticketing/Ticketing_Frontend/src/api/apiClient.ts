import { getAuthItem } from "../storage/authStorage";

const API_URL = "http://localhost:5047/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getAuthItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  console.log("API status:", response.status);
  console.log("API response:", text);

  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data;
}