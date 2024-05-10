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

export async function filteredContent(filter) {
  const response = await fetch(
    "/api/search?" +
      new URLSearchParams({
        filter: filter
      }),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.json();
}
export async function deleteBox(path) {
  return fetch("/api/boxes/" + path, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}

export async function deleteSpider(path) {
  return fetch("/api/spiders/" + path, {
    method: "DELETE",
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

export async function getSharedSpiderPreviewUrl(key) {
  const response = await fetch(`/api/spiders/preview-url/?spiderKey=${key}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.json();
}

export async function setShareList(path, shareList) {
  return fetch("/api/spiders/share-list/" + path, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(shareList),
  });
}

export async function getShareList(path) {
  const response = await fetch("/api/spiders/share-list/" + path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.json();
}

export async function uploadFiles(path, fileBlob) {
  return fetch("/api/spiders/" + path, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream"
    },
    body: fileBlob
  });
}
