import { fetchCurrentDirectory, getPreviewUrl, deleteBox, deleteSpider, setShareList, getShareList, getSharedSpiderPreviewUrl } from "../../services/file-service.js";
import { getFileType } from "../../services/file-types-service.js";

export default class SpiderViewComponent extends HTMLElement {
  static observedAttributes = ["refresh", "offset", "files-added", "loading"];

  constructor() {
    super();
    this.currentPath = ["/"];
    this.entries = [];
    this.loadingFolder = false;
  }

  navigateBackDirectories(directoryBackCount) {
    directoryBackCount = Math.min(directoryBackCount, this.currentPath.length - 1);
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

    if (name === "loading") {
      if (newValue === "true") {
        this.showLoading();
      } else {
        this.loadCurrentView();
      }
    }
  }

  async loadCurrentView() {
    this.loadingFolder = true;
    this.showLoading();
    const fullPath = this.currentPath.slice(1).join("/");
    let currentDirectory = await fetchCurrentDirectory(fullPath);
    const dateOptions = {
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: 'numeric',
    };
    this.entries = [];

    for (let entity of currentDirectory) {
      const isFolder = Boolean(entity.isBox);
      const lastModified = new Date(entity.LastModified);
      
      this.entries.push({
        name: entity.name,
        modified: lastModified.toLocaleString("en-US", dateOptions),
        size: isFolder ? `${entity.Size} items` : this.formatBytes(entity.Size),
        isFolder: isFolder,
        path: entity.path
      });
    }

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

  async showShareListEditor(name) {
    let fullPath = this.currentPath.slice(1).join("/") + `/${name}`;
    if(fullPath.startsWith("/")) {
      fullPath = fullPath.replace("/", "");
    }

    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const shareListEditorElement = this.shadowRoot.getElementById("share-list-editor-template").content.cloneNode(true);
    shareListEditorElement.querySelector("slot[name='name']").append(name);

    const textInput = shareListEditorElement.getElementById("share-list-editor-input");
    textInput.value = (await getShareList(fullPath)).join("\n");

    shareListEditorElement.getElementById("share-list-editor-cancel").addEventListener("click", (e) => {
      e.stopPropagation();
      this.loadCurrentView();
    });

    shareListEditorElement.getElementById("share-list-editor-save").addEventListener("click", async (e) => {
      e.stopPropagation();
      const shareList = textInput.value.split("\n").filter(el => el.trim().length !== 0);
      await setShareList(fullPath, shareList);
      return this.loadCurrentView();
    });

    containerElement.appendChild(shareListEditorElement);    
  }

  showEmptyFolder() {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const emptyFolderTemplate = this.shadowRoot.getElementById("empty-folder-template");
    containerElement.appendChild(emptyFolderTemplate.content.cloneNode(true));
  }

  async previewFile(path, isAbsolutePath=false) {
    this.showLoading();
    const previewUrl = await (isAbsolutePath ? getSharedSpiderPreviewUrl(path) : getPreviewUrl(path));
    if(previewUrl.url) {
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
    } else {
      this.showNoAccessErrorMessage();
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

  showLoading() {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const loadingElement = this.shadowRoot.getElementById("loading-template").content.cloneNode(true);
    containerElement.appendChild(loadingElement);    
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

  showNoAccessErrorMessage() {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const noAccessErrorNode = this.shadowRoot.getElementById("no-spider-access-template").content.cloneNode(true);
    const noAccessErrorElement = noAccessErrorNode.getElementById("no-spider-access");

    containerElement.appendChild(noAccessErrorElement);
  }

  async deleteFileOrFolder(name, isFolder) {
    const fullPath = this.currentPath.slice(1).join("/") + `/${name}`;

    if (isFolder) {
      await deleteBox(fullPath);
    } else {
      await deleteSpider(fullPath);
    }
  }

  addRowEvents(rowElement, entry) {
      let events = ["click"];
      const nameElement = rowElement.querySelector("slot[name='name']");

      for (let event of events) {
        nameElement.addEventListener(event, (_) => {
          if(entry.isFolder && !this.loadingFolder) {
              this.loadingFolder = true;
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
      }
  }

  updateListDisplay() {
    const containerElement = this.shadowRoot.querySelector(".container");
    const tableElement = this.shadowRoot.getElementById("table").content.cloneNode(true);
    const tableMainElement = tableElement.querySelector("main");

    this.clearBody(containerElement);

    const entryTemplate = this.shadowRoot.getElementById("row-entry");
    const headings = entryTemplate.content.cloneNode(true);

    for (let child of headings.children) {
      child.classList.add("table-column");
    }

    headings.querySelector("slot[name='name']").append("Name");
    headings.querySelector("slot[name='modified']").append("Modified");
    headings.querySelector("slot[name='size']").append("Size");

    headings.querySelector("#folder-icon").style.visibility = "hidden";
    headings.querySelector("#file-icon").style.visibility = "hidden";
    headings.querySelector("#delete-icon").style.visibility = "hidden";
    headings.querySelector("#share-icon").style.visibility = "hidden";
    headings.querySelector("#folder-icon").remove();

    tableMainElement.appendChild(headings);

    for (let entry of this.entries) {
      const rowEntry = entryTemplate.content.cloneNode(true);

      rowEntry.querySelector("slot[name='name']").append(entry.name);
      rowEntry.querySelector("slot[name='modified']").append(entry.modified);
      rowEntry.querySelector("slot[name='size']").append(entry.size);

      const deleteIcon = rowEntry.querySelector("#delete-icon");
      const shareIcon = rowEntry.querySelector("#share-icon");

      deleteIcon.addEventListener("click", async (event) => {
        this.showLoading();
        await this.deleteFileOrFolder(entry.name, entry.isFolder);
        return this.loadCurrentView();
      });

      if(entry.isFolder) {
        shareIcon.style.visibility = "hidden";
        rowEntry.querySelector("#file-icon").remove();
      } else {
        shareIcon.addEventListener("click", async () => {
          return this.showShareListEditor(entry.name)
        });
        rowEntry.querySelector("#folder-icon").remove();
      }

      this.addRowEvents(rowEntry, entry);
      tableMainElement.appendChild(rowEntry);
    }

    containerElement.appendChild(tableMainElement);
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document
      .getElementById("spider-view-component")
      .content.cloneNode(true);
    shadow.appendChild(template);

    const urlParams = new URLSearchParams(window.location.search);
    const fl = urlParams.get('fl');

    if(fl) {
      this.previewFile(fl, true);
    } else {
      this.loadCurrentView();
    }
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
