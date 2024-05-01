import { setStyling } from "../../core/loader/resource-loader.js";

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

    setStyling("./pages/not-found-page/not-found-page.css", shadow);
    const template = document.getElementById("not-found-page");
    shadow.innerHTML = template.innerHTML;
  }
}

customElements.define("not-found-page", NotFoundPage);
