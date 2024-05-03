export default class FileActionsComponent extends HTMLElement {
  constructor() {
    super();
    this.showingFolderDialog = false;
  }

  attributeChangedCallback(property, oldValue, newValue) {}

  toggleDialog() {
    this.showingFolderDialog = !this.showingFolderDialog;
    const uploadFileElement = this.shadowRoot.getElementById("upload-icon");

    uploadFileElement.style.visibility = this.showingFolderDialog
      ? "hidden"
      : "visible";
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document
      .getElementById("file-actions-component")
      .content.cloneNode(true);
    shadow.appendChild(template);

    const createFolderButton = shadow.getElementById("create-folder-icon");
    createFolderButton.addEventListener("click", () => this.toggleDialog());
  }

  disconnectedCallback() {}
}

customElements.define("file-actions", FileActionsComponent);
customElements.defineComponent("file-actions-component");
