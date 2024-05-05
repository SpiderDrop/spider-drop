export default class SidebarComponent extends HTMLElement {
    constructor() {
        super(); 
    }

    navigateToHomePage() {
      location.assign("/");
    }

    connectedCallback() 
    {
      const shadow = this.attachShadow({ mode: "closed" });
      const template = document.getElementById("side-bar-component").content.cloneNode(true);
      shadow.appendChild(template);

      shadow.getElementById("sign-out-button")
            .addEventListener("click", () => this.navigateToHomePage());
    }
    
    disconnectedCallback() {}
}

customElements.define("side-bar", SidebarComponent);
customElements.defineComponent("side-bar-component");