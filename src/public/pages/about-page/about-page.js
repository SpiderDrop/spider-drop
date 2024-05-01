import { setStyling } from "../../core/loader/resource-loader.js";

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

    setStyling("./pages/about-page/about-page.css", shadow);
    const template = document.getElementById("about-page");
    shadow.innerHTML = template.innerHTML;
  }
}

customElements.define("about-page", AboutPage);
