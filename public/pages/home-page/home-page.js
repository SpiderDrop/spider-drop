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

    shadow.innerHTML = `
      <div class="background">
        <div class="greeting-panel">
            <div class="text-small">Welcome to</div>
            <div class="text-large roboto-bold">Spider Drop</div>
            <button class="button-sign-in roboto-bold">Sign In</button>
        </div>
      </div>
    `;

    fetch("./pages/home-page/home-page.css")
      .then(response => response.text())
      .then(response => {
        const styling = new CSSStyleSheet();
        styling.replaceSync(response);
        shadow.adoptedStyleSheets = [styling];
      });
  }
}

customElements.define("home-page", HomePage);
