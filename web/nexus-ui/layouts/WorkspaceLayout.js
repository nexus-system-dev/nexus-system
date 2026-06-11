import { renderNexusTopbar } from "../components/NexusTopbar.js";
import {
  normalizeNexusWorkspaceRailRoute,
  renderNexusWorkspaceRail,
} from "../components/NexusWorkspaceRail.js";

export function renderWorkspaceLayout({
  sidebar = null,
  topbar = null,
  content = "",
} = {}) {
  const railMarkup = sidebar
    ? renderNexusWorkspaceRail({
        currentRoute: normalizeNexusWorkspaceRailRoute(sidebar.currentRoute),
      })
    : "";
  const topbarMarkup = topbar ? renderNexusTopbar(topbar) : "";

  return `
    <div class="nexus-ui-shell">
      <div class="nexus-ui-workspace-shell">
        ${railMarkup}
        <div class="nexus-ui-main">
          ${topbarMarkup}
          <main class="nexus-ui-content">
            <div class="nexus-ui-route-shell">
              ${content}
            </div>
          </main>
        </div>
      </div>
    </div>
  `;
}
