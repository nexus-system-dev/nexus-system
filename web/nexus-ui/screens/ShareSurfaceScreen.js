import { renderNexusWorkspaceRail } from "../components/NexusWorkspaceRail.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items, emptyText) {
  if (!items?.length) {
    return `<p class="nexus-share-surface__empty">${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ul class="nexus-share-surface__list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderShareStatusLabel(status) {
  switch (status) {
    case "not-prepared":
      return "עוד לא הוכנה תצוגה";
    case "approval-required":
      return "ממתין לאישור";
    case "approved-snapshot":
      return "תצוגה מאושרת";
    case "revoked":
      return "התצוגה בוטלה";
    default:
      return status || "עוד לא הוכנה תצוגה";
  }
}

function renderReleaseStatusLabel(status) {
  switch (status) {
    case "blocked":
      return "חסום";
    case "not-ready":
      return "לא מוכן";
    case "ready":
      return "מוכן לבדיקה";
    default:
      return status || "לא מוכן";
  }
}

function renderShareModeLabel(mode) {
  switch (mode) {
    case "private-draft":
      return "טיוטה פרטית";
    case "snapshot":
      return "תצוגה מוגבלת";
    case "review-demo":
      return "סקירה מוגבלת";
    default:
      return mode || "טיוטה פרטית";
  }
}

function renderReleaseTargetLabel(target) {
  switch (target) {
    case "private-preview":
    case "private-deployment":
      return "תצוגה פרטית";
    default:
      return target || "תצוגה פרטית";
  }
}

export function renderShareSurfaceScreen(viewModel = {}) {
  const contract = viewModel.contract ?? {};
  const share = viewModel.share ?? {};

  const content = `
    <section
      class="nexus-share-surface"
      data-share-surface-contract="${escapeHtml(contract.contractId ?? "SURF-007")}"
      data-surface-id="${escapeHtml(contract.surfaceId ?? "share")}"
      data-surface-purpose="${escapeHtml(contract.purpose ?? "experience-oriented-review-demo-workspace")}"
      data-share-law="${escapeHtml(contract.shareLaw ?? "experience-oriented-share-not-permissions-admin")}"
      data-share-agent-task="${escapeHtml(share.agentTaskId ?? "SHARE-AGT-001")}"
      data-share-agent-status="${escapeHtml(share.agentStatus ?? "not-prepared")}"
      data-share-approval-status="${escapeHtml(share.approvalStatus ?? "not-required")}"
      data-share-active="${share.active === true ? "true" : "false"}"
    >
      <header class="nexus-share-surface__hero">
        <div>
          <p class="nexus-share-surface__eyebrow">שיתוף חוויית מוצר</p>
          <h1>משתפים את מה שאפשר לראות, לא את מאחורי הקלעים</h1>
          <p>השיתוף ב־Nexus הוא תצוגת סקירה מוגבלת של התוצר. הוא לא ניהול גישות, לא מסך ניהול, ולא קישור שנוצר בלי בסיס אמיתי.</p>
        </div>
        <aside class="nexus-share-surface__gate" data-share-region="share-review-demo-link">
          <span class="${share.isShareReady ? "is-ready" : "is-waiting"}"></span>
          <strong>${escapeHtml(share.readinessLabel)}</strong>
          <p>${escapeHtml(share.readinessBody)}</p>
          <code data-share-review-link>${escapeHtml(share.shareLinkLabel)}</code>
          <p class="nexus-share-surface__mode">מצב תצוגה: ${escapeHtml(renderShareStatusLabel(share.agentStatus))}</p>
        </aside>
      </header>

      <section class="nexus-share-surface__canvas">
        <section class="nexus-share-surface__panel nexus-share-surface__panel--experience" data-share-region="share-experience-preview">
          <span class="nexus-share-surface__tag">תצוגת מוצר</span>
          <h2>${escapeHtml(share.experienceTitle)}</h2>
          <p>${escapeHtml(share.experienceBody)}</p>
          <div class="nexus-share-surface__preview-card">
            <span>${escapeHtml(renderReleaseStatusLabel(share.releaseStatus))}</span>
            <strong>${escapeHtml(renderReleaseTargetLabel(share.releaseTarget))}</strong>
          </div>
        </section>

        <section class="nexus-share-surface__panel" data-share-region="share-audience-access-boundary">
          <span class="nexus-share-surface__tag">קהל צפייה</span>
          <h2>${escapeHtml(share.audienceTitle)}</h2>
          ${renderList(share.audienceItems ?? [], "אין עדיין קהל סקירה מוגדר.")}
          <p class="nexus-share-surface__mode">מצב גישה: ${escapeHtml(renderShareModeLabel(share.accessMode))}</p>
        </section>

        <section class="nexus-share-surface__panel" data-share-region="share-copy-open-actions">
          <span class="nexus-share-surface__tag">פעולה</span>
          <h2>${share.isShareReady ? "אפשר לשלוח תצוגת סקירה" : "עדיין לא שולחים קישור"}</h2>
          <div class="nexus-share-surface__actions">
            <button type="button" class="nexus-share-surface__primary-action" data-share-demo-action="prepare" ${share.agentStatus === "not-prepared" || share.agentStatus === "revoked" ? "" : "disabled"}>
              הכן תצוגת סקירה
            </button>
            <button type="button" class="nexus-share-surface__primary-action" data-share-demo-action="copy" ${share.isShareReady ? "" : "disabled"}>
              העתק קישור סקירה
            </button>
            <button type="button" class="nexus-share-surface__secondary-action" data-share-demo-action="approve" ${share.approvalStatus === "waiting" ? "" : "disabled"}>
              אשר תצוגת סקירה
            </button>
            <button type="button" class="nexus-share-surface__secondary-action" data-share-demo-action="revoke" ${share.active === true ? "" : "disabled"}>
              בטל שיתוף
            </button>
            <button type="button" class="nexus-share-surface__secondary-action" data-nexus-ui-target="release">
              חזור לשחרור
            </button>
          </div>
        </section>

        <section class="nexus-share-surface__panel" data-share-region="share-privacy-scope">
          <span class="nexus-share-surface__tag">גבול פרטיות</span>
          <h2>מה לא יוצא החוצה</h2>
          <p>${escapeHtml(share.privacyScope)}</p>
        </section>

        <section class="nexus-share-surface__panel" data-share-region="share-return-to-build">
          <span class="nexus-share-surface__tag">המשך עבודה</span>
          <h2>אפשר לחזור לבנייה באותו הקשר</h2>
          <p>אם מישהו מגיב על התצוגה, Nexus מחזירה את ההקשר למסך הבנייה או השחרור בלי לפתוח מסלול מנותק.</p>
          <div class="nexus-share-surface__actions">
            <button type="button" class="nexus-share-surface__secondary-action" data-nexus-ui-target="loop">
              חזור לבנייה
            </button>
            <button type="button" class="nexus-share-surface__secondary-action" data-nexus-ui-target="timeline">
              ראה היסטוריה
            </button>
          </div>
        </section>

        <section class="nexus-share-surface__panel">
          <span class="nexus-share-surface__tag">ראיות</span>
          <h2>ראיות לפני שיתוף</h2>
          ${renderList(share.evidenceItems ?? [], "אין עדיין ראיות שחרור לשיתוף.")}
        </section>
      </section>
    </section>
  `;

  return `
    <section
      class="nexus-share-workspace-shell"
      data-share-workspace-shell="canonical-right-rail"
      data-share-workspace-project="${escapeHtml(viewModel.project?.name ?? "Share")}"
    >
      <div class="nexus-share-workspace-shell__content">
        ${content}
      </div>
      ${renderNexusWorkspaceRail({ currentRoute: "share" })}
    </section>
  `;
}
