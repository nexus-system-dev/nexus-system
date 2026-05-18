const QA_PRIMARY_ROUTES = [
  { key: "create", label: "Create" },
  { key: "onboarding", label: "Onboarding" },
  { key: "understanding", label: "Understanding" },
  { key: "loop", label: "Loop" },
  { key: "execution", label: "Execution" },
  { key: "proof", label: "Proof" },
  { key: "confirmation", label: "Confirmation" },
  { key: "state-update", label: "State Update" },
  { key: "next-task", label: "Next Task" },
  { key: "timeline", label: "Timeline" },
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
        <strong>QA mode</strong>
        <span>מעבר זמני בין מסכי הלופ בלי לחכות ל־runtime המלא.</span>
      </div>
      <div class="nexus-ui-qa-nav__buttons">
        ${QA_PRIMARY_ROUTES.map((route) => `
          <button
            class="nexus-ui-qa-nav__button${route.key === currentKey ? " active" : ""}"
            type="button"
            data-nexus-ui-qa-target="${route.key}"
          >${route.label}</button>
        `).join("")}
      </div>
    </section>
  `;
}
