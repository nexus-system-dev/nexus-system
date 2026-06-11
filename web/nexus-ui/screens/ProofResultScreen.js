import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
import { renderNexusStepper } from "../components/NexusStepper.js";
import { renderProofArtifactSurface } from "../components/ProofArtifactSurface.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";
import { escapeVisibleShellCopy, sanitizeVisibleShellCopy } from "../copy/visible-shell-language.js";

function escapeHtml(value) {
  return escapeVisibleShellCopy(value);
}

function renderCriterion(item) {
  return `
    <article class="nexus-proof-criterion${item.passed ? " passed" : ""}">
      <span class="nexus-proof-criterion__icon" aria-hidden="true">${item.passed ? "✓" : "!"}</span>
      <div class="nexus-proof-criterion__copy">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
      </div>
    </article>
  `;
}

function renderArtifact(item) {
  return `
    <article class="nexus-proof-artifact">
      <div class="nexus-proof-artifact__meta">
        <span class="nexus-proof-artifact__type">${escapeHtml(item.type)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <span class="nexus-proof-artifact__detail">${escapeHtml(item.meta)}</span>
    </article>
  `;
}

function renderReleaseEvidenceItem(item) {
  return `
    <article class="nexus-proof-artifact">
      <div class="nexus-proof-artifact__meta">
        <span class="nexus-proof-artifact__type">${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}</strong>
      </div>
    </article>
  `;
}

function renderReleaseCheck(item) {
  return `
    <article class="nexus-proof-criterion${item.status === "passed" ? " passed" : ""}">
      <span class="nexus-proof-criterion__icon" aria-hidden="true">${item.status === "passed" ? "✓" : "!"}</span>
      <div class="nexus-proof-criterion__copy">
        <strong>${escapeHtml(item.checkId)}</strong>
        <p>${escapeHtml(item.reason)}</p>
      </div>
    </article>
  `;
}

function sanitizeProductCopy(value, fallback = "") {
  return sanitizeVisibleShellCopy(value ?? fallback)
    .replaceAll("Release evidence and handoff", "מה צריך לפני שיתוף")
    .replaceAll("release evidence", "הוכחת מוכנות")
    .replaceAll("Release target", "יעד שיתוף")
    .replaceAll("release target", "יעד שיתוף")
    .replaceAll("handoff", "המשך")
    .replaceAll("Handoff", "המשך")
    .replaceAll("Next action:", "הצעד הבא:")
    .replaceAll("Open blocker", "מה עדיין פתוח")
    .replaceAll("Handoff step", "צעד המשך")
    .replaceAll("web-build", "אריזה")
    .replaceAll("web-deployment", "שיתוף")
    .replaceAll("live-browser-preview", "תצוגה חיה");
}

export function renderProofResultScreen(viewModel) {
  const sidebar = {
    currentRoute: "/loop",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
      { title: "בנייה", href: "/loop", target: "loop", icon: "▦" },
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
    { label: "בנייה", status: "complete", glyph: "✓" },
    { label: "בדיקה", status: "active" },
  ]);

  const content = `
    <section class="nexus-proof-screen">
      <div class="nexus-proof-screen__stepper">${steps}</div>
      ${viewModel.showQaNav ? renderNexusQaNav("proof") : ""}

      <div class="nexus-proof-screen__intro">
        <div class="nexus-proof-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <h1>${escapeHtml(viewModel.title)}</h1>
        <p>${escapeHtml(viewModel.subtitle)}</p>
      </div>

      <div class="nexus-proof-screen__grid">
        <div class="nexus-proof-screen__main">
          ${renderNexusCard({
            className: "nexus-proof-screen__preview-card",
            padding: "lg",
            content: `
              <div class="nexus-proof-screen__preview-header">
                <div class="nexus-proof-screen__preview-mark">◫</div>
                <div>
                  <span class="nexus-proof-screen__preview-label">${escapeHtml(viewModel.previewLabel)}</span>
                  <h2 id="proof-ready-title">${escapeHtml(viewModel.readyTitle)}</h2>
                  <p>${escapeHtml(viewModel.readySubtitle)}</p>
                </div>
              </div>
              <div class="nexus-proof-screen__preview-body">
                <div class="nexus-proof-screen__preview-frame">
                  <strong id="proof-preview-title">${escapeHtml(viewModel.previewTitle)}</strong>
                  <span>${escapeHtml(viewModel.previewMeta)}</span>
                </div>
                <p class="nexus-proof-screen__preview-why">${escapeHtml(viewModel.whyThisCounts)}</p>
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-proof-screen__artifact-card",
            padding: "lg",
            content: `
              <div class="nexus-proof-screen__artifact-head">
                <div>
                  <span class="nexus-proof-screen__artifact-label">התוצר שנבנה</span>
                  <h2>${escapeHtml(viewModel.artifact.title)}</h2>
                  <p>${escapeHtml(viewModel.artifactSupportLine ?? viewModel.artifact.previewKind)}</p>
                </div>
                <span class="nexus-proof-screen__artifact-status">${escapeHtml(viewModel.artifactDisplayStatus ?? viewModel.artifact.status)}</span>
              </div>
              ${renderProofArtifactSurface(viewModel.artifact)}
            `,
          })}

          ${renderNexusCard({
            className: "nexus-proof-screen__criteria-card",
            padding: "lg",
            content: `
              <h2>למה זה כבר מרגיש אמיתי</h2>
              <div class="nexus-proof-criteria-list">
                ${viewModel.successCriteria.map(renderCriterion).join("")}
              </div>
              <ul id="proof-bullets-list" class="nexus-proof-bullets-list"></ul>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-proof-screen__artifacts-card",
            padding: "lg",
            content: `
              <h2>מה כבר מוכן בתוצר</h2>
              <div class="nexus-proof-artifact-list">
                ${viewModel.artifacts.map(renderArtifact).join("")}
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-proof-screen__artifacts-card",
            padding: "lg",
            content: `
              <div class="nexus-proof-screen__artifact-head">
                <div>
                  <span class="nexus-proof-screen__artifact-label">מה צריך לפני שיתוף</span>
                  <h2>${escapeHtml(sanitizeProductCopy(viewModel.releaseEvidenceHandoff.handoffStatusLabel))}</h2>
                  <p>${escapeHtml(sanitizeProductCopy(viewModel.releaseEvidenceHandoff.narrative))}</p>
                </div>
                <span class="nexus-proof-screen__artifact-status">${escapeHtml(sanitizeProductCopy(viewModel.releaseEvidenceHandoff.releaseTarget))}</span>
              </div>
              <div class="nexus-proof-artifact-list">
                ${viewModel.releaseEvidenceHandoff.evidenceItems.map((item) => renderReleaseEvidenceItem({
                  label: sanitizeProductCopy(item.label),
                  value: sanitizeProductCopy(item.value),
                })).join("")}
              </div>
              <div class="nexus-proof-screen__preview-body">
                <div class="nexus-proof-screen__preview-frame">
                  <strong>${escapeHtml(sanitizeProductCopy(viewModel.releaseEvidenceHandoff.builtSurfaceTitle))}</strong>
                  <span>${escapeHtml(sanitizeProductCopy(viewModel.releaseEvidenceHandoff.persistenceRule))}</span>
                </div>
                <p class="nexus-proof-screen__preview-why">${escapeHtml(sanitizeProductCopy(`הצעד הבא: ${viewModel.releaseEvidenceHandoff.nextAction}`))}</p>
              </div>
              <div class="nexus-proof-artifact-list">
                ${viewModel.releaseEvidenceHandoff.handoffSteps.map((item) => `
                  <article class="nexus-proof-artifact">
                    <div class="nexus-proof-artifact__meta">
                      <span class="nexus-proof-artifact__type">צעד המשך</span>
                      <strong>${escapeHtml(sanitizeProductCopy(item))}</strong>
                    </div>
                  </article>
                `).join("")}
                ${viewModel.releaseEvidenceHandoff.blockers.map((item) => `
                  <article class="nexus-proof-artifact">
                    <div class="nexus-proof-artifact__meta">
                      <span class="nexus-proof-artifact__type">מה עדיין פתוח</span>
                      <strong>${escapeHtml(sanitizeProductCopy(item))}</strong>
                    </div>
                  </article>
                `).join("")}
              </div>
            `,
          })}

          <div class="nexus-proof-screen__actions">
            ${viewModel.secondaryActions.map((action, index) => renderNexusButton({
              label: action.label,
              variant: "secondary",
              className: "nexus-proof-screen__button",
              disabled: !action.supported,
              attrs: {
                id: index === 0 ? "proof-open-button" : "proof-download-button",
                "data-proof-target": action.target,
              },
            })).join("")}
            ${renderNexusButton({
              label: viewModel.primaryAction.label,
              variant: "primary",
              className: "nexus-proof-screen__button",
              attrs: {
                id: "proof-full-button",
                "data-proof-target": viewModel.primaryAction.target,
              },
            })}
          </div>
        </div>

        <aside class="nexus-proof-screen__side">
          ${renderNexusCard({
            className: "nexus-proof-screen__stats-card",
            padding: "lg",
            content: `
              <h2>מה כבר רואים במסך</h2>
              <div id="proof-stats-grid" class="nexus-proof-stats-grid">
                ${viewModel.stats.map((item) => `
                  <article class="nexus-proof-stat-card">
                    <strong>${escapeHtml(item.value)}</strong>
                    <span>${escapeHtml(item.label)}</span>
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
    <section class="nexus-proof-page">
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

export function bindProofResultScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-proof");
  const bindings = {
    proofPreviewTitle: "#proof-preview-title",
    proofReadyTitle: "#proof-ready-title",
    proofBulletsList: "#proof-bullets-list",
    proofStatsGrid: "#proof-stats-grid",
    proofDownloadButton: "#proof-download-button",
    proofOpenButton: "#proof-open-button",
    proofFullButton: "#proof-full-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
