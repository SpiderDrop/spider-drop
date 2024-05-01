let imports = [
  // CDN Imports
  "https://unpkg.com/@generic-components/components@latest/spinner.js",

  // Component Imports

  // Page Imports
  "./pages/home-page/home-page.js"
];

function addImports() {
  for (let importUrl of imports) {
    let script = document.createElement("script");
    script.type = "module";
    script.src = importUrl;
    document.head.appendChild(script);
  }
}

addImports();
