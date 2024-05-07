import { fetchCurrentDirectory } from "../../services/file-service.js";

export default class SpiderViewComponent extends HTMLElement {
  constructor() {
    super();
    this.currentPath = "/";
    this.entries = [];
  }

  async loadCurrentView() {
    const spiders = await fetchCurrentDirectory(this.currentPath);
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

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }

  updateListDisplay() {
    const tableBody = this.shadowRoot.querySelector("tbody");

    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }

    const rowTemplateElement = this.shadowRoot.getElementById("row-template");

    this.entries.forEach(entry => {
      const rowTemplate = rowTemplateElement.content.cloneNode(true);
      rowTemplate.querySelector("slot[name='name']").append(entry.name);
      rowTemplate.querySelector("slot[name='modified']").append(entry.modified);
      rowTemplate.querySelector("slot[name='size']").append(entry.size);
      rowTemplate.querySelector("slot[name='sharing']").append(entry.sharing);

      const rowElement = document.createElement("tr");
      rowElement.appendChild(rowTemplate);

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
