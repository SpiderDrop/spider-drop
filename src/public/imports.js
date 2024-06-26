import { getConfig } from "./services/config-services.js";
import { copyAllChildren } from "./core/loader/loader.js";

let scriptImports = [
  // Component Imports
  "./components/index.js",

  // Page Imports
  "./pages/index.js",

  // Router
  "./core/routing/router.js"
];

function addImports() {
  customElements.defineComponent = componentName => {
    const templateUrl = `./components/${componentName}/${componentName}.html`;

    return fetch(templateUrl)
      .then(response => response.text())
      .then(response => {
        let template = document.createElement("template");
        template.id = componentName;

        const html = new DOMParser().parseFromString(response, "text/html");

        copyAllChildren(html.head, template.content);
        copyAllChildren(html.body, template.content);

        document.head.appendChild(template);
      });
  };

  for (let importUrl of scriptImports) {
    let script = document.createElement("script");
    script.type = "module";
    script.src = importUrl;
    document.head.appendChild(script);
  }
}

getConfig();
addImports();
