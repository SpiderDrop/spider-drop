export default class NotFoundPage extends HTMLElement {
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
      .getElementById("not-found-page")
      .content.cloneNode(true);
    shadow.appendChild(template);
  }
}

customElements.define("not-found-page", NotFoundPage);
