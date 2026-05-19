import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
import { renderNexusStepper } from "../components/NexusStepper.js";
import { renderNexusTaskCard } from "../components/NexusTaskCard.js";
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

export function renderNextTaskScreen(viewModel) {
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
    <section class="nexus-next-task-screen">
      <div class="nexus-next-task-screen__stepper">${steps}</div>
      ${renderNexusQaNav("next-task")}

      <div class="nexus-next-task-screen__intro">
        <div class="nexus-next-task-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <h1>${escapeHtml(viewModel.title)}</h1>
        <p>${escapeHtml(viewModel.subtitle)}</p>
      </div>

      ${renderNexusCard({
        className: "nexus-next-task-screen__artifact-card",
        padding: "lg",
        content: `
          <div class="nexus-next-task-screen__artifact-header">
            <div>
              <span class="nexus-next-task-screen__artifact-label">המשימה הבאה נשענת על</span>
              <h2>${escapeHtml(viewModel.artifactTruth.title)}</h2>
              <p>${escapeHtml(viewModel.artifactTruth.subtitle)}</p>
            </div>
            ${viewModel.artifactAction.supported ? renderNexusButton({
              label: viewModel.artifactAction.label,
              variant: "secondary",
              className: "nexus-next-task-screen__artifact-button",
              attrs: {
                id: "next-task-artifact-button",
              },
            }) : ""}
          </div>
          ${renderProofArtifactSurface(viewModel.artifactTruth.artifact, { surfaceId: "next-task-artifact-surface" })}
        `,
      })}

      <div class="nexus-next-task-screen__grid">
        <div class="nexus-next-task-screen__main">
          ${renderNexusTaskCard(viewModel.mission)}

          ${renderNexusCard({
            className: "nexus-next-task-screen__reason-card",
            padding: "lg",
            content: `
              <h2>למה זה הצעד שהכי יקדם עכשיו</h2>
              <p>${escapeHtml(viewModel.whyNow)}</p>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-next-task-screen__ready-card",
            padding: "lg",
            content: `
              <div class="nexus-next-task-screen__details-grid">
                <div>
                  <h2>מה כבר מוכן בשביל להתחיל</h2>
                  <ul class="nexus-next-task-screen__list">
                    ${viewModel.readyNowItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    ${viewModel.artifactTruth.summaryItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </div>
                <div>
                  <h2>מה ייפתח מיד אחר כך</h2>
                  <ul class="nexus-next-task-screen__list">
                    ${viewModel.upcomingItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </div>
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-next-task-screen__ready-card",
            padding: "lg",
            content: `
              <div class="nexus-next-task-screen__artifact-header">
                <div>
                  <span class="nexus-next-task-screen__artifact-label">Growth boundary</span>
                  <h2>${escapeHtml(viewModel.growthOpportunityBoundary.statusLabel)}</h2>
                  <p>${escapeHtml(viewModel.growthOpportunityBoundary.visibleBoundaryRule)}</p>
                </div>
              </div>
              <div class="nexus-next-task-screen__details-grid">
                <div>
                  <h2>מה מותר להציע עכשיו</h2>
                  <ul class="nexus-next-task-screen__list">
                    ${viewModel.growthOpportunityBoundary.allowedMoves.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </div>
                <div>
                  <h2>מה נשאר מחוץ ל־Wave 4</h2>
                  <ul class="nexus-next-task-screen__list">
                    ${viewModel.growthOpportunityBoundary.disallowedMoves.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    ${viewModel.growthOpportunityBoundary.deferredOpportunityFamilies.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                    <li>${escapeHtml(viewModel.growthOpportunityBoundary.credibilityRule)}</li>
                    <li>${escapeHtml(viewModel.growthOpportunityBoundary.continuityRule)}</li>
                  </ul>
                </div>
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-next-task-screen__ready-card",
            padding: "lg",
            content: `
              <div class="nexus-next-task-screen__artifact-header">
                <div>
                  <span class="nexus-next-task-screen__artifact-label">Post-release continuation</span>
                  <h2>${escapeHtml(viewModel.postReleaseContinuation.statusLabel)}</h2>
                  <p>${escapeHtml(viewModel.postReleaseContinuation.visibleContinuationRule)}</p>
                </div>
                <span class="nexus-next-task-screen__artifact-label">${escapeHtml(viewModel.postReleaseContinuation.originReleaseTarget)}</span>
              </div>
              <div class="nexus-next-task-screen__details-grid">
                <div>
                  <h2>${escapeHtml(viewModel.postReleaseContinuation.nextMoveTitle)}</h2>
                  <p>${escapeHtml(viewModel.postReleaseContinuation.nextMoveDescription)}</p>
                  <ul class="nexus-next-task-screen__list">
                    ${viewModel.postReleaseContinuation.continuationMoves.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                  </ul>
                </div>
                <div>
                  <h2>למה זה נשאר bounded</h2>
                  <ul class="nexus-next-task-screen__list">
                    <li>${escapeHtml(viewModel.postReleaseContinuation.boundedGrowthRule)}</li>
                    <li>${escapeHtml(viewModel.postReleaseContinuation.continuityRule)}</li>
                    <li>${escapeHtml(`${viewModel.postReleaseContinuation.originArtifactTitle} -> ${viewModel.postReleaseContinuation.nextMoveFamily}`)}</li>
                  </ul>
                </div>
              </div>
            `,
          })}

          <div class="nexus-next-task-screen__actions">
            ${renderNexusButton({
              label: viewModel.secondaryAction.label,
              variant: "secondary",
              className: "nexus-next-task-screen__button",
              attrs: {
                id: "next-task-details-button",
                "data-next-task-target": viewModel.secondaryAction.target,
              },
            })}
            ${renderNexusButton({
              label: viewModel.primaryAction.label,
              variant: "primary",
              className: "nexus-next-task-screen__button",
              attrs: {
                id: "next-task-start-button",
                "data-next-task-target": viewModel.primaryAction.target,
                "data-next-task-action-kind": viewModel.primaryAction.actionKind ?? "execute",
              },
            })}
          </div>
        </div>

        <aside class="nexus-next-task-screen__side">
          ${renderNexusCard({
            className: "nexus-next-task-screen__stage-card",
            padding: "lg",
            content: `
              <h2>מה מצב ההתקדמות</h2>
              <div class="nexus-next-task-screen__stats">
                ${viewModel.stats.map((item) => `
                  <article class="nexus-next-task-screen__stat">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                  </article>
                `).join("")}
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-next-task-screen__blockers-card",
            padding: "lg",
            content: `
              <h2>מה עוד צריך לשים לב אליו</h2>
              <ul class="nexus-next-task-screen__list">
                ${(viewModel.blockerItems.length ? viewModel.blockerItems : ["אין כרגע חסם שמונע להתחיל."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            `,
          })}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-next-task-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "ה",
        },
        content,
      })}
    </section>
  `;
}

export function bindNextTaskScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-next-task");
  const bindings = {
    nextTaskStartButton: "#next-task-start-button",
    nextTaskDetailsButton: "#next-task-details-button",
    nextTaskArtifactButton: "#next-task-artifact-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
