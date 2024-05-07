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

    shadow.addEventListener("folderAdded", event => {
      console.log(`Folder ${event.detail.folderName} added`);
      event.stopPropagation();
    });

    shadow.addEventListener("filesUploaded", event => {
      console.log("Files uploaded");
      console.log(event.detail.files);
      event.stopPropagation();
    });
  }

  disconnectedCallback() {}
}

customElements.define("my-spiders-page", MySpidersPage);
