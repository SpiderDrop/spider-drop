export async function setStyling(path, shadowDom) {
  fetch(path).then(response => response.text()).then(response => {
    const styling = new CSSStyleSheet();
    styling.replaceSync(response);
    shadowDom.adoptedStyleSheets = [styling];
  });
}
