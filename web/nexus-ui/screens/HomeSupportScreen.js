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

function renderProjectCard(project) {
  return renderNexusCard({
    className: "nexus-home-screen__project-card",
    hover: true,
    padding: "lg",
    content: `
      <div class="nexus-home-screen__project-card-head">
        <div class="nexus-home-screen__project-copy">
          <strong>${escapeHtml(project.name)}</strong>
          <p>${escapeHtml(project.description)}</p>
        </div>
        <span class="nexus-home-screen__status-pill" data-tone="${escapeHtml(project.status.tone)}">
          ${escapeHtml(project.status.label)}
        </span>
      </div>

      <div class="nexus-home-screen__project-meta">
        ${project.metadata.map((item) => `
          <span><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</span>
        `).join("")}
      </div>

      <div class="nexus-home-screen__project-footer">
        <span>${escapeHtml(project.updatedAt)}</span>
        <div class="nexus-home-screen__project-actions">
          ${project.isCurrent ? '<span class="nexus-home-screen__current-pill">הפרויקט הפעיל</span>' : ""}
          ${renderNexusButton({
            label: project.isCurrent ? "חזור ללופ" : "פתח פרויקט",
            variant: project.isCurrent ? "secondary" : "primary",
            attrs: {
              "data-home-project-id": project.id,
            },
          })}
        </div>
      </div>
    `,
  });
}

export function renderHomeSupportScreen(viewModel) {
  const sidebar = {
    currentRoute: "/home",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
      { title: "הבנה", href: "/onboarding", target: "onboarding", icon: "⌂" },
      { title: "לולאה", href: "/loop", target: "loop", icon: "▦" },
      { title: "ציר זמן", href: "/timeline", target: "timeline", icon: "◷" },
    ],
    support: [
      { title: "בית", href: "/home", target: "home", icon: "⌂" },
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

  const projectsSection = viewModel.projects.length
    ? `
      <div class="nexus-home-screen__project-grid">
        ${viewModel.projects.map((project) => renderProjectCard(project)).join("")}
      </div>
    `
    : renderNexusCard({
      className: "nexus-home-screen__empty-card",
      padding: "lg",
      content: `
        <div class="nexus-home-screen__empty">
          <h2>${escapeHtml(viewModel.emptyState.title)}</h2>
          <p>${escapeHtml(viewModel.emptyState.body)}</p>
          ${renderNexusButton({
            label: viewModel.emptyState.actionLabel,
            variant: "primary",
            attrs: { id: "home-create-project-button" },
          })}
        </div>
      `,
    });

  const content = `
    <section class="nexus-home-screen">
      <div class="nexus-home-screen__intro">
        <div class="nexus-home-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <div class="nexus-home-screen__intro-main">
          <div>
            <h1>${escapeHtml(viewModel.title)}</h1>
            <p>${escapeHtml(viewModel.subtitle)}</p>
          </div>
          ${renderNexusButton({
            label: viewModel.primaryAction.label,
            variant: "primary",
            attrs: { id: "home-create-project-button" },
          })}
        </div>
      </div>

      <div class="nexus-home-screen__stats">
        ${viewModel.stats.map((item) => `
          <article class="nexus-home-screen__stat">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </article>
        `).join("")}
      </div>

      ${projectsSection}
    </section>
  `;

  return `
    <section class="nexus-home-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: "Nexus Home",
          avatar: "N",
        },
        content,
      })}
    </section>
  `;
}

export function bindHomeSupportScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-home");
  const createButton = host?.querySelector("#home-create-project-button") ?? doc.querySelector("#home-create-project-button");
  if (createButton) {
    elements.homeCreateProjectButton = createButton;
  }
}
