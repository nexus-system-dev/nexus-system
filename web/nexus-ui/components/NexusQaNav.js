import { escapeVisibleShellCopy } from "../copy/visible-shell-language.js";

const QA_PRIMARY_ROUTES = [
  { key: "create", label: "יצירה" },
  { key: "loop", label: "בנייה" },
  { key: "execution", label: "ביצוע" },
  { key: "proof", label: "בדיקה" },
  { key: "confirmation", label: "אישור" },
  { key: "state-update", label: "עדכון מצב" },
  { key: "next-task", label: "הצעד הבא" },
  { key: "timeline", label: "היסטוריה" },
];

function isQaOptInEnabled() {
  if (globalThis.location === undefined) {
    return true;
  }

  const searchParams = new URLSearchParams(globalThis.location.search ?? "");
  return searchParams.get("qa") === "1";
}

export function renderNexusQaNav(currentKey = "create") {
  if (!isQaOptInEnabled()) {
    return "";
  }

  return `
    <section class="nexus-ui-qa-nav" aria-label="QA navigation">
      <div class="nexus-ui-qa-nav__copy">
        <strong>תצוגת בדיקה</strong>
        <span>מעבר זמני בין מסכי העבודה בלי לחכות להרצה המלאה.</span>
      </div>
      <div class="nexus-ui-qa-nav__buttons">
        ${QA_PRIMARY_ROUTES.map((route) => `
          <button
            class="nexus-ui-qa-nav__button${route.key === currentKey ? " active" : ""}"
            type="button"
            data-nexus-ui-qa-target="${route.key}"
          >${escapeVisibleShellCopy(route.label)}</button>
        `).join("")}
      </div>
    </section>
  `;
}
