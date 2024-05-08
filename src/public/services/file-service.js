import { getAccessToken } from "../../services/auth-service.js";

let token = getAccessToken();

export async function fetchCurrentDirectory(path) {
  const response = await fetch("/api/boxes/" + path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return response.json();
}

export async function addBox(path) {
  return fetch("/api/boxes/" + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}

export async function getPreviewUrl(path) {
  const response = await fetch(`/api/spiders/preview-url/${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return response.json();
}
