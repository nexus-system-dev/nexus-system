import { escapeVisibleShellCopy } from "../copy/visible-shell-language.js";

const NEXUS_HORIZONTAL_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDY0MCAxOTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZGF0YS1mZy1keHhlMD0iOjA6L3NyYy9hcHAvY29tcG9uZW50cy9OZXh1c0xvZ29TeXN0ZW0udHN4OjYxOjU6MjAyMToxODc0OmU6c3ZnOmV0eHR4dHh0eHR4dHgiIGRhdGEtZmdpZC1keHhlMD0iOnJwajoiPjxkZWZzIGRhdGEtZmctZHh4ZTE9IjowOi9zcmMvYXBwL2NvbXBvbmVudHMvTmV4dXNMb2dvU3lzdGVtLnRzeDo2Nzo3OjIxNjI6MzkzOmU6ZGVmczplIj48bGluZWFyR3JhZGllbnQgaWQ9Im5leHVzLWdyYWRpZW50LTY0MC0xOTItaG9yaXpvbnRhbC1mdWxsLWNvbG9yIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIiBkYXRhLWZnLWR4eGUyPSI6MDovc3JjL2FwcC9jb21wb25lbnRzL05leHVzTG9nb1N5c3RlbS50c3g6Njg6OToyMTc3OjM2NDplOmxpbmVhckdyYWRpZW50OmV0ZSI+PHN0b3Agb2Zmc2V0PSIwJSIgZGF0YS1mZy1keHhlMz0iOjA6L3NyYy9hcHAvY29tcG9uZW50cy9OZXh1c0xvZ29TeXN0ZW0udHN4Ojc1OjExOjIzNjQ6Njk6ZTpzdG9wIiBzdHlsZT0ic3RvcC1jb2xvcjogcmdiKDk5LCAxMDIsIDI0MSk7IHN0b3Atb3BhY2l0eTogMTsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIGRhdGEtZmctZHh4ZTQ9IjowOi9zcmMvYXBwL2NvbXBvbmVudHMvTmV4dXNMb2dvU3lzdGVtLnRzeDo3NjoxMToyNDQ0OjcxOmU6c3RvcCIgc3R5bGU9InN0b3AtY29sb3I6IHJnYig3OSwgNzAsIDIyOSk7IHN0b3Atb3BhY2l0eTogMTsiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBkYXRhLWZnLWR4eGUxMD0iOjA6L3NyYy9hcHAvY29tcG9uZW50cy9OZXh1c0xvZ29TeXN0ZW0udHN4Ojg3Ojk6Mjc3NDo2MDI6ZTpnOmV0ZSI+PHJlY3QgeD0iMjQiIHk9IjI0IiB3aWR0aD0iMTQ0IiBoZWlnaHQ9IjE0NCIgcng9IjMxLjY4IiBmaWxsPSJ1cmwoI25leHVzLWdyYWRpZW50LTY0MC0xOTItaG9yaXpvbnRhbC1mdWxsLWNvbG9yKSIgZGF0YS1mZy1keHhlMTE9IjowOi9zcmMvYXBwL2NvbXBvbmVudHMvTmV4dXNMb2dvU3lzdGVtLnRzeDo4ODoxMToyNzg4OjE4NDplOnJlY3QiLz48dGV4dCB4PSI5NiIgeT0iOTYiIGZvbnQtc2l6ZT0iNzIiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGRhdGEtZmctZHh4ZTEyPSI6MDovc3JjL2FwcC9jb21wb25lbnRzL05leHVzTG9nb1N5c3RlbS50c3g6OTY6MTE6Mjk4MzozODA6ZTp0ZXh0OnQiPk48L3RleHQ+PC9nPjx0ZXh0IHg9IjE4Mi4zOTk5OTk5OTk5OTk5OCIgeT0iOTYiIGZvbnQtc2l6ZT0iNzIuOTYwMDAwMDAwMDAwMDEiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIHN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iIzBGMEYwRiIgdGV4dC1hbmNob3I9InN0YXJ0IiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgbGV0dGVyLXNwYWNpbmc9Ii0wLjAxNWVtIiBkYXRhLWZnLWR4eGUxNj0iOjA6L3NyYy9hcHAvY29tcG9uZW50cy9OZXh1c0xvZ29TeXN0ZW0udHN4OjExMzo5OjM0NDk6NDI2OmU6dGV4dDp0Ij5ORVhVUzwvdGV4dD48L3N2Zz4=";

const INTERNAL_ADVANCED_ROUTES = new Set(["/developer", "/brain", "/project-brain", "/advanced"]);
const CANONICAL_PRODUCT_ROUTES = new Set(["/release", "/growth"]);

function isExplicitDevModeEnabled() {
  if (typeof globalThis.location === "undefined") {
    return false;
  }

  const params = new URLSearchParams(globalThis.location.search ?? "");
  return params.get("dev") === "1";
}

function isVisibleAdvancedItem(item) {
  const href = String(item?.href ?? "");
  if (CANONICAL_PRODUCT_ROUTES.has(href)) {
    return true;
  }

  if (isExplicitDevModeEnabled()) {
    return true;
  }

  return !INTERNAL_ADVANCED_ROUTES.has(href);
}

function renderLink(item, currentRoute) {
  const isCurrent = item.href === currentRoute;
  const current = isCurrent ? ' aria-current="page"' : "";
  const icon = `<span class="nexus-ui-sidebar__icon">${item.icon}</span>`;
  const label = `<span>${escapeVisibleShellCopy(item.title)}</span>`;

  if (item.target) {
    return `
      <button class="nexus-ui-sidebar__link" type="button" data-nexus-ui-target="${item.target}"${current}>
        ${icon}
        ${label}
      </button>
    `;
  }

  return `
    <a class="nexus-ui-sidebar__link" href="${item.href}"${current}>
      ${icon}
      ${label}
    </a>
  `;
}

export function renderNexusSidebar({ primary = [], support = [], advanced = [], footer = [], currentRoute = "" } = {}) {
  const visibleAdvanced = advanced.filter(isVisibleAdvancedItem);

  return `
    <aside class="nexus-ui-sidebar" aria-label="Nexus navigation">
      <div class="nexus-ui-sidebar__brand">
        <img class="nexus-ui-sidebar__brand-image" src="${NEXUS_HORIZONTAL_LOGO}" alt="Nexus" />
      </div>

      <nav class="nexus-ui-sidebar__section">
        ${primary.map((item) => renderLink(item, currentRoute)).join("")}
      </nav>

      <nav class="nexus-ui-sidebar__section">
        ${support.map((item) => renderLink(item, currentRoute)).join("")}
      </nav>

      <nav class="nexus-ui-sidebar__section">
        ${visibleAdvanced.map((item) => renderLink(item, currentRoute)).join("")}
      </nav>

      <nav class="nexus-ui-sidebar__section nexus-ui-sidebar__section--footer">
        ${footer.map((item) => renderLink(item, currentRoute)).join("")}
      </nav>
    </aside>
  `;
}
