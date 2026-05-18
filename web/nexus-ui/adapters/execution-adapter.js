function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return String(value ?? "").trim();
}

function escapeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function resolveArtifactExpectation(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.context?.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.context?.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.proofArtifact?.artifactExpectation,
  );
}

function resolveGenerationIntent(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.generationIntent
      ?? safeProject.aiDesignRequest?.generationIntent
      ?? safeProject.context?.generationIntent
      ?? safeProject.context?.aiDesignRequest?.generationIntent,
  );
}

function resolveRepeatedLoopContinuation(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.repeatedLoopContinuation
      ?? safeProject.state?.repeatedLoopContinuation
      ?? safeProject.context?.repeatedLoopContinuation,
  );
}

function resolveSplitWorkspaceLiveBuildSurfaceModel(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.splitWorkspaceLiveBuildSurfaceModel
      ?? safeProject.context?.splitWorkspaceLiveBuildSurfaceModel
      ?? safeProject.state?.splitWorkspaceLiveBuildSurfaceModel,
  );
}

function resolveBuildProgressionStateMachine(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.buildProgressionStateMachine
      ?? safeProject.context?.buildProgressionStateMachine
      ?? safeProject.state?.buildProgressionStateMachine,
  );
}

function resolveClassSpecificSurfaceEvolutionRules(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.classSpecificSurfaceEvolutionRules
      ?? safeProject.context?.classSpecificSurfaceEvolutionRules
      ?? safeProject.aiDesignRequest?.classSpecificSurfaceEvolutionRules,
  );
}

function resolveLocalWorkspaceContract(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.localWorkspaceContract
      ?? safeProject.context?.localWorkspaceContract
      ?? safeProject.state?.localWorkspaceContract,
  );
}

function resolveDesktopShellScopeContract(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.desktopShellScopeContract
      ?? safeProject.context?.desktopShellScopeContract
      ?? safeProject.state?.desktopShellScopeContract,
  );
}

function resolveClassAwareRuntimeResolver(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.classAwareRuntimeResolver
      ?? safeProject.context?.classAwareRuntimeResolver
      ?? safeProject.state?.classAwareRuntimeResolver,
  );
}

function resolveClassAwarePackagingPreviewContract(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.classAwarePackagingPreviewContract
      ?? safeProject.context?.classAwarePackagingPreviewContract
      ?? safeProject.state?.classAwarePackagingPreviewContract,
  );
}

function resolveReleaseableProductStateContract(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.releaseableProductStateContract
      ?? safeProject.context?.releaseableProductStateContract
      ?? safeProject.state?.releaseableProductStateContract,
  );
}

function resolveLoopTaskSignal(project) {
  const approvals = normalizeArray(project.approvals);
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const blockedTask = roadmap.find((task) => task.status === "blocked");
  const assignedTask = roadmap.find((task) => task.status === "assigned");
  const title = approvals[0] ?? assignedTask?.summary ?? blockedTask?.summary ?? "כרגע אין משימה פעילה";
  const reason = blockedTask
    ? `זה תקוע בגלל: ${normalizeArray(blockedTask.dependencies).join(", ") || "חסר מידע"}`
    : approvals[0]
      ? "יש כאן החלטה אחת שמחזיקה את ההתקדמות."
      : "זה הצעד הכי ישיר להמשיך ממנו עכשיו.";

  return {
    title,
    reason,
    assignedTask,
    blockedTask,
  };
}

function containsRuntimeShellLeak(value = "") {
  const text = normalizeString(value).toLowerCase();
  return /initialize-|agent-runtime|recommended defaults are still provisional/.test(text);
}

function buildInternalToolExecutionFallback({
  project = null,
  artifactExpectation = null,
  generationIntent = null,
} = {}) {
  const expectation = normalizeObject(artifactExpectation);
  if (expectation.projectType !== "internal-tool") {
    return null;
  }

  const title = normalizeString(expectation.title) || "משטח עבודה פנימי";
  const focusAreas = normalizeArray(expectation.proofFocus)
    .map((item) => normalizeString(item))
    .filter(Boolean);
  const primaryFocus = focusAreas[0] ?? "בעלות גלויה על התור";
  const secondaryFocus = focusAreas[1] ?? "רמת שירות ברורה על כל בקשה";
  const tertiaryFocus = focusAreas[2] ?? "הפעולה הבאה שניתנת לביצוע מיד";
  const generationGoal = normalizeString(normalizeObject(generationIntent).generationGoal)
    || normalizeString(expectation.continuityLine)
    || normalizeString(expectation.summary)
    || "Nexus משלים עכשיו את סביבת העבודה הראשונה לפני ההוכחה.";

  return {
    missionTitle: `מכינים את ${title}`,
    detail: generationGoal,
    statusItems: [
      { label: "ננעל כיוון משטח העבודה עבור הצוות", status: "done" },
      { label: `ממקמים ${primaryFocus}`, status: "done" },
      { label: `מכינים ${secondaryFocus}`, status: "active" },
      { label: `ה־Proof הבא יראה ${tertiaryFocus}`, status: "pending" },
    ],
    liveItems: [
      `מגדיר ${primaryFocus}`,
      `מכין ${secondaryFocus}`,
      `מסיים את ${title} לקראת Proof`,
      `מוביל אל ${tertiaryFocus}`,
    ],
    logItems: [
      { time: "עכשיו", message: `נexus משלים את ${title} לפני Proof.` },
      { time: "עכשיו", message: `היעד הקרוב: ${primaryFocus}.` },
      { time: "עכשיו", message: `עוד רגע נראה ${tertiaryFocus}.` },
    ],
  };
}

function buildCommerceOpsExecutionFallback({
  artifactExpectation = null,
  generationIntent = null,
} = {}) {
  const expectation = normalizeObject(artifactExpectation);
  if (expectation.projectType !== "commerce-ops") {
    return null;
  }

  const title = normalizeString(expectation.title) || "Commerce workspace";
  const focusAreas = normalizeArray(expectation.proofFocus)
    .map((item) => normalizeString(item))
    .filter(Boolean);
  const primaryFocus = focusAreas[0] ?? "תור הזמנות פעיל";
  const secondaryFocus = focusAreas[1] ?? "מצב קטלוג ומלאי גלוי";
  const tertiaryFocus = focusAreas[2] ?? "פעולה תפעולית אחת שאפשר לבצע מיד";
  const generationGoal = normalizeString(normalizeObject(generationIntent).generationGoal)
    || normalizeString(expectation.continuityLine)
    || normalizeString(expectation.summary)
    || "Nexus משלים עכשיו את מרחב המסחר והתפעול הראשון לפני ההוכחה.";

  return {
    missionTitle: `מכינים את ${title}`,
    detail: generationGoal,
    statusItems: [
      { label: "ננעל כיוון מסחרי־תפעולי ראשון", status: "done" },
      { label: `ממקמים ${primaryFocus}`, status: "done" },
      { label: `מכינים ${secondaryFocus}`, status: "active" },
      { label: `ה־Proof הבא יראה ${tertiaryFocus}`, status: "pending" },
    ],
    liveItems: [
      `מייצב ${primaryFocus}`,
      `מכין ${secondaryFocus}`,
      `מסיים את ${title} לקראת Proof`,
      `מוביל אל ${tertiaryFocus}`,
    ],
    logItems: [
      { time: "עכשיו", message: `Nexus משלים את ${title} לפני Proof.` },
      { time: "עכשיו", message: `היעד הקרוב: ${primaryFocus}.` },
      { time: "עכשיו", message: `עוד רגע נראה ${tertiaryFocus}.` },
    ],
  };
}

export function buildExecutionLiveViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const taskSignal = resolveLoopTaskSignal(safeProject);
  const artifactExpectation = resolveArtifactExpectation(safeProject);
  const generationIntent = resolveGenerationIntent(safeProject);
  const classSpecificSurfaceEvolutionRules = resolveClassSpecificSurfaceEvolutionRules(safeProject);
  const localWorkspaceContract = resolveLocalWorkspaceContract(safeProject);
  const desktopShellScopeContract = resolveDesktopShellScopeContract(safeProject);
  const classAwareRuntimeResolver = resolveClassAwareRuntimeResolver(safeProject);
  const classAwarePackagingPreviewContract = resolveClassAwarePackagingPreviewContract(safeProject);
  const releaseableProductStateContract = resolveReleaseableProductStateContract(safeProject);
  const repeatedLoopContinuation = resolveRepeatedLoopContinuation(safeProject);
  const splitWorkspaceLiveBuildSurfaceModel = resolveSplitWorkspaceLiveBuildSurfaceModel(safeProject);
  const buildProgressionStateMachine = resolveBuildProgressionStateMachine(safeProject);
  const progressState = normalizeObject(safeProject.progressState);
  const reactiveWorkspaceState = normalizeObject(safeProject.reactiveWorkspaceState);
  const liveLogStream = normalizeObject(safeProject.liveLogStream);
  const realtimeEvents = normalizeArray(safeProject.realtimeEventStream?.events);
  const commandOutputs = normalizeArray(liveLogStream.commandOutputs);
  const stdoutEntries = normalizeArray(liveLogStream.streams?.stdout);
  const roadmap = normalizeArray(safeProject.cycle?.roadmap);
  const useRepeatedLoopContinuation = repeatedLoopContinuation.active === true && (
    !taskSignal.assignedTask
      || containsRuntimeShellLeak(taskSignal.title)
      || stdoutEntries.some((entry) => containsRuntimeShellLeak(entry?.message))
      || commandOutputs.some((entry) => containsRuntimeShellLeak(entry?.message))
  );
  const useArtifactFallback = !taskSignal.assignedTask
    && !taskSignal.blockedTask
    && normalizeArray(safeProject.approvals).length === 0;
  const internalToolFallback = useArtifactFallback
    ? buildInternalToolExecutionFallback({
        project: safeProject,
        artifactExpectation,
        generationIntent,
      })
    : null;
  const commerceOpsFallback = useArtifactFallback
    ? buildCommerceOpsExecutionFallback({
        artifactExpectation,
        generationIntent,
      })
    : null;

  const statusCandidates = [
    ...commandOutputs.slice(-2).reverse().map((entry) => ({
      label: escapeText(entry.message, "צעד שהושלם"),
      status: "done",
    })),
    ...stdoutEntries.slice(-2).reverse().map((entry) => ({
      label: escapeText(entry.message, "שלב בביצוע"),
      status: "active",
    })),
    ...roadmap.filter((task) => task.status === "assigned").slice(0, 2).map((task) => ({
      label: escapeText(task.summary, "משימה פעילה"),
      status: "active",
    })),
    ...roadmap.filter((task) => task.status === "blocked").slice(0, 2).map((task) => ({
      label: escapeText(task.summary, "ממתין"),
      status: "pending",
    })),
  ];

  const liveCandidates = [
    ...stdoutEntries.slice(-2).reverse().map((entry) => escapeText(entry.message)),
    ...realtimeEvents.slice(-2).reverse().map((entry) => escapeText(entry.message)),
  ].filter(Boolean);

  const logCandidates = [
    ...realtimeEvents.slice(-3).reverse().map((entry) => ({
      time: escapeText(entry.timestamp ?? entry.eventTime, "עכשיו"),
      message: escapeText(entry.message, "אירוע חי"),
    })),
    ...commandOutputs.slice(-2).reverse().map((entry) => ({
      time: escapeText(entry.timestamp, "runtime"),
      message: escapeText(entry.message, "Command output"),
    })),
  ];

  const repeatedExecution = normalizeObject(repeatedLoopContinuation.execution);
  const fallbackTitle = useRepeatedLoopContinuation
    ? repeatedExecution.missionTitle
    : commerceOpsFallback?.missionTitle ?? internalToolFallback?.missionTitle;
  const fallbackDetail = useRepeatedLoopContinuation
    ? repeatedExecution.detail
    : commerceOpsFallback?.detail ?? internalToolFallback?.detail;
  const fallbackStatusItems = useRepeatedLoopContinuation
    ? normalizeArray(repeatedExecution.statusItems)
    : commerceOpsFallback?.statusItems ?? internalToolFallback?.statusItems;
  const fallbackLiveItems = useRepeatedLoopContinuation
    ? normalizeArray(repeatedExecution.liveItems)
    : commerceOpsFallback?.liveItems ?? internalToolFallback?.liveItems;
  const fallbackLogItems = useRepeatedLoopContinuation
    ? normalizeArray(repeatedExecution.logItems)
    : commerceOpsFallback?.logItems ?? internalToolFallback?.logItems;

  return {
    title: "מבצעים את המשימה",
    subtitle: qaMode
      ? "זה מצב QA זמני לבדיקת execution גם בלי runtime מלא."
      : "המערכת פועלת עכשיו על המשימה שנבחרה לך.",
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "QA preview override" : "Nexus עובד עכשיו",
    detail: fallbackDetail ?? taskSignal.reason,
    missionTitle: fallbackTitle ?? taskSignal.title,
    workspaceSurfaceModel: {
      workspaceFamily: escapeText(splitWorkspaceLiveBuildSurfaceModel.workspaceFamily, "generic-project-workspace"),
      previewFrameFamily: escapeText(splitWorkspaceLiveBuildSurfaceModel.previewFrameFamily, "generic-preview"),
      buildSurfaceFamily: escapeText(splitWorkspaceLiveBuildSurfaceModel.buildSurfaceFamily, "generic-surface"),
      buildSurfaceTitle: escapeText(splitWorkspaceLiveBuildSurfaceModel.regions?.build?.title, "ה־build surface עוד מתגבש"),
      buildSurfaceDetail: escapeText(splitWorkspaceLiveBuildSurfaceModel.regions?.build?.detail, "ה־workspace צריך להראות build progression אמיתי מול המשתמש."),
      orchestrationEmphasis: escapeText(splitWorkspaceLiveBuildSurfaceModel.regions?.orchestration?.emphasis, "mission-and-next-move"),
      runtimeDirection: escapeText(splitWorkspaceLiveBuildSurfaceModel.runtimeFamily, "generic-runtime"),
      releasePathFamily: escapeText(splitWorkspaceLiveBuildSurfaceModel.releasePathFamily, "private-deployment"),
      visibleMilestones: normalizeArray(splitWorkspaceLiveBuildSurfaceModel.regions?.build?.visibleMilestones)
        .map((item) => escapeText(item))
        .filter(Boolean)
        .slice(0, 3),
    },
    buildProgressionStateMachine: {
      currentLabel: escapeText(buildProgressionStateMachine.summary?.currentLabel, "השלב הפעיל עוד לא ננעל"),
      currentRouteKey: escapeText(buildProgressionStateMachine.summary?.currentRouteKey, "execution"),
      overlayStatus: escapeText(buildProgressionStateMachine.overlayStatus, "pending"),
      states: normalizeArray(buildProgressionStateMachine.states).map((state) => ({
        stateId: escapeText(state.stateId),
        label: escapeText(state.label),
        routeKey: escapeText(state.routeKey),
        status: escapeText(state.status, "pending"),
      })),
    },
    classSpecificSurfaceEvolutionRules: {
      evolutionFamily: escapeText(classSpecificSurfaceEvolutionRules.evolutionFamily, "generic-evolution"),
      frontendSurfaceType: escapeText(classSpecificSurfaceEvolutionRules.frontendSurfaceType, "generic-preview"),
      backendStateType: escapeText(classSpecificSurfaceEvolutionRules.backendStateType, "generic-state"),
      sceneType: escapeText(classSpecificSurfaceEvolutionRules.sceneType, "overview-sequence"),
      visibleEvolutionRule: escapeText(
        classSpecificSurfaceEvolutionRules.visibleEvolutionRule,
        "overview and next step must evolve visibly",
      ),
      requiredVisibleChanges: normalizeArray(classSpecificSurfaceEvolutionRules.requiredVisibleChanges)
        .map((item) => escapeText(item))
        .filter(Boolean)
        .slice(0, 4),
    },
    localWorkspaceContract: {
      workspaceMode: escapeText(localWorkspaceContract.workspaceMode, "browser-backed-local-workspace"),
      desktopShellStatus: escapeText(localWorkspaceContract.desktopShellStatus, "deferred-to-w4-mbn-010"),
      currentWorkspaceKey: escapeText(localWorkspaceContract.identity?.currentWorkspaceKey, "workspace"),
      buildRouteKey: escapeText(localWorkspaceContract.identity?.buildRouteKey, "execution"),
      resumeWorkspace: escapeText(localWorkspaceContract.continuity?.resumeWorkspace, "workspace"),
      continuitySource: escapeText(localWorkspaceContract.continuity?.continuitySource, "workspace-navigation"),
      continuityGuarantees: normalizeArray(localWorkspaceContract.continuity?.continuityGuarantees)
        .map((item) => escapeText(item))
        .filter(Boolean)
        .slice(0, 5),
      localAwarenessRequirements: normalizeArray(localWorkspaceContract.localAwareness?.localAwarenessRequirements)
        .map((item) => escapeText(item))
        .filter(Boolean)
        .slice(0, 5),
    },
    desktopShellScopeContract: {
      shellFamily: escapeText(desktopShellScopeContract.shellFamily, "browser-backed-shell"),
      shellStatus: escapeText(desktopShellScopeContract.shellStatus, "scope-defined-not-implemented"),
      currentWave4Path: escapeText(desktopShellScopeContract.shellPathDecision?.currentWave4Path, "browser-backed-local-workspace"),
      preferredFutureShell: escapeText(desktopShellScopeContract.shellPathDecision?.preferredFutureShell, "desktop-wrapper-shell"),
      releaseWorkflowMode: escapeText(desktopShellScopeContract.runtimeBindings?.releaseWorkflowMode, "browser-to-cloud-handoff"),
      obligations: normalizeArray(desktopShellScopeContract.obligations)
        .map((item) => escapeText(item))
        .filter(Boolean)
        .slice(0, 5),
    },
    classAwareRuntimeResolver: {
      runtimeFamily: escapeText(classAwareRuntimeResolver.runtimeFamily, "generic-runtime"),
      packagingFamily: escapeText(classAwareRuntimeResolver.packagingFamily, "generic-package"),
      releasePathFamily: escapeText(classAwareRuntimeResolver.releasePathFamily, "private-deployment"),
      previewFamily: escapeText(classAwareRuntimeResolver.previewFamily, "generic-preview"),
      targetPlatform: escapeText(classAwareRuntimeResolver.targetPlatform, "generic"),
      preferredReleaseTarget: escapeText(classAwareRuntimeResolver.preferredReleaseTarget, "private-deployment"),
      shellPath: escapeText(classAwareRuntimeResolver.shellPath, "browser-backed-local-workspace"),
      visibleRuntimeRule: escapeText(classAwareRuntimeResolver.visibleRuntimeRule, "runtime path must stay visible before execution advances"),
      projectFacingPath: escapeText(classAwareRuntimeResolver.summary?.projectFacingPath, "generic-runtime -> private-deployment"),
      packagingPath: escapeText(classAwareRuntimeResolver.summary?.packagingPath, "generic-preview -> generic-package"),
    },
    classAwarePackagingPreviewContract: {
      previewFamily: escapeText(classAwarePackagingPreviewContract.previewFamily, "generic-preview"),
      previewMode: escapeText(classAwarePackagingPreviewContract.previewMode, "generic-preview"),
      previewSurface: escapeText(classAwarePackagingPreviewContract.previewSurface, "generic-preview-surface"),
      previewArtifact: escapeText(classAwarePackagingPreviewContract.previewArtifact, "generic-surface-preview"),
      packageMode: escapeText(classAwarePackagingPreviewContract.packageMode, "generic-package"),
      packagingFamily: escapeText(classAwarePackagingPreviewContract.packagingFamily, "generic-package"),
      packageArtifactType: escapeText(classAwarePackagingPreviewContract.packageArtifactType, "generic-delivery-bundle"),
      preferredReleaseTarget: escapeText(classAwarePackagingPreviewContract.preferredReleaseTarget, "private-deployment"),
      shellPath: escapeText(classAwarePackagingPreviewContract.shellPath, "browser-backed-local-workspace"),
      mobileArchivePath: escapeText(classAwarePackagingPreviewContract.mobileArchivePath),
      packagingExpectation: escapeText(classAwarePackagingPreviewContract.packagingExpectation, "preview/package mode remains explicit per class"),
      visiblePreviewRule: escapeText(classAwarePackagingPreviewContract.visiblePreviewRule, "preview must stay explicit before execution advances"),
      visiblePackagingRule: escapeText(classAwarePackagingPreviewContract.visiblePackagingRule, "packaging must stay explicit before release claims advance"),
      continuityRule: escapeText(classAwarePackagingPreviewContract.continuityRule, "preview/package mode must persist across reopen"),
      previewPath: escapeText(classAwarePackagingPreviewContract.summary?.previewPath, "generic-preview -> generic-preview"),
      packagePath: escapeText(classAwarePackagingPreviewContract.summary?.packagePath, "generic-package -> private-deployment"),
    },
    releaseableProductStateContract: {
      status: escapeText(releaseableProductStateContract.status, "not-ready"),
      stateFamily: escapeText(releaseableProductStateContract.stateFamily, "releaseable-product-state"),
      readinessDecision: escapeText(releaseableProductStateContract.readinessDecision, "not-ready"),
      releaseTarget: escapeText(releaseableProductStateContract.releaseTarget, "private-deployment"),
      packageArtifactType: escapeText(releaseableProductStateContract.packageArtifactType, "generic-delivery-bundle"),
      packagePath: escapeText(releaseableProductStateContract.packagePath, "generic-package -> private-deployment"),
      previewPath: escapeText(releaseableProductStateContract.previewPath, "generic-preview -> generic-preview"),
      packagingExpectation: escapeText(releaseableProductStateContract.packagingExpectation, "release path must stay visible as product-facing truth"),
      continuityRule: escapeText(releaseableProductStateContract.continuityRule, "releaseable state must survive reopen, route restore, and the next continuation loop"),
      visibleStateRule: escapeText(releaseableProductStateContract.visibleStateRule, "releaseable state must be visible before progression claims advance"),
      blockedReasons: normalizeArray(releaseableProductStateContract.blockedReasons).map((item) => escapeText(item)).filter(Boolean).slice(0, 4),
      visibleChecks: normalizeArray(releaseableProductStateContract.visibleChecks).map((item) => ({
        checkId: escapeText(item.checkId, "unknown-check"),
        status: escapeText(item.status, "failed"),
        reason: escapeText(item.reason),
      })).slice(0, 4),
      label: escapeText(releaseableProductStateContract.summary?.label, "Not releaseable yet"),
      nextAction: escapeText(releaseableProductStateContract.summary?.nextAction, "resolve-release-readiness-gaps"),
      readinessScore: String(releaseableProductStateContract.summary?.readinessScore ?? 0),
    },
    progressPercent: reactiveWorkspaceState.progressBar?.percent ?? progressState.percent ?? 0,
    stats: [
      { label: "התקדמות", value: `${reactiveWorkspaceState.progressBar?.percent ?? progressState.percent ?? 0}%` },
      { label: "לוגים", value: String(liveLogStream.summary?.totalEntries ?? 0) },
      { label: "אירועים חיים", value: String(realtimeEvents.length) },
    ],
    statusItems: fallbackStatusItems ?? (statusCandidates.length ? statusCandidates : [
      { label: "מחקר ואיסוף מידע", status: "done" },
      { label: "בניית תוכנית פעולה", status: "done" },
      { label: taskSignal.title || "יצירת Landing page", status: "active" },
      { label: "בדיקות ואופטימיזציה", status: "pending" },
    ]).slice(0, 5),
    liveItems: fallbackLiveItems ?? (liveCandidates.length ? liveCandidates : [
      "יוצר Landing page...",
      "מוסיף טופס הרשמה...",
      "מחבר מעקב...",
      "בודק תקינות...",
    ]).slice(0, 4),
    logItems: fallbackLogItems ?? (logCandidates.length ? logCandidates : [
      { time: "10:42", message: "יצירת טיוטה ראשונית" },
      { time: "10:41", message: "הוספת טופס הרשמה" },
      { time: "10:40", message: "חיבור Google Analytics" },
    ]).slice(0, 4),
    proofAction: { label: "הצג הוכחה כשמוכן ←", target: "proof" },
    stopAction: { label: "עצור ביצוע", supported: false },
  };
}
