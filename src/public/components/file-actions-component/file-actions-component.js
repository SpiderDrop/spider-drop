export default class FileActionsComponent extends HTMLElement {
  constructor() {
    super();
    this.showingFolderInput = false;
  }

  attributeChangedCallback(property, oldValue, newValue) {}

  onAddFolder() {
    const folderNameInputElement = this.shadowRoot.getElementById(
      "folder-input"
    );

    if (!folderNameInputElement.value) return;

    const folderAddedEvent = new CustomEvent("folderAdded", {
      composed: true,
      bubbles: true,
      detail: { folderName: folderNameInputElement.value }
    });

    this.dispatchEvent(folderAddedEvent);
    folderNameInputElement.value = "";
  }

  toggleDialog() {
    this.showingFolderInput = !this.showingFolderInput;
    const uploadFileElement = this.shadowRoot.getElementById("upload-icon");
    const folderNameInputElement = this.shadowRoot.getElementById(
      "folder-input"
    );
    const folderContainerElement = this.shadowRoot.getElementById(
      "create-folder-container"
    );

    if (this.showingFolderInput) {
      uploadFileElement.style.display = "none";
      folderNameInputElement.removeAttribute("hidden");
      folderContainerElement.classList.add("create-folder-container");
    } else {
      this.onAddFolder();
      uploadFileElement.style.display = "inline";
      folderNameInputElement.setAttribute("hidden", true);
      folderContainerElement.classList.remove("create-folder-container");
    }
  }

  onUploadFile() {
    const uploadFileDialog = this.shadowRoot.getElementById(
      "upload-file-dialog"
    );
    const uploadedFileEvent = new CustomEvent("filesUploaded", {
      composed: true,
      bubbles: true,
      detail: { files: Array.from(uploadFileDialog.files) }
    });
    this.dispatchEvent(uploadedFileEvent);
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document
      .getElementById("file-actions-component")
      .content.cloneNode(true);
    shadow.appendChild(template);

    const createFolderButton = shadow.getElementById("folder-icon");
    createFolderButton.addEventListener("click", () => this.toggleDialog());

    const uploadFileDialog = shadow.getElementById("upload-file-dialog");
    uploadFileDialog.onchange = () => this.onUploadFile();

    const uploadFileButton = shadow.getElementById("upload-icon");
    uploadFileButton.addEventListener("click", () => uploadFileDialog.click());

    const createFolderInputElement = shadow.getElementById("folder-input");
    createFolderInputElement.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        this.onAddFolder();
        this.toggleDialog();
      }
    });
  }

  disconnectedCallback() {}
}

await customElements.defineComponent("file-actions-component");
customElements.define("file-actions", FileActionsComponent);
