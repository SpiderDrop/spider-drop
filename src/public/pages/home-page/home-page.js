export default class HomePage extends HTMLElement {
  constructor() {
    super();
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }

  navigateToAboutPage() {
    location.assign("/my-spiders");
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "closed" });
    const template = document
      .getElementById("home-page")
      .content.cloneNode(true);
    shadow.appendChild(template);

    shadow
      .getElementById("sign-in-button")
      .addEventListener("click", () => this.navigateToAboutPage());
  }

  disconnectedCallback() {}
}

customElements.define("home-page", HomePage);
