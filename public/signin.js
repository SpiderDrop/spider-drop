import {
  requestAccessToken,
  saveAccessToken,
} from "./services/auth-service.js";
import { getConfig } from "./services/config-services.js";

async function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessCode = urlParams.get("code");

  if (accessCode) {
    const response = await requestAccessToken(accessCode);
    if (response.ok) {
      window.location.pathname = "/";
      saveAccessToken((await response.json()).access_token);
    } else {
      // Can do better with showing the error
      alert((await response.json()).message);
    }
  } else {
    const config = await getConfig();
    const authorizeUrl = `${config.AUTHORIZATION_URL}?client_id=${config.AUTH0_CLIENT_ID}&response_type=code&redirect_uri=${config.SIGN_IN_REDIRECT_URL}`;
    document
      .getElementById("authorize-link")
      .setAttribute("href", authorizeUrl);
  }
}

main();
