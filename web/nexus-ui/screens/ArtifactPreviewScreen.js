import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
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

export function renderArtifactPreviewScreen(viewModel) {
  const sidebar = {
    currentRoute: "/proof-artifact",
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

  const content = `
    <section class="nexus-artifact-screen">
      <div class="nexus-artifact-screen__intro">
        <div class="nexus-artifact-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <h1>${escapeHtml(viewModel.title)}</h1>
        <p>${escapeHtml(viewModel.subtitle)}</p>
      </div>

      <div class="nexus-artifact-screen__grid">
        <div class="nexus-artifact-screen__main">
          ${renderNexusCard({
            className: "nexus-artifact-screen__surface-card",
            padding: "lg",
            content: `
              <div class="nexus-artifact-screen__surface-head">
                <div>
                  <span class="nexus-artifact-screen__surface-label">התוצר עצמו</span>
                  <h2>${escapeHtml(viewModel.artifact.title)}</h2>
                  <p>${escapeHtml(viewModel.artifact.previewPayload?.subtitle ?? viewModel.artifact.previewKind)}</p>
                </div>
                <span class="nexus-artifact-screen__status">${escapeHtml(viewModel.status)}</span>
              </div>
              ${renderProofArtifactSurface(viewModel.artifact, { surfaceId: "artifact-route-preview" })}
            `,
          })}

          <div class="nexus-artifact-screen__actions">
            ${renderNexusButton({
              label: viewModel.downloadAction.label,
              variant: "secondary",
              className: "nexus-artifact-screen__button",
              disabled: !viewModel.downloadAction.supported,
              attrs: {
                id: "artifact-download-button",
                "data-artifact-target": viewModel.downloadAction.target,
              },
            })}
            ${renderNexusButton({
              label: viewModel.backAction.label,
              variant: "secondary",
              className: "nexus-artifact-screen__button",
              attrs: {
                id: "artifact-back-to-proof-button",
                "data-artifact-target": viewModel.backAction.target,
              },
            })}
            ${renderNexusButton({
              label: viewModel.continueAction.label,
              variant: "primary",
              className: "nexus-artifact-screen__button",
              attrs: {
                id: "artifact-continue-button",
                "data-artifact-target": viewModel.continueAction.target,
              },
            })}
          </div>
        </div>

        <aside class="nexus-artifact-screen__side">
          ${renderNexusCard({
            className: "nexus-artifact-screen__meta-card",
            padding: "lg",
            content: `
              <h2>מה מוכן עכשיו</h2>
              <dl class="nexus-artifact-screen__meta-list">
                <div><dt>פרויקט</dt><dd>${escapeHtml(viewModel.projectName)}</dd></div>
                <div><dt>תוצר</dt><dd>${escapeHtml(viewModel.artifact.previewPayload?.title ?? viewModel.artifact.title)}</dd></div>
                <div><dt>מוכן עכשיו ל</dt><dd>${escapeHtml(viewModel.artifact.previewPayload?.nextAction?.title ?? viewModel.artifact.previewPayload?.statusLine ?? viewModel.status)}</dd></div>
                <div><dt>מי ישתמש בו</dt><dd>${escapeHtml(viewModel.artifact.previewPayload?.audience ?? viewModel.artifact.artifactType)}</dd></div>
              </dl>
            `,
          })}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-artifact-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "א",
        },
        content,
      })}
    </section>
  `;
}

export function bindArtifactPreviewScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-artifact");
  const bindings = {
    artifactDownloadButton: "#artifact-download-button",
    artifactBackToProofButton: "#artifact-back-to-proof-button",
    artifactContinueButton: "#artifact-continue-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
