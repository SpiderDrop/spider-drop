import { fetchCurrentDirectory, getPreviewUrl } from "../../services/file-service.js";
import { getFileType } from "../../services/file-types-service.js";

export default class SpiderViewComponent extends HTMLElement {
  static observedAttributes = ["refresh", "offset"];

  constructor() {
    super();
    this.currentPath = ["/"];
    this.entries = [];
    this.loadingFolder = false;
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
    this.loadingFolder = true;
    const fullPath = this.currentPath.slice(1).join("/");
    let currentDirectory = await fetchCurrentDirectory(fullPath);

    this.entries = [];

    currentDirectory.forEach((entity => {
      const isFolder = Boolean(entity.isBox);
      const lastModified = new Date(entity.LastModified);
      
      this.entries.push({
        name: entity.name,
        modified: lastModified.toLocaleString(),
        size: isFolder ? `${entity.Size} items` : this.formatBytes(entity.Size),
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
    this.loadingFolder = false;
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

      let events = ["dblclick", "touchstart"];

      events.forEach(eventName => {
        rowElement.addEventListener(eventName, (_) => {
          if(entry.isFolder) {
            if (!this.loadingFolder) {
              this.loadingFolder = true;
              this.expandFolder(entry.name);
            }
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
    this.loadCurrentView();
  }

  disconnectedCallback() {}

  formatBytes(bytes, decimals = 2) {
    if(bytes <= 0) {
      return '0 Bytes'
    } else {
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }
  }
}

await customElements.defineComponent("spider-view-component");
customElements.define("spider-view", SpiderViewComponent);
