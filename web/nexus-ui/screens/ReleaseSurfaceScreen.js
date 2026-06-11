import { renderNexusWorkspaceRail } from "../components/NexusWorkspaceRail.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStatusPill(label, value) {
  return `
    <div class="nexus-release-surface__pill">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderList(items, emptyText) {
  if (!items.length) {
    return `<p class="nexus-release-surface__empty">${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ul class="nexus-release-surface__list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderChecks(checks) {
  if (!checks.length) {
    return `<p class="nexus-release-surface__empty">עוד לא נרשמו בדיקות שחרור מפורטות.</p>`;
  }

  return `
    <div class="nexus-release-surface__checks">
      ${checks.map((item) => `
        <article class="nexus-release-surface__check">
          <span>${escapeHtml(item.status)}</span>
          <strong>${escapeHtml(item.label)}</strong>
        </article>
      `).join("")}
    </div>
  `;
}

export function renderReleaseSurfaceScreen(viewModel = {}) {
  const release = viewModel.release ?? {};
  const contract = viewModel.contract ?? {};
  const framing = release.framing ?? {};
  const engineAnchors = framing.engineAnchors ?? {};
  const readinessCopy = release.isReady
    ? "השער פתוח לשחרור, בכפוף לאישור המשתמש."
    : "השער עדיין שומר על המוצר עד שכל ההוכחות מוכנות.";
  const blockedCopy = release.isBlocked
    ? "יש חסימות שמונעות שחרור עכשיו."
    : "אין חסימת שחרור ידועה כרגע.";

  const content = `
    <section
      class="nexus-release-surface"
      data-release-surface-contract="${escapeHtml(contract.contractId ?? "SURF-004")}"
      data-release-framing-task="${escapeHtml(framing.taskId ?? "EXP-004")}"
      data-release-framing-boundary="${escapeHtml(framing.boundary ?? "release-framing-not-release-execution")}"
      data-release-claim="${escapeHtml(framing.releaseClaim ?? "blocked-before-release-claim")}"
      data-release-backend-boundary="${escapeHtml(framing.backendBoundary ?? "local-mock-backend")}"
      data-release-product-package-status="${escapeHtml(framing.productPackageStatus ?? "missing")}"
      data-release-standalone-artifact-status="${escapeHtml(framing.standaloneArtifactStatus ?? "missing")}"
      data-release-engine-release-workspace="${escapeHtml(engineAnchors.releaseWorkspace ? "connected" : "missing")}"
      data-release-engine-releaseable-state="${escapeHtml(engineAnchors.releaseableProductStateContract ? "connected" : "missing")}"
      data-release-engine-deployment-path="${escapeHtml(engineAnchors.classAwareDeploymentReleasePath ? "connected" : "missing")}"
      data-release-engine-feedback="${escapeHtml(engineAnchors.deploymentStateFeedbackContract ? "connected" : "missing")}"
      data-surface-id="${escapeHtml(contract.surfaceId ?? "release")}"
      data-surface-purpose="${escapeHtml(contract.purpose ?? "human-release-decision-workspace")}"
      data-release-law="${escapeHtml(contract.releaseLaw ?? "preview-plus-gate-plus-deploy-truth")}"
    >
      <header class="nexus-release-surface__hero">
        <div>
          <p class="nexus-release-surface__eyebrow">שחרור מוצר</p>
          <h1>לפני שמשחררים, Nexus מראה את האמת</h1>
          <p>תצוגה אחת להחלטת שחרור: מה עומד לצאת, מה עבר בדיקה, מה חסום, ומה עדיין לא מותר להבטיח למשתמש.</p>
        </div>
        <div class="nexus-release-surface__status">
          ${renderStatusPill("יעד", release.targetLabel ?? release.target)}
          ${renderStatusPill("מצב", release.currentStatusLabel ?? release.currentStatus)}
          ${renderStatusPill("שער", release.validationStatusLabel ?? release.validationStatus)}
        </div>
      </header>

      <div class="nexus-release-surface__grid">
        <section class="nexus-release-surface__panel nexus-release-surface__panel--preview" data-release-region="release-preview-surface">
          <span class="nexus-release-surface__tag">תצוגה</span>
          <h2>מה עומד לצאת</h2>
          <p>${escapeHtml(release.previewLabel ?? release.previewPath)}</p>
          <div class="nexus-release-surface__preview-card">
            <strong>${escapeHtml(release.deploymentArtifactLabel ?? release.deploymentArtifactType)}</strong>
            <span>${escapeHtml(release.packageLabel ?? release.packagePath)}</span>
            <small>${escapeHtml(release.operationalLabel ?? release.operationalPath)}</small>
          </div>
        </section>

        <section class="nexus-release-surface__panel" data-release-region="release-gate">
          <span class="nexus-release-surface__tag">שער</span>
          <h2>${escapeHtml(readinessCopy)}</h2>
          <p>${escapeHtml(blockedCopy)}</p>
          ${renderList(release.blockers ?? [], "אין חסימות שחרור ידועות.")}
        </section>

        <section class="nexus-release-surface__panel" data-release-region="verification-evidence">
          <span class="nexus-release-surface__tag">בדיקות</span>
          <h2>ראיות לפני שחרור</h2>
          ${renderChecks(release.visibleChecks ?? [])}
        </section>

        <section class="nexus-release-surface__panel" data-release-region="deploy-publish-action">
          <span class="nexus-release-surface__tag">פרסום</span>
          <h2>מסלול פרסום</h2>
          <p>${escapeHtml(release.providerLabel)}. ${escapeHtml(release.strategyLabel)}</p>
          <button class="nexus-release-surface__primary-action" type="button" data-release-action="publish" ${release.isReady ? "" : "disabled"}>
            ${release.isReady ? "אשר שחרור" : "שחרור נעול עד שהשער מוכן"}
          </button>
        </section>

        <section class="nexus-release-surface__panel" data-release-region="failed-release-recovery">
          <span class="nexus-release-surface__tag">התאוששות</span>
          <h2>אם השחרור נכשל</h2>
          <p>המסך שומר את מצב השער והצעד הבא כדי שלא תהיה המתנה שקטה או הבטחת הצלחה מזויפת.</p>
        </section>

        <section class="nexus-release-surface__panel" data-release-region="rollback-affordance">
          <span class="nexus-release-surface__tag">חזרה</span>
          <h2>חזרה לגרסה בטוחה</h2>
          <p>חזרה לגרסה קודמת נשארת פעולה גלויה ונפרדת מאישור שחרור.</p>
        </section>

        <section class="nexus-release-surface__panel" data-release-region="share-demo-link">
          <span class="nexus-release-surface__tag">סקירה</span>
          <h2>שיתוף ודמו</h2>
          <p>תצוגת סקירה תופיע כאן רק כשיש תוצר שמותר להראות, בלי להפוך אותה לפרסום אמיתי.</p>
        </section>

        <section class="nexus-release-surface__panel" data-release-region="version-history-anchor">
          <span class="nexus-release-surface__tag">גרסאות</span>
          <h2>היסטוריית שחרור</h2>
          ${renderList(release.timelineEvents ?? [], "אין עדיין אירועי שחרור להצגה.")}
        </section>

        <section class="nexus-release-surface__panel" data-release-region="release-engine-truth">
          <span class="nexus-release-surface__tag">אמת</span>
          <h2>מה כבר מחובר למסלול השחרור</h2>
          ${renderList([
            engineAnchors.releaseWorkspace ? "מרחב שחרור מחובר." : "מרחב שחרור חסר.",
            engineAnchors.releaseableProductStateContract ? "מצב מוכנות מוצר מחובר." : "מצב מוכנות מוצר חסר.",
            engineAnchors.classAwareDeploymentReleasePath ? "מסלול הפצה לפי סוג מוצר מחובר." : "מסלול הפצה לפי סוג מוצר חסר.",
            engineAnchors.deploymentStateFeedbackContract ? "משוב מצב שחרור מחובר." : "משוב מצב שחרור חסר.",
            engineAnchors.productOwnedBackendSkeleton ? "שלד בקאנד מוצרי מחובר." : "שלד בקאנד מוצרי חסר.",
          ], "עדיין אין אמת שחרור מחוברת.")}
        </section>
      </div>
    </section>
  `;

  return `
    <section
      class="nexus-release-workspace-shell"
      data-release-workspace-shell="canonical-right-rail"
      data-release-workspace-project="${escapeHtml(viewModel.project?.name ?? "Release")}"
    >
      <div class="nexus-release-workspace-shell__content">
        ${content}
      </div>
      ${renderNexusWorkspaceRail({ currentRoute: "release" })}
    </section>
  `;
}
