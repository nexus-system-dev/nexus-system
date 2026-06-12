import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderFileRow(file) {
  return `
    <article class="nexus-files-screen__file-row" data-source="${escapeHtml(file.source)}">
      <div class="nexus-files-screen__file-main">
        <div class="nexus-files-screen__file-head">
          <strong>${escapeHtml(file.name)}</strong>
          <span class="nexus-files-screen__file-source">${escapeHtml(file.source)}</span>
        </div>
        <span class="nexus-files-screen__file-path">${escapeHtml(file.path)}</span>
        <p>${escapeHtml(file.summary)}</p>
      </div>
      <span class="nexus-files-screen__file-meta">${escapeHtml(file.meta)}</span>
    </article>
  `;
}

function renderFileIntakeBoundary(boundary = {}) {
  if (!boundary || typeof boundary !== "object" || !boundary.taskId) {
    return "";
  }

  const acceptedFiles = Array.isArray(boundary.acceptedFiles) ? boundary.acceptedFiles : [];
  const rejectedFiles = Array.isArray(boundary.rejectedFiles) ? boundary.rejectedFiles : [];
  const policy = boundary.policy ?? {};
  const routing = boundary.productUnderstandingRouting ?? {};
  const userFacing = boundary.userFacing ?? {};

  return `
    <section
      class="nexus-files-screen__boundary"
      data-file-intake-task="${escapeHtml(boundary.taskId)}"
      data-file-intake-status="${escapeHtml(boundary.status ?? "unknown")}"
      data-file-intake-accepted-count="${acceptedFiles.length}"
      data-file-intake-rejected-count="${rejectedFiles.length}"
      data-file-intake-routing="${escapeHtml(routing.status ?? "reference-only-or-empty")}"
      data-file-intake-retention="${escapeHtml(policy.retentionPolicy ?? "project-lifecycle")}"
    >
      <h2>${escapeHtml(userFacing.title ?? "גבול הקבצים")}</h2>
      <p>${escapeHtml(userFacing.body ?? "Nexus מציג כאן רק קבצים שנקלטו בגבולות הגרסה הראשונה.")}</p>
      <span>${escapeHtml(userFacing.limits ?? "")}</span>
    </section>
  `;
}

export function renderFilesSupportScreen(viewModel) {
  const sidebar = {
    currentRoute: "/files",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
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

  const filesCardContent = viewModel.files.length
    ? `
      <div class="nexus-files-screen__file-list">
        ${viewModel.files.map(renderFileRow).join("")}
      </div>
    `
    : `
      <div class="nexus-files-screen__empty">
        <h2>${escapeHtml(viewModel.emptyState.title)}</h2>
        <p>${escapeHtml(viewModel.emptyState.body)}</p>
      </div>
    `;

  const content = `
    <section class="nexus-files-screen">
      <div class="nexus-files-screen__intro">
        <div class="nexus-files-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <div class="nexus-files-screen__intro-main">
          <div>
            <h1>${escapeHtml(viewModel.title)}</h1>
            <p>${escapeHtml(viewModel.subtitle)}</p>
          </div>
          <div class="nexus-files-screen__actions">
            ${renderNexusButton({
              label: viewModel.secondaryAction.label,
              variant: "secondary",
              attrs: { "data-nexus-ui-target": viewModel.secondaryAction.target },
            })}
            ${renderNexusButton({
              label: viewModel.primaryAction.label,
              variant: "primary",
              attrs: { "data-nexus-ui-target": viewModel.primaryAction.target },
            })}
          </div>
        </div>
      </div>

      <div class="nexus-files-screen__stats">
        ${viewModel.stats.map((item) => `
          <article class="nexus-files-screen__stat">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </article>
        `).join("")}
      </div>

      <div class="nexus-files-screen__grid">
        <div class="nexus-files-screen__main">
          ${renderNexusCard({
            className: "nexus-files-screen__files-card",
            padding: "lg",
            content: `
              <h2>מה כבר ידוע על הקבצים</h2>
              ${filesCardContent}
            `,
          })}
        </div>

        <aside class="nexus-files-screen__side">
          ${renderFileIntakeBoundary(viewModel.fileIntakeBoundary)}

          ${renderNexusCard({
            className: "nexus-files-screen__summary-card",
            padding: "lg",
            content: `
              <h2>מקורות</h2>
              <div class="nexus-files-screen__source-list">
                ${viewModel.sourceSummary.length
                  ? viewModel.sourceSummary.map((item) => `
                    <div class="nexus-files-screen__source-row">
                      <span>${escapeHtml(item.label)}</span>
                      <strong>${escapeHtml(item.value)}</strong>
                    </div>
                  `).join("")
                  : '<p class="nexus-files-screen__muted">עדיין אין מקור קבצים פעיל.</p>'}
              </div>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-files-screen__runtime-card",
            padding: "lg",
            content: `
              <h2>${escapeHtml(viewModel.runtimeCard.title)}</h2>
              <p>${escapeHtml(viewModel.runtimeCard.body)}</p>
            `,
          })}

          ${renderNexusCard({
            className: "nexus-files-screen__limits-card",
            padding: "lg",
            content: `
              <h2>${escapeHtml(viewModel.limitsCard.title)}</h2>
              <ul class="nexus-files-screen__limits-list">
                ${viewModel.limitsCard.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            `,
          })}
        </aside>
      </div>
    </section>
  `;

  return `
    <section class="nexus-files-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "ק",
        },
        content,
      })}
    </section>
  `;
}
