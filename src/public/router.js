import { match } from "../util.js";

export default class Router extends HTMLElement {
  connectedCallback() {
    this.updateLinks();
    this.navigate(window.location.pathname);
  }

  navigate(url) {
    const matchedRoute = match(this.routes, url);

    if (matchedRoute !== null) {
      this.activeRoute = matchedRoute;
      window.history.pushState(null, null, url);
      this.update();
    }

    window.history.pushState(null, null, url);
  }

  update() {
    const { component, title, params = {} } = this.activeRoute;

    if (component) {
      while (this.outlet.firstChild) {
        this.outlet.removeChild(this.outlet.firstChild);
      }

      const view = document.createElement(component);
      document.title = title || document.title;

      for (let key in params) {
        if (key !== "*") view.setAttribute(key, params[key]);
      }

      this.outlet.appendChild(view);
    }
  }

  updateLinks() {
    this.querySelectorAll("a[route]").forEach(link => {
      const target = link.getAttribute("route");
      link.setAttribute("href", target);
      link.onclick = e => {
        e.preventDefault();
        this.navigate(target);
      };
    });
  }

  get routes() {
    return Array.from(this.querySelectorAll("wc-route"))
      .filter(node => node.parentNode === this)
      .map(route => ({
        path: route.getAttribute("path"),
        title: route.getAttribute("title"),
        component: route.getAttribute("component")
      }));
  }

  get outlet() {
    return this.querySelector("wc-outlet");
  }
}

customElements.define("wc-router", Router);
