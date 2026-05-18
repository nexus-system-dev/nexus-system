import { renderNexusSidebar } from "../components/NexusSidebar.js";
import { renderNexusTopbar } from "../components/NexusTopbar.js";

export function renderWorkspaceLayout({
  sidebar = null,
  topbar = null,
  content = "",
} = {}) {
  const sidebarMarkup = sidebar ? renderNexusSidebar(sidebar) : "";
  const topbarMarkup = topbar ? renderNexusTopbar(topbar) : "";

  return `
    <div class="nexus-ui-shell">
      <div class="nexus-ui-workspace-shell">
        ${sidebarMarkup}
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
