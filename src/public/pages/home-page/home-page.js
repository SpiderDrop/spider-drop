import { setStyling } from "../../core/loader/resource-loader.js";

export default class HomePage extends HTMLElement {
  constructor() {
    super();
    this.template = document
      .getElementById("home-page")
      .content.cloneNode(true);
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }

  navigateToAboutPage() {
    location.assign("/about");
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "closed" });

    setStyling("./pages/home-page/home-page.css", shadow);
    shadow.appendChild(this.template);

    shadow
      .getElementById("sign-in-button")
      .addEventListener("click", () => this.navigateToAboutPage());
  }

  disconnectedCallback() {
    this.template
      .getElementById("sign-in-button")
      .removeEventListener(() => this.navigateToAboutPage());
  }
}

customElements.define("home-page", HomePage);
