import { setStyling, setTemplate } from "../../core/loader/resource-loader.js";

class HomePage extends HTMLElement {
  constructor() {
    super();
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "closed" });

    setStyling("./pages/home-page/home-page.css", shadow);
    const template = document.getElementById("home-page");
    shadow.innerHTML = template.innerHTML;
  }
}

customElements.define("home-page", HomePage);
