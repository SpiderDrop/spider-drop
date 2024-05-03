export default class SearchHeaderComponent extends HTMLElement {
  constructor() {
    super();
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
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

customElements.define("search-header", SearchHeaderComponent);
customElements.defineComponent("search-header-component");
