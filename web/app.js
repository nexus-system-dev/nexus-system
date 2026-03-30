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
    workspaceBoard: doc.querySelector("#workspace-board"),
    emptyAppState: doc.querySelector("#empty-app-state"),
    emptyProjectMessage: doc.querySelector("#empty-project-message"),
    emptyProjectStatus: doc.querySelector("#empty-project-status"),
    createProjectNameInput: doc.querySelector("#create-project-name-input"),
    createProjectVisionInput: doc.querySelector("#create-project-vision-input"),
    createProjectLinkInput: doc.querySelector("#create-project-link-input"),
    createProjectButton: doc.querySelector("#create-project-button"),
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
  const activeAgents = normalizeArray(project.agents).filter((agent) => agent.status === "working").length;

  elements.heroProjectName.textContent = project.name ?? "Project";
  elements.heroGoal.textContent = project.goal ?? "המטרה תופיע כאן";
  elements.casinoBaseUrlInput.value = project.source?.baseUrl ?? "http://localhost:4101";

  elements.now.innerHTML = `
    <div class="big-status ${escapeHtml(project.status ?? "idle")}">
      <span>${escapeHtml(t(project.status ?? "idle"))}</span>
    </div>
    ${metricHtml([
      { label: "חסם מרכזי", value: project.overview?.bottleneck ?? "לא זוהה" },
      { label: "משימות פעילות", value: String(activeTasks.length) },
      { label: "משימות חסומות", value: String(blockedTasks.length) },
      { label: "סוכנים עובדים", value: String(activeAgents) },
    ])}
  `;
}

function renderCritical(elements, project) {
  const firstApproval = normalizeArray(project.approvals)[0];
  const blockedTask = normalizeArray(project.cycle?.roadmap).find((task) => task.status === "blocked");
  const title = firstApproval ?? blockedTask?.summary ?? "כרגע אין פעולה דחופה";
  const reason = blockedTask
    ? `זה תקוע בגלל: ${normalizeArray(blockedTask.dependencies).join(", ") || "חסר מידע"}`
    : "כרגע אין חסם גדול, אפשר להמשיך לסנכרן או לנתח.";

  elements.critical.innerHTML = `
    <div class="critical-main">${escapeHtml(title)}</div>
    <p class="critical-sub">${escapeHtml(reason)}</p>
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
  const items = [];

  if (scan.findings?.hasBackend) items.push({ title: "יש backend" });
  if (scan.findings?.hasAuth) items.push({ title: "יש auth" });
  if (scan.findings?.hasEnvExample) items.push({ title: "יש env לדוגמה" });
  if (external.features?.hasAuth) items.push({ title: "ה־API של הקזינו מדווח ש־auth קיים" });

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
  const restore = normalizeObject(project.restoreDecision ?? state.restoreDecision);
  const rollback = normalizeObject(project.rollbackExecutionResult ?? state.rollbackExecutionResult);
  const versions = normalizeObject(snapshot.versions);
  const scheduleExecution = normalizeObject(schedule.execution);
  const preChangeTriggers = normalizeArray(schedule.preChangeTriggers).join(", ");
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
      title: `Restore mode: ${restore.restoreMode ?? "unknown"}`,
      body: restore.blockedReason ?? `Safe to execute: ${restore.summary?.isSafeToExecute ? "yes" : "no"}`,
    },
    {
      title: `Rollback: ${rollback.executionStatus ?? "not-run"}`,
      body: `Targets restored: ${rollback.summary?.restoredTargetCount ?? 0}`,
    },
  ];

  elements.versioning.innerHTML = `
    ${metricHtml([
      { label: "Snapshot stored", value: snapshot.summary?.isStored ? "yes" : "no" },
      { label: "Schedule", value: schedule.summary?.scheduleStatus ?? "not-configured" },
      { label: "Last backup", value: scheduleExecution.lastRunAt ?? "never" },
      { label: "Restore mode", value: restore.restoreMode ?? "unknown" },
      { label: "Rollback status", value: rollback.executionStatus ?? "not-run" },
    ])}
    ${stackHtml("State control", details, "עדיין אין נתוני versioning זמינים.")}
  `;

  if (elements.snapshotIntervalInput && schedule.intervalSeconds) {
    elements.snapshotIntervalInput.value = String(schedule.intervalSeconds);
  }

  if (elements.snapshotTriggersInput) {
    elements.snapshotTriggersInput.value = preChangeTriggers || "bootstrap,migration,deploy";
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
  if (!project.externalSnapshot && !project.gitSnapshot && !project.runtimeSnapshot) {
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
  let currentProjectAuditPayload = null;
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

  async function fetchJson(url, options) {
    const response = await fetchImpl(url, options);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async function loadProject(projectId) {
    const project = await fetchJson(`/api/projects/${projectId}`);
    currentProjectId = projectId;
    currentProject = project;
    currentProjectAuditPayload = project.projectAuditPayload ?? project.state?.projectAuditPayload ?? null;
    onboardingFlow = null;
    applyDesignSystem(doc, project);
    renderProject(elements, project);
    if (elements.emptyAppState) {
      elements.emptyAppState.hidden = true;
    }
    if (elements.workspaceBoard) {
      elements.workspaceBoard.hidden = false;
    }
    setActiveWorkspace(elements, activeWorkspace);
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
    try {
      const raw = appStorage.getItem("nexus.appUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeStoredAppUser(appUser) {
    try {
      appStorage.setItem("nexus.appUser", JSON.stringify(appUser));
    } catch {}
  }

  function clearStoredAppUser() {
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

  function renderEmptyAppState({
    mode = "create",
    message = "אין פרויקטים",
    status = "כדי להתחיל צריך ליצור פרויקט ראשון ולעבור onboarding קצר.",
  } = {}) {
    if (elements.emptyAppState) {
      elements.emptyAppState.hidden = false;
    }
    if (elements.workspaceBoard) {
      elements.workspaceBoard.hidden = true;
    }
    if (elements.emptyProjectMessage) {
      elements.emptyProjectMessage.textContent = message;
    }
    if (elements.emptyProjectStatus) {
      elements.emptyProjectStatus.textContent = status;
    }
    if (elements.createProjectButton) {
      elements.createProjectButton.textContent = mode === "onboarding" ? "סיים Onboarding" : "צור פרויקט";
    }
    if (elements.heroProjectName && !currentProject) {
      elements.heroProjectName.textContent = "אין פרויקטים";
    }
    if (elements.heroGoal && !currentProject) {
      elements.heroGoal.textContent = "צריך ליצור פרויקט ראשון כדי להיכנס ל־workspace.";
    }
    if (elements.now && !currentProject) {
      elements.now.innerHTML = `<p class="empty">אין פרויקטים פעילים כרגע.</p>`;
    }
    if (elements.critical && !currentProject) {
      elements.critical.innerHTML = `<p class="empty">הפעולה הבאה היא ליצור פרויקט ראשון.</p>`;
    }
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
    };

    renderEmptyAppState({
      mode: "onboarding",
      message: "ממשיכים ל־onboarding",
      status: "הוסף קישור תומך אחד לפחות ואז סיים onboarding כדי לפתוח את ה־workspace.",
    });
  }

  async function finishFirstProjectOnboarding() {
    if (!onboardingFlow?.sessionId) {
      return;
    }

    const projectName = elements.createProjectNameInput?.value?.trim() ?? "";
    const visionText = elements.createProjectVisionInput?.value?.trim() ?? "";
    const supportingLink = elements.createProjectLinkInput?.value?.trim() ?? "";

    if (!projectName || !visionText || !supportingLink) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "ממשיכים ל־onboarding",
        status: "כדי לסיים onboarding צריך שם פרויקט, תיאור וקישור תומך אחד לפחות.",
      });
      return;
    }

    await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/intake`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visionText: formatVisionText(projectName, visionText),
        uploadedFiles: [],
        externalLinks: [supportingLink],
      }),
    });

    const finished = await fetchJson(`/api/onboarding/sessions/${onboardingFlow.sessionId}/finish`, {
      method: "POST",
    });

    if (finished.blocked || !finished.project?.id) {
      renderEmptyAppState({
        mode: "onboarding",
        message: "ממשיכים ל־onboarding",
        status: finished.error ?? "Onboarding עדיין לא מוכן לבניית פרויקט usable.",
      });
      return;
    }

    await loadProject(finished.project.id);
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

    if (mode === "websocket") {
      return reconnectPolicy.initialDelayMs ?? 1000;
    }

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
    const { projects } = await fetchJson("/api/projects");
    elements.projectSelect.innerHTML = normalizeArray(projects)
      .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`)
      .join("");

    if (projects?.[0]) {
      if (elements.emptyAppState) {
        elements.emptyAppState.hidden = true;
      }
      if (elements.workspaceBoard) {
        elements.workspaceBoard.hidden = false;
      }
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
    await fetchJson(`/api/projects/${currentProjectId}/run-cycle`, { method: "POST" });
    await loadProject(currentProjectId);
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
    if (onboardingFlow?.mode === "onboarding") {
      await finishFirstProjectOnboarding();
      return;
    }

    await createFirstProjectFlow();
  });

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

  elements.projectAuditRefreshButton?.addEventListener("click", async () => {
    await refreshProjectAudit();
  });

  const ready = loadProjects().catch((error) => {
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
