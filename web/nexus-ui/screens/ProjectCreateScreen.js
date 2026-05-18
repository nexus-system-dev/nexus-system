import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusInput } from "../components/NexusInput.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
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

function renderHelperCard(card) {
  return renderNexusCard({
    padding: "md",
    className: "nexus-create-helper-card",
    content: `
      <div class="nexus-create-helper-card__header">
        <h3>${escapeHtml(card.title)}</h3>
      </div>
      <ul class="nexus-create-helper-card__list">
        ${card.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `,
  });
}

export function renderProjectCreateScreen(viewModel) {
  const { title, statusMessage, fields, upload, helperCards } = viewModel;
  const sidebar = {
    currentRoute: "/create",
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
    { label: "צור פרויקט", status: "active" },
    { label: "הכרת הפרויקט", status: "inactive" },
    { label: "הבנה", status: "inactive" },
    { label: "פעולה", status: "inactive" },
  ]);

  const content = `
    <section id="empty-app-state" class="nexus-create-screen" data-mode="create">
      <div class="nexus-create-screen__stepper">${steps}</div>
      ${renderNexusQaNav("create")}

      <div class="nexus-create-screen__intro">
        <h1 id="create-screen-title" class="nexus-create-screen__title">${escapeHtml(title)}</h1>
        <p id="create-screen-status" class="nexus-create-screen__status">${escapeHtml(statusMessage)}</p>
      </div>

      <div class="nexus-create-screen__grid">
        <section class="nexus-create-screen__main">
          ${renderNexusCard({
            padding: "lg",
            className: "nexus-create-screen__form-card",
            content: `
              <div id="project-create-stage" class="nexus-create-screen__form">
                ${renderNexusInput({
                  id: "create-project-name-input",
                  label: "שם הפרויקט",
                  placeholder: "My SaaS App",
                  value: fields.projectName,
                  required: true,
                })}
                ${renderNexusInput({
                  id: "create-project-vision-input",
                  label: "תיאור הרעיון",
                  placeholder: "מערכת לניהול לקוחות עם AI",
                  value: fields.visionText,
                  multiline: true,
                  rows: 7,
                  required: true,
                })}
                <div class="nexus-create-upload">
                  <label class="nexus-ui-field__label">קבצים או מסמכים (אופציונלי)</label>
                  <button id="create-project-file-picker-button" class="nexus-create-upload__button" type="button">
                    <strong id="create-project-file-picker-title">${escapeHtml(upload.title)}</strong>
                    <span id="create-project-file-picker-meta">${escapeHtml(upload.meta)}</span>
                  </button>
                  <input id="create-project-file-upload-input" type="file" accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.json,.js,.jsx,.ts,.tsx,.css,.scss,.html,.yml,.yaml,.csv" multiple hidden />
                  <input id="create-project-file-name-input" type="hidden" value="${escapeHtml(fields.fileName)}" />
                  <textarea id="create-project-file-content-input" hidden>${escapeHtml(fields.fileContent)}</textarea>
                </div>
                ${renderNexusInput({
                  id: "create-project-link-input",
                  label: "קישור (אופציונלי)",
                  placeholder: "https://example.com",
                  value: fields.supportingLink,
                  type: "url",
                })}
                ${renderNexusButton({
                  label: "צור פרויקט והתחל",
                  variant: "primary",
                  className: "nexus-create-screen__cta",
                  attrs: { id: "create-project-button" },
                })}
              </div>
            `,
          })}
        </section>

        <aside class="nexus-create-screen__side">
          ${helperCards.map((card) => renderHelperCard(card)).join("")}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-create-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: { projectName: "", avatar: "י" },
        content,
      })}
    </section>
  `;
}

export function bindProjectCreateScreenElements(doc, elements) {
  const bindings = {
    emptyAppState: "#empty-app-state",
    createScreenTitle: "#create-screen-title",
    createScreenStatus: "#create-screen-status",
    projectCreateStage: "#project-create-stage",
    createProjectNameInput: "#create-project-name-input",
    createProjectVisionInput: "#create-project-vision-input",
    createProjectLinkInput: "#create-project-link-input",
    createProjectFilePickerButton: "#create-project-file-picker-button",
    createProjectFilePickerTitle: "#create-project-file-picker-title",
    createProjectFilePickerMeta: "#create-project-file-picker-meta",
    createProjectFileUploadInput: "#create-project-file-upload-input",
    createProjectFileNameInput: "#create-project-file-name-input",
    createProjectFileContentInput: "#create-project-file-content-input",
    createProjectButton: "#create-project-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
