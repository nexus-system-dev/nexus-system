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

function renderSummaryList(items, emptyText) {
  const safeItems = Array.isArray(items) ? items : [];
  const source = safeItems.length ? safeItems : [emptyText];
  return source.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function renderUnderstandingCard({ icon, title, strongId, bodyId, strongText, bodyText }) {
  return `
    <article class="nexus-onboarding-understanding-card">
      <div class="nexus-onboarding-understanding-card__icon">${escapeHtml(icon)}</div>
      <h3>${escapeHtml(title)}</h3>
      <strong id="${escapeHtml(strongId)}">${escapeHtml(strongText)}</strong>
      <p id="${escapeHtml(bodyId)}">${escapeHtml(bodyText)}</p>
    </article>
  `;
}

export function renderSmartOnboardingScreen(viewModel) {
  const sidebar = {
    currentRoute: "/onboarding",
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
    { label: "הכרת הפרויקט", status: "active" },
    { label: "הבנה", status: "inactive" },
    { label: "פעולה", status: "inactive" },
  ]);

  const content = `
    <section class="nexus-onboarding-screen">
      <div class="nexus-onboarding-screen__stepper">${steps}</div>
      ${renderNexusQaNav(viewModel.isUnderstandingMode ? "understanding" : "onboarding")}

      <div class="nexus-onboarding-screen__intro">
        <h1 id="onboarding-screen-message" class="nexus-onboarding-screen__title">${escapeHtml(viewModel.title)}</h1>
        <p id="onboarding-screen-status" class="nexus-onboarding-screen__status">${escapeHtml(viewModel.statusMessage)}</p>
      </div>

      <section id="onboarding-stage" class="nexus-onboarding-screen__layout">
        <div class="nexus-onboarding-screen__main">
          ${renderNexusCard({
            className: "nexus-onboarding-chat-card",
            padding: "lg",
            content: `
              <div class="nexus-onboarding-chat-card__meta">
                <div class="nexus-onboarding-chat-card__progress-row">
                  <span id="onboarding-progress-pill" class="nexus-onboarding-chat-card__pill">${escapeHtml(viewModel.progressLabel)}</span>
                  <div class="nexus-onboarding-chat-card__nav">
                    ${renderNexusButton({
                      label: "חזור",
                      variant: "secondary",
                      className: "nexus-onboarding-chat-card__nav-button",
                      attrs: { id: "onboarding-back-button" },
                    })}
                    ${renderNexusButton({
                      label: "קדימה",
                      variant: "secondary",
                      className: "nexus-onboarding-chat-card__nav-button",
                      attrs: { id: "onboarding-forward-button" },
                    })}
                  </div>
                </div>
                <div class="nexus-onboarding-chat-card__question">
                  <h2 id="onboarding-current-question-title">${escapeHtml(viewModel.questionTitle)}</h2>
                  <p id="onboarding-current-question-body">${escapeHtml(viewModel.questionBody)}</p>
                </div>
              </div>

              <div id="onboarding-chat-thread" class="onboarding-route-transcript nexus-onboarding-chat-card__thread"></div>

              <div class="nexus-onboarding-chat-card__composer">
                ${renderNexusInput({
                  id: "onboarding-answer-input",
                  label: "",
                  placeholder: "הקלד את התשובה שלך...",
                  value: viewModel.answerDraft,
                  className: "nexus-onboarding-chat-card__input",
                })}
                ${renderNexusButton({
                  label: "המשך לסיכום",
                  variant: "primary",
                  className: "nexus-onboarding-chat-card__cta",
                  attrs: { id: "onboarding-next-button" },
                })}
              </div>
            `,
          })}

          <section id="onboarding-form-stage" class="nexus-onboarding-understanding" hidden>
            <div class="nexus-onboarding-understanding__intro">
              <h2 id="onboarding-stage-title">זה מה שהבנתי</h2>
              <p id="onboarding-stage-description">בדקתי את כל המידע שאספנו</p>
            </div>

            <div class="nexus-onboarding-understanding__grid">
              ${renderUnderstandingCard({
                icon: "👥",
                title: "קהל יעד",
                strongId: "understanding-audience-title",
                bodyId: "understanding-audience-body",
                strongText: "קהל היעד עדיין לא הושלם",
                bodyText: "צריך לחדד מי המשתמש המרכזי של המוצר.",
              })}
              ${renderUnderstandingCard({
                icon: "⚠️",
                title: "בעיה",
                strongId: "understanding-problem-title",
                bodyId: "understanding-problem-body",
                strongText: "הבעיה עדיין לא חודדה",
                bodyText: "צריך להבין מה הכאב המרכזי שחוזר אצל המשתמש הזה.",
              })}
              ${renderUnderstandingCard({
                icon: "💡",
                title: "פתרון",
                strongId: "understanding-solution-title",
                bodyId: "understanding-solution-body",
                strongText: "הפתרון עדיין לא הוגדר",
                bodyText: "צריך לחדד איך נראה פתרון מוצלח מבחינת המשתמש.",
              })}
              ${renderUnderstandingCard({
                icon: "🎯",
                title: "יעד",
                strongId: "understanding-goal-title",
                bodyId: "understanding-goal-body",
                strongText: "להוציא את הפרויקט לפעולה",
                bodyText: "אחרי אישור הסיכום נתקדם למשימה הבאה שנגזרת מההבנה הזו.",
              })}
            </div>

            <div class="nexus-onboarding-understanding__actions">
              ${renderNexusButton({
                label: "תקן",
                variant: "secondary",
                className: "nexus-onboarding-understanding__button",
                attrs: { id: "understanding-correct-button" },
              })}
              ${renderNexusButton({
                label: "נכון - המשך ←",
                variant: "primary",
                className: "nexus-onboarding-understanding__button",
                attrs: { id: "understanding-continue-button" },
              })}
            </div>

            <div id="onboarding-material-stage" class="nexus-onboarding-understanding__material" hidden>
              <p class="mini-label">חומר תומך ל־Onboarding</p>
              <p class="empty-upload-note">הקישור והקובץ התומך ממסך היצירה ייכנסו יחד עם מסקנות השיחה לשלב הסיום.</p>
            </div>

            <button id="finish-onboarding-button" type="button" hidden>סיים Onboarding</button>
          </section>
        </div>

        <aside class="nexus-onboarding-screen__side">
          ${renderNexusCard({
            padding: "md",
            className: "nexus-onboarding-summary-card nexus-onboarding-summary-card--success",
            content: `
              <h3>מה הבנתי</h3>
              <div id="onboarding-understood-list" class="onboarding-route-summary-list">
                ${renderSummaryList(viewModel.summary.understood, "עדיין אין מסקנות.")}
              </div>
            `,
          })}
          ${renderNexusCard({
            padding: "md",
            className: "nexus-onboarding-summary-card nexus-onboarding-summary-card--warning",
            content: `
              <h3>מה חסר</h3>
              <div id="onboarding-missing-list" class="onboarding-route-summary-list">
                ${renderSummaryList(viewModel.summary.missing, "כרגע אין פערים פתוחים.")}
              </div>
            `,
          })}
          ${renderNexusCard({
            padding: "md",
            className: "nexus-onboarding-summary-card",
            content: `
              <h3>מה מתחדד עכשיו</h3>
              <div id="onboarding-notes-list" class="nexus-onboarding-notes-list"></div>
            `,
          })}
        </aside>
      </section>
    </section>
  `;

  return `
    <section class="nexus-onboarding-page">
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

export function bindSmartOnboardingScreenElements(doc, elements) {
  const bindings = {
    onboardingStage: "#onboarding-stage",
    onboardingScreenMessage: "#onboarding-screen-message",
    onboardingScreenStatus: "#onboarding-screen-status",
    onboardingStageTitle: "#onboarding-stage-title",
    onboardingStageDescription: "#onboarding-stage-description",
    onboardingProgressPill: "#onboarding-progress-pill",
    onboardingBackButton: "#onboarding-back-button",
    onboardingForwardButton: "#onboarding-forward-button",
    onboardingNotesList: "#onboarding-notes-list",
    onboardingUnderstoodList: "#onboarding-understood-list",
    onboardingMissingList: "#onboarding-missing-list",
    onboardingChatThread: "#onboarding-chat-thread",
    onboardingCurrentQuestionTitle: "#onboarding-current-question-title",
    onboardingCurrentQuestionBody: "#onboarding-current-question-body",
    onboardingAnswerInput: "#onboarding-answer-input",
    onboardingNextButton: "#onboarding-next-button",
    onboardingMaterialStage: "#onboarding-material-stage",
    onboardingFormStage: "#onboarding-form-stage",
    finishOnboardingButton: "#finish-onboarding-button",
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
    const element = doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
