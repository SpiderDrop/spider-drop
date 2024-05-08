export default class SearchHeaderComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "closed" });
    const template = document
      .getElementById("search-header-component")
      .content.cloneNode(true);
    shadow.appendChild(template);
  }

  disconnectedCallback() {}
}

await customElements.defineComponent("search-header-component");
customElements.define("search-header", SearchHeaderComponent);
