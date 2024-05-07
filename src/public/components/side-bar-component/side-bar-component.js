import {
  getUserInformation,
  getAccessToken,
  saveUsername
} from "../../services/auth-service.js";

export default class SidebarComponent extends HTMLElement {
  constructor() {
    super();
  }

  navigateToHomePage() {
    location.assign("/");
  }

  async populateUsername() {
    let accessToken = getAccessToken();
    let userInfo = await getUserInformation(accessToken);
    saveUsername(userInfo.name);
    this.shadowRoot.querySelector("slot[name='username']").append(userInfo.name);
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document
      .getElementById("side-bar-component")
      .content.cloneNode(true);
    shadow.appendChild(template);

    shadow
      .getElementById("sign-out-button")
      .addEventListener("click", () => this.navigateToHomePage());
    
    this.populateUsername();
  }

  disconnectedCallback() {}
}

await customElements.defineComponent("side-bar-component", SidebarComponent);
customElements.define("side-bar", SidebarComponent);
