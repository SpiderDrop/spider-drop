let templateImports = [
  "./pages/home-page/home-page.html",
  "./pages/about-page/about-page.html",
  "./pages/not-found-page/not-found-page.html"
];

let scriptImports = [
  // Component Imports

  // Page Imports
  "./pages/index.js"
];

function addImports() {
  for (let templateUrl of templateImports) {
    let template = document.createElement("template");
    template.id = templateUrl.substring(
      templateUrl.lastIndexOf("/") + 1,
      templateUrl.lastIndexOf(".")
    );
    fetch(templateUrl).then(response => response.text()).then(response => {
      template.innerHTML = response;
      document.head.appendChild(template);
    });
  }

  for (let importUrl of scriptImports) {
    let script = document.createElement("script");
    script.type = "module";
    script.src = importUrl;
    document.head.appendChild(script);
  }
}

addImports();
