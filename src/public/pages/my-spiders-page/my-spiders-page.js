export default class MySpidersPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "closed" });
    const template = document
      .getElementById("my-spiders-page")
      .content.cloneNode(true);
    shadow.appendChild(template);
  }

  disconnectedCallback() {}
}

customElements.define("my-spiders-page", MySpidersPage);
