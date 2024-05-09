export default class SearchHeaderComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const template = document
      .getElementById("search-header-component")
      .content.cloneNode(true);
    shadow.appendChild(template);
    const search = this.shadowRoot.getElementById("input");

    search.addEventListener("change", (event) => {
      this.dispatchEvent(
        new CustomEvent("searchInput", {
          composed: true,
          bubbles: true,
          cancelable: true,
          detail: {
            search: event.target.value
          }
        })
      );
    });
  }

  disconnectedCallback() {}
}

await customElements.defineComponent("search-header-component");
customElements.define("search-header", SearchHeaderComponent);
