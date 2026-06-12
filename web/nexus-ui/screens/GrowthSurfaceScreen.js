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

function labelSemBlockedPromise(item) {
  const labels = {
    "guarantee-traffic": "לא להבטיח תנועה",
    "guarantee-leads": "לא להבטיח לידים",
    "guarantee-sales": "לא להבטיח מכירות",
    "guarantee-conversions": "לא להבטיח המרות",
    "guarantee-revenue": "לא להבטיח הכנסות",
    "guarantee-roas": "לא להבטיח החזר על פרסום",
    "guarantee-profitability": "לא להבטיח רווחיות",
    "fabricate-clicks": "לא להמציא קליקים",
    "fabricate-cpc": "לא להמציא עלות לקליק",
    "fabricate-conversions": "לא להמציא המרות",
    "spend-without-approval": "לא להוציא כסף בלי אישור",
  };
  return labels[item] ?? item;
}

function labelEmailBlockedPromise(item) {
  const labels = {
    "guarantee-opens": "לא להבטיח פתיחות",
    "guarantee-clicks": "לא להבטיח קליקים",
    "guarantee-replies": "לא להבטיח תגובות",
    "guarantee-leads": "לא להבטיח לידים",
    "guarantee-sales": "לא להבטיח מכירות",
    "guarantee-conversions": "לא להבטיח המרות",
    "guarantee-revenue": "לא להבטיח הכנסות",
    "fabricate-open-rate": "לא להמציא אחוזי פתיחה",
    "fabricate-click-rate": "לא להמציא אחוזי הקלקה",
    "fabricate-replies": "לא להמציא תגובות",
    "send-without-approval": "לא לשלוח בלי אישור",
    "scrape-contacts": "לא לגרד אנשי קשר",
  };
  return labels[item] ?? item;
}

function labelLandingBlockedClaim(item) {
  const labels = {
    "fake-customers": "לא להציג לקוחות מזויפים",
    "fake-testimonials": "לא להציג המלצות מזויפות",
    "fake-proof": "לא להציג הוכחה מזויפת",
    "fake-conversions": "לא להמציא המרות",
    "guarantee-leads": "לא להבטיח לידים",
    "guarantee-sales": "לא להבטיח מכירות",
    "guarantee-revenue": "לא להבטיח הכנסות",
    "publish-without-approval": "לא לפרסם בלי אישור",
    "release-impersonation": "לא להציג טיוטה כשחרור",
    "collect-without-consent": "לא לאסוף פרטים בלי הסכמה",
  };
  return labels[item] ?? item;
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

function renderSocialCampaignExecution(campaign = {}) {
  if (!campaign || campaign.status === "not-created") {
    return "";
  }
  return `
    <section
      class="nexus-growth-surface__panel"
      data-social-campaign-agent-task="${escapeHtml(campaign.taskId ?? "GROW-AGT-002")}"
      data-social-campaign-agent-status="${escapeHtml(campaign.status ?? "not-created")}"
      data-social-campaign-provider="${escapeHtml(campaign.selectedProvider ?? "instagram")}"
      data-social-campaign-action="${escapeHtml(campaign.requestedAction ?? "draft")}"
      data-social-campaign-provider-connected="${escapeHtml(campaign.providerConnected ? "true" : "false")}"
      data-social-campaign-external-executed="${escapeHtml(campaign.externalExecutionPerformed ? "true" : "false")}"
      data-social-campaign-per-post-approval="${escapeHtml(campaign.perPostApprovalRequired === false ? "false" : "true")}"
      data-social-campaign-manual-copy="${escapeHtml(campaign.manualCopyAvailable === false ? "false" : "true")}"
      data-social-campaign-fabricated-metrics-blocked="${escapeHtml(campaign.fabricatedMetricsBlocked === false ? "false" : "true")}"
      data-growth-region="social-campaign-execution-agent"
    >
      <span class="nexus-growth-surface__tag">קמפיין חברתי</span>
      <h2>${escapeHtml(campaign.status === "scheduled" ? "תזמון אושר ונרשם" : campaign.status === "published" ? "פרסום אושר ונרשם" : "טיוטת קמפיין לפני פעולה חיצונית")}</h2>
      <p>${escapeHtml(campaign.userMessage ?? "קמפיין חברתי עדיין לא נוצר.")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>ספק</span>
          <strong>${escapeHtml(campaign.selectedProvider ?? "instagram")}</strong>
        </article>
        <article>
          <span>פוסטים</span>
          <strong>${escapeHtml(campaign.sequenceCount ?? 0)}</strong>
        </article>
        <article>
          <span>פעולה</span>
          <strong>${escapeHtml(campaign.requestedAction ?? "draft")}</strong>
        </article>
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>ספקים שמותרים לביצוע בשחרור הראשון</strong>
        ${renderList(campaign.firstReleaseRealProviders ?? [], "אין ספקים שמותרים לביצוע.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>ערוצים שנשארים טיוטה בלבד</strong>
        ${renderList(campaign.draftOnlyProviders ?? [], "אין ערוצים בטיוטה בלבד.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>חסום בשחרור הראשון</strong>
        ${renderList(campaign.blockedActions ?? [], "אין חסימות נוספות.")}
      </div>
      ${campaign.missingAsset ? `
        <p class="nexus-growth-surface__empty">חסר נכס מאושר: ${escapeHtml(campaign.missingAsset)}. עוברים לשיתוף או דמו לפני שימוש במדיה.</p>
      ` : ""}
      <p class="nexus-growth-surface__empty">${escapeHtml(campaign.commentsSummary?.summary ?? "אין תגובות אמיתיות זמינות לקריאה.")}</p>
    </section>
  `;
}

function renderSeoActionPath(seo = {}) {
  if (!seo || seo.status === "not-created") {
    return "";
  }
  return `
    <section
      class="nexus-growth-surface__panel"
      dir="${escapeHtml(seo.direction ?? "rtl")}"
      data-seo-action-task="${escapeHtml(seo.taskId ?? "GROW-SEO-001")}"
      data-seo-action-status="${escapeHtml(seo.status ?? "not-created")}"
      data-seo-action-requested="${escapeHtml(seo.requestedAction ?? "draft")}"
      data-seo-action-language="${escapeHtml(seo.language ?? "he")}"
      data-seo-action-direction="${escapeHtml(seo.direction ?? "rtl")}"
      data-seo-action-approval-required="${escapeHtml(seo.approvalRequiredBeforeApply === false ? "false" : "true")}"
      data-seo-action-visual-build-required="${escapeHtml(seo.visualBuildRequired ? "true" : "false")}"
      data-seo-action-mutation-required="${escapeHtml(seo.mutationRequired ? "true" : "false")}"
      data-seo-action-public-gate="${escapeHtml(seo.shareOrReleaseRequiredForPublicVisibility === false ? "false" : "true")}"
      data-seo-action-real-provider-data="${escapeHtml(seo.realProviderDataAvailable ? "true" : "false")}"
      data-seo-action-search-volume-hypothesis="${escapeHtml(seo.searchVolumeIsHypothesis === false ? "false" : "true")}"
      data-seo-action-external-published="${escapeHtml(seo.externalPublicationPerformed ? "true" : "false")}"
      data-growth-region="seo-action-path"
    >
      <span class="nexus-growth-surface__tag">חיפוש אורגני</span>
      <h2>${escapeHtml(seo.status === "applied-to-visual-build" ? "שינוי SEO אושר ונשלח לבנייה" : "טיוטת SEO לפני החלה")}</h2>
      <p>${escapeHtml(seo.userMessage ?? "SEO עדיין לא נוצר.")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>כותרת</span>
          <strong>${escapeHtml(seo.title || "לא נוצרה כותרת")}</strong>
        </article>
        <article>
          <span>תיאור</span>
          <strong>${escapeHtml(seo.metaDescription || "לא נוצר תיאור")}</strong>
        </article>
        <article>
          <span>מצב נתוני ספק</span>
          <strong>${escapeHtml(seo.realProviderDataAvailable ? "נתונים אמיתיים זמינים" : "טיוטה ללא נתוני ספק")}</strong>
        </article>
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>השערות חיפוש לאישור</strong>
        ${renderList(seo.keywordHypotheses ?? [], "אין השערות חיפוש להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>כותרות מוצעות</strong>
        ${renderList(seo.headings ?? [], "אין כותרות להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>מה חסום</strong>
        ${renderList(seo.blockedClaims ?? [], "אין חסימות להצגה.")}
      </div>
      <p class="nexus-growth-surface__empty">נתוני חיפוש, דירוגים ונפחי חיפוש נשארים השערה עד שיש מקור אמיתי.</p>
    </section>
  `;
}

function renderSemActionPath(sem = {}) {
  if (!sem || sem.status === "not-created") {
    return "";
  }
  return `
    <section
      class="nexus-growth-surface__panel"
      data-sem-action-task="${escapeHtml(sem.taskId ?? "GROW-SEM-001")}"
      data-sem-action-status="${escapeHtml(sem.status ?? "not-created")}"
      data-sem-action-requested="${escapeHtml(sem.requestedAction ?? "draft")}"
      data-sem-action-provider="${escapeHtml(sem.selectedProvider ?? "google-ads")}"
      data-sem-action-provider-connected="${escapeHtml(sem.providerConnected ? "true" : "false")}"
      data-sem-action-provider-supported="${escapeHtml(sem.providerSupportedForRealExecution ? "true" : "false")}"
      data-sem-action-draft-only-provider="${escapeHtml(sem.draftOnlyProvider ? "true" : "false")}"
      data-sem-action-spend-scope="${escapeHtml(sem.hasSpendPermissionScope ? "true" : "false")}"
      data-sem-action-provider-not-spend-permission="${escapeHtml(sem.providerConnectionIsNotSpendPermission === false ? "false" : "true")}"
      data-sem-action-separate-approvals="${escapeHtml(sem.separateApprovalRequired === false ? "false" : "true")}"
      data-sem-action-budget-cap-enforced="${escapeHtml(sem.budgetCapEnforced === false ? "false" : "true")}"
      data-sem-action-hard-cap-usd="${escapeHtml(sem.hardCapUsd ?? 50)}"
      data-sem-action-landing-ready="${escapeHtml(sem.landingOrDemoReady ? "true" : "false")}"
      data-sem-action-measurement-ready="${escapeHtml(sem.measurementPlanReady ? "true" : "false")}"
      data-sem-action-can-prepare-activation="${escapeHtml(sem.canPrepareActivation ? "true" : "false")}"
      data-sem-action-external-spend="${escapeHtml(sem.externalSpendPerformed ? "true" : "false")}"
      data-sem-action-safe-stop="${escapeHtml(sem.safeStopStopped ? "true" : "false")}"
      data-sem-action-safe-stop-ads-modified="${escapeHtml(sem.safeStopAdsModified ? "true" : "false")}"
      data-sem-action-safe-stop-budget-modified="${escapeHtml(sem.safeStopBudgetModified ? "true" : "false")}"
      data-growth-region="sem-action-path"
    >
      <span class="nexus-growth-surface__tag">פרסום ממומן</span>
      <h2>${escapeHtml(sem.status === "ready-for-provider-activation" ? "הניסוי מוכן להפעלה מאושרת" : sem.status === "stopped-safely" ? "קמפיין נעצר לפי כלל בטיחות" : "טיוטת ניסוי ממומן לפני הוצאה")}</h2>
      <p>${escapeHtml(sem.userMessage ?? "SEM עדיין לא נוצר.")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>ספק</span>
          <strong>${escapeHtml(sem.selectedProvider ?? "google-ads")}</strong>
        </article>
        <article>
          <span>תקרת תקציב</span>
          <strong>${escapeHtml(`${sem.hardCapUsd ?? 50} ${sem.budgetCurrency ?? "USD"}`)}</strong>
        </article>
        <article>
          <span>הוצאה בפועל</span>
          <strong>${escapeHtml(sem.externalSpendPerformed ? "בוצעה" : "לא בוצעה")}</strong>
        </article>
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>אישורים נפרדים</strong>
        ${renderList([
          `קמפיין: ${sem.campaignApproved ? "מאושר" : "לא מאושר"}`,
          `מודעה: ${sem.adApproved ? "מאושרת" : "לא מאושרת"}`,
          `תקציב: ${sem.budgetApproved ? "מאושר" : "לא מאושר"}`,
          `הפעלה: ${sem.activationApproved ? "מאושרת" : "לא מאושרת"}`,
        ], "אין אישורים להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>ספקים שמותרים לביצוע בשחרור הראשון</strong>
        ${renderList(sem.firstReleaseRealProviders ?? [], "אין ספקים שמותרים לביצוע.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>ערוצים שנשארים טיוטה בלבד</strong>
        ${renderList(sem.draftOnlyProviders ?? [], "אין ערוצים בטיוטה בלבד.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>מה חסום</strong>
        ${renderList((sem.forbiddenPromises ?? []).map(labelSemBlockedPromise), "אין חסימות להצגה.")}
      </div>
      <p class="nexus-growth-surface__empty">חיבור ספק אינו הרשאת הוצאה. שינוי מסר או דף עובר למסלולי הבנייה והשינוי.</p>
    </section>
  `;
}

function renderEmailActionPath(email = {}) {
  if (!email || email.status === "not-created") {
    return "";
  }
  return `
    <section
      class="nexus-growth-surface__panel"
      data-email-action-task="${escapeHtml(email.taskId ?? "GROW-EMAIL-001")}"
      data-email-action-status="${escapeHtml(email.status ?? "not-created")}"
      data-email-action-requested="${escapeHtml(email.requestedAction ?? "draft")}"
      data-email-action-provider="${escapeHtml(email.selectedProvider ?? "mailchimp")}"
      data-email-action-provider-connected="${escapeHtml(email.providerConnected ? "true" : "false")}"
      data-email-action-provider-supported="${escapeHtml(email.providerSupportedForRealSend ? "true" : "false")}"
      data-email-action-gmail-limited="${escapeHtml(email.gmailLimited ? "true" : "false")}"
      data-email-action-source-confirmed="${escapeHtml(email.audienceSourceConfirmed ? "true" : "false")}"
      data-email-action-lawful-basis="${escapeHtml(email.lawfulBasisConfirmed ? "true" : "false")}"
      data-email-action-cold-list-rejected="${escapeHtml(email.coldListRejected ? "true" : "false")}"
      data-email-action-draft-only="${escapeHtml(email.draftOnlyByDefault === false ? "false" : "true")}"
      data-email-action-full-audience-default="${escapeHtml(email.fullAudienceSendDefault ? "true" : "false")}"
      data-email-action-test-send-prepared="${escapeHtml(email.testSendPrepared ? "true" : "false")}"
      data-email-action-one-email-ready="${escapeHtml(email.oneEmailSendPrepared ? "true" : "false")}"
      data-email-action-external-send="${escapeHtml(email.externalSendPerformed ? "true" : "false")}"
      data-email-action-per-email-approval="${escapeHtml(email.perEmailApprovalRequired === false ? "false" : "true")}"
      data-email-action-fabricated-metrics-blocked="${escapeHtml(email.fabricatedResultsBlocked === false ? "false" : "true")}"
      data-email-action-metrics-fabricated="${escapeHtml(email.metricsFabricated ? "true" : "false")}"
      data-growth-region="email-action-path"
    >
      <span class="nexus-growth-surface__tag">אימייל</span>
      <h2>${escapeHtml(email.status === "one-email-send-ready" ? "אימייל אחד מוכן לשליחה מאושרת" : email.status === "test-send-ready" ? "שליחת בדיקה מוכנה לאישור" : "טיוטת אימייל לפני שליחה")}</h2>
      <p>${escapeHtml(email.userMessage ?? "מסלול אימייל עדיין לא נוצר.")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>ספק</span>
          <strong>${escapeHtml(email.selectedProvider ?? "mailchimp")}</strong>
        </article>
        <article>
          <span>קהל נקי</span>
          <strong>${escapeHtml(`${email.cleanedCount ?? 0} כתובות`)}</strong>
        </article>
        <article>
          <span>נשלח בפועל</span>
          <strong>${escapeHtml(email.externalSendPerformed ? "כן" : "לא")}</strong>
        </article>
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>אישורים נפרדים</strong>
        ${renderList([
          `קמפיין: ${email.campaignApproved ? "מאושר" : "לא מאושר"}`,
          `תוכן: ${email.contentApproved ? "מאושר" : "לא מאושר"}`,
          `מקור קהל: ${email.audienceSourceApproved ? "מאושר" : "לא מאושר"}`,
          `בדיקה: ${email.testSendApproved ? "מאושרת" : "לא מאושרת"}`,
          `שליחה: ${email.sendApproved ? "מאושרת" : "לא מאושרת"}`,
        ], "אין אישורים להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>טיוטות לאישור</strong>
        ${renderList(email.subjectVariants ?? [], "אין נושאים להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>ספקים שמתאימים לשליחה בשחרור הראשון</strong>
        ${renderList(email.preferredProviders ?? [], "אין ספקים זמינים לשליחה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>מה חסום</strong>
        ${renderList((email.forbiddenPromises ?? []).map(labelEmailBlockedPromise), "אין חסימות להצגה.")}
      </div>
      <p class="nexus-growth-surface__empty">אישור קמפיין מכין רצף, אבל כל אימייל אמיתי דורש אישור נפרד. נתוני פתיחה או קליקים מגיעים רק ממדידה אמיתית.</p>
    </section>
  `;
}

function renderLandingActionPath(landing = {}) {
  if (!landing || landing.status === "not-created") {
    return "";
  }
  return `
    <section
      class="nexus-growth-surface__panel"
      dir="${escapeHtml(landing.direction ?? "rtl")}"
      data-landing-action-task="${escapeHtml(landing.taskId ?? "GROW-LAND-001")}"
      data-landing-action-status="${escapeHtml(landing.status ?? "not-created")}"
      data-landing-action-requested="${escapeHtml(landing.requestedAction ?? "draft")}"
      data-landing-action-language="${escapeHtml(landing.language ?? "he")}"
      data-landing-action-direction="${escapeHtml(landing.direction ?? "rtl")}"
      data-landing-action-ready="${escapeHtml(landing.ready ? "true" : "false")}"
      data-landing-action-draft-internal="${escapeHtml(landing.draftInternal === false ? "false" : "true")}"
      data-landing-action-preview-not-public="${escapeHtml(landing.previewInspectableNotPublic ? "true" : "false")}"
      data-landing-action-public-visible="${escapeHtml(landing.publicVisible ? "true" : "false")}"
      data-landing-action-external-approval="${escapeHtml(landing.externalApprovalGranted ? "true" : "false")}"
      data-landing-action-share-ready="${escapeHtml(landing.shareDemoReady ? "true" : "false")}"
      data-landing-action-release-ready="${escapeHtml(landing.releaseReady ? "true" : "false")}"
      data-landing-action-share-gate-required="${escapeHtml(landing.shareOrReleaseGateRequired === false ? "false" : "true")}"
      data-landing-action-external-published="${escapeHtml(landing.externalPublicationPerformed ? "true" : "false")}"
      data-landing-action-product-truth-owner="${escapeHtml(landing.productTruthOwner ?? "source-product-not-landing")}"
      data-landing-action-lead-consent="${escapeHtml(landing.consentConfigured ? "true" : "false")}"
      data-landing-action-lead-storage="${escapeHtml(landing.leadStorage ?? "nexus-experiment-leads")}"
      data-landing-action-rtl="${escapeHtml(landing.direction === "rtl" ? "true" : "false")}"
      data-landing-action-fabricated-results-blocked="${escapeHtml(landing.fabricatedConversionDataBlocked === false ? "false" : "true")}"
      data-growth-region="landing-action-path"
    >
      <span class="nexus-growth-surface__tag">דף נחיתה</span>
      <h2>${escapeHtml(landing.status === "shared-demo-ready" ? "מוכן לשיתוף דמו מאושר" : landing.status === "release-handoff-ready" ? "מוכן למסלול שחרור מאושר" : landing.status === "preview-ready" ? "תצוגה פנימית מוכנה" : "טיוטת דף נחיתה פנימית")}</h2>
      <p>${escapeHtml(landing.userMessage ?? "מסלול דף נחיתה עדיין לא נוצר.")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>גרסאות</span>
          <strong>${escapeHtml(`${landing.versionCount ?? 0}/${landing.maxVersions ?? 2}`)}</strong>
        </article>
        <article>
          <span>נראות ציבורית</span>
          <strong>${escapeHtml(landing.publicVisible ? "מותרת דרך שער" : "לא ציבורי")}</strong>
        </article>
        <article>
          <span>בעלות אמת מוצר</span>
          <strong>${escapeHtml(landing.productTruthOwner ?? "source-product-not-landing")}</strong>
        </article>
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>השערת ניסוי</strong>
        ${renderList([landing.hypothesis].filter(Boolean), "אין השערה להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>כפתורי פעולה לבדיקה</strong>
        ${renderList(landing.ctaVariants ?? [], "אין כפתורים להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>מדידה שמותרת לדף להפיק</strong>
        ${renderList(landing.landingEvents ?? [], "אין אירועי מדידה להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>מה חסום</strong>
        ${renderList((landing.forbiddenClaims ?? []).map(labelLandingBlockedClaim), "אין חסימות להצגה.")}
      </div>
      ${landing.missing?.length ? `
        <p class="nexus-growth-surface__empty">חסר לפני יצירה: ${escapeHtml(landing.missing.join(", "))}</p>
      ` : ""}
      <p class="nexus-growth-surface__empty">דף נחיתה הוא נכס צמיחה פנימי. שינוי אמת מוצר עובר לשינוי מוצר, שינוי חזותי עובר לבנייה חזותית, ונראות חיצונית עוברת לשיתוף או שחרור.</p>
    </section>
  `;
}

function renderLandingBackendSync(backend = {}) {
  if (!backend || backend.status === "not-created") {
    return "";
  }
  return `
    <section
      class="nexus-growth-surface__panel"
      dir="rtl"
      data-landing-backend-task="${escapeHtml(backend.taskId ?? "GROW-LAND-BACKEND-001")}"
      data-landing-backend-status="${escapeHtml(backend.status ?? "not-created")}"
      data-landing-backend-storage="${escapeHtml(backend.storageStatus ?? "nexus-experiment-leads")}"
      data-landing-backend-artifact-boundary="${escapeHtml(backend.artifactBoundaryStatus ?? "draft-only")}"
      data-landing-backend-production="${escapeHtml(backend.productionBackend ? "true" : "false")}"
      data-landing-backend-standalone-ready="${escapeHtml(backend.standaloneReady ? "true" : "false")}"
      data-landing-backend-external-capture-allowed="${escapeHtml(backend.externalCaptureAllowed ? "true" : "false")}"
      data-landing-backend-external-capture-blocked="${escapeHtml(backend.externalCaptureBlocked === false ? "false" : "true")}"
      data-landing-backend-lead-count="${escapeHtml(String(backend.leadCount ?? 0))}"
      data-landing-backend-product-lead-count="${escapeHtml(String(backend.productBackendLeadCount ?? 0))}"
      data-landing-backend-sync-direction="${escapeHtml(backend.syncDirection ?? "landing-to-product")}"
      data-landing-backend-product-owner="${escapeHtml(backend.productTruthOwner ?? "source-product-not-landing")}"
      data-growth-region="landing-backend-sync"
    >
      <span class="nexus-growth-surface__tag">בקאנד דף נחיתה</span>
      <h2>${escapeHtml(backend.status === "synced" ? "ליד נשמר וסונכרן למוצר" : backend.packageContractReady ? "בקאנד עצמאי מוכן כחוזה חבילה" : "בקאנד דף נחיתה עדיין לא מוכן")}</h2>
      <p>${escapeHtml(backend.userMessage ?? "בקאנד דף נחיתה עדיין לא נוצר.")}</p>
      <div class="nexus-growth-surface__signal-grid">
        <article>
          <span>אחסון</span>
          <strong>${escapeHtml(backend.storageStatus ?? "nexus-experiment-leads")}</strong>
        </article>
        <article>
          <span>סנכרון למוצר</span>
          <strong>${escapeHtml(`${backend.productBackendLeadCount ?? 0} לידים`)}</strong>
        </article>
        <article>
          <span>מצב פרסום</span>
          <strong>${escapeHtml(backend.externalCaptureAllowed ? "מותר בשער שחרור" : "חסום לשימוש חיצוני")}</strong>
        </article>
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>חוזה עצמאי</strong>
        ${renderList([
          backend.packageContractReady ? "יש חוזה פרונטד ובקאנד לדף הנחיתה" : "אין עדיין חוזה חבילה",
          `מצב חבילה: ${backend.artifactBoundaryStatus ?? "draft-only"}`,
          `כיוון סנכרון: ${backend.syncDirection ?? "landing-to-product"}`,
        ], "אין חוזה בקאנד להצגה.")}
      </div>
      <div class="nexus-growth-surface__plugin-list">
        <strong>מה עדיין חסום</strong>
        ${renderList([
          backend.productionBackend ? "" : "זה עדיין לא בקאנד ייצור",
          backend.standaloneReady ? "" : "זה עדיין לא חבילת מוצר עצמאית",
          backend.externalCaptureBlocked === false ? "" : (backend.releaseBlockReason ?? "איסוף חיצוני חסום עד שחרור מלא"),
        ].filter(Boolean), "אין חסימות להצגה.")}
      </div>
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

          ${renderSocialCampaignExecution(growth.socialCampaign ?? {})}

          ${renderSeoActionPath(growth.seoAction ?? {})}

          ${renderSemActionPath(growth.semAction ?? {})}

          ${renderEmailActionPath(growth.emailAction ?? {})}

          ${renderLandingActionPath(growth.landingAction ?? {})}

          ${renderLandingBackendSync(growth.landingBackend ?? {})}

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
