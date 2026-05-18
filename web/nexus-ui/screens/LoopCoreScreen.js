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

function renderContextItem(item) {
  return `
    <article class="nexus-loop-context-item" data-status="${escapeHtml(item.status)}">
      <span class="nexus-loop-context-item__dot" aria-hidden="true"></span>
      <div class="nexus-loop-context-item__copy">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
      </div>
    </article>
  `;
}

export function renderLoopCoreScreen(viewModel) {
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
    <section class="nexus-loop-screen">
      <div class="nexus-loop-screen__stepper">${steps}</div>
      ${renderNexusQaNav("loop")}

      <div class="nexus-loop-screen__intro">
        <div class="nexus-loop-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <h1>${escapeHtml(viewModel.title)}</h1>
        <p>${escapeHtml(viewModel.subtitle)}</p>
        <span class="nexus-loop-screen__detail">${escapeHtml(viewModel.detail)}</span>
      </div>

      ${viewModel.previewArtifact ? renderNexusCard({
        className: "nexus-loop-screen__preview-card",
        padding: "lg",
        content: `
          <div class="nexus-loop-screen__preview-head">
            <div>
              <span class="nexus-loop-screen__preview-label">זה התוצר שממשיך להיבנות עכשיו</span>
              <h2>${escapeHtml(viewModel.previewSurfaceTitle)}</h2>
              <p>${escapeHtml(viewModel.previewSurfaceSubtitle)}</p>
            </div>
            <span class="nexus-loop-screen__preview-status">${escapeHtml(viewModel.previewSurfaceStatus)}</span>
          </div>
          ${renderProofArtifactSurface(viewModel.previewArtifact, { surfaceId: "loop-surface-preview" })}
        `,
      }) : ""}

      <div class="nexus-loop-screen__grid">
        <div class="nexus-loop-screen__main">
          ${renderNexusCard({
            className: "nexus-loop-screen__why-card",
            padding: "lg",
            content: `
              <h2>למה זה חשוב עכשיו</h2>
              <p id="loop-primary-reason">${escapeHtml(viewModel.whyItMatters)}</p>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-loop-screen__next-card",
            padding: "lg",
            content: `
              <h2>מה יקרה אחרי הלחיצה</h2>
              <p id="loop-what-happens-body">${escapeHtml(viewModel.whatHappensNext)}</p>
            `,
          })}

          <div class="nexus-loop-screen__actions">
            ${renderNexusButton({
              label: viewModel.secondaryAction.label,
              variant: "secondary",
              className: "nexus-loop-screen__button",
              attrs: {
                id: "loop-secondary-action-button",
                "data-loop-target": viewModel.secondaryAction.target,
              },
            })}
            ${renderNexusButton({
              label: viewModel.primaryAction.label,
              variant: "primary",
              className: "nexus-loop-screen__button",
              attrs: {
                id: "loop-primary-action-button",
                "data-loop-target": viewModel.primaryAction.target,
                "data-loop-action-kind": viewModel.primaryAction.actionKind,
              },
            })}
          </div>
        </div>

        <aside class="nexus-loop-screen__side">
          ${renderNexusTaskCard(viewModel.mission)}

          ${renderNexusCard({
            className: "nexus-loop-screen__context-card",
            padding: "lg",
            content: `
              <h2>מה כבר סגור ומה נפתח אחר כך</h2>
              <div class="nexus-loop-context-list">
                ${viewModel.contextItems.map(renderContextItem).join("")}
              </div>
            `,
          })}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-loop-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "ל",
        },
        content,
      })}
    </section>
  `;
}
