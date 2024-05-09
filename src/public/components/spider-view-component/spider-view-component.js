import {
  fetchCurrentDirectory,
  filteredContent
} from "../../services/file-service.js";

export default class SpiderViewComponent extends HTMLElement {
  static observedAttributes = ["refresh", "offset", "search"];

  constructor() {
    super();
    this.currentPath = ["/"];
    this.entries = [];
  }

  navigateBackDirectories(directoryBackCount) {
    if (directoryBackCount > this.currentPath.length) return;

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
    if (name === "search") {
      this.loadCurrentView(newValue);
    }
  }

  async search(spider) {
    return await filteredContent(spider);
  }

  async loadCurrentView(search = "") {
    const fullPath = this.currentPath.slice(1).join("/");
    let currentDirectory = search
      ? await this.search(search)
      : await fetchCurrentDirectory(fullPath);

    const dateTimeFormat = new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    this.entries = [];

    currentDirectory.forEach((entity) => {
      const isFolder = Boolean(entity.isBox);
      const lastModified = new Date(entity.LastModified);

      this.entries.push({
        name: entity.name,
        modified: dateTimeFormat.format(lastModified),
        size: entity.Size + (isFolder ? " files" : ""),
        sharing: Boolean(entity.sharing) ? "public" : "private",
        isFolder: isFolder
      });
    });

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

    this.entries.sort(function (a, b) {
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

    const emptyFolderTemplate = this.shadowRoot.getElementById(
      "empty-folder-template"
    );
    containerElement.appendChild(emptyFolderTemplate.content.cloneNode(true));
  }

  updateListDisplay() {
    const containerElement = this.shadowRoot.querySelector(".container");
    this.clearBody(containerElement);

    const columnTemplate = this.shadowRoot.getElementById("column-template");
    containerElement.appendChild(columnTemplate.content.cloneNode(true));

    const tableBody = this.shadowRoot.querySelector("tbody");

    const rowTemplateElement = this.shadowRoot.getElementById("row-template");

    this.entries.forEach((entry) => {
      const rowTemplate = rowTemplateElement.content.cloneNode(true);
      rowTemplate.querySelector("slot[name='name']").append(entry.name);
      rowTemplate.querySelector("slot[name='modified']").append(entry.modified);
      rowTemplate.querySelector("slot[name='size']").append(entry.size);
      rowTemplate.querySelector("slot[name='sharing']").append(entry.sharing);

      const rowElement = document.createElement("tr");
      rowElement.appendChild(rowTemplate);

      if (entry.isFolder) {
        rowElement.addEventListener("click", (_) => {
          this.expandFolder(entry.name);
          this.dispatchEvent(
            new CustomEvent("folderEntered", {
              bubbles: true,
              cancelable: true,
              composed: true,
              detail: {
                folderName: entry.name
              }
            })
          );
        });
      }

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

    headings.forEach((heading) => {
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
