import {
  getUserInformation,
  getAccessToken,
  saveUsername,
  deleteAccessToken
} from "../../services/auth-service.js";
export default class SearchHeaderComponent extends HTMLElement {
  constructor() {
    super();
  }

  navigateToHomePage() {
    deleteAccessToken();
    location.assign("/");
  }

  extractInitials(fullName) {
    let initials = fullName.split(' ').map(part => part[0]).join('');
    return initials;
  }

  async populateUsername() {
    let accessToken = getAccessToken();
    let userInfo = await getUserInformation(accessToken);
    saveUsername(userInfo.name);
    this.shadowRoot.querySelector("slot[name='username']").append(this.extractInitials(userInfo.name));
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document
      .getElementById("search-header-component")
      .content.cloneNode(true);
    shadow.appendChild(template);
    const search = this.shadowRoot.getElementById("input");

    search.addEventListener("change", (event) => {
      this.dispatchEvent(
        new CustomEvent("searchInput", {
          composed: true,
          bubbles: true,
          cancelable: true,
          detail: {
            search: event.target.value
          }
        })
      );
    });

    shadow
      .getElementById("sign-out-icon")
      .addEventListener("click", () => this.navigateToHomePage());

    this.populateUsername();
  }

  disconnectedCallback() {}
}

await customElements.defineComponent("search-header-component");
customElements.define("search-header", SearchHeaderComponent);
