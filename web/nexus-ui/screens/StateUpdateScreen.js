import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
import { renderNexusStepper } from "../components/NexusStepper.js";
import { renderProofArtifactSurface } from "../components/ProofArtifactSurface.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderUpdateCard(item) {
  return `
    <article class="nexus-state-update-card ${escapeHtml(item.tone)}">
      <span class="nexus-state-update-card__icon" aria-hidden="true">${escapeHtml(item.glyph)}</span>
      <div class="nexus-state-update-card__copy">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.description)}</p>
        <span>${escapeHtml(item.impact)}</span>
      </div>
    </article>
  `;
}

export function renderStateUpdateScreen(viewModel) {
  const sidebar = {
    currentRoute: "/loop",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
      { title: "הבנה", href: "/onboarding", target: "onboarding", icon: "⌂" },
      { title: "לולאה", href: "/loop", target: "loop", icon: "▦" },
      { title: "ציר זמן", href: "/timeline", target: "timeline", icon: "◷" },
    ],
    support: [
      { title: "בית", href: "/home", icon: "⌂" },
      { title: "קבצים", href: "/files", icon: "⌘" },
    ],
    advanced: [
      { title: "Developer", href: "/developer", icon: "⌘" },
      { title: "מוח הפרויקט", href: "/brain", icon: "☷" },
      { title: "שחרורים", href: "/release", icon: "▤" },
      { title: "צמיחה", href: "/growth", icon: "↗" },
    ],
    footer: [
      { title: "הגדרות", href: "/settings", icon: "⚙" },
      { title: "עזרה", href: "/help", icon: "?" },
    ],
  };

  const steps = renderNexusStepper([
    { label: "יצירה", status: "complete", glyph: "✓" },
    { label: "הכרת הפרויקט", status: "complete", glyph: "✓" },
    { label: "הבנה", status: "complete", glyph: "✓" },
    { label: "פעולה", status: "active" },
  ]);

  const content = `
    <section class="nexus-state-update-screen">
      <div class="nexus-state-update-screen__stepper">${steps}</div>
      ${renderNexusQaNav("state-update")}

      <div class="nexus-state-update-screen__intro">
        <div class="nexus-state-update-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <h1>${escapeHtml(viewModel.title)}</h1>
        <p>${escapeHtml(viewModel.subtitle)}</p>
      </div>

      ${renderNexusCard({
        className: "nexus-state-update-screen__artifact-card",
        padding: "lg",
        content: `
          <div class="nexus-state-update-screen__artifact-header">
            <div>
              <span class="nexus-state-update-screen__artifact-label">הדבר שאושר עכשיו</span>
              <h2>${escapeHtml(viewModel.artifactTruth.title)}</h2>
              <p>${escapeHtml(viewModel.artifactTruth.subtitle)}</p>
            </div>
            ${viewModel.artifactAction.supported ? renderNexusButton({
              label: viewModel.artifactAction.label,
              variant: "secondary",
              className: "nexus-state-update-screen__artifact-button",
              attrs: {
                id: "state-update-artifact-button",
              },
            }) : ""}
          </div>
          ${renderProofArtifactSurface(viewModel.artifactTruth.artifact, { surfaceId: "state-update-artifact-surface" })}
        `,
      })}

      <div class="nexus-state-update-screen__grid">
        <div class="nexus-state-update-screen__main">
          ${renderNexusCard({
            className: "nexus-state-update-screen__updates-card",
            padding: "lg",
            content: `
              <h2>מה התקדם בפועל</h2>
              <div class="nexus-state-update-card-list">
                ${viewModel.updateCards.map(renderUpdateCard).join("")}
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-state-update-screen__details-card",
            padding: "lg",
            content: `
              <div class="nexus-state-update-screen__details-grid">
                <div>
                  <h2>מה כבר בידיים שלך</h2>
                  <ul class="nexus-state-update-screen__list">
                    ${viewModel.completionItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    ${viewModel.artifactTruth.summaryItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </div>
                <div>
                  <h2>מה נפתח מיד</h2>
                  <ul class="nexus-state-update-screen__list">
                    ${viewModel.unlockedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </div>
              </div>
              <p class="nexus-state-update-screen__meaning">${escapeHtml(viewModel.nextMeaning)}</p>
            `,
          })}

          <div class="nexus-state-update-screen__actions">
            ${renderNexusButton({
              label: viewModel.secondaryAction.label,
              variant: "secondary",
              className: "nexus-state-update-screen__button",
              attrs: {
                id: "state-update-history-button",
                "data-state-update-target": viewModel.secondaryAction.target,
              },
            })}
            ${renderNexusButton({
              label: viewModel.primaryAction.label,
              variant: "primary",
              className: "nexus-state-update-screen__button",
              attrs: {
                id: "state-update-next-button",
                "data-state-update-target": viewModel.primaryAction.target,
              },
            })}
          </div>
        </div>

        <aside class="nexus-state-update-screen__side">
          ${renderNexusCard({
            className: "nexus-state-update-screen__progress-card",
            padding: "lg",
            content: `
              <h2>איפה הפרויקט עומד עכשיו</h2>
              <div class="nexus-state-update-screen__stats">
                ${viewModel.stats.map((item) => `
                  <article class="nexus-state-update-screen__stat">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                  </article>
                `).join("")}
              </div>
              <div class="nexus-state-update-screen__progress">
                <div class="nexus-state-update-screen__progress-meta">
                  <span>${escapeHtml(viewModel.progressLabel)}</span>
                  <strong>${escapeHtml(viewModel.progressPercent)}%</strong>
                </div>
                <div class="nexus-state-update-screen__progress-bar">
                  <div class="nexus-state-update-screen__progress-fill" style="width:${Number(viewModel.progressPercent) || 0}%"></div>
                </div>
              </div>
            `,
          })}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-state-update-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "ע",
        },
        content,
      })}
    </section>
  `;
}

export function bindStateUpdateScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-state-update");
  const bindings = {
    stateUpdateNextButton: "#state-update-next-button",
    stateUpdateHistoryButton: "#state-update-history-button",
    stateUpdateArtifactButton: "#state-update-artifact-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
