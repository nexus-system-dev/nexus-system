import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
import { renderProofArtifactSurface } from "../components/ProofArtifactSurface.js";
import { renderNexusStepper } from "../components/NexusStepper.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTimelineEntry(entry) {
  return `
    <article class="nexus-timeline-screen__event ${escapeHtml(entry.tone)}">
      <div class="nexus-timeline-screen__event-marker" aria-hidden="true">
        <span>${escapeHtml(entry.glyph)}</span>
      </div>
      <div class="nexus-timeline-screen__event-card">
        <div class="nexus-timeline-screen__event-meta">
          <span class="nexus-timeline-screen__event-kind">${escapeHtml(entry.kind)}</span>
          <time>${escapeHtml(entry.timestamp)}</time>
        </div>
        <strong>${escapeHtml(entry.title)}</strong>
        <p>${escapeHtml(entry.description)}</p>
      </div>
    </article>
  `;
}

export function renderTimelineHistoryScreen(viewModel) {
  const sidebar = {
    currentRoute: "/timeline",
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
    { label: "פעולה", status: "complete", glyph: "✓" },
  ]);

  const content = `
    <section class="nexus-timeline-screen">
      <div class="nexus-timeline-screen__stepper">${steps}</div>
      ${renderNexusQaNav("timeline")}

      <div class="nexus-timeline-screen__header">
        <div class="nexus-timeline-screen__intro">
          <div class="nexus-timeline-screen__badge">${escapeHtml(viewModel.badge)}</div>
          <h1>${escapeHtml(viewModel.title)}</h1>
          <p>${escapeHtml(viewModel.subtitle)}</p>
        </div>
        ${renderNexusButton({
          label: viewModel.primaryAction.label,
          variant: "primary",
          className: "nexus-timeline-screen__return-button",
          attrs: {
            id: "timeline-return-button",
            "data-timeline-target": viewModel.primaryAction.target,
          },
        })}
      </div>

      <div class="nexus-timeline-screen__layout">
        <div class="nexus-timeline-screen__main">
          ${renderNexusCard({
            className: "nexus-timeline-screen__artifact-card",
            padding: "lg",
            content: `
              <div class="nexus-timeline-screen__artifact-header">
                <div>
                  <span class="nexus-timeline-screen__artifact-label">התוצר האחרון בלולאה</span>
                  <h2>${escapeHtml(viewModel.artifactTruth.title)}</h2>
                  <p>${escapeHtml(viewModel.artifactTruth.subtitle)}</p>
                </div>
                ${viewModel.artifactAction.supported ? renderNexusButton({
                  label: viewModel.artifactAction.label,
                  variant: "secondary",
                  className: "nexus-timeline-screen__artifact-button",
                  attrs: {
                    id: "timeline-artifact-button",
                  },
                }) : ""}
              </div>
              ${renderProofArtifactSurface(viewModel.artifactTruth.artifact, { surfaceId: "timeline-artifact-surface" })}
            `,
          })}

          ${renderNexusCard({
            className: "nexus-timeline-screen__events-card",
            padding: "lg",
            content: `
              <div class="nexus-timeline-screen__artifact-header">
                <div>
                  <span class="nexus-timeline-screen__artifact-label">Wave 4 live verification matrix</span>
                  <h2>${escapeHtml(viewModel.wave4LiveVerificationMatrix.statusLabel)}</h2>
                  <p>${escapeHtml(viewModel.wave4LiveVerificationMatrix.matrixRule)}</p>
                </div>
              </div>
              <div class="nexus-timeline-screen__stats">
                <article class="nexus-timeline-screen__stat">
                  <span>Total lanes</span>
                  <strong>${escapeHtml(viewModel.wave4LiveVerificationMatrix.summary.totalLanes)}</strong>
                </article>
                <article class="nexus-timeline-screen__stat">
                  <span>Execution routes</span>
                  <strong>${escapeHtml(viewModel.wave4LiveVerificationMatrix.summary.executionRoutes)}</strong>
                </article>
                <article class="nexus-timeline-screen__stat">
                  <span>Proof routes</span>
                  <strong>${escapeHtml(viewModel.wave4LiveVerificationMatrix.summary.proofRoutes)}</strong>
                </article>
                <article class="nexus-timeline-screen__stat">
                  <span>Restore checks</span>
                  <strong>${escapeHtml(viewModel.wave4LiveVerificationMatrix.summary.restoreChecks)}</strong>
                </article>
              </div>
              <div class="nexus-timeline-screen__stats">
                ${viewModel.wave4LiveVerificationMatrix.verificationLanes.map((item) => `
                  <article class="nexus-timeline-screen__stat">
                    <span>${escapeHtml(`${item.routeKey} · ${item.title}`)}</span>
                    <strong>${escapeHtml(item.visibleAnchor)}</strong>
                  </article>
                `).join("")}
              </div>
              <ul>
                <li>${escapeHtml(viewModel.wave4LiveVerificationMatrix.strongerPreviewRule)}</li>
                <li>${escapeHtml(viewModel.wave4LiveVerificationMatrix.restoreRule)}</li>
                ${viewModel.wave4LiveVerificationMatrix.verificationLanes.flatMap((item) => [
                  ...item.passCriteria.map((entry) => `${item.laneId}: ${entry}`),
                  ...item.restoreChecks.map((entry) => `${item.laneId}: ${entry}`),
                ]).slice(0, 10).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-timeline-screen__events-card",
            padding: "lg",
            content: `
              <div class="nexus-timeline-screen__artifact-header">
                <div>
                  <span class="nexus-timeline-screen__artifact-label">Cross-surface continuity</span>
                  <h2>${escapeHtml(viewModel.crossSurfaceContinuity.statusLabel)}</h2>
                  <p>${escapeHtml(viewModel.crossSurfaceContinuity.visibleContinuityRule)}</p>
                </div>
              </div>
              <div class="nexus-timeline-screen__stats">
                ${viewModel.crossSurfaceContinuity.continuitySteps.map((item) => `
                  <article class="nexus-timeline-screen__stat">
                    <span>${escapeHtml(`${item.routeKey} · ${item.title}`)}</span>
                    <strong>${escapeHtml(item.visibleAnchor)}</strong>
                  </article>
                `).join("")}
              </div>
              <ul>
                ${viewModel.crossSurfaceContinuity.continuityChecks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                <li>${escapeHtml(viewModel.crossSurfaceContinuity.restoreRule)}</li>
                <li>${escapeHtml(viewModel.crossSurfaceContinuity.explainablePath)}</li>
              </ul>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-timeline-screen__events-card",
            padding: "lg",
            content: `
              <h2>רצף ההתקדמות</h2>
              <div class="nexus-timeline-screen__events">
                ${viewModel.entries.map(renderTimelineEntry).join("")}
              </div>
            `,
          })}
        </div>

        <aside class="nexus-timeline-screen__side">
          ${renderNexusCard({
            className: "nexus-timeline-screen__stats-card",
            padding: "lg",
            content: `
              <h2>מה כבר יש ביד</h2>
              <div class="nexus-timeline-screen__stats">
                ${viewModel.stats.map((item) => `
                  <article class="nexus-timeline-screen__stat">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                  </article>
                `).join("")}
              </div>
            `,
          })}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-timeline-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "צ",
        },
        content,
      })}
    </section>
  `;
}

export function bindTimelineHistoryScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-timeline");
  const bindings = {
    timelineReturnButton: "#timeline-return-button",
    timelineArtifactButton: "#timeline-artifact-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
