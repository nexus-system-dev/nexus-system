import { renderNexusWorkspaceRail } from "../components/NexusWorkspaceRail.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMetric(metric) {
  return `
    <article class="nexus-growth-surface__metric">
      <strong>${escapeHtml(metric.value)}</strong>
      <span>${escapeHtml(metric.label)}</span>
    </article>
  `;
}

function renderOpportunity(item, index) {
  return `
    <article class="nexus-growth-surface__opportunity">
      <span>${index + 1}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
      </div>
    </article>
  `;
}

function renderList(items, emptyText) {
  if (!items.length) {
    return `<p class="nexus-growth-surface__empty">${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ul class="nexus-growth-surface__list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function labelExternalAction(action) {
  const labels = {
    publish: "פרסום",
    schedule: "תזמון",
    reply: "תגובה בשם המשתמש",
    delete: "מחיקה או הסרה",
    "direct-message": "הודעה פרטית",
    spend: "הוצאה כספית",
  };
  return labels[action] ?? action;
}

function renderGrowthPluginLayer(pluginLayer = {}) {
  const primary = pluginLayer.primaryPlugin ?? {};
  const registry = pluginLayer.registry ?? {};
  const registryPlugins = registry.plugins ?? [];
  return `
    <section
      class="nexus-growth-surface__panel"
      data-growth-plugin-task="${escapeHtml(pluginLayer.taskId ?? "GROW-PLUG-001")}"
      data-growth-plugin-status="${escapeHtml(pluginLayer.status ?? "needs-product-first")}"
      data-growth-plugin-primary="${escapeHtml(primary.pluginId ?? "product-readiness-blocker")}"
      data-growth-plugin-provider-required="${escapeHtml(primary.providerRequired ? "true" : "false")}"
      data-growth-plugin-approval-required="${escapeHtml(primary.approvalRequired ? "true" : "false")}"
      data-growth-plugin-handoff="${escapeHtml(primary.handoffRequired ?? "none")}"
      data-growth-region="growth-plugin-layer"
    >
      <span class="nexus-growth-surface__tag">יכולת צמיחה</span>
      <h2>${escapeHtml(primary.label ?? "קודם סוגרים תוצר ברור")}</h2>
      <p>${escapeHtml(primary.whyThisPlugin ?? "הצעד חייב להיות מחובר לתוצר.")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>כוונת משתמש</span>
          <strong>${escapeHtml(primary.userIntentLabel ?? "למידה ממשתמשים")}</strong>
        </article>
        <article>
          <span>ערוץ משני</span>
          <strong>${escapeHtml(primary.channelSecondaryLabel ?? "ללא ערוץ חיצוני")}</strong>
        </article>
        <article>
          <span>מדד קטן</span>
          <strong>${escapeHtml(primary.smallSuccessMetric ?? "מדד קטן עוד לא הוגדר")}</strong>
        </article>
      </div>
      ${pluginLayer.missing?.length ? `
        <div class="nexus-growth-surface__plugin-list">
          <strong>מה חסר לפני צמיחה</strong>
          ${renderList(pluginLayer.missing, "אין חסרים להצגה.")}
        </div>
      ` : ""}
      <div class="nexus-growth-surface__plugin-list">
        <strong>מותר עכשיו</strong>
        ${renderList(primary.allowedActions ?? [], "אין פעולה מותרת עד שיש תוצר ברור.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>חסום בלי אישור או אמת ספק</strong>
        ${renderList(primary.blockedActions ?? [], "אין חסימות נוספות.")}
      </div>
      <div
        class="nexus-growth-surface__plugin-list"
        data-growth-plugin-registry-task="${escapeHtml(registry.taskId ?? "GROW-PLUG-002")}"
        data-growth-plugin-registry-status="${escapeHtml(registry.status ?? "ready")}"
        data-growth-plugin-registry-mode="${escapeHtml(registry.userFacingMode ?? "simple-intents-not-marketplace")}"
        data-growth-plugin-registry-count="${escapeHtml(registryPlugins.length)}"
      >
        <strong>יכולות השחרור הראשון</strong>
        ${renderList(
          registryPlugins.map((item) => item.userIntentLabel ?? item.pluginId).slice(0, 6),
          "רישום היכולות עדיין לא זמין.",
        )}
      </div>
    </section>
  `;
}

function renderGrowthMeasurement(measurement = {}) {
  const sourceTypes = measurement.sourceTypes ?? [];
  return `
    <section
      class="nexus-growth-surface__panel"
      data-growth-measurement-task="${escapeHtml(measurement.taskId ?? "GROW-MEASURE-001")}"
      data-growth-measurement-status="${escapeHtml(measurement.status ?? "measurement-not-available-yet")}"
      data-growth-measurement-availability="${escapeHtml(measurement.measurementAvailability ?? "measurement-not-available-yet")}"
      data-growth-measurement-confidence="${escapeHtml(measurement.confidenceLevel ?? "low")}"
      data-growth-measurement-no-success-inference="${escapeHtml(measurement.noSuccessInference === false ? "false" : "true")}"
      data-growth-region="growth-measurement-truth"
    >
      <span class="nexus-growth-surface__tag">מדידת אמת</span>
      <h2>${escapeHtml(measurement.status === "has-initial-signal" ? "יש סימן מדידה ראשוני" : "המדידה עדיין לא זמינה")}</h2>
      <p>${escapeHtml(measurement.result ?? "measurement not available yet")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>מקורות</span>
          <strong>${escapeHtml(sourceTypes.length ? sourceTypes.join(", ") : "אין מקור מדידה")}</strong>
        </article>
        <article>
          <span>ביטחון</span>
          <strong>${escapeHtml(measurement.confidenceLevel ?? "low")}</strong>
        </article>
        <article>
          <span>שפה מותרת</span>
          <strong>${escapeHtml(measurement.conclusionLanguage ?? "initial-signal")}</strong>
        </article>
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>הפרדה</strong>
        ${renderList([
          `השערה: ${measurement.hypothesis ?? "לא הוגדרה"}`,
          `תוצאה: ${measurement.result ?? "לא זמינה"}`,
          `תובנה: ${measurement.insight ?? "אין להסיק הצלחה"}`,
        ], "אין מדידה להצגה.")}
      </div>
      <p class="nexus-growth-surface__empty">מדידה לא משנה את המוצר לבד. שינוי מוצר עובר לסוכן שינוי.</p>
    </section>
  `;
}

export function renderGrowthSurfaceScreen(viewModel = {}) {
  const contract = viewModel.contract ?? {};
  const growth = viewModel.growth ?? {};
  const agent = growth.agent ?? {};
  const pluginLayer = agent.growthPluginLayer ?? {};

  const content = `
    <section
      class="nexus-growth-surface"
      data-growth-surface-contract="${escapeHtml(contract.contractId ?? "SURF-005")}"
      data-growth-agent-task="${escapeHtml(agent.taskId ?? "GROW-AGT-001")}"
      data-growth-agent-status="${escapeHtml(agent.status ?? "needs-product-first")}"
      data-growth-agent-opportunity-type="${escapeHtml(agent.opportunityType ?? "user-learning")}"
      data-growth-agent-requires-agent="${escapeHtml(agent.requiresAgent ?? "none")}"
      data-growth-agent-requires-approval="${escapeHtml(agent.requiresApproval ? "true" : "false")}"
      data-growth-agent-can-run="${escapeHtml(agent.canRunGrowth ? "true" : "false")}"
      data-growth-campaign-external-action-locked="${escapeHtml(agent.campaignExecution?.requiresExplicitApprovalBeforeExternalAction === false ? "false" : "true")}"
      data-surface-id="${escapeHtml(contract.surfaceId ?? "growth")}"
      data-surface-purpose="${escapeHtml(contract.purpose ?? "bounded-product-evolution-workspace")}"
      data-growth-law="${escapeHtml(contract.growthLaw ?? "product-connected-growth-insight-not-analytics-noise")}"
    >
      <header class="nexus-growth-surface__hero">
        <div>
          <p class="nexus-growth-surface__eyebrow">צמיחה אחרי מוצר</p>
          <h1>צמיחה מתחילה רק ממה שכבר נבנה</h1>
          <p>Nexus מציפה הזדמנויות שמחוברות לתוצר, לא רעש אנליטי ולא קמפיינים מומצאים.</p>
        </div>
        <div class="nexus-growth-surface__gate" data-growth-region="growth-readiness-gate">
          <span class="${growth.readyForGrowth ? "is-ready" : "is-waiting"}"></span>
          <strong>${escapeHtml(growth.readinessLabel)}</strong>
          <p>${escapeHtml(growth.readinessBody)}</p>
        </div>
      </header>

      <section class="nexus-growth-surface__canvas">
        <div class="nexus-growth-surface__main">
          <section class="nexus-growth-surface__panel nexus-growth-surface__panel--insight" data-growth-region="product-connected-growth-insights">
            <span class="nexus-growth-surface__tag">Product signal</span>
            <h2>מה אפשר ללמוד מהתוצר עכשיו</h2>
            <p>${escapeHtml(growth.visibleBoundaryRule)}</p>
            <div class="nexus-growth-surface__signal-grid">
              <article>
                <span>תוצר מקור</span>
                <strong>${escapeHtml(growth.originArtifactTitle)}</strong>
              </article>
              <article>
                <span>קהל</span>
                <strong>${escapeHtml(growth.audience)}</strong>
              </article>
              <article>
                <span>יעד שחרור</span>
                <strong>${escapeHtml(growth.originReleaseTarget)}</strong>
              </article>
            </div>
          </section>

          <section class="nexus-growth-surface__panel" data-growth-region="bounded-opportunity-list">
            <span class="nexus-growth-surface__tag">Bounded opportunities</span>
            <h2>הזדמנויות שמותר לפתוח</h2>
            <div class="nexus-growth-surface__opportunities">
              ${(growth.opportunities ?? []).map(renderOpportunity).join("") || `<p class="nexus-growth-surface__empty">אין עדיין הזדמנות bounded להצגה.</p>`}
            </div>
          </section>

          <section class="nexus-growth-surface__panel" data-growth-region="growth-agent-decision">
            <span class="nexus-growth-surface__tag">סוכן צמיחה</span>
            <h2>${escapeHtml(agent.statusLabel ?? "צריך תוצר לפני צמיחה")}</h2>
            <p>${escapeHtml(agent.userMessage ?? "צמיחה מחכה לאמת מוצר.")}</p>
            <div class="nexus-growth-surface__signal-grid">
              <article>
                <span>סוג צעד</span>
                <strong>${escapeHtml(agent.opportunityLabel ?? "למידת משתמש")}</strong>
              </article>
              <article>
                <span>העברה</span>
                <strong>${escapeHtml(agent.requiresAgentLabel ?? "לא נדרש סוכן נוסף")}</strong>
              </article>
              <article>
                <span>מדד אמת</span>
                <strong>${escapeHtml(agent.successMetric ?? "מדד קטן עוד לא הוגדר")}</strong>
              </article>
            </div>
          </section>

          ${renderGrowthPluginLayer(pluginLayer)}

          ${renderGrowthMeasurement(growth.measurement ?? {})}

          <section class="nexus-growth-surface__panel" data-growth-region="growth-metric-baseline">
            <span class="nexus-growth-surface__tag">Baseline</span>
            <h2>מדידה מינימלית</h2>
            <div class="nexus-growth-surface__metrics">
              ${(growth.metrics ?? []).map(renderMetric).join("")}
            </div>
          </section>
        </div>

        <aside class="nexus-growth-surface__side">
          <section class="nexus-growth-surface__panel nexus-growth-surface__panel--next" data-growth-region="experiment-next-move">
            <span class="nexus-growth-surface__tag">Next move</span>
            <h2>${escapeHtml(growth.nextMove?.title ?? "צעד צמיחה מוגבל")}</h2>
            <p>${escapeHtml(growth.nextMove?.body ?? "הצעד הבא נשאר מחובר לתוצר שאושר.")}</p>
            <button type="button" class="nexus-growth-surface__primary-action" ${growth.readyForGrowth ? "" : "disabled"}>
              ${growth.readyForGrowth ? "פתח ניסוי מוגבל" : "מחכה לתוצר מאושר"}
            </button>
          </section>

          <section class="nexus-growth-surface__panel" data-growth-region="post-release-continuity-anchor">
            <span class="nexus-growth-surface__tag">Continuity</span>
            <h2>מה נשמר להמשך</h2>
            <p>${escapeHtml(growth.continuityRule)}</p>
          </section>

          <section class="nexus-growth-surface__panel">
            <span class="nexus-growth-surface__tag">לא עכשיו</span>
            <h2>מה לא פותחים כצמיחה</h2>
            ${renderList([
              ...(growth.deferred ?? []),
              ...(growth.disallowed ?? []),
              ...(agent.doNotPromise ?? []),
              ...(agent.campaignExecution?.forbiddenWithoutApproval ?? []).map((item) => `לא לבצע פעולה חיצונית ללא אישור: ${labelExternalAction(item)}`),
            ].slice(0, 7), "אין חסימות צמיחה להצגה.")}
          </section>
        </aside>
      </section>
    </section>
  `;

  return `
    <section
      class="nexus-growth-workspace-shell"
      data-growth-workspace-shell="canonical-right-rail"
      data-growth-workspace-project="${escapeHtml(viewModel.project?.name ?? "Growth")}"
    >
      <div class="nexus-growth-workspace-shell__content">
        ${content}
      </div>
      ${renderNexusWorkspaceRail({ currentRoute: "growth" })}
    </section>
  `;
}
