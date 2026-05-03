function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setCssVar(styleTarget, name, value) {
  if (!styleTarget || typeof styleTarget.setProperty !== "function" || value === undefined || value === null) {
    return;
  }

  styleTarget.setProperty(name, String(value));
}

const labels = {
  active: "פעיל",
  blocked: "חסום",
  idle: "ממתין",
  working: "עובד",
  assigned: "בתהליך",
  done: "הושלם",
  failed: "נכשל",
  build: "בנייה",
  maintenance: "תחזוקה",
  marketing: "שיווק",
  growth: "צמיחה",
  advisory: "זמין",
  recommendation: "המלצה",
  warning: "אזהרה",
  critical: "קריטי",
  partial: "חלקי",
  full: "מלא",
  shared: "משותף",
  solo: "יחיד",
  open: "פתוח",
  success: "הצלחה",
  "task.assigned": "משימה שובצה",
  "task.completed": "משימה הושלמה",
  "task.failed": "משימה נכשלה",
  "roadmap.generated": "נוצרה תוכנית",
  "state.updated": "המצב עודכן",
};

function t(value) {
  return labels[value] ?? value;
}

function listHtml(items, emptyText) {
  if (!items.length) {
    return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  }

  return items
    .map(
      (item) => `
      <article class="list-item">
        <strong>${escapeHtml(item.title)}</strong>
        ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
      </article>
    `,
    )
    .join("");
}

function metricHtml(metrics) {
  return `
    <div class="signal-grid">
      ${metrics
        .map(
          (metric) => `
          <div class="signal-item">
            <span class="mini-label">${escapeHtml(metric.label)}</span>
            <strong>${escapeHtml(metric.value)}</strong>
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}

function stackHtml(title, items, emptyText) {
  if (!items.length) {
    return `
      <section class="stack-block">
        <h3>${escapeHtml(title)}</h3>
        <p class="empty">${escapeHtml(emptyText)}</p>
      </section>
    `;
  }

  return `
    <section class="stack-block">
      <h3>${escapeHtml(title)}</h3>
      <div class="stack-list">
        ${items
          .map(
            (item) => `
            <article class="stack-item">
              <strong>${escapeHtml(item.title)}</strong>
              ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
            </article>
          `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function queryElements(doc) {
  return {
    projectSelect: doc.querySelector("#project-select"),
    syncCasinoButton: doc.querySelector("#sync-casino-button"),
    analyzeButton: doc.querySelector("#analyze-button"),
    runCycleButton: doc.querySelector("#run-cycle-button"),
    heroActions: doc.querySelector(".hero-actions"),
    screenCreate: doc.querySelector("#screen-create"),
    screenOnboarding: doc.querySelector("#screen-onboarding"),
    screenWorkspace: doc.querySelector("#screen-workspace"),
    workspaceTopShell: doc.querySelector(".workspace-top-shell"),
    workspaceBoard: doc.querySelector("#workspace-board"),
    flowFeedbackBanner: doc.querySelector("#flow-feedback-banner"),
    flowFeedbackTitle: doc.querySelector("#flow-feedback-title"),
    flowFeedbackMessage: doc.querySelector("#flow-feedback-message"),
    createNewProjectButton: doc.querySelector("#create-new-project-button"),
    reopenOnboardingButton: doc.querySelector("#reopen-onboarding-button"),
    emptyAppState: doc.querySelector("#empty-app-state"),
    emptyProjectMessage: doc.querySelector("#empty-project-message"),
    emptyProjectStatus: doc.querySelector("#empty-project-status"),
    projectCreateStage: doc.querySelector("#project-create-stage"),
    onboardingStage: doc.querySelector("#onboarding-stage"),
    onboardingScreenMessage: doc.querySelector("#onboarding-screen-message"),
    onboardingScreenStatus: doc.querySelector("#onboarding-screen-status"),
    onboardingStageTitle: doc.querySelector("#onboarding-stage-title"),
    onboardingStageDescription: doc.querySelector("#onboarding-stage-description"),
    onboardingProgressPill: doc.querySelector("#onboarding-progress-pill"),
    onboardingBackButton: doc.querySelector("#onboarding-back-button"),
    onboardingForwardButton: doc.querySelector("#onboarding-forward-button"),
    onboardingNotesList: doc.querySelector("#onboarding-notes-list"),
    onboardingChatThread: doc.querySelector("#onboarding-chat-thread"),
    onboardingCurrentQuestionTitle: doc.querySelector("#onboarding-current-question-title"),
    onboardingCurrentQuestionBody: doc.querySelector("#onboarding-current-question-body"),
    onboardingAnswerInput: doc.querySelector("#onboarding-answer-input"),
    onboardingNextButton: doc.querySelector("#onboarding-next-button"),
    onboardingMaterialStage: doc.querySelector("#onboarding-material-stage"),
    onboardingFormStage: doc.querySelector("#onboarding-form-stage"),
    createProjectNameInput: doc.querySelector("#create-project-name-input"),
    createProjectVisionInput: doc.querySelector("#create-project-vision-input"),
    createProjectLinkInput: doc.querySelector("#create-project-link-input"),
    createProjectFileNameInput: doc.querySelector("#create-project-file-name-input"),
    createProjectFileContentInput: doc.querySelector("#create-project-file-content-input"),
    createProjectButton: doc.querySelector("#create-project-button"),
    finishOnboardingButton: doc.querySelector("#finish-onboarding-button"),
    developerTab: doc.querySelector("#tab-developer"),
    projectBrainTab: doc.querySelector("#tab-project-brain"),
    releaseTab: doc.querySelector("#tab-release"),
    growthTab: doc.querySelector("#tab-growth"),
    heroProjectName: doc.querySelector("#hero-project-name"),
    heroGoal: doc.querySelector("#hero-goal"),
    now: doc.querySelector("#now-content"),
    critical: doc.querySelector("#critical-content"),
    missing: doc.querySelector("#missing-content"),
    existing: doc.querySelector("#existing-content"),
    live: doc.querySelector("#live-content"),
    decision: doc.querySelector("#decision-content"),
    developerWorkspaceSummary: doc.querySelector("#developer-workspace-summary"),
    developerWorkspacePanel: doc.querySelector("#workspace-developer"),
    projectBrainSummary: doc.querySelector("#project-brain-summary"),
    projectBrainPanel: doc.querySelector("#workspace-project-brain"),
    releaseWorkspaceSummary: doc.querySelector("#release-workspace-summary"),
    releaseWorkspacePanel: doc.querySelector("#workspace-release"),
    growthWorkspaceSummary: doc.querySelector("#growth-workspace-summary"),
    growthWorkspacePanel: doc.querySelector("#workspace-growth"),
    screenReview: doc.querySelector("#screen-review-content"),
    proposalReview: doc.querySelector("#proposal-review-content"),
    proposalSectionTitleInput: doc.querySelector("#proposal-section-title-input"),
    proposalSectionSummaryInput: doc.querySelector("#proposal-section-summary-input"),
    proposalNextActionLabelInput: doc.querySelector("#proposal-next-action-label-input"),
    proposalAnnotationInput: doc.querySelector("#proposal-annotation-input"),
    proposalEditButton: doc.querySelector("#proposal-edit-button"),
    partialSectionDecisionSelect: doc.querySelector("#partial-section-decision-select"),
    partialComponentDecisionSelect: doc.querySelector("#partial-component-decision-select"),
    partialCopyDecisionSelect: doc.querySelector("#partial-copy-decision-select"),
    partialAcceptanceNoteInput: doc.querySelector("#partial-acceptance-note-input"),
    partialAcceptanceButton: doc.querySelector("#partial-acceptance-button"),
    snapshotIntervalInput: doc.querySelector("#snapshot-interval-input"),
    snapshotTriggersInput: doc.querySelector("#snapshot-triggers-input"),
    snapshotScheduleButton: doc.querySelector("#snapshot-schedule-button"),
    runSnapshotBackupButton: doc.querySelector("#run-snapshot-backup-button"),
    snapshotMaxInput: doc.querySelector("#snapshot-max-input"),
    snapshotRetentionButton: doc.querySelector("#snapshot-retention-button"),
    snapshotCleanupButton: doc.querySelector("#snapshot-cleanup-button"),
    snapshotWorkerToggleButton: doc.querySelector("#snapshot-worker-toggle-button"),
    snapshotWorkerRunButton: doc.querySelector("#snapshot-worker-run-button"),
    disasterRecoveryRefreshButton: doc.querySelector("#disaster-recovery-refresh-button"),
    continuityActionSelect: doc.querySelector("#continuity-action-select"),
    continuityActionButton: doc.querySelector("#continuity-action-button"),
    continuityRefreshButton: doc.querySelector("#continuity-refresh-button"),
    executeRollbackButton: doc.querySelector("#execute-rollback-button"),
    projectAuditActorInput: doc.querySelector("#project-audit-actor-input"),
    projectAuditActionInput: doc.querySelector("#project-audit-action-input"),
    projectAuditSensitivitySelect: doc.querySelector("#project-audit-sensitivity-select"),
    projectAuditRefreshButton: doc.querySelector("#project-audit-refresh-button"),
    projectAudit: doc.querySelector("#project-audit-content"),
    accessIsolation: doc.querySelector("#access-isolation-content"),
    learning: doc.querySelector("#learning-content"),
    companion: doc.querySelector("#companion-content"),
    collaboration: doc.querySelector("#collaboration-content"),
    versioning: doc.querySelector("#versioning-content"),
    growth: doc.querySelector("#growth-content"),
    casinoBaseUrlInput: doc.querySelector("#casino-base-url-input"),
    external: doc.querySelector("#external-content"),
    scanPathInput: doc.querySelector("#scan-path-input"),
    scanButton: doc.querySelector("#scan-button"),
    scanner: doc.querySelector("#scanner-content"),
    primitiveComponents: doc.querySelector("#primitive-components-content"),
    layoutComponents: doc.querySelector("#layout-components-content"),
    feedbackComponents: doc.querySelector("#feedback-components-content"),
    navigationComponents: doc.querySelector("#navigation-components-content"),
    dataDisplayComponents: doc.querySelector("#data-display-components-content"),
    analysis: doc.querySelector("#analysis-content"),
    graph: doc.querySelector("#graph-content"),
    agents: doc.querySelector("#agents-content"),
    events: doc.querySelector("#events-content"),
  };
}

const workspaceKeys = ["developer", "project-brain", "release", "growth"];
const onboardingQuestionFlow = [
  {
    id: "target-user",
    title: "למי הפרויקט הזה מיועד?",
    body: "ענה בקצרה מי המשתמש המרכזי כדי שנבין עבור מי בונים את ה־workspace הראשון.",
    noteLabel: "קהל יעד",
    placeholder: "לדוגמה: מנהלי מוצר, צוותי פיתוח, בעלי קזינו או צוותי support.",
  },
  {
    id: "core-flow",
    title: "מה הפעולה הראשונה שהמשתמש חייב לבצע?",
    body: "תאר את הצעד הראשון הקריטי של המשתמש בתוך המוצר, בלי לפרט עדיין את כל המערכת.",
    noteLabel: "פעולת ליבה ראשונה",
    placeholder: "לדוגמה: לפתוח פרויקט, לאשר proposal, או להשלים onboarding קצר.",
  },
  {
    id: "success-outcome",
    title: "איך תדע שהגרסה הראשונה באמת נותנת ערך?",
    body: "תאר מה המשתמש צריך לקבל או להרגיש כדי שנוכל להגדיר מהו first value אמיתי.",
    noteLabel: "תוצאת ערך ראשונה",
    placeholder: "לדוגמה: לראות next task ברור, recommendation, או project state usable.",
  },
];

function workspaceTabHtml(title, metaItems = []) {
  return `
    <span class="workspace-tab-title">${escapeHtml(title)}</span>
    <span class="workspace-tab-meta">${metaItems.map((item) => escapeHtml(item)).join(" · ")}</span>
  `;
}

function renderWorkspaceTabs(elements, project) {
  const developerWorkspace = normalizeObject(project.developerWorkspace);
  const developerSummary = normalizeObject(developerWorkspace.contextSummary);
  const projectBrainWorkspace = normalizeObject(project.projectBrainWorkspace);
  const brainSummary = normalizeObject(projectBrainWorkspace.summary);
  const releaseWorkspace = normalizeObject(project.releaseWorkspace);
  const releaseValidation = normalizeObject(releaseWorkspace.validation);
  const releaseSummary = normalizeObject(releaseWorkspace.summary);
  const growthWorkspace = normalizeObject(project.growthWorkspace);
  const growthSummary = normalizeObject(growthWorkspace.summary);

  if (elements.developerTab) {
    elements.developerTab.innerHTML = workspaceTabHtml("Developer", [
      `${developerSummary.progressPercent ?? 0}%`,
      developerSummary.progressStatus ?? "idle",
      developerSummary.nextAction ?? "no next action",
    ]);
  }

  if (elements.projectBrainTab) {
    elements.projectBrainTab.innerHTML = workspaceTabHtml("Project Brain", [
      `${brainSummary.blockerCount ?? 0} blockers`,
      projectBrainWorkspace.overview?.currentPhase ?? "unknown",
      brainSummary.requiresApproval ? "approval required" : "clear",
    ]);
  }

  if (elements.releaseTab) {
    elements.releaseTab.innerHTML = workspaceTabHtml("Release", [
      releaseValidation.status ?? "unknown",
      releaseSummary.isBlocked ? "blocked" : "moving",
      releaseWorkspace.buildAndDeploy?.currentStage ?? "planned",
    ]);
  }

  if (elements.growthTab) {
    elements.growthTab.innerHTML = workspaceTabHtml("Growth", [
      `${growthSummary.totalPillars ?? 0} pillars`,
      `${growthSummary.totalKpis ?? 0} kpis`,
      growthSummary.hasGrowthPlan ? "plan active" : "plan empty",
    ]);
  }
}

function setActiveWorkspace(elements, workspaceKey) {
  const activeKey = workspaceKeys.includes(workspaceKey) ? workspaceKey : "developer";
  const mapping = [
    { key: "developer", tab: elements.developerTab, panel: elements.developerWorkspacePanel },
    { key: "project-brain", tab: elements.projectBrainTab, panel: elements.projectBrainPanel },
    { key: "release", tab: elements.releaseTab, panel: elements.releaseWorkspacePanel },
    { key: "growth", tab: elements.growthTab, panel: elements.growthWorkspacePanel },
  ];

  for (const entry of mapping) {
    const isActive = entry.key === activeKey;
    if (entry.tab) {
      entry.tab.classList?.toggle("active", isActive);
      if ("ariaSelected" in entry.tab) {
        entry.tab.ariaSelected = isActive ? "true" : "false";
      }
    }
    if (entry.panel) {
      entry.panel.classList?.toggle("active", isActive);
      entry.panel.hidden = !isActive;
    }
  }
}

export function applyDesignSystem(doc, project) {
  const rootStyle = doc?.documentElement?.style;
  if (!rootStyle) {
    return;
  }

  const designTokens = normalizeObject(project.designTokens);
  const colors = normalizeObject(designTokens.colors);
  const spacing = normalizeObject(designTokens.spacing);
  const radius = normalizeObject(designTokens.radius);
  const borders = normalizeObject(designTokens.borders);
  const shadows = normalizeObject(designTokens.shadows);
  const typographySystem = normalizeObject(project.typographySystem);
  const typeScale = normalizeObject(typographySystem.typeScale);
  const layoutSystem = normalizeObject(project.layoutSystem);
  const spacingScale = normalizeObject(layoutSystem.spacingScale);
  const sectionRhythm = normalizeObject(layoutSystem.sectionRhythm);
  const colorRules = normalizeObject(project.colorRules);
  const roles = normalizeObject(colorRules.roles);
  const states = normalizeObject(colorRules.states);

  setCssVar(rootStyle, "--bg", roles.canvas?.token ?? colors.canvas);
  setCssVar(rootStyle, "--panel", roles.surface?.token ?? colors.surface);
  setCssVar(rootStyle, "--ink", roles.textPrimary?.token ?? colors.ink);
  setCssVar(rootStyle, "--muted", roles.textMuted?.token ?? colors.muted);
  setCssVar(rootStyle, "--line", roles.border?.token ?? colors.border);
  setCssVar(rootStyle, "--accent", roles.accent?.token ?? colors.accent);
  setCssVar(rootStyle, "--accent-strong", roles.accentStrong?.token ?? colors.accentStrong);
  setCssVar(rootStyle, "--good", states.success?.token ?? colors.success);
  setCssVar(rootStyle, "--warn", states.warning?.token ?? colors.warning);
  setCssVar(rootStyle, "--bad", states.danger?.token ?? colors.danger);
  setCssVar(rootStyle, "--font-display", typographySystem.displayFontFamily ?? designTokens.typography?.familyDisplay);
  setCssVar(rootStyle, "--font-body", typographySystem.baseFontFamily ?? designTokens.typography?.familyBody);
  setCssVar(rootStyle, "--font-size-display", `${typeScale.display?.fontSize ?? designTokens.typography?.sizeDisplay ?? 40}px`);
  setCssVar(rootStyle, "--font-size-h1", `${typeScale.h1?.fontSize ?? designTokens.typography?.sizeXl ?? 28}px`);
  setCssVar(rootStyle, "--font-size-h2", `${typeScale.h2?.fontSize ?? designTokens.typography?.sizeLg ?? 20}px`);
  setCssVar(rootStyle, "--font-size-body", `${typeScale.body?.fontSize ?? designTokens.typography?.sizeMd ?? 16}px`);
  setCssVar(rootStyle, "--font-size-meta", `${typeScale.meta?.fontSize ?? designTokens.typography?.sizeXs ?? 12}px`);
  setCssVar(rootStyle, "--line-height-body", String(typeScale.body?.lineHeight ?? 1.5));
  setCssVar(rootStyle, "--line-height-heading", String(typeScale.h1?.lineHeight ?? 1.1));
  setCssVar(rootStyle, "--space-xs", `${spacingScale.xs ?? spacing.xs ?? 4}px`);
  setCssVar(rootStyle, "--space-sm", `${spacingScale.sm ?? spacing.sm ?? 8}px`);
  setCssVar(rootStyle, "--space-md", `${spacingScale.md ?? spacing.md ?? 12}px`);
  setCssVar(rootStyle, "--space-lg", `${spacingScale.lg ?? spacing.lg ?? 20}px`);
  setCssVar(rootStyle, "--space-xl", `${spacingScale.xl ?? spacing.xl ?? 32}px`);
  setCssVar(rootStyle, "--space-xxl", `${spacingScale.xxl ?? spacing.xxl ?? 48}px`);
  setCssVar(rootStyle, "--radius-sm", `${radius.sm ?? 6}px`);
  setCssVar(rootStyle, "--radius-md", `${radius.md ?? 12}px`);
  setCssVar(rootStyle, "--radius-lg", `${radius.lg ?? 20}px`);
  setCssVar(rootStyle, "--radius-pill", `${radius.pill ?? 999}px`);
  setCssVar(rootStyle, "--border-subtle", `${borders.subtle ?? 1}px`);
  setCssVar(rootStyle, "--border-strong", `${borders.strong ?? 2}px`);
  setCssVar(rootStyle, "--border-focus", `${borders.focus ?? 3}px`);
  setCssVar(rootStyle, "--shadow-soft", shadows.soft);
  setCssVar(rootStyle, "--shadow-medium", shadows.medium);
  setCssVar(rootStyle, "--shadow-focus", shadows.focus);
  setCssVar(rootStyle, "--layout-max-width", `${layoutSystem.grid?.maxContentWidth ?? 1280}px`);
  setCssVar(rootStyle, "--layout-gap", `${layoutSystem.grid?.gutter ?? spacing.lg ?? 20}px`);
  setCssVar(rootStyle, "--section-gap", `${sectionRhythm.sectionGap ?? spacing.xl ?? 32}px`);
  setCssVar(rootStyle, "--panel-gap", `${sectionRhythm.panelGap ?? spacing.lg ?? 20}px`);
  setCssVar(rootStyle, "--page-top", `${sectionRhythm.pageTop ?? spacing.xxl ?? 48}px`);
}

function renderTop(elements, project) {
  const blockedTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "blocked");
  const activeTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "assigned");
  const firstValueOutput = normalizeObject(project.firstValueOutput ?? project.state?.firstValueOutput);
  const firstValueSummary = normalizeObject(project.firstValueSummary ?? project.state?.firstValueSummary);
  const bottleneck = project.overview?.bottleneck ?? "לא זוהה";
  const projectStatus = t(project.status ?? "idle");
  const currentStateSummary = activeTasks.length > 0
    ? `הפרויקט נמצא עכשיו בשלב ${projectStatus}, וכבר יש צעד עבודה פעיל שמחכה לבדיקה.`
    : `הפרויקט נמצא עכשיו בשלב ${projectStatus}, וה־workspace מוכן לצעד הבא.`;
  const firstValueHeadline = firstValueOutput.preview?.headline ?? firstValueSummary.message ?? null;
  const firstValueDetail =
    firstValueOutput.preview?.detail
    ?? normalizeArray(firstValueOutput.userVisibleArtifacts).join(" | ")
    ?? null;

  elements.heroProjectName.textContent = project.name ?? "Project";
  elements.heroGoal.textContent = project.goal ?? "המטרה תופיע כאן";
  elements.casinoBaseUrlInput.value = project.source?.baseUrl ?? "http://localhost:4101";

  elements.now.innerHTML = `
    <div class="workspace-top-summary">
      <div class="big-status ${escapeHtml(project.status ?? "idle")}">
        <span>${escapeHtml(t(project.status ?? "idle"))}</span>
      </div>
      <div class="workspace-top-copy">
        <strong>המצב הנוכחי</strong>
        <p>${escapeHtml(currentStateSummary)}</p>
        ${firstValueHeadline ? `<p class="workspace-top-support">כרגע כבר רואים התחלה של ערך: ${escapeHtml(firstValueHeadline)}.</p>` : ""}
        ${firstValueDetail ? `<p class="workspace-top-support subtle">${escapeHtml(firstValueDetail)}</p>` : ""}
      </div>
    </div>
    <div class="workspace-priority-line">
      <span class="mini-label">החסם המרכזי כרגע</span>
      <strong>${escapeHtml(bottleneck)}</strong>
      <span>${escapeHtml(blockedTasks.length > 0 ? "זה הדבר הראשון שכדאי לפתור לפני הרחבה נוספת." : "אין כרגע חסימה קשה, אבל זה עדיין הנקודה שדורשת הכי הרבה תשומת לב.")}</span>
    </div>
  `;
}

function renderCritical(elements, project) {
  const firstApproval = normalizeArray(project.approvals)[0];
  const blockedTask = normalizeArray(project.cycle?.roadmap).find((task) => task.status === "blocked");
  const assignedTask = normalizeArray(project.cycle?.roadmap).find((task) => task.status === "assigned");
  const title = firstApproval ?? assignedTask?.summary ?? blockedTask?.summary ?? "כרגע אין פעולה דחופה";
  const reason = blockedTask
    ? `זה תקוע בגלל: ${normalizeArray(blockedTask.dependencies).join(", ") || "חסר מידע"}`
    : firstApproval
      ? "זאת הנקודה היחידה שמחזיקה את ההתקדמות לפני הרצה נוספת."
      : "זה הצעד הכי ישיר לקדם עכשיו כדי לשמור על מומנטום.";
  const blocker = project.overview?.bottleneck ?? blockedTask?.summary ?? "לא זוהה חסם מרכזי";

  elements.critical.innerHTML = `
    <div class="critical-kicker-line">הפעולה הבאה</div>
    <div class="critical-main">${escapeHtml(title)}</div>
    <p class="critical-sub">${escapeHtml(reason)}</p>
    <div class="critical-single-blocker">
      <span class="mini-label">הדבר שמעכב אותך עכשיו</span>
      <strong>${escapeHtml(blocker)}</strong>
    </div>
  `;
}

function renderMissing(elements, project) {
  const scan = normalizeObject(project.scan);
  const external = normalizeObject(project.externalSnapshot);
  const items = [];

  if (scan.findings) {
    if (!scan.findings.hasMigrations) items.push({ title: "חסרות מיגרציות" });
    if (!scan.findings.hasEnvExample) items.push({ title: "חסר קובץ env לדוגמה" });
    if (!scan.findings.hasTests) items.push({ title: "חסרות בדיקות" });
  }

  if (external.features) {
    if (!external.features.hasPayments) items.push({ title: "חסר תהליך תשלומים" });
    if (!external.features.hasWallet) items.push({ title: "חסר ארנק" });
    if (normalizeArray(external.roadmapContext?.knownMissingParts).length) {
      items.push(
        ...normalizeArray(external.roadmapContext?.knownMissingParts).slice(0, 4).map((item) => ({
          title: item,
        })),
      );
    }
  }

  elements.missing.innerHTML = listHtml(items, "לא זוהו כרגע חוסרים בולטים.");
}

function renderExisting(elements, project) {
  const scan = normalizeObject(project.scan);
  const external = normalizeObject(project.externalSnapshot);
  const repositoryDiagnosis = normalizeObject(
    project.repositoryImportAndCodebaseDiagnosis ?? project.state?.repositoryImportAndCodebaseDiagnosis,
  );
  const items = [];

  if (scan.findings?.hasBackend) items.push({ title: "יש backend" });
  if (scan.findings?.hasAuth) items.push({ title: "יש auth" });
  if (scan.findings?.hasEnvExample) items.push({ title: "יש env לדוגמה" });
  if (external.features?.hasAuth) items.push({ title: "ה־API של הקזינו מדווח ש־auth קיים" });
  if (repositoryDiagnosis.status === "ready") {
    items.push({
      title: `Diagnosis ready: ${repositoryDiagnosis.repository?.fullName ?? "connected-repository"}`,
      body: repositoryDiagnosis.summary?.architectureSummary ?? repositoryDiagnosis.summary?.codebaseSummary ?? "",
    });
  }

  elements.existing.innerHTML = listHtml(items, "עדיין אין מספיק מידע חיובי להציג.");
}

function renderLive(elements, project) {
  const activeTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "assigned");
  const blockedTasks = normalizeArray(project.cycle?.roadmap).filter((task) => task.status === "blocked");
  const progressState = normalizeObject(project.progressState);
  const reactiveWorkspaceState = normalizeObject(project.reactiveWorkspaceState);
  const liveUpdateChannel = normalizeObject(project.liveUpdateChannel);
  const liveLogStream = normalizeObject(project.liveLogStream);
  const realtimeEvents = normalizeArray(project.realtimeEventStream?.events);
  const commandOutputs = normalizeArray(liveLogStream.commandOutputs);
  const stdoutEntries = normalizeArray(liveLogStream.streams?.stdout);
  const stderrEntries = normalizeArray(liveLogStream.streams?.stderr);
  const items = [
    {
      title: `Live channel: ${liveUpdateChannel.transportMode ?? "polling"}`,
      body: `refresh ${liveUpdateChannel.refreshStrategy ?? "scheduled-refresh"} | progress ${reactiveWorkspaceState.progressBar?.percent ?? progressState.percent ?? 0}% | logs ${liveLogStream.summary?.totalEntries ?? 0}`,
    },
    ...realtimeEvents.slice(0, 2).map((event) => ({
      title: event.message ?? event.streamType ?? "Live event",
      body: `${event.streamType ?? "stream"} | ${t(event.status ?? "active")}`,
    })),
    ...commandOutputs.slice(-2).reverse().map((entry) => ({
      title: entry.message ?? "Command output",
      body: `${entry.stream ?? "stdout"} | command output`,
    })),
    ...stdoutEntries.slice(-2).reverse().map((entry) => ({
      title: entry.message ?? "stdout",
      body: `${entry.source ?? "runtime"} | stdout`,
    })),
    ...stderrEntries.slice(-1).reverse().map((entry) => ({
      title: entry.message ?? "stderr",
      body: `${entry.source ?? "runtime"} | stderr`,
    })),
    ...activeTasks.slice(0, 3).map((task) => ({
      title: task.summary,
      body: "קורה עכשיו",
    })),
    ...blockedTasks.slice(0, 2).map((task) => ({
      title: task.summary,
      body: "חסום כרגע",
    })),
  ];

  elements.live.innerHTML = listHtml(items, "כרגע אין פעילות מיוחדת.");
}

function renderDecision(elements, project) {
  const surface = normalizeObject(project.cockpitRecommendationSurface);
  const recommendationPanel = normalizeObject(surface.recommendationPanel);

  if (surface.surfaceId) {
    const items = [
      {
        title: surface.headline ?? "No active recommendation",
        body: surface.summary ?? recommendationPanel.reason ?? "",
      },
      {
        title: surface.whyNow ?? "No recommendation reasoning yet",
        body: recommendationPanel.expectedOutcome ?? "",
      },
      {
        title: recommendationPanel.primaryCta?.label ?? "Review recommendation",
        body: surface.approval?.requiresApproval
          ? `${surface.approval?.riskLevel ?? "unknown"} | ${surface.approval?.whatIfRejected ?? "Approval required"}`
          : `urgency ${recommendationPanel.urgency ?? "normal"}`,
      },
    ];

    elements.decision.innerHTML = `
      ${metricHtml([
        { label: "Recommendation", value: surface.headline ?? "not-set" },
        { label: "Approval", value: surface.approval?.requiresApproval ? "required" : "clear" },
        { label: "Blockers", value: String(surface.summaryMeta?.blockerCount ?? 0) },
        { label: "Urgency", value: recommendationPanel.urgency ?? "normal" },
      ])}
      ${stackHtml("Cockpit recommendation", items, "אין כרגע recommendation זמינה.")}
    `;
    return;
  }

  const items = normalizeArray(project.approvals).slice(0, 4).map((approval) => ({ title: approval }));
  elements.decision.innerHTML = listHtml(items, "אין כרגע משהו שצריך לאשר.");
}

function renderProposalReview(elements, project) {
  const state = normalizeObject(project.state);
  const aiControlCenterSurface = normalizeObject(project.aiControlCenterSurface ?? state.aiControlCenterSurface);
  const aiDesignRequest = normalizeObject(project.aiDesignRequest ?? state.aiDesignRequest);
  const aiDesignProposal = normalizeObject(project.aiDesignProposal ?? state.aiDesignProposal);
  const aiGenerationObservability = normalizeObject(project.aiGenerationObservability ?? state.aiGenerationObservability);
  const providerLatencyFailureTracker = normalizeObject(project.providerLatencyFailureTracker ?? state.providerLatencyFailureTracker);
  const generationSuccessAcceptanceTracker = normalizeObject(
    project.generationSuccessAcceptanceTracker ?? state.generationSuccessAcceptanceTracker,
  );
  const promptContractFailureTracker = normalizeObject(project.promptContractFailureTracker ?? state.promptContractFailureTracker);
  const designProposalValidation = normalizeObject(project.designProposalValidation ?? state.designProposalValidation);
  const designProposalReviewState = normalizeObject(project.designProposalReviewState ?? state.designProposalReviewState);
  const proposalApplyDecision = normalizeObject(project.proposalApplyDecision ?? state.proposalApplyDecision);
  const editableProposal = normalizeObject(project.editableProposal ?? state.editableProposal);
  const editedProposal = normalizeObject(project.editedProposal ?? state.editedProposal);
  const activeProposal = editedProposal.revisionId ? editedProposal : editableProposal;
  const history = normalizeObject(project.proposalEditHistory ?? state.proposalEditHistory);
  const partialAcceptanceDecision = normalizeObject(project.partialAcceptanceDecision ?? state.partialAcceptanceDecision);
  const remainingProposalScope = normalizeObject(project.remainingProposalScope ?? state.remainingProposalScope);

  if (!editableProposal.proposalId) {
    if (elements.proposalReview) {
      elements.proposalReview.innerHTML = `<p class="empty">עדיין אין proposal פתוח לעריכה או partial acceptance.</p>`;
    }
    if (elements.proposalSectionTitleInput) elements.proposalSectionTitleInput.value = "";
    if (elements.proposalSectionSummaryInput) elements.proposalSectionSummaryInput.value = "";
    if (elements.proposalNextActionLabelInput) elements.proposalNextActionLabelInput.value = "";
    if (elements.proposalAnnotationInput) elements.proposalAnnotationInput.value = "";
    if (elements.partialAcceptanceNoteInput) elements.partialAcceptanceNoteInput.value = "";
    return;
  }

  const sections = normalizeArray(activeProposal.sections);
  const components = normalizeArray(activeProposal.components);
  const copyItems = normalizeArray(activeProposal.copy);
  const firstSection = normalizeObject(sections[0]);
  const firstComponent = normalizeObject(components[0]);
  const firstCopy = normalizeObject(copyItems[0]);
  const nextAction = normalizeObject(activeProposal.nextAction);
  const historyEntries = normalizeArray(history.entries).slice(-3).reverse().map((entry) => ({
    title: `Revision ${entry.revisionNumber ?? "?"} · ${entry.action ?? "edited"}`,
    body: `${entry.proposalId ?? activeProposal.proposalId ?? "proposal"} | annotations ${entry.annotationCount ?? 0}`,
  }));
  const reviewScope = [
    {
      title: firstSection.label ?? firstSection.sectionId ?? "Section",
      body: firstSection.contentSummary ?? "אין סיכום section זמין.",
    },
    {
      title: firstComponent.componentType ?? firstComponent.componentId ?? "Component",
      body: String(firstComponent.proposedValue ?? firstComponent.currentValue ?? "No proposed value"),
    },
    {
      title: firstCopy.label ?? firstCopy.copyId ?? "Copy",
      body: firstCopy.proposedText ?? firstCopy.currentText ?? "No proposed copy",
    },
  ];
  const partialItems = partialAcceptanceDecision.decisionId
    ? [
        {
          title: partialAcceptanceDecision.status ?? "unknown",
          body: `follow-up: ${partialAcceptanceDecision.followUpAction ?? "not-set"}`,
        },
        {
          title: "Approved",
          body: String(partialAcceptanceDecision.summary?.approvedCount ?? 0),
        },
        {
          title: "Remaining",
          body: String(partialAcceptanceDecision.summary?.remainingCount ?? 0),
        },
        {
          title: "Regeneration scope",
          body:
            normalizeArray(remainingProposalScope.componentsNeedingRegeneration)
              .map((component) => component.componentId)
              .join(" | ")
            || "אין כרגע רכיבים פתוחים ל־regeneration.",
        },
      ]
    : [];
  const generatedPreviewItems = aiControlCenterSurface.aiControlCenterSurfaceId
    ? [
        {
          title: aiControlCenterSurface.generatedSurfacePreview?.screenId ?? "generated-preview",
          body: `delivery: ${aiControlCenterSurface.summary?.deliveryStatus ?? "unknown"}`,
        },
        {
          title: "Preview regions",
          body: String(aiControlCenterSurface.generatedSurfacePreview?.regionCount ?? 0),
        },
        {
          title: "CTA anchors",
          body: aiControlCenterSurface.generatedSurfacePreview?.hasCtaAnchors ? "yes" : "no",
        },
        {
          title: "Live binding",
          body: aiControlCenterSurface.liveRuntimeBinding?.activeScreenId ?? "not-bound",
        },
      ]
    : [];
  const aiDesignItems = aiDesignRequest.requestId
    ? [
        {
          title: aiDesignRequest.screen?.screenId ?? "screen",
          body: aiDesignRequest.selectedTask?.summary ?? "No selected task summary",
        },
        {
          title: aiDesignProposal.proposalId ?? "proposal",
          body: `regions ${normalizeArray(aiDesignProposal.regions).length} | provider ${aiDesignProposal.reasoning?.source ?? "unknown"}`,
        },
        {
          title: "Validation",
          body: `${designProposalValidation.status ?? "unknown"} | review ${designProposalReviewState.status ?? "unknown"}`,
        },
        {
          title: "Apply",
          body: proposalApplyDecision.status ?? "unknown",
        },
      ]
    : [];
  const aiObservabilityItems = aiGenerationObservability.observabilityId
    ? [
        {
          title: aiGenerationObservability.providerId ?? "provider",
          body: `status ${aiGenerationObservability.status ?? "unknown"} | checks ${aiGenerationObservability.summary?.readyCheckCount ?? 0}/${aiGenerationObservability.summary?.totalCheckCount ?? 0}`,
        },
        {
          title: "Validation / review",
          body: `${aiGenerationObservability.summary?.validationStatus ?? "unknown"} | ${aiGenerationObservability.summary?.reviewStatus ?? "unknown"}`,
        },
        {
          title: "Apply / attention",
          body: `${aiGenerationObservability.summary?.applyStatus ?? "unknown"} | blockers ${aiGenerationObservability.summary?.blockingCheckCount ?? 0}`,
        },
      ]
    : [];
  const providerLatencyItems = providerLatencyFailureTracker.trackerId
    ? [
        {
          title: providerLatencyFailureTracker.providerId ?? "provider",
          body: `latency ${providerLatencyFailureTracker.latency?.latencyStatus ?? "unknown"} | failures ${providerLatencyFailureTracker.failure?.failureCount ?? 0}`,
        },
        {
          title: "Health / circuit",
          body: `${providerLatencyFailureTracker.providerHealth?.providerHealth ?? "unknown"} | ${providerLatencyFailureTracker.providerHealth?.circuitState ?? "unknown"}`,
        },
        {
          title: "Latest reason",
          body: providerLatencyFailureTracker.failure?.latestReason ?? "No provider failure reason is active.",
        },
      ]
    : [];
  const generationSuccessItems = generationSuccessAcceptanceTracker.trackerId
    ? [
        {
          title: `produced ${generationSuccessAcceptanceTracker.summary?.producedProposalCount ?? 0} | accepted ${generationSuccessAcceptanceTracker.summary?.acceptedProposalCount ?? 0}`,
          body: `rejected ${generationSuccessAcceptanceTracker.summary?.rejectedProposalCount ?? 0} | pending ${generationSuccessAcceptanceTracker.summary?.pendingProposalCount ?? 0}`,
        },
        {
          title: "Owner / operator",
          body: `${generationSuccessAcceptanceTracker.summary?.ownerAcceptanceStatus ?? "unknown"} | ${generationSuccessAcceptanceTracker.summary?.applyStatus ?? "unknown"}`,
        },
        {
          title: "Acceptance rate",
          body: `${Math.round((generationSuccessAcceptanceTracker.summary?.acceptanceRate ?? 0) * 100)}% | review ${generationSuccessAcceptanceTracker.summary?.reviewStatus ?? "unknown"}`,
        },
      ]
    : [];
  const promptContractFailureItems = promptContractFailureTracker.trackerId
    ? [
        {
          title: `blocking ${promptContractFailureTracker.failureSummary?.blockingFailureCount ?? 0} | missing ${promptContractFailureTracker.failureSummary?.missingContractCount ?? 0}`,
          body: `invalid ${promptContractFailureTracker.failureSummary?.invalidContractCount ?? 0} | blocked ${promptContractFailureTracker.failureSummary?.blockedContractCount ?? 0}`,
        },
        {
          title: "Execution / provider",
          body: `${promptContractFailureTracker.failureSummary?.executionStatus ?? "unknown"} | ${promptContractFailureTracker.failureSummary?.providerStatus ?? "unknown"}`,
        },
        {
          title: "Latest failure",
          body: promptContractFailureTracker.latestFailure?.reason ?? "No prompt contract failure is active.",
        },
      ]
    : [];

  if (elements.proposalSectionTitleInput) {
    elements.proposalSectionTitleInput.value = firstSection.label ?? firstSection.title ?? "";
  }
  if (elements.proposalSectionSummaryInput) {
    elements.proposalSectionSummaryInput.value = firstSection.contentSummary ?? firstSection.body ?? "";
  }
  if (elements.proposalNextActionLabelInput) {
    elements.proposalNextActionLabelInput.value = nextAction.label ?? "";
  }
  if (elements.partialSectionDecisionSelect && !elements.partialSectionDecisionSelect.value) {
    elements.partialSectionDecisionSelect.value = "approved";
  }
  if (elements.partialComponentDecisionSelect && !elements.partialComponentDecisionSelect.value) {
    elements.partialComponentDecisionSelect.value = "rejected";
  }
  if (elements.partialCopyDecisionSelect && !elements.partialCopyDecisionSelect.value) {
    elements.partialCopyDecisionSelect.value = "approved";
  }

  if (elements.proposalReview) {
    elements.proposalReview.innerHTML = `
      ${metricHtml([
        { label: "Proposal", value: activeProposal.proposalType ?? editableProposal.proposalType ?? "generic" },
        { label: "Revision", value: String(editedProposal.revisionNumber ?? 1) },
        { label: "History", value: String(normalizeArray(history.entries).length || 1) },
        { label: "Partial status", value: partialAcceptanceDecision.status ?? "not-run" },
      ])}
      ${stackHtml("Current proposal scope", reviewScope, "עדיין אין scope זמין לעריכה.")}
      ${stackHtml("AI design chain", aiDesignItems, "עדיין אין שרשרת AI Design קנונית זמינה.")}
      ${stackHtml("AI generation observability", aiObservabilityItems, "עדיין אין observability קנוני לשרשרת ה־AI.")}
      ${stackHtml("Provider latency & failure", providerLatencyItems, "עדיין אין מעקב latency/failure קנוני עבור ספק ה־AI.")}
      ${stackHtml("Generation success & acceptance", generationSuccessItems, "עדיין אין מעקב קנוני להצלחה ולקבלה של generation.")}
      ${stackHtml("Prompt contract failures", promptContractFailureItems, "עדיין אין מעקב קנוני לכשלי prompt contract.")}
      ${stackHtml("Generated preview", generatedPreviewItems, "עדיין אין generated surface זמין להצגה.")}
      ${stackHtml("Edit history", historyEntries, "עדיין אין היסטוריית revisions מעבר ליצירה הראשונית.")}
      ${stackHtml("Partial acceptance", partialItems, "עדיין לא בוצע partial acceptance על ההצעה הזאת.")}
    `;
  }
}

function renderWorkspaceSummaries(elements, project) {
  const developerWorkspace = normalizeObject(project.developerWorkspace);
  const developerSummary = normalizeObject(developerWorkspace.contextSummary);
  const projectBrainWorkspace = normalizeObject(project.projectBrainWorkspace);
  const brainSummary = normalizeObject(projectBrainWorkspace.summary);
  const releaseWorkspace = normalizeObject(project.releaseWorkspace);
  const releaseSummary = normalizeObject(releaseWorkspace.summary);
  const releaseValidation = normalizeObject(releaseWorkspace.validation);
  const growthWorkspace = normalizeObject(project.growthWorkspace);
  const growthSummary = normalizeObject(growthWorkspace.summary);

  elements.developerWorkspaceSummary.innerHTML = metricHtml([
    { label: "Progress", value: `${developerSummary.progressPercent ?? 0}%` },
    { label: "Status", value: developerSummary.progressStatus ?? "idle" },
    { label: "Next action", value: developerSummary.nextAction ?? "not-set" },
    { label: "Incident", value: developerSummary.incidentStatus ?? "clear" },
  ]);

  elements.projectBrainSummary.innerHTML = metricHtml([
    { label: "Domain", value: projectBrainWorkspace.overview?.domain ?? "generic" },
    { label: "Phase", value: projectBrainWorkspace.overview?.currentPhase ?? "unknown" },
    { label: "Blockers", value: String(brainSummary.blockerCount ?? 0) },
    { label: "Approval", value: brainSummary.requiresApproval ? "required" : "clear" },
  ]);

  elements.releaseWorkspaceSummary.innerHTML = metricHtml([
    { label: "Target", value: releaseWorkspace.releaseTarget ?? "not-set" },
    { label: "Stage", value: releaseWorkspace.buildAndDeploy?.currentStage ?? "planned" },
    { label: "Validation", value: releaseValidation.status ?? "unknown" },
    { label: "Blocked", value: releaseSummary.isBlocked ? "yes" : "no" },
  ]);

  elements.growthWorkspaceSummary.innerHTML = metricHtml([
    { label: "Pillars", value: String(growthSummary.totalPillars ?? 0) },
    { label: "Channels", value: String(growthSummary.totalChannels ?? 0) },
    { label: "KPIs", value: String(growthSummary.totalKpis ?? 0) },
    { label: "Plan", value: growthSummary.hasGrowthPlan ? "active" : "not-set" },
  ]);
}

function renderPrimitivePreview(component) {
  const preview = normalizeObject(component.preview);
  const escapedLabel = escapeHtml(preview.label ?? component.componentType ?? "Primitive");

  if (component.componentType === "button") {
    return `
      <div class="primitive-preview-row">
        <button type="button" class="primitive-button-preview">${escapeHtml(preview.text ?? "Primary action")}</button>
        <button type="button" class="primitive-button-preview secondary">${escapeHtml(preview.secondaryText ?? "Secondary action")}</button>
      </div>
    `;
  }

  if (component.componentType === "input") {
    return `
      <label class="primitive-field-preview">
        <span class="mini-label">${escapedLabel}</span>
        <input type="text" value="${escapeHtml(preview.value ?? "")}" placeholder="${escapeHtml(preview.placeholder ?? "")}" />
      </label>
    `;
  }

  if (component.componentType === "textarea") {
    return `
      <label class="primitive-field-preview">
        <span class="mini-label">${escapedLabel}</span>
        <textarea rows="4" placeholder="${escapeHtml(preview.placeholder ?? "")}">${escapeHtml(preview.value ?? "")}</textarea>
      </label>
    `;
  }

  if (component.componentType === "select") {
    const options = normalizeArray(preview.options);
    const selectedOption = preview.selectedOption ?? options[0] ?? "";
    return `
      <label class="primitive-field-preview">
        <span class="mini-label">${escapedLabel}</span>
        <select>
          ${options
            .map(
              (option) =>
                `<option value="${escapeHtml(option)}"${option === selectedOption ? " selected" : ""}>${escapeHtml(option)}</option>`,
            )
            .join("")}
        </select>
      </label>
    `;
  }

  if (component.componentType === "badge") {
    return `
      <div class="primitive-preview-row">
        ${normalizeArray(preview.items)
          .map((item, index) => `<span class="primitive-badge-preview tone-${index % 3}">${escapeHtml(item)}</span>`)
          .join("")}
      </div>
    `;
  }

  if (component.componentType === "icon-button") {
    return `
      <div class="primitive-preview-row">
        <button type="button" class="primitive-icon-button-preview" aria-label="${escapeHtml(preview.assistiveLabel ?? "Icon action")}">
          <span aria-hidden="true">${escapeHtml(preview.icon ?? "⋯")}</span>
        </button>
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderPrimitiveComponents(elements, project) {
  if (!elements.primitiveComponents) {
    return;
  }

  const primitiveLibrary = normalizeObject(project.primitiveComponents);
  const components = normalizeArray(primitiveLibrary.components);
  const summary = normalizeObject(primitiveLibrary.summary);

  if (!components.length) {
    elements.primitiveComponents.innerHTML = `<p class="empty">עדיין אין ספריית primitive components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="primitive-card">
          <header class="primitive-card-header">
            <strong>${escapeHtml(component.componentType ?? "primitive")}</strong>
            <span class="mini-label">${escapeHtml(component.interactive ? "interactive" : "display")}</span>
          </header>
          <p class="primitive-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderPrimitivePreview(component)}
          <p class="primitive-card-meta">${escapeHtml(normalizeArray(component.variants).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.primitiveComponents.innerHTML = `
    ${metricHtml([
      { label: "Primitives", value: String(summary.totalComponents ?? components.length) },
      { label: "Interactive", value: String(summary.interactiveComponents ?? 0) },
      { label: "Form ready", value: summary.includesFormPrimitives ? "yes" : "no" },
      { label: "Base contract", value: primitiveLibrary.baseContractId ?? "not-set" },
    ])}
    <div class="primitive-grid">${cards}</div>
  `;
}

function renderLayoutPreview(component) {
  const preview = normalizeObject(component.preview);
  const items = normalizeArray(preview.items);
  const columns = normalizeArray(preview.columns);

  if (component.componentType === "container") {
    return `
      <div class="layout-preview-shell layout-preview-container">
        <div class="layout-preview-outline">
          <div class="layout-preview-inner">${escapeHtml(items[1] ?? "Inner content")}</div>
        </div>
      </div>
    `;
  }

  if (component.componentType === "section" || component.componentType === "panel") {
    return `
      <div class="layout-preview-shell layout-preview-section">
        ${items.map((item) => `<div class="layout-preview-block">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "stack") {
    return `
      <div class="layout-preview-shell layout-preview-stack">
        ${items.map((item) => `<div class="layout-preview-block">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "grid") {
    return `
      <div class="layout-preview-shell layout-preview-grid">
        ${columns.map((column) => `<div class="layout-preview-grid-cell">span ${escapeHtml(String(column))}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "divider") {
    return `
      <div class="layout-preview-shell layout-preview-divider">
        <span>${escapeHtml(items[0] ?? "Section A")}</span>
        <div class="layout-preview-divider-line"></div>
        <span>${escapeHtml(items[1] ?? "Section B")}</span>
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderLayoutComponents(elements, project) {
  if (!elements.layoutComponents) {
    return;
  }

  const layoutLibrary = normalizeObject(project.layoutComponents);
  const components = normalizeArray(layoutLibrary.components);
  const summary = normalizeObject(layoutLibrary.summary);

  if (!components.length) {
    elements.layoutComponents.innerHTML = `<p class="empty">עדיין אין ספריית layout components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="layout-card">
          <header class="layout-card-header">
            <strong>${escapeHtml(component.componentType ?? "layout")}</strong>
            <span class="mini-label">${escapeHtml(normalizeArray(component.anatomy).join(" · "))}</span>
          </header>
          <p class="layout-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderLayoutPreview(component)}
          <p class="layout-card-meta">${escapeHtml(
            Object.entries(normalizeObject(component.layoutRules))
              .map(([key, value]) => `${key}:${value}`)
              .join(" · "),
          )}</p>
        </article>
      `,
    )
    .join("");

  elements.layoutComponents.innerHTML = `
    ${metricHtml([
      { label: "Layouts", value: String(summary.totalComponents ?? components.length) },
      { label: "Workbench ready", value: summary.supportsWorkbenchLayouts ? "yes" : "no" },
      { label: "Responsive", value: summary.hasResponsiveCoverage ? "yes" : "no" },
      { label: "Library", value: layoutLibrary.layoutComponentLibraryId ?? "not-set" },
    ])}
    <div class="layout-grid">${cards}</div>
  `;
}

function renderFeedbackPreview(component) {
  const preview = normalizeObject(component.preview);

  if (component.componentType === "loading-state") {
    return `
      <div class="feedback-preview-shell">
        <div class="feedback-loading-row">
          <div class="feedback-spinner"></div>
          <div>
            <strong>${escapeHtml(preview.headline ?? "Loading")}</strong>
            <p>${escapeHtml(preview.description ?? "")}</p>
          </div>
        </div>
        <div class="feedback-progress-track">
          <div class="feedback-progress-indicator" style="width:${escapeHtml(preview.progressLabel ?? "64%")}"></div>
        </div>
      </div>
    `;
  }

  if (component.componentType === "empty-state" || component.componentType === "error-state") {
    return `
      <div class="feedback-preview-shell">
        <strong>${escapeHtml(preview.headline ?? "Feedback state")}</strong>
        <p>${escapeHtml(preview.description ?? "")}</p>
        <button type="button" class="feedback-action-preview">${escapeHtml(preview.actionLabel ?? "Continue")}</button>
      </div>
    `;
  }

  if (component.componentType === "toast") {
    return `
      <div class="feedback-preview-stack">
        ${normalizeArray(preview.items).map((item, index) => `<div class="feedback-toast-preview tone-${index % 3}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "banner") {
    return `
      <div class="feedback-banner-preview">
        <strong>${escapeHtml(preview.headline ?? "Banner")}</strong>
        <p>${escapeHtml(preview.description ?? "")}</p>
      </div>
    `;
  }

  if (component.componentType === "progress") {
    const percent = Number(preview.percent ?? 0);
    return `
      <div class="feedback-preview-shell">
        <div class="feedback-progress-meta">
          <strong>${escapeHtml(preview.label ?? "Progress")}</strong>
          <span>${escapeHtml(String(percent))}%</span>
        </div>
        <div class="feedback-progress-track">
          <div class="feedback-progress-indicator" style="width:${Math.max(0, Math.min(100, percent))}%"></div>
        </div>
        <p>${escapeHtml(preview.meta ?? "")}</p>
      </div>
    `;
  }

  if (component.componentType === "skeleton") {
    return `
      <div class="feedback-preview-stack">
        ${Array.from({ length: Number(preview.rows ?? 3) }, (_, index) => `<div class="feedback-skeleton-row tone-${index % 3}"></div>`).join("")}
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderFeedbackComponents(elements, project) {
  if (!elements.feedbackComponents) {
    return;
  }

  const feedbackLibrary = normalizeObject(project.feedbackComponents);
  const components = normalizeArray(feedbackLibrary.components);
  const summary = normalizeObject(feedbackLibrary.summary);

  if (!components.length) {
    elements.feedbackComponents.innerHTML = `<p class="empty">עדיין אין ספריית feedback components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="feedback-card">
          <header class="feedback-card-header">
            <strong>${escapeHtml(component.componentType ?? "feedback")}</strong>
            <span class="mini-label">${escapeHtml(component.tone ?? "neutral")}</span>
          </header>
          <p class="feedback-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderFeedbackPreview(component)}
          <p class="feedback-card-meta">${escapeHtml(normalizeArray(component.supportedStates).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.feedbackComponents.innerHTML = `
    ${metricHtml([
      { label: "Feedback", value: String(summary.totalComponents ?? components.length) },
      { label: "Screen states", value: summary.coversScreenStates ? "yes" : "no" },
      { label: "Inline feedback", value: summary.coversInlineFeedback ? "yes" : "no" },
      { label: "Library", value: feedbackLibrary.feedbackComponentLibraryId ?? "not-set" },
    ])}
    <div class="feedback-grid">${cards}</div>
  `;
}

function renderNavigationPreview(component) {
  const preview = normalizeObject(component.preview);
  const items = normalizeArray(preview.items);

  if (component.componentType === "sidebar") {
    return `
      <div class="navigation-preview-shell navigation-preview-sidebar">
        ${items.map((item, index) => `<div class="navigation-chip${index === 0 ? " active" : ""}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "tabs") {
    const activeItem = preview.activeItem ?? items[0] ?? "";
    return `
      <div class="navigation-preview-shell navigation-preview-tabs">
        ${items.map((item) => `<div class="navigation-tab${item === activeItem ? " active" : ""}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "breadcrumb") {
    return `
      <div class="navigation-preview-shell navigation-preview-breadcrumb">
        ${items.map((item, index) => `<span>${escapeHtml(item)}${index < items.length - 1 ? " / " : ""}</span>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "topbar") {
    return `
      <div class="navigation-preview-shell navigation-preview-topbar">
        <strong>${escapeHtml(preview.title ?? "Workspace")}</strong>
        <div class="navigation-preview-actions">
          ${normalizeArray(preview.actions).map((action) => `<span class="navigation-chip">${escapeHtml(action)}</span>`).join("")}
        </div>
        <span class="mini-label">${escapeHtml(preview.status ?? "Live")}</span>
      </div>
    `;
  }

  if (component.componentType === "stepper") {
    const activeItem = preview.activeItem ?? items[0] ?? "";
    return `
      <div class="navigation-preview-shell navigation-preview-stepper">
        ${items.map((item, index) => `<div class="navigation-step${item === activeItem ? " active" : ""}"><span>${index + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join("")}
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderNavigationComponents(elements, project) {
  if (!elements.navigationComponents) {
    return;
  }

  const navigationLibrary = normalizeObject(project.navigationComponents);
  const components = normalizeArray(navigationLibrary.components);
  const summary = normalizeObject(navigationLibrary.summary);

  if (!components.length) {
    elements.navigationComponents.innerHTML = `<p class="empty">עדיין אין ספריית navigation components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="navigation-card">
          <header class="navigation-card-header">
            <strong>${escapeHtml(component.componentType ?? "navigation")}</strong>
            <span class="mini-label">${escapeHtml(normalizeArray(component.anatomy).join(" · "))}</span>
          </header>
          <p class="navigation-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderNavigationPreview(component)}
          <p class="navigation-card-meta">${escapeHtml(Object.entries(normalizeObject(component.navigationRules)).map(([key, value]) => `${key}:${Array.isArray(value) ? value.join(",") : value}`).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.navigationComponents.innerHTML = `
    ${metricHtml([
      { label: "Navigation", value: String(summary.totalComponents ?? components.length) },
      { label: "Flow types", value: String(summary.totalFlowTypes ?? 0) },
      { label: "Workspace ready", value: summary.supportsWorkspaceNavigation ? "yes" : "no" },
      { label: "Library", value: navigationLibrary.navigationComponentLibraryId ?? "not-set" },
    ])}
    <div class="navigation-grid">${cards}</div>
  `;
}

function renderDataDisplayPreview(component) {
  const preview = normalizeObject(component.preview);

  if (component.componentType === "table") {
    const headers = normalizeArray(preview.headers);
    const rows = normalizeArray(preview.rows);
    return `
      <div class="data-display-preview-shell">
        <div class="data-display-table-preview">
          <div class="data-display-table-row header">
            ${headers.map((header) => `<strong>${escapeHtml(header)}</strong>`).join("")}
          </div>
          ${rows.map((row) => `<div class="data-display-table-row">${normalizeArray(row).map((cell) => `<span>${escapeHtml(cell)}</span>`).join("")}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (component.componentType === "stat-card") {
    return `
      <div class="data-display-preview-shell data-display-stat-preview">
        <span class="mini-label">${escapeHtml(preview.headline ?? "Metric")}</span>
        <strong>${escapeHtml(preview.value ?? "0")}</strong>
        <span>${escapeHtml(preview.delta ?? "0%")}</span>
      </div>
    `;
  }

  if (component.componentType === "activity-log") {
    return `
      <div class="data-display-preview-shell data-display-stack">
        ${normalizeArray(preview.items).map((item) => `<div class="data-display-log-item">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "timeline") {
    const items = normalizeArray(preview.items);
    const activeItem = preview.activeItem ?? items[0] ?? "";
    return `
      <div class="data-display-preview-shell data-display-timeline">
        ${items.map((item) => `<div class="data-display-timeline-step${item === activeItem ? " active" : ""}">${escapeHtml(item)}</div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "key-value-panel") {
    return `
      <div class="data-display-preview-shell data-display-key-value">
        ${normalizeArray(preview.pairs).map((pair) => `<div class="data-display-kv-row"><span>${escapeHtml(pair?.[0] ?? "")}</span><strong>${escapeHtml(pair?.[1] ?? "")}</strong></div>`).join("")}
      </div>
    `;
  }

  if (component.componentType === "status-chip") {
    return `
      <div class="data-display-preview-shell">
        ${normalizeArray(preview.items).map((item, index) => `<span class="data-display-chip tone-${index % 3}">${escapeHtml(item)}</span>`).join("")}
      </div>
    `;
  }

  return `<p class="empty">No preview available.</p>`;
}

function renderDataDisplayComponents(elements, project) {
  if (!elements.dataDisplayComponents) {
    return;
  }

  const displayLibrary = normalizeObject(project.dataDisplayComponents);
  const components = normalizeArray(displayLibrary.components);
  const summary = normalizeObject(displayLibrary.summary);

  if (!components.length) {
    elements.dataDisplayComponents.innerHTML = `<p class="empty">עדיין אין ספריית data display components זמינה.</p>`;
    return;
  }

  const cards = components
    .map(
      (component) => `
        <article class="data-display-card">
          <header class="data-display-card-header">
            <strong>${escapeHtml(component.componentType ?? "data-display")}</strong>
            <span class="mini-label">${escapeHtml(normalizeArray(component.supportedScreenTypes).join(" · "))}</span>
          </header>
          <p class="data-display-card-body">${escapeHtml(component.usage ?? "No usage guidance yet.")}</p>
          ${renderDataDisplayPreview(component)}
          <p class="data-display-card-meta">${escapeHtml(Object.entries(normalizeObject(component.dataRules)).map(([key, value]) => `${key}:${value}`).join(" · "))}</p>
        </article>
      `,
    )
    .join("");

  elements.dataDisplayComponents.innerHTML = `
    ${metricHtml([
      { label: "Display", value: String(summary.totalComponents ?? components.length) },
      { label: "Screen types", value: String(summary.totalSupportedScreenTypes ?? 0) },
      { label: "Dashboards", value: summary.supportsOperationalDashboards ? "yes" : "no" },
      { label: "Library", value: displayLibrary.dataDisplayLibraryId ?? "not-set" },
    ])}
    <div class="data-display-grid">${cards}</div>
  `;
}

function renderScreenReview(elements, project) {
  const report = normalizeObject(project.screenReviewReport);
  const reportSummary = normalizeObject(report.summary);
  const checklistSummary = normalizeObject(project.screenValidationChecklist?.summary);
  const screens = normalizeArray(report.screens);
  const readyItems = screens
    .filter((screen) => screen.summary?.isReady)
    .slice(0, 2)
    .map((screen) => ({
      title: `${screen.screenType ?? screen.screenId} מוכן`,
      body: "עבר את כל הולידטורים",
    }));
  const blockedItems = screens
    .filter((screen) => !screen.summary?.isReady)
    .slice(0, 3)
    .map((screen) => ({
      title: `${screen.screenType ?? screen.screenId} חסום`,
      body: normalizeArray(screen.summary?.blockingIssues).join(" | ") || "נדרשת בדיקה נוספת",
    }));

  elements.screenReview.innerHTML = `
    ${metricHtml([
      { label: "מסכים מוכנים", value: String(reportSummary.readyScreens ?? 0) },
      { label: "מסכים חסומים", value: String(reportSummary.blockedScreens ?? 0) },
      { label: "סה״כ מסכים", value: String(checklistSummary.totalScreens ?? reportSummary.totalScreens ?? 0) },
      { label: "מצב gate", value: (reportSummary.blockedScreens ?? 0) === 0 ? "Ready" : "Needs review" },
    ])}
    ${stackHtml("Pass", readyItems, "עדיין אין מסכים שסומנו כמוכנים.")}
    ${stackHtml("Blocking issues", blockedItems, "אין כרגע חסימות פתוחות ברמת screen review.")}
  `;
}

function extractLearningItems(project) {
  const insightViewModel = normalizeObject(project.learningInsightViewModel);
  const explicitInsights = normalizeArray(insightViewModel.insights);
  if (explicitInsights.length > 0) {
    return explicitInsights.map((insight) => ({
      title: insight.title ?? insight.insightId ?? "Learning insight",
      body: insight.summary ?? insight.reason ?? "",
    }));
  }

  const fallbackItems = normalizeArray(insightViewModel.items);
  return fallbackItems.map((item) => ({
    title: item.title ?? item.id ?? "Learning insight",
    body: item.summary ?? item.reason ?? "",
  }));
}

function renderLearning(elements, project) {
  const template = normalizeObject(project.aiLearningWorkspaceTemplate);
  const composition = normalizeObject(template.composition);
  const summary = normalizeObject(template.summary);
  const confidence = normalizeObject(project.confidenceIndicator);
  const items = extractLearningItems(project).slice(0, 3);

  elements.learning.innerHTML = `
    ${metricHtml([
      { label: "Insights", value: String(composition.insightCount ?? items.length) },
      { label: "Sections", value: String(summary.enabledSections ?? 0) },
      { label: "Confidence", value: confidence.level ?? confidence.confidenceLevel ?? "not-set" },
      { label: "Reasoning", value: summary.supportsRecommendationReasoning ? "enabled" : "basic" },
    ])}
    ${stackHtml("Top insights", items, "עדיין אין learning insights זמינים.")}
  `;
}

function renderCompanion(elements, project) {
  const state = normalizeObject(project.companionState);
  const dock = normalizeObject(project.companionDock);
  const panel = normalizeObject(project.companionPanel);
  const settings = normalizeObject(project.companionModeSettings);
  const suggestionItems = normalizeArray(panel.sections?.suggestions?.items).slice(0, 3).map((item) => ({
    title: item,
    body: "Companion signal",
  }));
  const actionItems = normalizeArray(panel.sections?.nextActions?.items).slice(0, 3).map((item) => ({
    title: item,
    body: "Next action",
  }));

  elements.companion.innerHTML = `
    ${metricHtml([
      { label: "State", value: state.state ?? "idle" },
      { label: "Priority", value: dock.priority ?? "advisory" },
      { label: "Mode", value: settings.selectedMode ?? "assistive" },
      { label: "Dock", value: dock.visible ? "visible" : "hidden" },
    ])}
    ${stackHtml(
      "Companion summary",
      [
        {
          title: dock.summary?.headline ?? "The AI companion is available if you need help.",
          body: normalizeArray(state.reasons).join(" | ") || "אין כרגע איתותים מיוחדים.",
        },
      ],
      "אין כרגע companion summary.",
    )}
    ${stackHtml("Suggestions", suggestionItems, "אין כרגע suggestions פתוחות.")}
    ${stackHtml("Next actions", actionItems, "אין כרגע next actions ל־companion.")}
  `;
}

function renderCollaboration(elements, project) {
  const feed = normalizeObject(project.collaborationFeed);
  const summary = normalizeObject(feed.summary);
  const presenceSummary = normalizeObject(project.projectPresenceState?.summary);
  const reviewThreadState = normalizeObject(project.reviewThreadState);
  const reviewThreadSummary = normalizeObject(reviewThreadState.summary);
  const items = normalizeArray(feed.items).slice(0, 4).map((item) => ({
    title: item.headline ?? item.itemType ?? "Collaboration event",
    body: `${item.actorName ?? "Nexus"} | ${item.workspaceArea ?? "workspace"} | ${t(item.status ?? "active")}`,
  }));
  const threadItems = normalizeArray(reviewThreadState.threads).slice(0, 3).map((thread) => ({
    title: thread.title ?? thread.threadType ?? "Review thread",
    body: `${thread.contextTarget?.resourceType ?? "comment"} | ${thread.messages?.[thread.messages.length - 1]?.body ?? "No messages yet"}`,
  }));

  elements.collaboration.innerHTML = `
    ${metricHtml([
      { label: "Feed items", value: String(summary.totalItems ?? 0) },
      { label: "Active participants", value: String(project.projectPresenceState?.activeParticipantCount ?? presenceSummary.totalParticipants ?? 0) },
      { label: "Shared presence", value: presenceSummary.hasSharedPresence ? "yes" : "no" },
      { label: "Open threads", value: String(reviewThreadSummary.openThreads ?? 0) },
    ])}
    ${stackHtml("Latest activity", items, "עדיין אין activity שיתופית זמינה.")}
    ${stackHtml("Review threads", threadItems, "עדיין אין review threads פתוחים.")}
  `;
}

function renderVersioning(elements, project) {
  const state = normalizeObject(project.state);
  const snapshot = normalizeObject(project.snapshotRecord ?? state.snapshotRecord);
  const schedule = normalizeObject(project.snapshotSchedule ?? state.snapshotSchedule);
  const worker = normalizeObject(project.snapshotBackupWorker ?? state.snapshotBackupWorker);
  const snapshotJobState = normalizeObject(project.snapshotJobState ?? state.snapshotJobState);
  const retentionPolicy = normalizeObject(project.snapshotRetentionPolicy ?? state.snapshotRetentionPolicy);
  const retentionDecision = normalizeObject(project.snapshotRetentionDecision ?? state.snapshotRetentionDecision);
  const continuityPlan = normalizeObject(project.continuityPlan ?? state.continuityPlan);
  const disasterRecoveryChecklist = normalizeObject(project.disasterRecoveryChecklist ?? state.disasterRecoveryChecklist);
  const businessContinuityState = normalizeObject(project.businessContinuityState ?? state.businessContinuityState);
  const restore = normalizeObject(project.restoreDecision ?? state.restoreDecision);
  const rollback = normalizeObject(project.rollbackExecutionResult ?? state.rollbackExecutionResult);
  const versions = normalizeObject(snapshot.versions);
  const scheduleExecution = normalizeObject(schedule.execution);
  const preChangeTriggers = normalizeArray(schedule.preChangeTriggers).join(", ");
  const checklistSummary = normalizeObject(disasterRecoveryChecklist.summary);
  const checklistPrerequisites = normalizeArray(disasterRecoveryChecklist.prerequisites);
  const checklistSteps = normalizeArray(disasterRecoveryChecklist.steps);
  const continuitySummary = normalizeObject(businessContinuityState.summary);
  const continuityOrchestration = normalizeObject(businessContinuityState.orchestration);
  const continuityDecisionTrace = normalizeObject(continuityPlan.decisionTrace);
  const continuityActions = normalizeArray(businessContinuityState.availableActions).map((action) => ({
    title: action,
    body: `continuity action`,
  }));
  const details = [
    {
      title: snapshot.snapshotId ?? snapshot.snapshotRecordId ?? "No snapshot yet",
      body: `state v${versions.stateVersion ?? "?"} | graph v${versions.executionGraphVersion ?? "?"}`,
    },
    {
      title: `Schedule: ${schedule.summary?.scheduleStatus ?? "not-configured"}`,
      body: `Every ${schedule.intervalSeconds ?? "?"}s | pre-change: ${preChangeTriggers || "none"}`,
    },
    {
      title: `Retention: ${retentionPolicy.summary?.policyStatus ?? "active"}`,
      body: `max ${retentionPolicy.maxSnapshots ?? "?"} | pruned ${retentionDecision.summary?.pruneCount ?? 0}`,
    },
    {
      title: `Worker: ${snapshotJobState.lastExecutionStatus ?? worker.lastExecutionStatus ?? "not-run"}`,
      body: `status ${snapshotJobState.status ?? worker.status ?? "idle"} | errors ${worker.errorCount ?? 0}`,
    },
    {
      title: `Restore mode: ${restore.restoreMode ?? "unknown"}`,
      body: restore.blockedReason ?? `Safe to execute: ${restore.summary?.isSafeToExecute ? "yes" : "no"}`,
    },
    {
      title: `Rollback: ${rollback.executionStatus ?? "not-run"}`,
      body: `Targets restored: ${rollback.summary?.restoredTargetCount ?? 0}`,
    },
    {
      title: `Recovery readiness: ${checklistSummary.readinessScore ?? 0}%`,
      body: `missing ${checklistSummary.missingPrerequisites ?? 0} | steps ${checklistSteps.length} | traces ${disasterRecoveryChecklist.observability?.totalTraces ?? 0}`,
    },
    {
      title: `Continuity: ${businessContinuityState.lifecycleState ?? "unknown"}`,
      body: `${businessContinuityState.continuityStatus ?? "unknown"} | mode ${continuityPlan.recommendedMode ?? "n/a"} | failover ${continuitySummary.failoverReady ? "ready" : "partial"}`,
    },
  ];
  const prerequisiteItems = checklistPrerequisites.slice(0, 5).map((item) => ({
    title: `${item.label ?? item.key ?? "Prerequisite"} | ${item.status ?? "unknown"}`,
    body: item.reason ?? "No reason provided.",
  }));
  const recoveryStepItems = checklistSteps.slice(0, 5).map((step) => ({
    title: `${step.order ?? "?"}. ${step.title ?? "Recovery step"}`,
    body: `${step.phase ?? "phase"} | ${step.ready === false ? "blocked" : "ready"} | ${step.description ?? ""}`,
  }));
  const continuityItems = [
    {
      title: `Backup orchestration`,
      body: `schedule ${continuityOrchestration.backup?.scheduleId ?? "n/a"} | worker ${continuityOrchestration.backup?.workerEnabled ? "enabled" : "disabled"}`,
    },
    {
      title: `Retention orchestration`,
      body: `policy ${continuityOrchestration.retention?.retentionPolicyId ?? "n/a"} | max ${continuityOrchestration.retention?.maxSnapshots ?? "?"}`,
    },
    {
      title: `Failover integration`,
      body: `${continuityOrchestration.failover?.integrationStatus ?? "placeholder"} | ${continuityOrchestration.failover?.note ?? "n/a"}`,
    },
    {
      title: `Continuity plan`,
      body: `${continuityPlan.affectedLayer ?? "runtime"} | ${continuityPlan.summary?.planStatus ?? "missing"} | ${continuityDecisionTrace.reliabilitySource ?? "n/a"}`,
    },
  ];

  elements.versioning.innerHTML = `
    ${metricHtml([
      { label: "Snapshot stored", value: snapshot.summary?.isStored ? "yes" : "no" },
      { label: "Schedule", value: schedule.summary?.scheduleStatus ?? "not-configured" },
      { label: "Worker", value: worker.enabled ? (worker.status ?? "active") : "disabled" },
      { label: "Worker next run", value: worker.nextRunAt ?? scheduleExecution.nextRunAt ?? "n/a" },
      { label: "Max snapshots", value: String(retentionPolicy.maxSnapshots ?? 20) },
      { label: "Last cleanup", value: retentionPolicy.lastCleanupAt ?? "never" },
      { label: "Last backup", value: scheduleExecution.lastRunAt ?? "never" },
      { label: "Rollback status", value: rollback.executionStatus ?? "not-run" },
      { label: "Recovery ready", value: checklistSummary.canExecuteRecovery ? "yes" : "no" },
      { label: "Recovery score", value: `${checklistSummary.readinessScore ?? 0}%` },
      { label: "Continuity state", value: businessContinuityState.lifecycleState ?? "unknown" },
      { label: "Continuity risk", value: businessContinuityState.continuityStatus ?? "unknown" },
      { label: "Plan mode", value: continuityPlan.recommendedMode ?? "n/a" },
    ])}
    ${stackHtml("State control", details, "עדיין אין נתוני versioning זמינים.")}
    ${stackHtml("Recovery prerequisites", prerequisiteItems, "אין כרגע prerequisites של recovery.")}
    ${stackHtml("Recovery steps", recoveryStepItems, "אין כרגע recovery steps זמינים.")}
    ${stackHtml("Business continuity", continuityItems, "אין כרגע business continuity state זמין.")}
    ${stackHtml("Continuity actions", continuityActions, "אין כרגע continuity actions זמינות.")}
  `;

  if (elements.snapshotIntervalInput && schedule.intervalSeconds) {
    elements.snapshotIntervalInput.value = String(schedule.intervalSeconds);
  }

  if (elements.snapshotTriggersInput) {
    elements.snapshotTriggersInput.value = preChangeTriggers || "bootstrap,migration,deploy";
  }

  if (elements.snapshotMaxInput && retentionPolicy.maxSnapshots) {
    elements.snapshotMaxInput.value = String(retentionPolicy.maxSnapshots);
  }

  if (elements.snapshotWorkerToggleButton) {
    elements.snapshotWorkerToggleButton.textContent = worker.enabled ? "Disable worker" : "Enable worker";
  }
}

function renderProjectAudit(elements, payload) {
  if (!elements.projectAudit) {
    return;
  }

  const projectAuditPayload = normalizeObject(payload);
  const summary = normalizeObject(projectAuditPayload.summary);
  const filters = normalizeObject(projectAuditPayload.filters);
  const entries = normalizeArray(projectAuditPayload.entries).map((entry) => ({
    title: `${entry.actionType ?? "project.observed"} | ${entry.actorLabel ?? entry.actorId ?? "system"} | ${entry.sensitivity ?? "low"}`,
    body: `${entry.timestamp ?? "no-timestamp"} | ${entry.outcomeStatus ?? "recorded"}`,
  }));

  elements.projectAudit.innerHTML = `
    ${metricHtml([
      { label: "Entries", value: String(summary.totalEntries ?? entries.length) },
      { label: "Filtered", value: summary.filtered ? "yes" : "no" },
      { label: "Actor filter", value: filters.actorId ?? "all" },
      { label: "Sensitivity", value: filters.sensitivity ?? "all" },
    ])}
    ${stackHtml("Audit history", entries, projectAuditPayload.viewerModel?.emptyState ?? "No matching audit activity found.")}
  `;
}

function renderAccessIsolation(elements, project) {
  if (!elements.accessIsolation) {
    return;
  }

  const state = normalizeObject(project.state);
  const projectAuthorizationDecision = normalizeObject(project.projectAuthorizationDecision ?? state.projectAuthorizationDecision);
  const privilegedAuthorityDecision = normalizeObject(project.privilegedAuthorityDecision ?? state.privilegedAuthorityDecision);
  const workspaceIsolationDecision = normalizeObject(project.workspaceIsolationDecision ?? state.workspaceIsolationDecision);
  const leakageAlert = normalizeObject(project.leakageAlert ?? state.leakageAlert);

  const hasSignals = Boolean(
    projectAuthorizationDecision.authorizationDecisionId
    || privilegedAuthorityDecision.privilegedAuthorityDecisionId
    || workspaceIsolationDecision.workspaceIsolationDecisionId
    || leakageAlert.leakageAlertId,
  );

  if (!hasSignals) {
    elements.accessIsolation.innerHTML = `<p class="empty">עדיין אין החלטות authorization/isolation זמינות.</p>`;
    return;
  }

  const checks = [
    ...normalizeArray(projectAuthorizationDecision.checks),
    ...normalizeArray(privilegedAuthorityDecision.checks),
    ...normalizeArray(workspaceIsolationDecision.checks),
    ...normalizeArray(leakageAlert.checks),
  ].slice(0, 8);

  elements.accessIsolation.innerHTML = `
    ${metricHtml([
      { label: "Authorization", value: projectAuthorizationDecision.decision ?? "unknown" },
      { label: "Privileged", value: privilegedAuthorityDecision.decision ?? "unknown" },
      { label: "Isolation", value: workspaceIsolationDecision.decision ?? "unknown" },
      { label: "Leakage", value: leakageAlert.severity ?? "clear" },
    ])}
    ${stackHtml(
      "Guard decisions",
      [
        {
          title: projectAuthorizationDecision.reason ?? "Authorization decision available",
          body: `${projectAuthorizationDecision.projectAction ?? "view"} | ${projectAuthorizationDecision.requiredCapability ?? "view"}`,
        },
        {
          title: privilegedAuthorityDecision.reason ?? "Privileged authority decision available",
          body: `${privilegedAuthorityDecision.projectAction ?? "view"} | approval ${privilegedAuthorityDecision.requiresApproval ? "required" : "not-required"}`,
        },
        {
          title: workspaceIsolationDecision.reason ?? "Workspace isolation decision available",
          body: `${workspaceIsolationDecision.resourceType ?? "resource"} | ${workspaceIsolationDecision.requestWorkspaceId ?? "workspace"}`,
        },
        {
          title: leakageAlert.reason ?? "Leak detector evaluated",
          body: `${normalizeArray(leakageAlert.leakSignals).join(" | ") || "no leak signals"}`,
        },
      ],
      "אין כרגע guard decisions.",
    )}
    ${stackHtml(
      "Checks",
      checks.map((check) => ({ title: check, body: "policy signal" })),
      "אין checks זמינים.",
    )}
  `;
}

function renderGrowth(elements, project) {
  const growthWorkspace = normalizeObject(project.growthWorkspace);
  const strategy = normalizeObject(growthWorkspace.strategy);
  const campaigns = normalizeObject(growthWorkspace.campaigns);
  const analytics = normalizeObject(growthWorkspace.analytics);
  const pillarItems = normalizeArray(strategy.pillars).slice(0, 3).map((pillar) => ({
    title: pillar.title ?? pillar.name ?? pillar,
    body: pillar.summary ?? strategy.contentGoal ?? "",
  }));
  const campaignItems = normalizeArray(campaigns.tasks).slice(0, 3).map((task) => ({
    title: task.title ?? task.summary ?? task.taskId ?? "Campaign task",
    body: `${task.status ?? "planned"} | ${task.channel ?? task.owner ?? "growth"}`,
  }));
  const kpiItems = normalizeArray(analytics.kpis).slice(0, 3).map((kpi) => ({
    title: kpi.label ?? kpi.name ?? "KPI",
    body: `${kpi.value ?? kpi.current ?? "n/a"}${kpi.unit ? ` ${kpi.unit}` : ""}`,
  }));

  elements.growth.innerHTML = `
    ${stackHtml(
      "Strategy",
      [
        {
          title: strategy.targetAudience ?? "No target audience yet",
          body: `${strategy.gtmStage ?? "unknown"} | ${strategy.contentGoal ?? "no content goal"}`,
        },
      ],
      "אין כרגע growth strategy זמינה.",
    )}
    ${stackHtml("Pillars", pillarItems, "אין כרגע pillars מוגדרים.")}
    ${stackHtml("Campaigns", campaignItems, "אין כרגע משימות campaign פתוחות.")}
    ${stackHtml("KPIs", kpiItems, "אין כרגע KPI נתונים להצגה.")}
  `;
}

function renderExternal(elements, project) {
  const repositoryDiagnosis = normalizeObject(
    project.repositoryImportAndCodebaseDiagnosis ?? project.state?.repositoryImportAndCodebaseDiagnosis,
  );
  const liveWebsiteDiagnosis = normalizeObject(
    project.liveWebsiteIngestionAndFunnelDiagnosis ?? project.state?.liveWebsiteIngestionAndFunnelDiagnosis,
  );
  const importedAnalyticsNormalization = normalizeObject(
    project.importedAnalyticsNormalization ?? project.state?.importedAnalyticsNormalization,
  );
  const importedAssetTaskExtraction = normalizeObject(
    project.importedAssetTaskExtraction ?? project.state?.importedAssetTaskExtraction,
  );
  const importAndContinueRoadmap = normalizeObject(
    project.importAndContinueRoadmap ?? project.state?.importAndContinueRoadmap,
  );

  if (
    !project.externalSnapshot
    && !project.gitSnapshot
    && !project.runtimeSnapshot
    && !repositoryDiagnosis.status
    && !liveWebsiteDiagnosis.status
    && !importedAnalyticsNormalization.status
    && !importedAssetTaskExtraction.status
    && !importAndContinueRoadmap.status
  ) {
    elements.external.innerHTML = `<p class="empty">עדיין לא בוצע חיבור חיצוני.</p>`;
    return;
  }

  const items = [];

  if (project.externalSnapshot) {
    const snapshot = project.externalSnapshot;
    items.push(
      { title: `מצב הקזינו: ${snapshot.health?.status ?? "unknown"}` },
      {
        title: "מסד נתונים",
        body:
          snapshot.health?.databaseConnected === null
            ? snapshot.health?.databaseConnectedReason
            : snapshot.health?.databaseConnected
              ? "מחובר"
              : "לא מחובר",
      },
      {
        title: "זרימות חסומות",
        body: normalizeArray(snapshot.blockedFlows).slice(0, 3).join(" | ") || "אין כרגע",
      },
    );
  }

  if (project.gitSnapshot) {
    items.push(
      {
        title: `חיבור Git: ${project.gitSnapshot.repo?.fullName ?? project.gitSnapshot.repo?.name ?? "unknown"}`,
        body: `${project.gitSnapshot.provider ?? "git"} | ענף ראשי: ${project.gitSnapshot.repo?.defaultBranch ?? "unknown"}`,
      },
      {
        title: "Branches / PRs",
        body: `${normalizeArray(project.gitSnapshot.branches).length} branches | ${normalizeArray(project.gitSnapshot.pullRequests).length} PR/MR`,
      },
      {
        title: "Commit אחרון",
        body: project.gitSnapshot.commits?.[0]?.title ?? "אין commits זמינים",
      },
    );
  }

  if (repositoryDiagnosis.status === "ready") {
    items.push(
      {
        title: `Repository diagnosis: ${repositoryDiagnosis.summary?.diagnosisStatus ?? "ready"}`,
        body: repositoryDiagnosis.summary?.codebaseSummary ?? "Codebase diagnosis available",
      },
      {
        title: "Architecture / gaps",
        body: `${repositoryDiagnosis.summary?.architectureSummary ?? "No architecture summary"} | ${(normalizeArray(repositoryDiagnosis.diagnosisReadout?.blockingGaps).slice(0, 2).join(" | ") || "No blocking gaps")}`,
      },
      {
        title: "Next import action",
        body: repositoryDiagnosis.summary?.nextAction ?? "Review repository diagnosis findings",
      },
    );
  }

  if (liveWebsiteDiagnosis.status === "ready") {
    items.push(
      {
        title: `Website diagnosis: ${liveWebsiteDiagnosis.summary?.diagnosisStatus ?? "ready"}`,
        body: liveWebsiteDiagnosis.summary?.websiteSummary ?? "Live website diagnosis available",
      },
      {
        title: "Funnel / blockers",
        body:
          `${liveWebsiteDiagnosis.summary?.funnelSummary ?? "No funnel summary"} | ${(
            normalizeArray(liveWebsiteDiagnosis.funnelDiagnosis?.criticalDependencies).slice(0, 2).join(" | ")
            || "No critical dependencies"
          )}`,
      },
      {
        title: "Next website action",
        body: liveWebsiteDiagnosis.summary?.nextAction ?? "Review live website diagnosis findings",
      },
    );
  }

  if (importedAnalyticsNormalization.status === "ready") {
    items.push(
      {
        title: `Imported analytics: ${importedAnalyticsNormalization.summary?.normalizationStatus ?? "ready"}`,
        body: `${importedAnalyticsNormalization.summary?.importedAssetCount ?? 0} imported assets | ${importedAnalyticsNormalization.summary?.providerCount ?? 0} providers`,
      },
      {
        title: "Analytics evidence",
        body:
          normalizeArray(importedAnalyticsNormalization.evidenceSources?.providers).join(" | ")
          || "Imported analytics evidence available",
      },
      {
        title: "Next analytics action",
        body: importedAnalyticsNormalization.summary?.nextAction ?? "Review normalized imported analytics",
      },
    );
  }

  if (importedAssetTaskExtraction.status === "ready") {
    items.push(
      {
        title: `Imported tasks: ${importedAssetTaskExtraction.summary?.totalExtractedTasks ?? 0}`,
        body: `${importedAssetTaskExtraction.summary?.highPriorityCount ?? 0} high priority | ${normalizeArray(importedAssetTaskExtraction.summary?.sourceCoverage).join(" | ")}`,
      },
      {
        title: "Next extracted action",
        body: importedAssetTaskExtraction.summary?.nextAction ?? "Review extracted imported tasks",
      },
      {
        title: "Extraction coverage",
        body:
          normalizeArray(importedAssetTaskExtraction.extractedTasks)
            .slice(0, 2)
            .map((task) => task.title)
            .join(" | ") || "Imported task extraction available",
      },
    );
  }

  if (importAndContinueRoadmap.status === "ready") {
    items.push(
      {
        title: `Import roadmap: ${importAndContinueRoadmap.summary?.roadmapItemCount ?? 0} tasks`,
        body: `${importAndContinueRoadmap.summary?.sourceCount ?? 0} sources | highest priority: ${importAndContinueRoadmap.summary?.highestPriorityAction ?? "n/a"}`,
      },
      {
        title: "Next import-and-continue action",
        body: importAndContinueRoadmap.summary?.nextAction ?? "Review import-and-continue roadmap",
      },
      {
        title: "Roadmap dependency chain",
        body:
          normalizeArray(importAndContinueRoadmap.roadmapItems)
            .slice(0, 2)
            .map((task) => task.title)
            .join(" | ") || "Import-and-continue roadmap available",
      },
    );
  }

  if (project.runtimeSnapshot) {
    items.push(
      {
        title: "Runtime",
        body: `CI: ${project.runtimeSnapshot.ci?.[0]?.status ?? "unknown"} | Deploy: ${project.runtimeSnapshot.deployments?.[0]?.status ?? "unknown"}`,
      },
      {
        title: "Errors / Monitoring",
        body: `${normalizeArray(project.runtimeSnapshot.errorLogs).reduce((sum, item) => sum + (item.count ?? 0), 0)} שגיאות | ${normalizeArray(project.runtimeSnapshot.monitoring).filter((item) => item.status !== "ok").length} התראות`,
      },
    );
  }

  elements.external.innerHTML = listHtml(items, "אין מידע חיצוני.");
}

function renderScanner(elements, project) {
  elements.scanPathInput.value = project.path ?? "";
  if (!project.scan) {
    elements.scanner.innerHTML = `<p class="empty">עדיין לא בוצעה סריקה.</p>`;
    return;
  }

  const scan = project.scan;
  elements.scanner.innerHTML = listHtml(
    [
      { title: scan.summary ?? "אין סיכום סריקה" },
      { title: "חוסרים", body: normalizeArray(scan.gaps).join(" | ") || "לא זוהו" },
      { title: "בדיקות", body: normalizeArray(scan.evidence?.testFiles).join(", ") || "לא זוהו" },
    ],
    "אין נתוני סריקה.",
  );
}

function renderAnalysis(elements, project) {
  if (!project.analysis) {
    elements.analysis.innerHTML = `<p class="empty">עדיין לא בוצע ניתוח AI.</p>`;
    return;
  }

  const analysis = project.analysis;
  elements.analysis.innerHTML = listHtml(
    [
      { title: analysis.summary ?? "אין סיכום ניתוח" },
      { title: "סיכונים", body: normalizeArray(analysis.risks).join(" | ") || "אין כרגע" },
      { title: "צעדים מומלצים", body: normalizeArray(analysis.nextActions).join(" | ") || "אין כרגע" },
    ],
    "אין ניתוח.",
  );
}

function renderGraph(elements, project) {
  const tasks = normalizeArray(project.cycle?.roadmap);
  elements.graph.innerHTML = listHtml(
    tasks.map((task) => ({
      title: task.summary,
      body: `${t(task.lane)} | ${t(task.status)}`,
    })),
    "אין זרימת ביצוע.",
  );
}

function renderAgents(elements, project) {
  elements.agents.innerHTML = listHtml(
    normalizeArray(project.agents).map((agent) => ({
      title: `${agent.name} - ${t(agent.status)}`,
      body: agent.currentTask ?? "אין כרגע משימה",
    })),
    "אין סוכנים.",
  );
}

function renderEvents(elements, project) {
  elements.events.innerHTML = listHtml(
    normalizeArray(project.events).slice().reverse().slice(0, 6).map((event) => ({
      title: t(event.type),
      body: event.payload?.task?.summary ?? event.payload?.taskId ?? event.payload?.projectId ?? "",
    })),
    "אין אירועים.",
  );
}

export function renderProject(elements, project) {
  renderTop(elements, project);
  renderWorkspaceTabs(elements, project);
  renderWorkspaceSummaries(elements, project);
  renderCritical(elements, project);
  renderMissing(elements, project);
  renderExisting(elements, project);
  renderLive(elements, project);
  renderDecision(elements, project);
  renderPrimitiveComponents(elements, project);
  renderLayoutComponents(elements, project);
  renderFeedbackComponents(elements, project);
  renderNavigationComponents(elements, project);
  renderDataDisplayComponents(elements, project);
  renderScreenReview(elements, project);
  renderProposalReview(elements, project);
  renderLearning(elements, project);
  renderCompanion(elements, project);
  renderCollaboration(elements, project);
  renderVersioning(elements, project);
  renderProjectAudit(elements, project.projectAuditPayload ?? project.state?.projectAuditPayload);
  renderAccessIsolation(elements, project);
  renderGrowth(elements, project);
  renderExternal(elements, project);
  renderScanner(elements, project);
  renderAnalysis(elements, project);
  renderGraph(elements, project);
  renderAgents(elements, project);
  renderEvents(elements, project);
}

export function createCockpitApp({
  doc = globalThis.document,
  fetchImpl = globalThis.fetch,
  EventSourceImpl = globalThis.EventSource,
  storageImpl = globalThis.localStorage,
  setTimeoutImpl = globalThis.setTimeout,
  clearTimeoutImpl = globalThis.clearTimeout,
} = {}) {
  if (!doc) {
    throw new Error("Document is required to initialize the cockpit app.");
  }

  const elements = queryElements(doc);
  let currentProjectId = null;
  let currentProject = null;
  let refreshTimer = null;
  let liveEventSource = null;
  let activeWorkspace = "developer";
  let onboardingFlow = null;
  let onboardingConversation = null;
  let currentProjectAuditPayload = null;
  let activeAppUser = null;
  const presenceParticipantId = `presence-${Math.random().toString(36).slice(2, 10)}`;
  const appStorage = storageImpl && typeof storageImpl.getItem === "function" && typeof storageImpl.setItem === "function"
    ? storageImpl
    : {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      };
  const locationHost = globalThis.location?.hostname ?? "";

  function resolveDevFlowControlsEnabled() {
    if (locationHost === "127.0.0.1" || locationHost === "localhost") {
      return true;
    }

    return globalThis.location === undefined;
  }

  function readStoredFlowState() {
    try {
      const raw = appStorage.getItem("nexus.flowState");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeStoredFlowState(flowState) {
    try {
      appStorage.setItem("nexus.flowState", JSON.stringify(flowState));
    } catch {}
  }

  function captureDraftInputs() {
    return {
      projectName: elements.createProjectNameInput?.value ?? "",
      visionText: elements.createProjectVisionInput?.value ?? "",
      supportingLink: elements.createProjectLinkInput?.value ?? "",
      fileName: elements.createProjectFileNameInput?.value ?? "",
      fileContent: elements.createProjectFileContentInput?.value ?? "",
    };
  }

  function applyDraftInputs(draftInputs = {}) {
    if (elements.createProjectNameInput) elements.createProjectNameInput.value = draftInputs.projectName ?? "";
    if (elements.createProjectVisionInput) elements.createProjectVisionInput.value = draftInputs.visionText ?? "";
    if (elements.createProjectLinkInput) elements.createProjectLinkInput.value = draftInputs.supportingLink ?? "";
    if (elements.createProjectFileNameInput) elements.createProjectFileNameInput.value = draftInputs.fileName ?? "";
    if (elements.createProjectFileContentInput) elements.createProjectFileContentInput.value = draftInputs.fileContent ?? "";
  }

  function persistFlowState(screen) {
    writeStoredFlowState({
      screen,
      currentProjectId,
      activeWorkspace,
      onboardingFlow,
      onboardingConversation,
      draftInputs: captureDraftInputs(),
    });
  }

  async function fetchJson(url, options) {
    const storedAppUser = readStoredAppUser();
    const headers = {
      ...(options?.headers ?? {}),
    };

    if (
      typeof url === "string"
      && url.startsWith("/api/")
      && storedAppUser?.userId
      && !headers["x-user-id"]
    ) {
      headers["x-user-id"] = storedAppUser.userId;
    }

    const response = await fetchImpl(url, {
      ...options,
      headers,
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  function setFlowButtonState({
    target = "create",
    disabled = false,
    label = null,
  } = {}) {
    const button = target === "finish" ? elements.finishOnboardingButton : elements.createProjectButton;
    if (!button) {
      return;
    }

    button.disabled = disabled;
    button.textContent = label ?? (target === "finish" ? "סיים Onboarding" : "צור פרויקט");
  }

  function createOnboardingConversationState() {
    return {
      currentIndex: 0,
      answers: {},
      draftAnswer: "",
      pendingAdvance: false,
      pendingAnswer: "",
      advanceTimer: null,
    };
  }

  function buildWorkspaceLandingFeedback({ projectName = "", answers = {} } = {}) {
    const resolvedProjectName = projectName.trim() || "הפרויקט שלך";
    const targetUser = typeof answers["target-user"] === "string" ? answers["target-user"].trim() : "";
    const coreFlow = typeof answers["core-flow"] === "string" ? answers["core-flow"].trim() : "";
    const successOutcome = typeof answers["success-outcome"] === "string" ? answers["success-outcome"].trim() : "";

    const title = "הפרויקט שלך מוכן";
    const messageParts = [`נכנסת עכשיו ל־workspace של ${resolvedProjectName}.`];

    if (targetUser && coreFlow) {
      messageParts.push(`בנינו פתיחה שמכוונת ל־${targetUser} סביב ${coreFlow}.`);
    } else if (successOutcome) {
      messageParts.push(`הצעד הבא כאן בנוי כדי להביא אותך מהר ל־${successOutcome}.`);
    } else {
      messageParts.push("עכשיו אפשר להתחיל לעבוד מתוך המרחב הראשי של הפרויקט.");
    }

    return {
      title,
      message: messageParts.join(" "),
    };
  }

  function buildWorkspaceContinuitySnapshot(project) {
    const normalizedProject = normalizeObject(project);
    const status = t(normalizedProject.status ?? "idle");
    const bottleneck = normalizedProject.overview?.bottleneck ?? "לא זוהה";
    const nextAction = normalizedProject.developerWorkspace?.contextSummary?.nextAction
      ?? normalizeArray(normalizedProject.cycle?.roadmap).find((task) => task.status === "assigned")?.summary
      ?? "לא הוגדרה פעולה";

    return {
      status,
      bottleneck,
      nextAction,
    };
  }

  function resetCreateProjectInputs() {
    if (elements.createProjectNameInput) elements.createProjectNameInput.value = "";
    if (elements.createProjectVisionInput) elements.createProjectVisionInput.value = "";
    if (elements.createProjectLinkInput) elements.createProjectLinkInput.value = "";
    if (elements.createProjectFileNameInput) elements.createProjectFileNameInput.value = "";
    if (elements.createProjectFileContentInput) elements.createProjectFileContentInput.value = "";
  }

  function enterCreateProjectScreen() {
    closeLiveUpdates();
    currentProjectId = null;
    currentProject = null;
    currentProjectAuditPayload = null;
    onboardingFlow = null;
    onboardingConversation = null;
    resetCreateProjectInputs();
    renderEmptyAppState({
      mode: "create",
      message: "צור פרויקט חדש",
      status: "אפשר להתחיל flow חדש בלי לאבד את ההפרדה בין Create Project, Onboarding ו־Workspace.",
    });
    persistFlowState("create");
  }

  function buildRunCycleFeedback(previousProject, nextProject) {
    const before = buildWorkspaceContinuitySnapshot(previousProject);
    const after = buildWorkspaceContinuitySnapshot(nextProject);
    const changedParts = [];

    if (before.status !== after.status) {
      changedParts.push(`המצב עבר ל־${after.status}`);
    }
    if (before.bottleneck !== after.bottleneck) {
      changedParts.push(`החסם המרכזי עכשיו הוא ${after.bottleneck}`);
    }
    if (before.nextAction !== after.nextAction) {
      changedParts.push(`הפעולה הבאה עודכנה ל־${after.nextAction}`);
    }

    if (changedParts.length > 0) {
      return {
        title: "הפרויקט התקדם",
        message: changedParts.join(" · "),
      };
    }

    return {
      title: "ה־workspace עודכן",
      message: "אתה עדיין באותו פרויקט. רעננו את המצב בלי לאפס את ההקשר שלך.",
    };
  }

  function pulseWorkspaceContinuity() {
    if (!elements.workspaceTopShell?.classList) {
      return;
    }

    elements.workspaceTopShell.classList.remove("continuity-refresh");
    elements.workspaceTopShell.classList.add("continuity-refresh");
    setTimeoutImpl(() => {
      elements.workspaceTopShell?.classList?.remove("continuity-refresh");
    }, 520);
  }

  function clearFlowFeedback() {
    if (elements.flowFeedbackBanner) {
      elements.flowFeedbackBanner.hidden = true;
    }
    if (elements.flowFeedbackTitle) {
      elements.flowFeedbackTitle.textContent = "";
    }
    if (elements.flowFeedbackMessage) {
      elements.flowFeedbackMessage.textContent = "";
    }
  }

  function showFlowFeedback({ title = "", message = "" } = {}) {
    if (elements.flowFeedbackTitle) {
      elements.flowFeedbackTitle.textContent = title;
    }
    if (elements.flowFeedbackMessage) {
      elements.flowFeedbackMessage.textContent = message;
    }
    if (elements.flowFeedbackBanner) {
      elements.flowFeedbackBanner.hidden = false;
    }
  }

  function setAppScreen(screen) {
    const normalizedScreen = screen === "workspace" || screen === "onboarding" ? screen : "create";

    if (elements.screenCreate) {
      elements.screenCreate.hidden = normalizedScreen !== "create";
    }
    if (elements.screenOnboarding) {
      elements.screenOnboarding.hidden = normalizedScreen !== "onboarding";
    }
    if (elements.screenWorkspace) {
      elements.screenWorkspace.hidden = normalizedScreen !== "workspace";
    }
    if (elements.emptyAppState) {
      elements.emptyAppState.hidden = normalizedScreen !== "create";
    }
    if (elements.onboardingStage) {
      elements.onboardingStage.hidden = normalizedScreen !== "onboarding";
    }
    if (elements.workspaceBoard) {
      elements.workspaceBoard.hidden = normalizedScreen !== "workspace";
    }
    if (elements.heroActions) {
      elements.heroActions.hidden = normalizedScreen !== "workspace";
    }
    if (normalizedScreen !== "workspace") {
      clearFlowFeedback();
    }
    persistFlowState(normalizedScreen);
  }

  async function loadProject(projectId, transitionFeedback = null, preloadedProject = null) {
    const project = preloadedProject ?? await fetchJson(`/api/projects/${projectId}`);
    currentProjectId = projectId;
    currentProject = project;
    currentProjectAuditPayload = project.projectAuditPayload ?? project.state?.projectAuditPayload ?? null;
    onboardingFlow = null;
    applyDesignSystem(doc, project);
    renderProject(elements, project);
    setAppScreen("workspace");
    if (transitionFeedback?.title || transitionFeedback?.message) {
      showFlowFeedback({
        title: transitionFeedback.title ?? "ה־workspace נטען",
        message: transitionFeedback.message ?? "הפרויקט מוכן לעבודה.",
      });
    } else {
      clearFlowFeedback();
    }
    if (transitionFeedback?.pulseWorkspace === true) {
      pulseWorkspaceContinuity();
    }
    setActiveWorkspace(elements, activeWorkspace);
    persistFlowState("workspace");
    updatePresence().catch(() => {});
    connectLiveUpdates();
    return project;
  }

  function buildProjectAuditQueryParams() {
    const params = new URLSearchParams();
    const actorId = elements.projectAuditActorInput?.value?.trim() ?? "";
    const actionType = elements.projectAuditActionInput?.value?.trim() ?? "";
    const sensitivity = elements.projectAuditSensitivitySelect?.value?.trim() ?? "";
    if (actorId) {
      params.set("actorId", actorId);
    }
    if (actionType) {
      params.set("actionType", actionType);
    }
    if (sensitivity) {
      params.set("sensitivity", sensitivity);
    }
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  async function refreshProjectAudit() {
    if (!currentProjectId) {
      return;
    }

    const payload = await fetchJson(`/api/projects/${currentProjectId}/audit${buildProjectAuditQueryParams()}`);
    currentProjectAuditPayload = payload;
    renderProjectAudit(elements, currentProjectAuditPayload);
  }

  function readStoredAppUser() {
    if (activeAppUser?.userId || activeAppUser?.email) {
      return activeAppUser;
    }

    try {
      const raw = appStorage.getItem("nexus.appUser");
      activeAppUser = raw ? JSON.parse(raw) : null;
      return activeAppUser;
    } catch {
      return activeAppUser;
    }
  }

  function writeStoredAppUser(appUser) {
    activeAppUser = appUser ?? null;
    try {
      appStorage.setItem("nexus.appUser", JSON.stringify(appUser));
    } catch {}
  }

  function clearStoredAppUser() {
    activeAppUser = null;
    try {
      appStorage.removeItem("nexus.appUser");
    } catch {}
  }

  function formatVisionText(projectName, visionText) {
    const normalizedName = String(projectName ?? "").trim();
    const normalizedVision = String(visionText ?? "").trim();
    if (!normalizedName && !normalizedVision) {
      return "";
    }
    return `שם הפרויקט: ${normalizedName}\n${normalizedVision}`.trim();
  }

  function reopenOnboardingFromWorkspace() {
    if (currentProject) {
      if (elements.createProjectNameInput) {
        elements.createProjectNameInput.value = currentProject.name ?? elements.createProjectNameInput.value ?? "";
      }
      if (elements.createProjectVisionInput && !elements.createProjectVisionInput.value.trim()) {
        elements.createProjectVisionInput.value = currentProject.goal ?? "";
      }
    }
    onboardingConversation = createOnboardingConversationState();

    renderEmptyAppState({
      mode: "onboarding",
      message: "פתחת מחדש את מסך ה־Onboarding",
      status: "זה מצב בדיקה מתוך ה־workspace כדי לעבוד על ה־UI של ה־onboarding בלי ליצור פרויקט חדש.",
    });
    persistFlowState("onboarding");
  }

  async function exitOnboardingScreen() {
    if (currentProjectId) {
      onboardingConversation = null;
      await loadProject(currentProjectId, {
        title: "חזרת ל־workspace שלך",
        message: "יצאת ממסך ה־Onboarding וחזרת לאותו פרויקט בלי לאבד את ההקשר.",
      });
      return;
    }

    onboardingFlow = null;
    onboardingConversation = null;
    renderEmptyAppState({
      mode: "create",
      message: "חזרת ליצירת הפרויקט",
      status: "אפשר לעדכן את שם הפרויקט או התיאור, ואז להמשיך שוב ל־Onboarding.",
    });
  }

  function buildOnboardingUploadedFiles() {
    const fileName = elements.createProjectFileNameInput?.value?.trim() ?? "";
    const fileContent = elements.createProjectFileContentInput?.value ?? "";

    if (!fileName && !fileContent.trim()) {
      return [];
    }

    return [
      {
        name: fileName || "supporting-notes.txt",
        type: fileName.endsWith(".md") ? "markdown" : "text",
        content: fileContent,
      },
    ];
  }

  function getOnboardingAnswer(questionId) {
    const answer = onboardingConversation?.answers?.[questionId];
    return typeof answer === "string" ? answer.trim() : "";
  }

  function buildOnboardingLeadSummary() {
    const audience = getOnboardingAnswer("target-user");
    const flow = getOnboardingAnswer("core-flow");
    const outcome = getOnboardingAnswer("success-outcome");

    if (audience && flow && outcome) {
      return `כרגע אני מבין שאנחנו בונים עבור ${audience}, כשהפעולה הראשונה שחייבת לעבוד היא ${flow}, והערך הראשוני יימדד לפי ${outcome}.`;
    }

    if (audience && flow) {
      return `יש כבר תמונה ראשונית: הפרויקט מכוון ל־${audience}, והצעד הראשון שחייב לעבוד הוא ${flow}.`;
    }

    if (audience) {
      return `הבנתי שהפרויקט מכוון קודם כל ל־${audience}. עכשיו נחדד את הזרימה הראשונית שהמשתמש הזה חייב לעבור.`;
    }

    return "ברגע שתענה על השאלות, ה־AI יסכם כאן בצורה חיה מה כבר הובן על הפרויקט.";
  }

  function buildOnboardingWorkingMemory() {
    const projectName = elements.createProjectNameInput?.value?.trim() ?? "";
    const visionText = elements.createProjectVisionInput?.value?.trim() ?? "";
    const supportingLink = elements.createProjectLinkInput?.value?.trim() ?? "";
    const uploadedFiles = buildOnboardingUploadedFiles();
    const audience = getOnboardingAnswer("target-user");
    const flow = getOnboardingAnswer("core-flow");
    const outcome = getOnboardingAnswer("success-outcome");
    const understood = [];
    const missing = [];
    const refining = [];

    if (projectName) {
      understood.push(`שם הפרויקט כבר נעול סביב ${projectName}.`);
    }

    if (visionText) {
      understood.push(`כבר יש מיקוד ראשוני: ${visionText}.`);
    }

    if (audience) {
      understood.push(`ה־AI כבר מבין שהמשתמש המרכזי הוא ${audience}.`);
    } else {
      missing.push("עדיין חסר מי המשתמש המרכזי שעבורו בונים את החוויה הראשונה.");
    }

    if (flow) {
      understood.push(`הפעולה הראשונה שחייבת לעבוד הוגדרה כ־${flow}.`);
    } else {
      missing.push("עדיין לא ברור מה הפעולה הראשונה שהמשתמש חייב לבצע בתוך המוצר.");
    }

    if (outcome) {
      understood.push(`מדד הערך הראשוני מתבהר סביב ${outcome}.`);
    } else {
      missing.push("עדיין חסר איך נראה רגע הערך הראשון שהמשתמש אמור לקבל.");
    }

    if (audience && !flow) {
      refining.push(`עכשיו כשהקהל הוא ${audience}, ה־AI מחדד את הזרימה הראשונית שהקהל הזה חייב לעבור.`);
    }

    if (audience && flow && !outcome) {
      refining.push(`ה־AI מחבר בין ${audience} לבין הצעד הראשון ${flow}, ומחדד מה צריך להיות רגע הערך הראשון.`);
    }

    if (audience && flow && outcome) {
      refining.push(buildOnboardingLeadSummary());
    }

    if (supportingLink) {
      refining.push("כבר הוזן קישור תומך, כך שאפשר יהיה לחבר את ההבנה הזו גם לחומר חיצוני.");
    }

    if (uploadedFiles.length > 0) {
      refining.push(`נוסף גם מסמך תומך ידני (${uploadedFiles[0].name}) שיכול לחזק את ההקשר של השיחה.`);
    }

    if (!understood.length && !missing.length && !refining.length) {
      missing.push("עדיין לא נאסף מספיק מידע. ה־AI מחכה לתשובה הראשונה כדי להתחיל לבנות תמונת מצב אמיתית.");
    }

    return {
      understood,
      missing,
      refining,
    };
  }

  function renderOnboardingNotes() {
    if (!elements.onboardingNotesList) {
      return;
    }

    const memory = buildOnboardingWorkingMemory();
    const sections = [
      {
        title: "מה הובן",
        key: "understood",
        items: memory.understood,
      },
      {
        title: "מה עדיין חסר",
        key: "missing",
        items: memory.missing,
      },
      {
        title: "מה מתחדד עכשיו",
        key: "refining",
        items: memory.refining,
      },
    ];

    elements.onboardingNotesList.innerHTML = sections
      .map((section) => {
        const body = section.items.length
          ? section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")
          : `<p>כרגע אין עדכון חדש באזור הזה.</p>`;

        return `
          <section class="onboarding-memory-section ${escapeHtml(section.key)}">
            <strong>${escapeHtml(section.title)}</strong>
            <div class="onboarding-memory-body">
              ${body}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function buildOnboardingCurrentPrompt() {
    const currentQuestion = onboardingQuestionFlow[onboardingConversation?.currentIndex ?? 0] ?? null;
    const audience = getOnboardingAnswer("target-user");
    const flow = getOnboardingAnswer("core-flow");

    if (!currentQuestion) {
      return {
        title: "השיחה הושלמה",
        body: "יש לנו תמונה ראשונית טובה. עכשיו אפשר להוסיף חומר תומך ידני לפני סיום onboarding.",
      };
    }

    if (currentQuestion.id === "core-flow" && audience) {
      return {
        title: "מעולה, עכשיו נחדד את הפעולה הראשונה",
        body: `אם המשתמש המרכזי הוא ${audience}, מה בדיוק הוא חייב לעשות ראשון כדי להרגיש שהמערכת באמת מתחילה לעבוד עבורו?`,
      };
    }

    if (currentQuestion.id === "success-outcome" && audience && flow) {
      return {
        title: "יש לי כבר תמונה כמעט שלמה",
        body: `אז אנחנו מכוונים ל־${audience}, והצעד הראשון הוא ${flow}. עכשיו נשאר לחדד איך נראה רגע הערך הראשון שהמשתמש אמור לקבל.`,
      };
    }

    return {
      title: currentQuestion.title,
      body: currentQuestion.body,
    };
  }

  function focusOnboardingAnswerInput() {
    if (typeof elements.onboardingAnswerInput?.focus === "function" && !elements.onboardingAnswerInput.hidden) {
      elements.onboardingAnswerInput.focus();
    }
  }

  function resolveOnboardingDraftAnswer(currentQuestion) {
    if (!currentQuestion) {
      return "";
    }

    if (typeof onboardingConversation?.draftAnswer === "string" && onboardingConversation.draftAnswer.length > 0) {
      return onboardingConversation.draftAnswer;
    }

    return onboardingConversation?.answers?.[currentQuestion.id] ?? elements.onboardingAnswerInput?.value ?? "";
  }

  function resolveOnboardingComposerValue(currentQuestion) {
    if (!currentQuestion) {
      return "";
    }

    if (typeof onboardingConversation?.draftAnswer === "string" && onboardingConversation.draftAnswer.length > 0) {
      return onboardingConversation.draftAnswer;
    }

    return "";
  }

  function renderOnboardingConversation() {
    onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
    const currentQuestion = onboardingQuestionFlow[onboardingConversation.currentIndex] ?? null;
    const isComplete = onboardingConversation.currentIndex >= onboardingQuestionFlow.length;
    const currentPrompt = buildOnboardingCurrentPrompt();
    const isAwaitingAiReply = onboardingConversation.pendingAdvance === true;

    if (elements.onboardingProgressPill) {
      elements.onboardingProgressPill.textContent = isComplete
        ? "השיחה הושלמה"
        : `שאלה ${onboardingConversation.currentIndex + 1} מתוך ${onboardingQuestionFlow.length}`;
    }

    if (elements.onboardingChatThread) {
      const transcript = [];

      for (const question of onboardingQuestionFlow.slice(0, onboardingConversation.currentIndex)) {
        transcript.push(`
          <article class="onboarding-chat-bubble ai">
            <span class="mini-label">AI</span>
            <strong>${escapeHtml(question.title)}</strong>
            <p>${escapeHtml(question.body)}</p>
          </article>
        `);

        const answer = onboardingConversation.answers[question.id];
        if (typeof answer === "string" && answer.trim()) {
          transcript.push(`
            <article class="onboarding-chat-bubble user">
              <span class="mini-label">אתה</span>
              <p>${escapeHtml(answer.trim())}</p>
            </article>
          `);
        }
      }

      if (isComplete) {
        transcript.push(`
          <article class="onboarding-chat-bubble ai">
            <span class="mini-label">AI</span>
            <strong>יש מספיק הקשר כדי לסיים onboarding</strong>
            <p>עכשיו אפשר לצרף חומר תומך ידני ולפתוח את ה־workspace.</p>
          </article>
        `);
      } else if (isAwaitingAiReply) {
        transcript.push(`
          <article class="onboarding-chat-bubble user entering">
            <span class="mini-label">אתה</span>
            <p>${escapeHtml(onboardingConversation.pendingAnswer)}</p>
          </article>
          <article class="onboarding-chat-bubble ai typing entering">
            <span class="mini-label">AI</span>
            <strong>מעבד את מה שכתבת</strong>
            <p>מנסח את השאלה הבאה ומעדכן את ההבנה שלו על הפרויקט.</p>
          </article>
        `);
      } else {
        transcript.push(`
          <article class="onboarding-chat-bubble ai entering">
            <span class="mini-label">AI</span>
            <strong>${escapeHtml(currentPrompt.title)}</strong>
            <p>${escapeHtml(currentPrompt.body)}</p>
          </article>
        `);
      }

      elements.onboardingChatThread.innerHTML = transcript.join("");
    }

    if (elements.onboardingCurrentQuestionTitle) {
      elements.onboardingCurrentQuestionTitle.textContent = isAwaitingAiReply ? "ה־AI מגיב למה שכתבת" : currentPrompt.title;
    }
    if (elements.onboardingCurrentQuestionBody) {
      elements.onboardingCurrentQuestionBody.textContent = isAwaitingAiReply
        ? "עוד רגע מופיעה השאלה הבאה. אפשר להמשיך מיד כשהתגובה תעלה."
        : currentPrompt.body;
    }
    if (elements.onboardingAnswerInput) {
      elements.onboardingAnswerInput.hidden = isComplete || isAwaitingAiReply;
      elements.onboardingAnswerInput.placeholder = currentQuestion?.placeholder ?? "";
      elements.onboardingAnswerInput.value = isComplete || isAwaitingAiReply
        ? ""
        : resolveOnboardingComposerValue(currentQuestion);
    }
    if (elements.onboardingNextButton) {
      elements.onboardingNextButton.hidden = isComplete || isAwaitingAiReply;
      elements.onboardingNextButton.textContent = onboardingConversation.currentIndex === onboardingQuestionFlow.length - 1
        ? "שלח תשובה אחרונה"
        : "שלח והמשך";
    }
    if (elements.onboardingBackButton) {
      elements.onboardingBackButton.textContent = currentProjectId ? "חזור ל־Workspace" : "חזור ליצירת הפרויקט";
      elements.onboardingBackButton.disabled = isAwaitingAiReply;
    }
    if (elements.onboardingForwardButton) {
      elements.onboardingForwardButton.disabled = isAwaitingAiReply;
      elements.onboardingForwardButton.textContent = isComplete ? "סיים Onboarding" : "קדימה";
    }
    if (elements.onboardingMaterialStage) {
      elements.onboardingMaterialStage.hidden = !isComplete;
    }
    if (elements.onboardingFormStage) {
      elements.onboardingFormStage.hidden = !isComplete;
    }
    if (elements.finishOnboardingButton) {
      elements.finishOnboardingButton.hidden = !isComplete;
    }
    focusOnboardingAnswerInput();
  }

  function advanceOnboardingConversation() {
    onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
    if (onboardingConversation.pendingAdvance) {
      return;
    }
    const currentQuestion = onboardingQuestionFlow[onboardingConversation.currentIndex];
    if (!currentQuestion) {
      renderOnboardingConversation();
      return;
    }

    const answer = resolveOnboardingDraftAnswer(currentQuestion).trim();
    if (!answer) {
      if (elements.onboardingScreenStatus) {
        elements.onboardingScreenStatus.textContent = "כדי להתקדם בשיחה צריך לענות על השאלה הנוכחית.";
      }
      return;
    }

    onboardingConversation.answers[currentQuestion.id] = answer;
    onboardingConversation.pendingAnswer = answer;
    onboardingConversation.draftAnswer = "";
    onboardingConversation.pendingAdvance = true;

    if (elements.onboardingScreenStatus) {
      elements.onboardingScreenStatus.textContent = "ה־AI מעבד את מה שכתבת וממשיך את השיחה.";
    }

    renderOnboardingNotes();
    renderOnboardingConversation();
    persistFlowState("onboarding");

    if (onboardingConversation.advanceTimer) {
      clearTimeoutImpl(onboardingConversation.advanceTimer);
    }

    onboardingConversation.advanceTimer = setTimeoutImpl(() => {
      onboardingConversation.pendingAdvance = false;
      onboardingConversation.pendingAnswer = "";
      onboardingConversation.currentIndex += 1;
      if (elements.onboardingScreenStatus) {
        elements.onboardingScreenStatus.textContent = onboardingConversation.currentIndex >= onboardingQuestionFlow.length
          ? "השיחה הושלמה. עכשיו אפשר להוסיף חומר תומך ולסיים onboarding."
          : "מעולה. ה־AI עדכן את ההבנה שלו על הפרויקט וממשיך להוביל את השיחה.";
      }
      renderOnboardingNotes();
      renderOnboardingConversation();
      persistFlowState("onboarding");
    }, 420);
  }

  function formatOnboardingBlockedStatus(finished = {}) {
    const completionDecision = normalizeObject(finished.onboardingCompletionDecision);
    const clarificationPrompts = normalizeArray(completionDecision.clarificationPrompts)
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim());
    const missingInputs = normalizeArray(completionDecision.missingInputs)
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim());

    if (clarificationPrompts.length > 0) {
      return `Onboarding נחסם עד להשלמת: ${clarificationPrompts.join(" | ")}`;
    }

    if (missingInputs.length > 0) {
      return `Onboarding נחסם כי חסרים שדות חובה: ${missingInputs.join(", ")}`;
    }

    return finished.error ?? "Onboarding עדיין לא מוכן לבניית פרויקט usable.";
  }

  function renderEmptyAppState({
    mode = "create",
    message = "אין פרויקטים",
    status = "כדי להתחיל צריך ליצור פרויקט ראשון ולעבור onboarding קצר.",
  } = {}) {
    clearFlowFeedback();
    setAppScreen(mode === "onboarding" ? "onboarding" : "create");
    if (mode === "onboarding") {
      if (elements.onboardingScreenMessage) {
        elements.onboardingScreenMessage.textContent = message;
      }
      if (elements.onboardingScreenStatus) {
        elements.onboardingScreenStatus.textContent = status;
      }
    } else {
      if (elements.emptyProjectMessage) {
        elements.emptyProjectMessage.textContent = message;
      }
      if (elements.emptyProjectStatus) {
        elements.emptyProjectStatus.textContent = status;
      }
    }
    if (elements.emptyProjectMessage && mode !== "onboarding") {
      elements.emptyProjectMessage.textContent = message;
    }
    if (elements.emptyProjectStatus && mode !== "onboarding") {
      elements.emptyProjectStatus.textContent = status;
    }
    if (elements.emptyAppState) {
      elements.emptyAppState.dataset.mode = "create";
    }
    if (elements.projectCreateStage) {
      elements.projectCreateStage.hidden = false;
    }
    if (mode === "onboarding") {
      onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
      if (elements.onboardingStageTitle) {
        elements.onboardingStageTitle.textContent = "עכשיו מחדדים את הפרויקט עם onboarding";
      }
      if (elements.onboardingStageDescription) {
        elements.onboardingStageDescription.textContent =
          "זה שלב נפרד מיצירת הפרויקט הראשונית. כאן מבהירים למערכת מה אתה בונה, למה זה חשוב, ואיזה חומרים תומכים כבר יש.";
      }
      if (elements.onboardingNotesList) {
        renderOnboardingNotes();
      }
      renderOnboardingConversation();
    }
    setFlowButtonState({
      target: "create",
      disabled: false,
      label: "צור פרויקט",
    });
    setFlowButtonState({
      target: "finish",
      disabled: false,
      label: "סיים Onboarding",
    });
    if (elements.heroProjectName && !currentProject) {
      elements.heroProjectName.textContent = "אין פרויקטים";
    }
    if (elements.heroGoal && !currentProject) {
      elements.heroGoal.textContent =
        mode === "onboarding"
          ? "השלב הבא הוא להשלים onboarding ורק אז לפתוח את ה־workspace."
          : "צריך ליצור פרויקט ראשון כדי להיכנס ל־workspace.";
    }
    if (elements.now && !currentProject) {
      elements.now.innerHTML = `<p class="empty">אין פרויקטים פעילים כרגע.</p>`;
    }
    if (elements.critical && !currentProject) {
      elements.critical.innerHTML = `<p class="empty">הפעולה הבאה היא ליצור פרויקט ראשון.</p>`;
    }
    persistFlowState(mode === "onboarding" ? "onboarding" : "create");
  }

  async function ensureAppUser() {
    const stored = readStoredAppUser();
    if (stored?.email) {
      return stored;
    }

    const email = `local-operator-${Date.now()}@nexus.local`;
    const password = `nexus-${Math.random().toString(36).slice(2, 10)}`;
    const signup = await fetchJson("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: {
          email,
          displayName: "Local operator",
        },
        credentials: {
          password,
        },
      }),
    });
    const appUser = {
      email,
      password,
      userId: signup.authPayload?.userIdentity?.userId ?? null,
      displayName: signup.authPayload?.userIdentity?.displayName ?? "Local operator",
    };
    writeStoredAppUser(appUser);
    return appUser;
  }

  async function createFirstProjectFlow() {
    const projectName = elements.createProjectNameInput?.value?.trim() ?? "";
    const visionText = elements.createProjectVisionInput?.value?.trim() ?? "";
    if (!projectName || !visionText) {
      renderEmptyAppState({
        mode: "create",
        message: "אין פרויקטים",
        status: "צריך להזין שם פרויקט ותיאור קצר לפני היצירה.",
      });
      return;
    }

    let appUser = await ensureAppUser();
    let draftResult = null;

    try {
      draftResult = await fetchJson("/api/project-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: {
            email: appUser.email,
          },
          projectCreationInput: {
            projectName,
            visionText,
          },
        }),
      });
    } catch {
      clearStoredAppUser();
      appUser = await ensureAppUser();
      draftResult = await fetchJson("/api/project-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: {
            email: appUser.email,
          },
          projectCreationInput: {
            projectName,
            visionText,
          },
        }),
      });
    }

    const session = await fetchJson("/api/onboarding/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: appUser.userId,
        projectDraftId: draftResult.projectDraftId,
        initialInput: {
          projectName,
          visionText,
        },
      }),
    });

    onboardingFlow = {
      mode: draftResult.projectCreationRedirect?.target === "onboarding" ? "onboarding" : "create",
      sessionId: session.onboardingSession?.sessionId ?? null,
      projectDraftId: draftResult.projectDraftId,
      projectName,
      visionText,
    };
    onboardingConversation = createOnboardingConversationState();

    renderEmptyAppState({
      mode: "onboarding",
      message: "עברנו ל־onboarding של הפרויקט",
      status: "זה שלב נפרד מיצירת הפרויקט. עכשיו מוסיפים הקשר וחומר תומך לפני פתיחת ה־workspace.",
    });
    persistFlowState("onboarding");
  }

  async function finishFirstProjectOnboarding() {
    if (!onboardingFlow?.sessionId) {
      if (currentProjectId) {
        await loadProject(currentProjectId, {
          title: "חזרת ל־workspace שלך",
          message: "מסך ה־Onboarding נפתח במצב בדיקה מתוך ה־workspace, אז החזרנו אותך לאותו פרויקט בלי לפתוח flow חדש.",
        });
        return;
      }

      renderEmptyAppState({
        mode: "onboarding",
        message: "אי אפשר לסיים onboarding עדיין",
        status: "אין כרגע session פעיל ל־onboarding, ולכן אי אפשר לבנות workspace חדש מהשלב הזה.",
      });
      return;
    }

    if ((onboardingConversation?.currentIndex ?? 0) < onboardingQuestionFlow.length) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "ממשיכים ל־onboarding",
        status: "לפני שסוגרים את השלב הזה צריך לענות על כל 3 שאלות ה־AI.",
      });
      return;
    }

    const projectName = elements.createProjectNameInput?.value?.trim() || onboardingFlow?.projectName?.trim?.() || "";
    const visionText = elements.createProjectVisionInput?.value?.trim() || onboardingFlow?.visionText?.trim?.() || "";
    const supportingLink = elements.createProjectLinkInput?.value?.trim() ?? "";
    const uploadedFiles = buildOnboardingUploadedFiles();

    if (!projectName || !visionText || (!supportingLink && uploadedFiles.length === 0)) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "ממשיכים ל־onboarding",
        status: "כדי לסיים onboarding צריך שם פרויקט, תיאור, וקישור תומך או קובץ תומך אחד לפחות.",
      });
      return;
    }

    setFlowButtonState({
      target: "finish",
      disabled: true,
      label: "מסיים Onboarding...",
    });
    renderEmptyAppState({
      mode: "onboarding",
      message: "מסיימים onboarding",
      status: "הבקשה נשלחה. בודק readiness, משלים intake וטוען workspace ברגע שהפרויקט מוכן.",
    });
    setFlowButtonState({
      target: "finish",
      disabled: true,
      label: "מסיים Onboarding...",
    });

    try {
      await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/intake`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visionText: formatVisionText(projectName, visionText),
          uploadedFiles: [],
          externalLinks: supportingLink ? [supportingLink] : [],
        }),
      });

      if (uploadedFiles.length > 0) {
        await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadedFiles,
          }),
        });
      }

      const finished = await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/finish`, {
        method: "POST",
      });

      if (finished.blocked || !finished.project?.id) {
        renderEmptyAppState({
          mode: "onboarding",
          message: "Onboarding דורש השלמה",
          status: formatOnboardingBlockedStatus(finished),
        });
        return;
      }

      await loadProject(finished.project.id, {
        ...buildWorkspaceLandingFeedback({
          projectName,
          answers: onboardingConversation?.answers ?? {},
        }),
      });
    } catch (error) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "סיום onboarding נכשל",
        status: `לא הצלחנו לסיים onboarding כרגע. ${error?.message ?? "נסה שוב או השלם את שדות החובה."}`,
      });
    }
  }

  async function submitProposalEditsFromUi() {
    const state = normalizeObject(currentProject?.state);
    const editableProposal = normalizeObject(currentProject?.editableProposal ?? state.editableProposal);
    const editedProposal = normalizeObject(currentProject?.editedProposal ?? state.editedProposal);
    if (!currentProjectId || !editableProposal.proposalId) {
      return;
    }

    const activeProposal = normalizeObject(
      editedProposal.revisionId ? editedProposal : editableProposal,
    );
    const firstSection = normalizeObject(normalizeArray(activeProposal.sections)[0]);
    const revisionNumber = Number(editedProposal.revisionNumber ?? 1) + 1;
    const annotationNote = elements.proposalAnnotationInput?.value?.trim() ?? "";
    const userEditInput = {
      revisionNumber,
      sectionEdits: firstSection.sectionId
        ? [
            {
              sectionId: firstSection.sectionId,
              label: elements.proposalSectionTitleInput?.value?.trim() || firstSection.label,
              contentSummary: elements.proposalSectionSummaryInput?.value?.trim() || firstSection.contentSummary,
            },
          ]
        : [],
      nextActionEdit: {
        label: elements.proposalNextActionLabelInput?.value?.trim() || activeProposal.nextAction?.label || "Review proposal",
      },
    };

    if (annotationNote) {
      userEditInput.annotations = [
        {
          targetType: "section",
          targetId: firstSection.sectionId ?? "overview",
          note: annotationNote,
          severity: "warning",
        },
      ];
    }

    await fetchJson(`/api/projects/${currentProjectId}/proposal-edits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEditInput }),
    });
    activeWorkspace = "release";
    await loadProject(currentProjectId);
    if (elements.proposalAnnotationInput) {
      elements.proposalAnnotationInput.value = "";
    }
  }

  async function submitPartialAcceptanceFromUi() {
    const state = normalizeObject(currentProject?.state);
    const editableProposal = normalizeObject(currentProject?.editableProposal ?? state.editableProposal);
    const editedProposal = normalizeObject(currentProject?.editedProposal ?? state.editedProposal);
    if (!currentProjectId || !editableProposal.proposalId) {
      return;
    }

    const activeProposal = normalizeObject(
      editedProposal.revisionId ? editedProposal : editableProposal,
    );
    const firstSection = normalizeObject(normalizeArray(activeProposal.sections)[0]);
    const firstComponent = normalizeObject(normalizeArray(activeProposal.components)[0]);
    const firstCopy = normalizeObject(normalizeArray(activeProposal.copy)[0]);
    const note = elements.partialAcceptanceNoteInput?.value?.trim() ?? "";
    const approvalOutcome = {
      sectionOutcomes: firstSection.sectionId
        ? [
            {
              sectionId: firstSection.sectionId,
              decision: elements.partialSectionDecisionSelect?.value ?? "approved",
              note,
            },
          ]
        : [],
      componentOutcomes: firstComponent.componentId
        ? [
            {
              componentId: firstComponent.componentId,
              decision: elements.partialComponentDecisionSelect?.value ?? "rejected",
              note,
            },
          ]
        : [],
      copyOutcomes: firstCopy.copyId
        ? [
            {
              copyId: firstCopy.copyId,
              decision: elements.partialCopyDecisionSelect?.value ?? "approved",
              note,
            },
          ]
        : [],
    };

    await fetchJson(`/api/projects/${currentProjectId}/partial-acceptance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalOutcome }),
    });
    activeWorkspace = "release";
    await loadProject(currentProjectId);
    if (elements.partialAcceptanceNoteInput) {
      elements.partialAcceptanceNoteInput.value = "";
    }
  }

  async function executeRollbackFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/rollback-executions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await loadProject(currentProjectId);
  }

  async function saveSnapshotScheduleFromUi() {
    if (!currentProjectId) {
      return;
    }

    const intervalSeconds = Number(elements.snapshotIntervalInput?.value ?? 300);
    const preChangeTriggers = (elements.snapshotTriggersInput?.value ?? "bootstrap,migration,deploy")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backup-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleInput: {
          enabled: true,
          intervalSeconds: Number.isFinite(intervalSeconds) ? intervalSeconds : 300,
          preChangeTriggers,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

  async function runSnapshotBackupFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backups/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: "manual",
      }),
    });
    await loadProject(currentProjectId);
  }

  async function saveSnapshotRetentionFromUi() {
    if (!currentProjectId) {
      return;
    }

    const maxSnapshots = Number(elements.snapshotMaxInput?.value ?? 20);
    await fetchJson(`/api/projects/${currentProjectId}/snapshot-retention-policy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retentionInput: {
          enabled: true,
          maxSnapshots: Number.isFinite(maxSnapshots) ? maxSnapshots : 20,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

  async function runSnapshotCleanupFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/snapshot-retention-cleanup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: "manual-cleanup",
      }),
    });
    await loadProject(currentProjectId);
  }

  async function toggleSnapshotWorkerFromUi() {
    if (!currentProjectId) {
      return;
    }

    const currentWorker = normalizeObject(currentProject?.snapshotBackupWorker ?? currentProject?.state?.snapshotBackupWorker);
    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backup-worker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerInput: {
          enabled: !currentWorker.enabled,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

async function runSnapshotWorkerTickFromUi() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/snapshot-backup-worker/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: "manual-worker-run",
      }),
    });
    await loadProject(currentProjectId);
  }

  async function refreshDisasterRecoveryChecklistFromUi() {
    if (!currentProjectId) {
      return;
    }

    const payload = await fetchJson(`/api/projects/${currentProjectId}/disaster-recovery-checklist?refresh=1`);
    const refreshedProject = payload?.project ?? null;
    if (refreshedProject && typeof refreshedProject === "object") {
      currentProject = refreshedProject;
      renderProject(elements, currentProject);
      return;
    }

    await loadProject(currentProjectId);
  }

  async function refreshBusinessContinuityFromUi() {
    if (!currentProjectId) {
      return;
    }

    const payload = await fetchJson(`/api/projects/${currentProjectId}/business-continuity?refresh=1`);
    const refreshedProject = payload?.project ?? null;
    if (refreshedProject && typeof refreshedProject === "object") {
      currentProject = refreshedProject;
      renderProject(elements, currentProject);
      return;
    }

    await loadProject(currentProjectId);
  }

  async function applyBusinessContinuityActionFromUi() {
    if (!currentProjectId) {
      return;
    }

    const actionType = elements.continuityActionSelect?.value ?? "trigger-continuity-health-check";
    await fetchJson(`/api/projects/${currentProjectId}/business-continuity/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionInput: {
          actionType,
        },
      }),
    });
    await loadProject(currentProjectId);
  }

  function mergeLiveState(liveState) {
    if (!currentProject) {
      return;
    }

    currentProject = {
      ...currentProject,
      progressState: liveState.progressState ?? currentProject.progressState,
      reactiveWorkspaceState: liveState.reactiveWorkspaceState ?? currentProject.reactiveWorkspaceState,
      realtimeEventStream: liveState.realtimeEventStream ?? currentProject.realtimeEventStream,
      liveUpdateChannel: liveState.liveUpdateChannel ?? currentProject.liveUpdateChannel,
      liveLogStream: liveState.liveLogStream ?? currentProject.liveLogStream,
      formattedLogs: liveState.formattedLogs ?? currentProject.formattedLogs,
      commandConsoleView: liveState.commandConsoleView ?? currentProject.commandConsoleView,
      projectPresenceState: liveState.projectPresenceState ?? currentProject.projectPresenceState,
      reviewThreadState: liveState.reviewThreadState ?? currentProject.reviewThreadState,
      collaborationFeed: liveState.collaborationFeed ?? currentProject.collaborationFeed,
      continuityPlan: liveState.continuityPlan ?? currentProject.continuityPlan,
      businessContinuityState: liveState.businessContinuityState ?? currentProject.businessContinuityState,
      events: liveState.events ?? currentProject.events,
    };
    renderLive(elements, currentProject);
    renderCollaboration(elements, currentProject);
    renderEvents(elements, currentProject);
  }

  async function refreshLiveState() {
    if (!currentProjectId) {
      return;
    }

    try {
      const liveState = await fetchJson(`/api/projects/${currentProjectId}/live-state`);
      mergeLiveState(liveState);
    } finally {
      scheduleLiveRefresh();
    }
  }

  async function updatePresence() {
    if (!currentProjectId) {
      return;
    }

    await fetchJson(`/api/projects/${currentProjectId}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: presenceParticipantId,
        sessionId: presenceParticipantId,
        userId: presenceParticipantId,
        displayName: "Local operator",
        role: "owner",
        status: "active",
        workspaceArea: `${activeWorkspace}-workspace`,
        currentSurface: `${activeWorkspace}-workspace`,
        currentTask: currentProject?.progressState?.status ?? null,
      }),
    });
  }

  function closeLiveUpdates() {
    if (refreshTimer) {
      clearTimeoutImpl(refreshTimer);
      refreshTimer = null;
    }

    if (liveEventSource && typeof liveEventSource.close === "function") {
      liveEventSource.close();
    }

    liveEventSource = null;
  }

  function resolveRefreshDelay(channel) {
    const normalizedChannel = normalizeObject(channel);
    const reconnectPolicy = normalizeObject(normalizedChannel.reconnectPolicy);
    const mode = normalizedChannel.transportMode ?? "polling";

    if (mode === "sse") {
      return reconnectPolicy.initialDelayMs ?? 1500;
    }

    return reconnectPolicy.initialDelayMs ?? 5000;
  }

  function scheduleLiveRefresh() {
    if (refreshTimer) {
      clearTimeoutImpl(refreshTimer);
      refreshTimer = null;
    }

    if (!currentProjectId || !currentProject) {
      return;
    }

    const channel = normalizeObject(currentProject.liveUpdateChannel);
    const delay = resolveRefreshDelay(channel);
    refreshTimer = setTimeoutImpl(() => {
      refreshLiveState().catch((error) => {
        elements.events.innerHTML = `<p class="empty">Live refresh failed: ${escapeHtml(error.message)}</p>`;
        scheduleLiveRefresh();
      });
    }, delay);
  }

  function resolveLiveEndpoint(projectId, channel) {
    const normalizedChannel = normalizeObject(channel);
    return normalizedChannel.deliveryEndpoint ?? `/api/projects/${projectId}/live-events`;
  }

  function connectLiveUpdates() {
    closeLiveUpdates();

    if (!currentProjectId || !currentProject) {
      return;
    }

    const channel = normalizeObject(currentProject.liveUpdateChannel);
    const serverTransport = channel.serverTransport ?? (channel.transportMode === "polling" ? "polling" : "sse");
    if (serverTransport === "polling" || typeof EventSourceImpl !== "function") {
      scheduleLiveRefresh();
      return;
    }

    const eventSource = new EventSourceImpl(resolveLiveEndpoint(currentProjectId, channel));
    liveEventSource = eventSource;

    eventSource.onmessage = (event) => {
      try {
        mergeLiveState(JSON.parse(event.data));
      } catch (error) {
        elements.events.innerHTML = `<p class="empty">Live stream parse failed: ${escapeHtml(error.message)}</p>`;
      }
    };
    eventSource.addEventListener?.("live-state", (event) => {
      try {
        mergeLiveState(JSON.parse(event.data));
      } catch (error) {
        elements.events.innerHTML = `<p class="empty">Live stream parse failed: ${escapeHtml(error.message)}</p>`;
      }
    });
    eventSource.onerror = () => {
      if (liveEventSource === eventSource) {
        eventSource.close?.();
        liveEventSource = null;
        scheduleLiveRefresh();
      }
    };
  }

  async function loadProjects() {
    const storedFlowState = readStoredFlowState();
    const { projects } = await fetchJson("/api/projects");
    elements.projectSelect.innerHTML = normalizeArray(projects)
      .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`)
      .join("");

    if (storedFlowState?.activeWorkspace) {
      activeWorkspace = workspaceKeys.includes(storedFlowState.activeWorkspace)
        ? storedFlowState.activeWorkspace
        : activeWorkspace;
    }

    if (storedFlowState?.draftInputs) {
      applyDraftInputs(storedFlowState.draftInputs);
    }

    if (storedFlowState?.onboardingFlow && typeof storedFlowState.onboardingFlow === "object") {
      onboardingFlow = storedFlowState.onboardingFlow;
    }

    if (storedFlowState?.onboardingConversation && typeof storedFlowState.onboardingConversation === "object") {
      onboardingConversation = storedFlowState.onboardingConversation;
    }

    if (storedFlowState?.screen === "workspace" && storedFlowState.currentProjectId) {
      await loadProject(storedFlowState.currentProjectId);
    } else if (storedFlowState?.screen === "onboarding") {
      currentProjectId = storedFlowState.currentProjectId ?? null;
      currentProject = null;
      renderEmptyAppState({
        mode: "onboarding",
        message: "חזרת ל־Onboarding",
        status: "המשכנו בדיוק מהמקום שבו היית לפני הרענון.",
      });
    } else if (projects?.[0]) {
      await loadProject(projects[0].id);
    } else {
      currentProjectId = null;
      currentProject = null;
      renderEmptyAppState();
    }

    return projects;
  }

  elements.projectSelect?.addEventListener("change", async (event) => {
    await loadProject(event.target.value);
  });

  elements.createNewProjectButton?.addEventListener("click", () => {
    enterCreateProjectScreen();
  });

  elements.developerTab?.addEventListener("click", () => {
    activeWorkspace = "developer";
    setActiveWorkspace(elements, activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.projectBrainTab?.addEventListener("click", () => {
    activeWorkspace = "project-brain";
    setActiveWorkspace(elements, activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.releaseTab?.addEventListener("click", () => {
    activeWorkspace = "release";
    setActiveWorkspace(elements, activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.growthTab?.addEventListener("click", () => {
    activeWorkspace = "growth";
    setActiveWorkspace(elements, activeWorkspace);
    updatePresence().catch(() => {});
  });

  elements.runCycleButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    const previousProject = currentProject;
    await fetchJson(`/api/projects/${currentProjectId}/run-cycle`, { method: "POST" });
    const nextProject = await fetchJson(`/api/projects/${currentProjectId}`);
    const refreshedProject = await loadProject(currentProjectId, {
      ...buildRunCycleFeedback(previousProject, nextProject),
      pulseWorkspace: true,
    }, nextProject);
    currentProject = refreshedProject;
  });

  elements.analyzeButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    await fetchJson(`/api/projects/${currentProjectId}/analyze`, { method: "POST" });
    await loadProject(currentProjectId);
  });

  elements.scanButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    await fetchJson(`/api/projects/${currentProjectId}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: elements.scanPathInput.value }),
    });
    await loadProject(currentProjectId);
  });

  elements.syncCasinoButton?.addEventListener("click", async () => {
    if (!currentProjectId) return;
    await fetchJson(`/api/projects/${currentProjectId}/sync-casino`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseUrl: elements.casinoBaseUrlInput.value }),
    });
    await loadProject(currentProjectId);
  });

  elements.createProjectButton?.addEventListener("click", async () => {
    await createFirstProjectFlow();
  });

  elements.finishOnboardingButton?.addEventListener("click", async () => {
    await finishFirstProjectOnboarding();
  });

  elements.onboardingNextButton?.addEventListener("click", () => {
    advanceOnboardingConversation();
  });

  elements.onboardingBackButton?.addEventListener("click", async () => {
    await exitOnboardingScreen();
  });

  elements.onboardingForwardButton?.addEventListener("click", async () => {
    const isComplete = (onboardingConversation?.currentIndex ?? 0) >= onboardingQuestionFlow.length;
    if (isComplete) {
      await finishFirstProjectOnboarding();
      return;
    }
    advanceOnboardingConversation();
  });

  elements.onboardingAnswerInput?.addEventListener("input", () => {
    onboardingConversation = onboardingConversation ?? createOnboardingConversationState();
    onboardingConversation.draftAnswer = elements.onboardingAnswerInput?.value ?? "";
    persistFlowState("onboarding");
  });

  elements.onboardingAnswerInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault?.();
      advanceOnboardingConversation();
    }
  });

  elements.reopenOnboardingButton?.addEventListener("click", () => {
    reopenOnboardingFromWorkspace();
  });

  elements.createProjectNameInput?.addEventListener("input", () => {
    persistFlowState(onboardingFlow?.sessionId ? "onboarding" : "create");
  });

  elements.createProjectVisionInput?.addEventListener("input", () => {
    persistFlowState(onboardingFlow?.sessionId ? "onboarding" : "create");
  });

  elements.createProjectLinkInput?.addEventListener("input", () => {
    persistFlowState(onboardingFlow?.sessionId ? "onboarding" : "create");
  });

  elements.createProjectFileNameInput?.addEventListener("input", () => {
    persistFlowState(onboardingFlow?.sessionId ? "onboarding" : "create");
  });

  elements.createProjectFileContentInput?.addEventListener("input", () => {
    persistFlowState(onboardingFlow?.sessionId ? "onboarding" : "create");
  });

  if (!resolveDevFlowControlsEnabled()) {
    if (elements.reopenOnboardingButton) {
      elements.reopenOnboardingButton.hidden = true;
    }
    if (elements.createNewProjectButton) {
      elements.createNewProjectButton.hidden = true;
    }
  }

  elements.proposalEditButton?.addEventListener("click", async () => {
    await submitProposalEditsFromUi();
  });

  elements.partialAcceptanceButton?.addEventListener("click", async () => {
    await submitPartialAcceptanceFromUi();
  });

  elements.executeRollbackButton?.addEventListener("click", async () => {
    await executeRollbackFromUi();
  });

  elements.snapshotScheduleButton?.addEventListener("click", async () => {
    await saveSnapshotScheduleFromUi();
  });

  elements.runSnapshotBackupButton?.addEventListener("click", async () => {
    await runSnapshotBackupFromUi();
  });

  elements.snapshotRetentionButton?.addEventListener("click", async () => {
    await saveSnapshotRetentionFromUi();
  });

  elements.snapshotCleanupButton?.addEventListener("click", async () => {
    await runSnapshotCleanupFromUi();
  });

  elements.snapshotWorkerToggleButton?.addEventListener("click", async () => {
    await toggleSnapshotWorkerFromUi();
  });

  elements.snapshotWorkerRunButton?.addEventListener("click", async () => {
    await runSnapshotWorkerTickFromUi();
  });

  elements.disasterRecoveryRefreshButton?.addEventListener("click", async () => {
    await refreshDisasterRecoveryChecklistFromUi();
  });

  elements.continuityActionButton?.addEventListener("click", async () => {
    await applyBusinessContinuityActionFromUi();
  });

  elements.continuityRefreshButton?.addEventListener("click", async () => {
    await refreshBusinessContinuityFromUi();
  });

  elements.projectAuditRefreshButton?.addEventListener("click", async () => {
    await refreshProjectAudit();
  });

  const ready = loadProjects().catch((error) => {
    if (error?.message === "Request failed: 401") {
      currentProjectId = null;
      currentProject = null;
      renderEmptyAppState({
        mode: "create",
        message: "אין פרויקטים",
        status: "כדי להתחיל צריך ליצור פרויקט ראשון ולעבור onboarding קצר.",
      });
      return [];
    }

    elements.now.innerHTML = `<p class="empty">טעינת המסך נכשלה: ${escapeHtml(error.message)}</p>`;
    throw error;
  });

  return {
    elements,
    loadProject,
    loadProjects,
    refreshLiveState,
    setActiveWorkspace(workspaceKey) {
      activeWorkspace = workspaceKey;
      setActiveWorkspace(elements, activeWorkspace);
    },
    closeLiveUpdates,
    ready,
  };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  createCockpitApp();
}
