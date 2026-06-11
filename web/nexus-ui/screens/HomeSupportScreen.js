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

function renderContinuationCard(project) {
  return renderNexusCard({
    className: "nexus-home-screen__continuation-card",
    hover: true,
    padding: "lg",
    content: `
      <div class="nexus-home-screen__continuation-copy">
        <span>${escapeHtml(project.status.label)}</span>
        <strong>${escapeHtml(project.name)}</strong>
        <p>${escapeHtml(project.description)}</p>
      </div>
      <div class="nexus-home-screen__continuation-footer">
        <small>${escapeHtml(project.updatedAt)}</small>
        ${renderNexusButton({
          label: "המשך",
          variant: "secondary",
          attrs: {
            "data-home-project-id": project.id,
          },
        })}
      </div>
    `,
  });
}

function renderRecentContinuations(viewModel) {
  if (viewModel.recentProjects.length === 0) {
    return renderNexusCard({
      className: "nexus-home-screen__empty-card",
      padding: "lg",
      content: `
        <div class="nexus-home-screen__empty">
          <h2>${escapeHtml(viewModel.emptyState.title)}</h2>
          <p>${escapeHtml(viewModel.emptyState.body)}</p>
        </div>
      `,
    });
  }

  return `
    <div class="nexus-home-screen__continuation-grid">
      ${viewModel.recentProjects.map((project) => renderContinuationCard(project)).join("")}
    </div>
  `;
}

export function renderHomeSupportScreen(viewModel) {
  const sidebar = {
    currentRoute: "/home",
    primary: [
      { title: "יצירה", href: "/create", target: "create", icon: "＋" },
      { title: "בנייה", href: "/loop", target: "loop", icon: "▦" },
    ],
    support: [
      { title: "בית", href: "/home", target: "home", icon: "⌂" },
      { title: "קבצים", href: "/files", icon: "⌘" },
    ],
    advanced: [
      { title: "שחרור", href: "/release", icon: "▤" },
      { title: "צמיחה", href: "/growth", icon: "↗" },
    ],
    footer: [
      { title: "הגדרות", href: "/settings", icon: "⚙" },
      { title: "עזרה", href: "/help", icon: "?" },
    ],
  };

  const currentProject = viewModel.currentProject;
  const ideaHandoff = viewModel.ideaHandoff ?? {};
  const ideaHandoffAttrs = {
    "data-slice-contract": ideaHandoff.sliceContract ?? "SLICE-002",
    "data-home-handoff-source": ideaHandoff.sourceSurface ?? "home",
    "data-home-handoff-target": ideaHandoff.targetSurface ?? "create",
    "data-home-handoff-agent": ideaHandoff.responsibleAgent ?? "project-discovery-agent",
    "data-home-handoff-engine": ideaHandoff.hiddenEngine ?? "onboarding-intake-engine",
    "data-home-handoff-boundary": ideaHandoff.boundary ?? "handoff-only-not-agent-response",
    "data-home-handoff-intent": ideaHandoff.intent ?? "new-product-idea",
  };
  const primaryButtonAttrs = currentProject
    ? { "data-home-project-id": currentProject.id }
    : { id: "home-create-project-button", ...ideaHandoffAttrs, "data-home-handoff-action": "start-idea-conversation" };

  const content = `
    <section
      class="nexus-home-screen"
      data-surface-contract="${escapeHtml(viewModel.surfaceContract)}"
      data-surface-purpose="${escapeHtml(viewModel.workspaceLaw)}"
    >
      <div
        class="nexus-home-screen__hero"
        data-home-region="create-or-continue-entry"
        data-slice-contract="${escapeHtml(ideaHandoffAttrs["data-slice-contract"])}"
        data-home-handoff-source="${escapeHtml(ideaHandoffAttrs["data-home-handoff-source"])}"
        data-home-handoff-target="${escapeHtml(ideaHandoffAttrs["data-home-handoff-target"])}"
        data-home-handoff-agent="${escapeHtml(ideaHandoffAttrs["data-home-handoff-agent"])}"
        data-home-handoff-engine="${escapeHtml(ideaHandoffAttrs["data-home-handoff-engine"])}"
        data-home-handoff-boundary="${escapeHtml(ideaHandoffAttrs["data-home-handoff-boundary"])}"
      >
        <div class="nexus-home-screen__badge">${escapeHtml(viewModel.badge)}</div>
        <div class="nexus-home-screen__hero-copy">
          <h1>${escapeHtml(viewModel.title)}</h1>
          <p>${escapeHtml(viewModel.subtitle)}</p>
        </div>
        <div class="nexus-home-screen__hero-actions">
          ${renderNexusButton({
            label: viewModel.primaryAction.label,
            variant: "primary",
            attrs: primaryButtonAttrs,
          })}
          ${currentProject ? renderNexusButton({
            label: viewModel.secondaryAction.label,
            variant: "secondary",
            attrs: { id: "home-create-project-button", ...ideaHandoffAttrs, "data-home-handoff-action": "start-idea-conversation" },
          }) : ""}
        </div>
      </div>

      <div class="nexus-home-screen__body">
        <section class="nexus-home-screen__last-action" data-home-region="last-meaningful-action">
          <span>${escapeHtml(viewModel.lastMeaningfulAction.title)}</span>
          <h2>${escapeHtml(viewModel.lastMeaningfulAction.body)}</h2>
          ${currentProject ? `<p>${escapeHtml(currentProject.name)} · ${escapeHtml(currentProject.phase)}</p>` : ""}
        </section>

        <section class="nexus-home-screen__recent" data-home-region="recent-product-continuation">
          <div class="nexus-home-screen__section-head">
            <span>המשכיות מוצרית</span>
            <strong>לא dashboard. רק המקומות שאפשר להמשיך מהם.</strong>
          </div>
          ${renderRecentContinuations(viewModel)}
        </section>
      </div>
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
