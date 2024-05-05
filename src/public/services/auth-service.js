export async function requestAccessToken(accessCode) {
  return fetch("/auth/access-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessCode: accessCode,
    }),
  });
}

export function saveAccessToken(accessToken) {
  localStorage.setItem("ACCESS_TOKEN", accessToken);
}

export function getAccessToken() {
  return localStorage.getItem("ACCESS_TOKEN");
}
