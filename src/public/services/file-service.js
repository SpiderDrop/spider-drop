import { getAccessToken } from "../../services/auth-service.js";

let token = getAccessToken();

export async function fetchCurrentDirectory(path) {
  const response = await fetch("/api/boxes/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return response.json();
}
