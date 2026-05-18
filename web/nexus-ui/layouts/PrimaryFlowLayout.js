import { renderNexusTopbar } from "../components/NexusTopbar.js";

export function renderPrimaryFlowLayout({ topbar = {}, content = "" } = {}) {
  return `
    <div class="nexus-ui-flow-shell">
      <div class="nexus-ui-flow-topbar">
        ${renderNexusTopbar(topbar)}
      </div>
      <main class="nexus-ui-flow-content">
        ${content}
      </main>
    </div>
  `;
}
