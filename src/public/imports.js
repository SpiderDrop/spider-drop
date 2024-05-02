let scriptImports = [
  // Component Imports
  "./components/index.js",

  // Page Imports
  "./pages/index.js",

  // Router
  "./core/routing/router.js"
];

function addImports() {
  for (let importUrl of scriptImports) {
    let script = document.createElement("script");
    script.type = "module";
    script.src = importUrl;
    document.head.appendChild(script);
  }
}

addImports();
