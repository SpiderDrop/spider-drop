import { fetchCurrentDirectory, getPreviewUrl } from "../../services/file-service.js";
import { getFileType } from "../../services/file-types-service.js";

export default class SpiderViewComponent extends HTMLElement {
  static observedAttributes = ["refresh", "offset"];

  constructor() {
    super();
    this.currentPath = ["/"];
    this.entries = [];
  }

  navigateBackDirectories(directoryBackCount) {
    if (directoryBackCount > this.currentPath.length)
      return;

    this.currentPath.splice(-directoryBackCount, directoryBackCount);
    this.loadCurrentView();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "refresh") {
      this.loadCurrentView();
    }

    if (name === "offset") {
      this.navigateBackDirectories(Number(newValue));
    }
  }

  async loadCurrentView() {
    const fullPath = this.currentPath.slice(1).join("/");
    let currentDirectory = await fetchCurrentDirectory(fullPath);
  
    const dateTimeFormat = new Intl.DateTimeFormat("en", { 
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    this.entries = [];

    currentDirectory.forEach((entity => {
      const isFolder = Boolean(entity.isBox);
      const lastModified = new Date(entity.LastModified);
      
      this.entries.push({
        name: entity.name,
        modified: dateTimeFormat.format(lastModified),
        size: entity.Size + (isFolder ? " files" : ""),
        sharing: Boolean(entity.sharing) ? "public" : "private",
        isFolder: isFolder,
        path: entity.path
      });
    }));

    if (this.entries.length) {
      this.updateListDisplay();
    } else {
      this.showEmptyFolder();
    }
  }

  removeSortedByIcon() {
    const sortedIcon = this.shadowRoot.getElementById("sorted-icon");
    if (sortedIcon) sortedIcon.remove();
  }

  sortBy(headingElement) {
    const sortedIconTemplate = this.shadowRoot.getElementById(
      "sorted-icon-template"
    );

    this.removeSortedByIcon();
    headingElement.appendChild(sortedIconTemplate.content.cloneNode(true));
    const heading = headingElement.id;

    this.entries.sort(function(a, b) {
      if (a[heading] < b[heading]) return -1;

      return a[heading] > b[heading] ? 1 : 0;
    });

    this.updateListDisplay();
  }

  expandFolder(folderName) {
     this.currentPath.push(folderName);
     this.loadCurrentView();
  }

  clearBody(element) {
    while (element.hasChildNodes()) {
      element.removeChild(element.firstChild);
    }
  }

  showEmptyFolder() {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const emptyFolderTemplate = this.shadowRoot.getElementById("empty-folder-template");
    containerElement.appendChild(emptyFolderTemplate.content.cloneNode(true));
  }

  async previewFile(path) {
    const previewUrl = await getPreviewUrl(path);
    const fileType = getFileType(path);
    
    if(fileType === "images") {
      this.showImagePreview(previewUrl.url);
    } else if(fileType === "videos") {
      this.showVideoPreview(previewUrl.url);
    } else if(fileType === "audio") {
      this.showAudioPreview(previewUrl.url);
    } else {
      this.showDefaultPreview(previewUrl.url);
    }
  }

  showImagePreview(previewUrl) {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const imagePreviewNode = this.shadowRoot.getElementById("image-preview-template").content.cloneNode(true);
    const imageElement = imagePreviewNode.getElementById("image-preview");
    imageElement.src = previewUrl;
    containerElement.appendChild(imageElement);    
  }

  showVideoPreview(previewUrl) {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const videoPreviewNode = this.shadowRoot.getElementById("video-preview-template").content.cloneNode(true);
    const videoElement = videoPreviewNode.getElementById("video-preview");
    videoElement.src = previewUrl;
    videoElement.getElementsByTagName("a")[0].href = previewUrl;
    containerElement.appendChild(videoElement);
  }

  showAudioPreview(previewUrl) {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const audioPreviewNode = this.shadowRoot.getElementById("audio-preview-template").content.cloneNode(true);
    const audioElement = audioPreviewNode.getElementById("audio-preview");
    audioElement.src = previewUrl;
    audioElement.getElementsByTagName("a")[0].href = previewUrl;
    containerElement.appendChild(audioElement);
  }

  showDefaultPreview(previewUrl) {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const defaultPreviewNode = this.shadowRoot.getElementById("default-preview-template").content.cloneNode(true);
    const defaultPreviewElement = defaultPreviewNode.getElementById("default-preview");
    defaultPreviewElement.getElementsByTagName("a")[0].href = previewUrl;
    containerElement.appendChild(defaultPreviewElement);
  }

  updateListDisplay() {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const columnTemplate = this.shadowRoot.getElementById("column-template");
    containerElement.appendChild(columnTemplate.content.cloneNode(true));

    const tableBody = this.shadowRoot.querySelector("tbody");

    const rowTemplateElement = this.shadowRoot.getElementById("row-template");

    this.entries.forEach(entry => {
      const rowTemplate = rowTemplateElement.content.cloneNode(true);
      rowTemplate.querySelector("slot[name='name']").append(entry.name);
      rowTemplate.querySelector("slot[name='modified']").append(entry.modified);
      rowTemplate.querySelector("slot[name='size']").append(entry.size);
      rowTemplate.querySelector("slot[name='sharing']").append(entry.sharing);

      const rowElement = document.createElement("tr");
      rowElement.appendChild(rowTemplate);

      rowElement.addEventListener("click", (_) => {
        if(entry.isFolder) {
          this.expandFolder(entry.name);
        } else {
          this.previewFile(entry.path)
        }

        this.dispatchEvent(new CustomEvent("folderEntered", {
          bubbles: true, 
          cancelable: true, 
          composed: true,
          detail: {
            folderName: entry.name
          }
        }));
      });
      tableBody.appendChild(rowElement);
    });
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document
      .getElementById("spider-view-component")
      .content.cloneNode(true);
    shadow.appendChild(template);

    const headings = this.shadowRoot.querySelectorAll("tr th");

    headings.forEach(heading => {
      heading.addEventListener("click", () => {
        this.sortBy(heading);
      });
    });

    this.loadCurrentView();
  }

  disconnectedCallback() {}
}

await customElements.defineComponent("spider-view-component");
customElements.define("spider-view", SpiderViewComponent);
