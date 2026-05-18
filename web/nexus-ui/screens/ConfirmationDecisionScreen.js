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

export function renderConfirmationDecisionScreen(viewModel) {
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
    <section class="nexus-confirmation-screen">
      <div class="nexus-confirmation-screen__stepper">${steps}</div>
      ${renderNexusQaNav("confirmation")}

      <div class="nexus-confirmation-screen__intro">
        <div class="nexus-confirmation-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <h1>${escapeHtml(viewModel.title)}</h1>
        <p>${escapeHtml(viewModel.subtitle)}</p>
      </div>

      ${renderNexusCard({
        className: "nexus-confirmation-screen__artifact-card",
        padding: "lg",
        content: `
          <div class="nexus-confirmation-screen__artifact-header">
              <div>
              <span class="nexus-confirmation-screen__artifact-label">התוצר שעומד לאישור</span>
              <h2>${escapeHtml(viewModel.artifactTruth.title)}</h2>
              <p>${escapeHtml(viewModel.artifactTruth.subtitle)}</p>
            </div>
            ${viewModel.artifactAction.supported ? renderNexusButton({
              label: viewModel.artifactAction.label,
              variant: "secondary",
              className: "nexus-confirmation-screen__artifact-button",
              attrs: {
                id: "confirmation-artifact-button",
              },
            }) : ""}
          </div>
          ${renderProofArtifactSurface(viewModel.artifactTruth.artifact, { surfaceId: "confirmation-artifact-surface" })}
        `,
      })}

      <div class="nexus-confirmation-screen__cards">
        ${renderNexusCard({
          className: "nexus-confirmation-screen__choice-card approve",
          padding: "xl",
          hover: true,
          content: `
            <div class="nexus-confirmation-screen__choice-icon success">✓</div>
            <h2>זה טוב, המשך</h2>
            <p>התוצאה עונה על הציפיות ואפשר לעדכן מצב ולהתקדם למשימה הבאה.</p>
            ${renderNexusButton({
              label: viewModel.approveAction.label,
              variant: "secondary",
              className: "nexus-confirmation-screen__button",
              attrs: {
                id: "confirmation-approve-button",
                "data-approval-request-id": viewModel.approveAction.approvalRequestId ?? "",
              },
            })}
          `,
        })}

        ${renderNexusCard({
          className: "nexus-confirmation-screen__choice-card revise",
          padding: "xl",
          hover: true,
          content: `
            <div class="nexus-confirmation-screen__choice-icon warning">✎</div>
            <h2>צריך שינויים</h2>
            <p>יש משהו שדורש תיקון או חידוד לפני שמאשרים את התוצאה הזאת.</p>
            ${renderNexusButton({
              label: viewModel.reviseAction.label,
              variant: "secondary",
              className: "nexus-confirmation-screen__button",
              attrs: {
                id: "confirmation-revise-button",
              },
            })}
          `,
        })}
      </div>

      ${renderNexusCard({
        className: "nexus-confirmation-screen__summary-card",
        padding: "lg",
        content: `
          <h2>מה יקרה אחרי ההחלטה</h2>
          <div class="nexus-confirmation-screen__result-name">${escapeHtml(viewModel.resultName)}</div>
          <ul id="confirmation-summary-list" class="nexus-confirmation-screen__summary-list">
            ${viewModel.artifactTruth.summaryItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            ${viewModel.summaryItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <p class="nexus-confirmation-screen__note">${escapeHtml(viewModel.decisionNote)}</p>
        `,
      })}
    </section>
  `;

  return `
    <section class="nexus-confirmation-page">
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

export function bindConfirmationDecisionScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-confirmation");
  const bindings = {
    confirmationApproveButton: "#confirmation-approve-button",
    confirmationReviseButton: "#confirmation-revise-button",
    confirmationArtifactButton: "#confirmation-artifact-button",
    confirmationSummaryList: "#confirmation-summary-list",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
