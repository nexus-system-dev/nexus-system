import { renderNexusWorkspaceRail } from "../components/NexusWorkspaceRail.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items = []) {
  return `
    <ul class="nexus-studio-boundary__list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

export function renderStudioBoundaryScreen(viewModel = {}) {
  const contract = viewModel.contract ?? {};
  const studio = viewModel.studio ?? {};
  const connection = studio.connection ?? {};
  const handoffAgent = studio.handoffAgent ?? {};
  const handoffEnvelope = handoffAgent.envelope ?? {};
  const fallback = handoffAgent.unavailableFallback ?? {};

  const content = `
    <section
      class="nexus-studio-boundary"
      data-studio-boundary-contract="${escapeHtml(contract.contractId ?? "SURF-008")}"
      data-surface-id="${escapeHtml(contract.surfaceId ?? "studio")}"
      data-surface-purpose="${escapeHtml(contract.purpose ?? "desktop-local-workspace-boundary")}"
      data-studio-law="${escapeHtml(contract.studioLaw ?? "nexus-web-identifies-explains-and-hands-off-to-nexus-studio-desktop")}"
      data-studio-handoff-agent-task="${escapeHtml(handoffAgent.taskId ?? "STD-HANDOFF-AGT-001")}"
      data-studio-handoff-agent-status="${escapeHtml(handoffAgent.status ?? "unavailable-fallback")}"
      data-studio-handoff-decision="${escapeHtml(handoffAgent.decision ?? "prepare-with-fallback")}"
      data-studio-handoff-id="${escapeHtml(handoffEnvelope.handoffId ?? "")}"
      data-studio-handoff-protocol="${escapeHtml(handoffEnvelope.handoffProtocolVersion ?? "studio-handoff-v1")}"
      data-studio-handoff-required-capability="${escapeHtml(handoffEnvelope.requiredLocalCapability ?? "local-workspace")}"
      data-studio-handoff-return-contract="${escapeHtml((handoffAgent.returnContract?.acceptedStates ?? []).join("|"))}"
    >
      <header class="nexus-studio-boundary__hero" data-studio-region="studio-web-boundary-explanation">
        <div>
          <p class="nexus-studio-boundary__eyebrow">Nexus Web ↔ Nexus Studio Desktop</p>
          <h1>${escapeHtml(studio.boundaryTitle)}</h1>
          <p>${escapeHtml(studio.boundaryBody)}</p>
        </div>
        <aside class="nexus-studio-boundary__status" data-studio-region="studio-desktop-connection-status">
          <span class="${connection.isConnected ? "is-connected" : "is-disconnected"}"></span>
          <strong>${escapeHtml(connection.label)}</strong>
          <p>${escapeHtml(connection.body)}</p>
          <code>${escapeHtml(connection.status)}</code>
        </aside>
      </header>

      <section class="nexus-studio-boundary__grid">
        <section class="nexus-studio-boundary__panel nexus-studio-boundary__panel--action" data-studio-region="studio-open-desktop-action">
          <span class="nexus-studio-boundary__tag">מעבר מקומי</span>
          <h2>פתח את אותו פרויקט ב־Nexus Studio</h2>
          <p>${escapeHtml(studio.requiredReason)}</p>
          <p>${escapeHtml(connection.isConnected ? "נקסוס יפתח בקשת מעבר מוגבלת ויחכה לאישור חזרה מהאפליקציה המקומית." : "נקסוס יכין בקשת מעבר, אבל לא יטען שהאפליקציה המקומית נפתחה או התחברה עד שתחזור הוכחה.")}</p>
          <div class="nexus-studio-boundary__actions">
            <a class="nexus-studio-boundary__primary-action" href="${escapeHtml(studio.desktopOpenUrl)}">
              ${escapeHtml(studio.primaryActionLabel)}
            </a>
            <button type="button" class="nexus-studio-boundary__secondary-action" data-nexus-ui-target="loop">
              המשך ב־Web
            </button>
          </div>
        </section>

        <section class="nexus-studio-boundary__panel" data-studio-region="studio-install-fallback">
          <span class="nexus-studio-boundary__tag">אם Studio לא מותקן</span>
          <h2>האתר לא מזייף יכולות מקומיות</h2>
          <p>${escapeHtml(fallback.body ?? "בלי אפליקציית Desktop מחוברת, Nexus Web לא מציג עורך קבצים מקומי ולא מבטיח הרצה מקומית.")}</p>
          <div class="nexus-studio-boundary__actions">
            ${studio.installUrl
              ? `<a class="nexus-studio-boundary__secondary-action" href="${escapeHtml(studio.installUrl)}">${escapeHtml(studio.fallbackActionLabel)}</a>`
              : `<button type="button" class="nexus-studio-boundary__secondary-action" disabled>${escapeHtml(studio.fallbackActionLabel)}</button>`}
          </div>
        </section>

        <section class="nexus-studio-boundary__panel nexus-studio-boundary__panel--split" data-studio-region="studio-web-vs-desktop-split">
          <span class="nexus-studio-boundary__tag">גבול אחריות</span>
          <div class="nexus-studio-boundary__split">
            <article>
              <h2>מה נשאר ב־Web</h2>
              ${renderList(studio.webResponsibilities ?? [])}
            </article>
            <article>
              <h2>מה עובר ל־Studio Desktop</h2>
              ${renderList(studio.desktopResponsibilities ?? [])}
            </article>
          </div>
        </section>

        <section class="nexus-studio-boundary__panel" data-studio-region="studio-return-to-web-product-truth">
          <span class="nexus-studio-boundary__tag">חזרה לאמת המוצר</span>
          <h2>Studio לא הופך למוצר נפרד</h2>
          <p>כל עבודה מקומית חייבת לחזור לאותו פרויקט, לאותו הקשר, ולאותה אמת מוצר בענן.</p>
          <p>נקסוס יקבל בחזרה רק מצב שמחובר לבקשת המעבר הזאת, ולא יקבל הצלחה כללית בלי קשר לפרויקט.</p>
          <div class="nexus-studio-boundary__actions">
            ${(studio.returnTargets ?? []).map((target) => `
              <button type="button" class="nexus-studio-boundary__secondary-action" data-nexus-ui-target="${escapeHtml(target.target)}">
                ${escapeHtml(target.label)}
              </button>
            `).join("")}
          </div>
        </section>
      </section>
    </section>
  `;

  return `
    <section
      class="nexus-studio-workspace-shell"
      data-studio-workspace-shell="canonical-right-rail"
      data-studio-workspace-project="${escapeHtml(viewModel.project?.name ?? "Studio")}"
    >
      <div class="nexus-studio-workspace-shell__content">
        ${content}
      </div>
      ${renderNexusWorkspaceRail({ currentRoute: "studio" })}
    </section>
  `;
}
