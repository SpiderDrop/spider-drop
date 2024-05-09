import { getAccessToken } from "../../services/auth-service.js"

export default class MySpidersPage extends HTMLElement {
  navigateBack(offset) {
    const spiderViewElement = this.shadowRoot.querySelector("spider-view");
    spiderViewElement.setAttribute("offset", `${offset}`);
  }

  navigateForward(folderName) {
    const fileActionsElement = this.shadowRoot.querySelector("file-actions");
    fileActionsElement.setAttribute("latest-path", folderName);
  }

  refreshFileView() {
    const spiderViewElement = this.shadowRoot.querySelector("spider-view");
    spiderViewElement.setAttribute("refresh", "true");
  }

  connectedCallback() {
    if (getAccessToken()) {
      const shadow = this.attachShadow({ mode: "open" });
      const template = document
        .getElementById("my-spiders-page")
        .content.cloneNode(true);
      shadow.appendChild(template);

      shadow.addEventListener("folderAdded", (event) => {
        this.refreshFileView();
        event.stopPropagation();
      });

      shadow.addEventListener("refresh", (event) => {
        this.refreshFileView();
        event.stopPropagation();
      });

      shadow.addEventListener("navigateBack", (event) => {
        this.navigateBack(event.detail.offset);
        event.stopPropagation();
      });

      shadow.addEventListener("folderEntered", (event) => {
        this.navigateForward(event.detail.folderName);
        event.stopPropagation();
      });
    } else {
      location.assign("/");
    }
  }

  disconnectedCallback() {}
}

customElements.define("my-spiders-page", MySpidersPage);
