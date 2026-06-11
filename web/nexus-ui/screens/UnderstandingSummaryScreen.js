import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
import { renderNexusStepper } from "../components/NexusStepper.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";
import {
  resolveHumanConversationPauseBadge,
  resolveHumanNextStepHeading,
  resolveHumanWhyPauseHeading,
} from "../../shared/live-conversation-tone-contract.js";
import { getNexusButtonClassName } from "../components/NexusButton.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderUnderstandingCard(card, index) {
  const titleIds = [
    "understanding-audience-title",
    "understanding-problem-title",
    "understanding-solution-title",
    "understanding-goal-title",
  ];
  const bodyIds = [
    "understanding-audience-body",
    "understanding-problem-body",
    "understanding-solution-body",
    "understanding-goal-body",
  ];

  return `
    <article class="nexus-understanding-card">
      <div class="nexus-understanding-card__accent" aria-hidden="true"></div>
      <div class="nexus-understanding-card__header">
        <div class="nexus-understanding-card__icon">${escapeHtml(card.icon)}</div>
        <div class="nexus-understanding-card__title-group">
          <span class="nexus-understanding-card__label">${escapeHtml(card.label)}</span>
          <strong id="${escapeHtml(titleIds[index])}">${escapeHtml(card.title)}</strong>
        </div>
      </div>
      <p id="${escapeHtml(bodyIds[index])}">${escapeHtml(card.body)}</p>
    </article>
  `;
}

function renderGenerationLearningCard(card) {
  if (!card) {
    return "";
  }

  return renderNexusCard({
    className: "nexus-understanding-screen__why-card",
    padding: "lg",
    content: `
      <div class="nexus-understanding-screen__badge">${escapeHtml(card.badge)}</div>
      <h2>${escapeHtml(resolveHumanNextStepHeading())}</h2>
      <p><strong>${escapeHtml(card.title)}</strong></p>
      <p>${escapeHtml(card.body)}</p>
      <p>${escapeHtml(card.proofLine)}</p>
      <div class="nexus-understanding-screen__confidence">
        <span class="nexus-understanding-screen__confidence-dot" aria-hidden="true"></span>
        <span>${escapeHtml(card.focusAreas.join(" · "))}</span>
      </div>
    `,
  });
}

function renderUnderstandingActionLink({
  label = "",
  href = "/loop",
  variant = "primary",
  className = "",
  attrs = {},
} = {}) {
  const extraAttrs = Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value).replaceAll('"', "&quot;")}"`)
    .join(" ");

  return `
    <a
      href="${escapeHtml(href)}"
      class="${getNexusButtonClassName({ variant, className })}"
      ${extraAttrs}
    >${escapeHtml(label)}</a>
  `;
}

export function renderUnderstandingSummaryScreen(viewModel) {
  const sidebar = {
    currentRoute: "/loop",
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

  const steps = renderNexusStepper([
    { label: "יצירה", status: "complete", glyph: "✓" },
    { label: "הכרת הפרויקט", status: "complete", glyph: "✓" },
    { label: "הבנה", status: "active" },
    { label: "פעולה", status: "inactive" },
  ]);

  const content = `
    <section class="nexus-understanding-screen">
      <div class="nexus-understanding-screen__stepper">${steps}</div>
      ${renderNexusQaNav("loop")}

      <div class="nexus-understanding-screen__intro">
        <div class="nexus-understanding-screen__badge">${escapeHtml(resolveHumanConversationPauseBadge())}</div>
        <h1 id="understanding-screen-title">${escapeHtml(viewModel.title)}</h1>
        <p id="understanding-screen-status">${escapeHtml(viewModel.subtitle)}</p>
        <p class="nexus-understanding-screen__detail">${escapeHtml(viewModel.detail)}</p>
      </div>

      <div class="nexus-understanding-screen__grid">
        ${viewModel.cards.map((card, index) => renderUnderstandingCard(card, index)).join("")}
      </div>

      ${renderNexusCard({
        className: "nexus-understanding-screen__why-card",
        padding: "lg",
        content: `
          <h2>${escapeHtml(resolveHumanWhyPauseHeading())}</h2>
          <p>${escapeHtml(viewModel.whyItMatters)}</p>
          <div class="nexus-understanding-screen__confidence">
            <span class="nexus-understanding-screen__confidence-dot" aria-hidden="true"></span>
            <span>${escapeHtml(viewModel.confidenceLabel)}</span>
          </div>
        `,
      })}

      ${renderGenerationLearningCard(viewModel.generationLearningCard)}

      <div class="nexus-understanding-screen__actions">
        ${renderNexusButton({
          label: "צריך תיקון",
          variant: "secondary",
          className: "nexus-understanding-screen__button",
          attrs: { id: "understanding-correct-button" },
        })}
        ${renderUnderstandingActionLink({
          label: "נכון, בוא נתקדם",
          href: "/loop",
          variant: "primary",
          className: "nexus-understanding-screen__button",
          attrs: { id: "understanding-continue-button" },
        })}
      </div>
    </section>
  `;

  return `
    <section class="nexus-understanding-page">
      ${renderWorkspaceLayout({
        sidebar,
        topbar: {
          projectName: viewModel.projectName,
          avatar: viewModel.projectName ? viewModel.projectName.slice(0, 1) : "י",
        },
        content,
      })}
    </section>
  `;
}

export function bindUnderstandingSummaryScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-understanding");
  const bindings = {
    understandingScreenTitle: "#understanding-screen-title",
    understandingScreenStatus: "#understanding-screen-status",
    understandingAudienceTitle: "#understanding-audience-title",
    understandingAudienceBody: "#understanding-audience-body",
    understandingProblemTitle: "#understanding-problem-title",
    understandingProblemBody: "#understanding-problem-body",
    understandingSolutionTitle: "#understanding-solution-title",
    understandingSolutionBody: "#understanding-solution-body",
    understandingGoalTitle: "#understanding-goal-title",
    understandingGoalBody: "#understanding-goal-body",
    understandingCorrectButton: "#understanding-correct-button",
    understandingContinueButton: "#understanding-continue-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
