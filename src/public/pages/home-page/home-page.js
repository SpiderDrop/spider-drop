import {
  getAccessToken,
  popPostLoginUrl,
  requestAccessToken,
  saveAccessToken
} from "../../services/auth-service.js";
import { getConfig } from "../../services/config-services.js";

export default class HomePage extends HTMLElement {
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }

  navigateToMySpidersPage() {
    location.assign("/my-spiders");
  }

  navigateToNext() {
    const postLoginUrl = popPostLoginUrl();
    if (postLoginUrl) {
      location.href = postLoginUrl;
    } else {
      this.navigateToMySpidersPage();
    }
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "closed" });
    const template = document
      .getElementById("home-page")
      .content.cloneNode(true);
    shadow.appendChild(template);

    shadow
      .getElementById("sign-in-button")
      .addEventListener("click", this.doLogin);

    this.checkLogin();
  }

  async checkLogin() {
    if (getAccessToken()) {
      this.navigateToMySpidersPage();
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const accessCode = urlParams.get("code");

      if (accessCode) {
        const response = await requestAccessToken(accessCode);
        if (response.ok) {
          saveAccessToken((await response.json()).access_token);
          this.navigateToNext();
        } else {
          // Not expecting anything to go wrong that should be reported to user.
        }
      }
    }
  }

  async doLogin() {
    const config = await getConfig();
    const authorizeUrl = `${config.AUTHORIZATION_URL}?client_id=${config.AUTH0_CLIENT_ID}&response_type=code&redirect_uri=${config.SIGN_IN_REDIRECT_URL}&audience=${config.JWT_AUDIENCE}&scope=openid profile email`;
    window.location.href = authorizeUrl;
  }
}

customElements.define("home-page", HomePage);
