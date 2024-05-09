import { getConfig } from "../../services/config-services.js";

export async function requestAccessToken(accessCode) {
  return fetch("/auth/access-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      accessCode: accessCode
    })
  });
}

export async function getUserInformation(accessToken) {
  let username = getUsername();

  if (username) {
    return Promise.resolve({
      name: username
    });
  }

  const config = await getConfig();
  const response = await fetch(config.USER_INFO_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  return response.json();
}

export function saveAccessToken(accessToken) {
  localStorage.setItem("ACCESS_TOKEN", accessToken);
}

export function getAccessToken() {
  return localStorage.getItem("ACCESS_TOKEN");
}

export function deleteAccessToken(){
  localStorage.removeItem("ACCESS_TOKEN")
}

export function saveUsername(username) {
  localStorage.setItem("USER_NAME", username);
}

export function getUsername() {
  return localStorage.getItem("USER_NAME");
}
