export default class AboutPage extends HTMLElement {
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
      .getElementById("about-page")
      .content.cloneNode(true);
    shadow.appendChild(template);
  }
}

customElements.define("about-page", AboutPage);
