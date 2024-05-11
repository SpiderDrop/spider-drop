import { addBox, uploadFiles } from "../../services/file-service.js";

export default class FileActionsComponent extends HTMLElement {
  static observedAttributes = [ "latest-path" ];

  constructor() {
    super();
    this.showingFolderInput = false;
    this.navigationDepth = 1;
    this.navigationPath = ["/"];
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (property === "latest-path") {
      this.navigationPath.push(newValue);
      this.navigationDepth += 1;
      this.onUpdatedPath();
    }
  }

  onUpdatedPath() {
    const titleElement = this.shadowRoot.getElementById("path-list");

    while (titleElement.hasChildNodes()) {
      titleElement.removeChild(titleElement.firstChild);
    }

    const breadcrumbTemplate = this.shadowRoot.getElementById("breadcrumb-template");

    for (let i = 0; i < this.navigationPath.length; i++) {
      const wrapper = document.createElement("p");
      const breadcrumb = breadcrumbTemplate.content.cloneNode(true);
      
      if (i === 0) {
        breadcrumb.querySelector("slot[name='breadcrumb']").append("My Spiders");
      }
      else {
        breadcrumb.querySelector("slot[name='breadcrumb']").append(`>${this.navigationPath[i]}`);
      }
      wrapper.appendChild(breadcrumb);

      wrapper.addEventListener("click", (event) => {
        const offset = this.navigationPath.length - i - 1;
        if (offset === 0) return;

        this.navigationPath.splice(-offset);
        this.navigationDepth -= offset;

        this.dispatchEvent(new CustomEvent("navigateBack", {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
              offset: offset
            }
          }));

        this.onUpdatedPath();
      });

      titleElement.appendChild(wrapper);
    }
  }

  async onAddFolder() {
    const folderNameInputElement = this.shadowRoot.getElementById(
      "folder-input"
    );

    if (!folderNameInputElement.value) return;

    let folderName = folderNameInputElement.value;
    folderNameInputElement.value = "";

    const folderAddedEvent = new CustomEvent("folderAdded", {
      composed: true,
      bubbles: true,
      detail: { folderName: folderName }
    });

    await addBox(this.navigationPath.slice(1).join("/") + `/${folderName}`);
    this.dispatchEvent(folderAddedEvent);
  }

  toggleDialog() {
    this.showingFolderInput = !this.showingFolderInput;
    const uploadFileElement = this.shadowRoot.getElementById("upload-icon");
    const reloadElement = this.shadowRoot.getElementById("reload-icon");
    const folderNameInputElement = this.shadowRoot.getElementById(
      "folder-input"
    );
    const folderContainerElement = this.shadowRoot.getElementById(
      "create-folder-container"
    );

    if (this.showingFolderInput) {
      uploadFileElement.style.display = "none";
      reloadElement.style.display = "none";
      folderNameInputElement.removeAttribute("hidden");
      folderContainerElement.classList.add("create-folder-container");
    } else {
      this.onAddFolder();
      uploadFileElement.style.display = "inline";
      reloadElement.style.display = "inline";
      folderNameInputElement.setAttribute("hidden", true);
      folderContainerElement.classList.remove("create-folder-container");
    }
  }

  refreshView() {
    const uploadedFileEvent = new Event("refresh", {
      composed: true,
      bubbles: true,
      cancelable: true
    });

    this.dispatchEvent(uploadedFileEvent);
  }

  async onUploadFile() {
    const uploadFileDialog = this.shadowRoot.getElementById(
      "upload-file-dialog"
    );

    uploadFileDialog.disabled = true;
    document.body.style.cursor = "wait";
    
    let uploadedFiles = Array.from(uploadFileDialog.files);
   
    let currentPath = this.navigationPath.slice(1).join("/");
    let promises = [];

    for (let file of uploadedFiles) {
      let filePath = `${currentPath}/${file.name}`;
      if(filePath.startsWith("/")) {
        filePath = filePath.replace("/", "");
      }

      const fetchPromise = uploadFiles(filePath, file);
      promises.push(fetchPromise);
    }

    await Promise.all(promises);

    uploadFileDialog.disabled = false;
    document.body.style.cursor = "pointer"
    this.refreshView();
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

    const reloadIcon = shadow.getElementById("reload-icon");
    reloadIcon.addEventListener("click", () => this.refreshView());

    const createFolderInputElement = shadow.getElementById("folder-input");
    createFolderInputElement.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        this.onAddFolder();
        this.toggleDialog();
      }
    });

    this.onUpdatedPath();
  }

  disconnectedCallback() {}
}

await customElements.defineComponent("file-actions-component");
customElements.define("file-actions", FileActionsComponent);
