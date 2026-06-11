import { renderNexusWorkspaceRail } from "../components/NexusWorkspaceRail.js";
import { escapeVisibleShellCopy } from "../copy/visible-shell-language.js";

function escapeHtml(value) {
  return escapeVisibleShellCopy(value);
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderChangeItem(item) {
  return `
    <article class="nexus-history-surface__change ${escapeAttribute(item.tone)}">
      <div class="nexus-history-surface__change-meta">
        <span>${escapeHtml(item.label)}</span>
        <time>${escapeHtml(item.time)}</time>
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
    </article>
  `;
}

function renderCheckpointStateLabel(state) {
  switch (state) {
    case "possible-with-impact":
      return "דורש בדיקת השפעה";
    case "safe":
      return "בטוח לבדיקה";
    case "not-possible":
      return "לא זמין לחזרה";
    default:
      return state || "נקודת חזרה";
  }
}

function renderCheckpoint(item) {
  const restoreImpact = item.restoreImpact ?? {};
  const willRestore = Array.isArray(restoreImpact.willRestore) ? restoreImpact.willRestore.join(" · ") : "";
  return `
    <article class="nexus-history-surface__checkpoint">
      <span>${escapeHtml(renderCheckpointStateLabel(item.state))}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
      ${willRestore ? `<small>${escapeHtml(willRestore)}</small>` : ""}
      <button
        type="button"
        class="nexus-history-surface__restore-action"
        data-history-restore-button="true"
        data-history-checkpoint-id="${escapeAttribute(item.id)}"
        data-history-checkpoint-domain-model="${escapeAttribute(item.productDomainModel)}"
      >
        בדוק חזרה לנקודה הזו
      </button>
    </article>
  `;
}

function renderSnapshot(item) {
  const willRestore = Array.isArray(item.willRestore) && item.willRestore.length ? item.willRestore.join(" · ") : "";
  const willRemove = Array.isArray(item.willRemove) && item.willRemove.length ? item.willRemove.join(" · ") : "";
  return `
    <article
      class="nexus-history-surface__snapshot"
      data-history-version-card="${escapeAttribute(item.id)}"
      data-history-version-task="${escapeAttribute(item.taskId ?? "EXP-003")}"
      data-history-version-checkpoint-id="${escapeAttribute(item.restoreCheckpointId ?? "")}"
      data-history-version-domain-model="${escapeAttribute(item.productDomainModel ?? "")}"
    >
      <span>${escapeHtml(item.status ?? "גרסה שמורה")}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
      ${willRestore ? `<small>מה יחזור: ${escapeHtml(willRestore)}</small>` : ""}
      ${willRemove ? `<small>מה יוסר: ${escapeHtml(willRemove)}</small>` : ""}
      <small>${escapeHtml(item.rollbackBoundary ?? "אין השפעת שחרור בשלב הזה.")}</small>
    </article>
  `;
}

function renderList(items) {
  return `
    <ul class="nexus-history-surface__list">
      ${(items ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderRestoreDecision(agent = {}) {
  const decision = agent.restoreDecision ?? {};
  if (!agent.taskId) {
    return "";
  }
  const impact = decision.restoreImpact ?? {};
  const canExecuteRestore = decision.status === "impact-ready" && decision.requestedCheckpointId;
  const list = (items) => Array.isArray(items) && items.length
    ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "<p>אין שינוי באזור הזה.</p>";
  return `
    <section
      class="nexus-history-surface__panel nexus-history-surface__panel--agent"
      data-history-continuity-agent-task="${escapeAttribute(agent.taskId)}"
      data-history-continuity-agent-status="${escapeAttribute(agent.status)}"
      data-history-restore-decision-status="${escapeAttribute(decision.status ?? "not-requested")}"
    >
      <span class="nexus-history-surface__tag">החלטת רציפות</span>
      <h2>${escapeHtml(agent.currentSummary || "Nexus זוכרת מה השתנה ומה אפשר להחזיר.")}</h2>
      <p>${escapeHtml(decision.userReply ?? "אפשר לבדוק נקודת חזרה בלי לשנות אמת מוצר בשקט.")}</p>
      <div class="nexus-history-surface__impact-grid">
        <div>
          <strong>מה יחזור</strong>
          ${list(impact.willRestore)}
        </div>
        <div>
          <strong>מה יוסר</strong>
          ${list(impact.willRemove)}
        </div>
        <div>
          <strong>מה יישאר</strong>
          ${list(impact.willKeep)}
        </div>
      </div>
      <small>${escapeHtml(impact.releaseImpact ?? "אין השפעת שחרור בשלב הזה.")}</small>
      ${canExecuteRestore ? `
        <button
          type="button"
          class="nexus-history-surface__primary-action"
          data-history-restore-execute-button="true"
          data-history-checkpoint-id="${escapeAttribute(decision.requestedCheckpointId)}"
        >
          אשר וחזור לנקודה הזו
        </button>
      ` : ""}
    </section>
  `;
}

export function renderTimelineHistoryScreen(viewModel = {}) {
  const contract = viewModel.contract ?? {};
  const history = viewModel.history ?? {};
  const historyContinuityAgent = viewModel.historyContinuityAgent ?? {};
  const currentState = history.currentState ?? {};
  const returnToBuild = history.returnToBuild ?? viewModel.primaryAction ?? {};

  const content = `
    <section
      class="nexus-history-surface"
      data-history-surface-contract="${escapeAttribute(contract.contractId ?? "SURF-006")}"
      data-surface-id="${escapeAttribute(contract.surfaceId ?? "timeline")}"
      data-surface-purpose="${escapeAttribute(contract.purpose ?? "product-continuity-and-change-memory-workspace")}"
      data-history-law="${escapeAttribute(contract.historyLaw ?? "product-memory-and-restore-truth-not-debug-timeline")}"
      data-history-continuity-agent="${escapeAttribute(historyContinuityAgent.taskId || "pending")}"
    >
      <header class="nexus-history-surface__hero" data-history-region="history-current-state-anchor">
        <div>
          <p class="nexus-history-surface__eyebrow">${escapeHtml(viewModel.badge ?? "זיכרון מוצר")}</p>
          <h1>${escapeHtml(viewModel.title ?? "מה נשמר מהדרך עד עכשיו")}</h1>
          <p>${escapeHtml(viewModel.subtitle ?? "היסטוריה שמחזירה אותך להקשר, לשינויים ולנקודת החזרה הבטוחה.")}</p>
        </div>
        <aside class="nexus-history-surface__state-card">
          <span>${escapeHtml(currentState.statusLabel ?? "נשמר לעבודה")}</span>
          <strong>${escapeHtml(currentState.projectName ?? viewModel.projectName ?? "Nexus")}</strong>
          <p>${escapeHtml(currentState.body ?? "הקשר המוצר נשמר ומוכן להמשך.")}</p>
        </aside>
      </header>

      <section class="nexus-history-surface__grid">
        <section class="nexus-history-surface__panel nexus-history-surface__panel--changes" data-history-region="history-change-log">
          <span class="nexus-history-surface__tag">שינויים משמעותיים</span>
          <h2>מה באמת השתנה</h2>
          <p>רק רגעים ששינו את הבנת המוצר או את הדרך קדימה נשמרים כאן.</p>
          <div class="nexus-history-surface__changes">
            ${(history.changeLog ?? []).map(renderChangeItem).join("")}
          </div>
        </section>

        ${renderRestoreDecision(historyContinuityAgent)}

        <aside class="nexus-history-surface__side">
          <section class="nexus-history-surface__panel" data-history-region="history-restore-checkpoints">
            <span class="nexus-history-surface__tag">נקודות חזרה</span>
            <h2>לאן אפשר לחזור בבטחה</h2>
            <div class="nexus-history-surface__checkpoints">
              ${(history.restoreCheckpoints ?? []).map(renderCheckpoint).join("")}
            </div>
          </section>

          <section class="nexus-history-surface__panel" data-history-region="history-return-to-build">
            <span class="nexus-history-surface__tag">המשך עבודה</span>
            <h2>${escapeHtml(returnToBuild.body ?? "חזרה לבנייה ממשיכה מאותו הקשר.")}</h2>
            <button
              type="button"
              id="timeline-return-button"
              class="nexus-history-surface__primary-action"
              data-timeline-target="${escapeAttribute(returnToBuild.target ?? "loop")}"
            >
              ${escapeHtml(returnToBuild.label ?? "חזור לבנייה")}
            </button>
          </section>
        </aside>
      </section>

      <section class="nexus-history-surface__footer-grid">
        <section class="nexus-history-surface__panel" data-history-region="history-continuity-thread">
          <span class="nexus-history-surface__tag">רצף עבודה</span>
          <h2>איך ההקשר ממשיך</h2>
          ${renderList(history.continuityThread ?? [])}
        </section>

        <section
          class="nexus-history-surface__panel"
          data-history-region="history-version-snapshots"
          data-history-versioning-task="EXP-003"
          data-history-versioning-boundary="visible-versioning-over-history-agent"
        >
          <span class="nexus-history-surface__tag">גרסאות שמורות</span>
          <h2>מה נשמר כגרסת מוצר שאפשר להבין ולחזור ממנה</h2>
          <div class="nexus-history-surface__snapshots">
            ${(history.versionSnapshots ?? []).map(renderSnapshot).join("")}
          </div>
        </section>
      </section>
    </section>
  `;

  return `
    <section
      class="nexus-history-workspace-shell"
      data-history-workspace-shell="canonical-right-rail"
      data-history-workspace-project="${escapeAttribute(viewModel.projectName ?? "Nexus")}"
    >
      <div class="nexus-history-workspace-shell__content">
        ${content}
      </div>
      ${renderNexusWorkspaceRail({ currentRoute: "timeline" })}
    </section>
  `;
}

export function bindTimelineHistoryScreenElements(doc, elements) {
  const host = doc.querySelector("#screen-timeline");
  const bindings = {
    timelineReturnButton: "#timeline-return-button",
  };

  for (const [key, selector] of Object.entries(bindings)) {
    const element = host?.querySelector(selector) ?? doc.querySelector(selector);
    if (element) {
      elements[key] = element;
    }
  }
}
