let imports = ["./pages/home-page/home-page.js"];

function addImports() {
  for (let importUrl of imports) {
    let script = document.createElement("script");
    script.type = "module";
    script.src = importUrl;
    document.head.appendChild(script);
  }
}

addImports();
