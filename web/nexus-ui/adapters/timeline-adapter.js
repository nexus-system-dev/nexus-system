import { buildArtifactTruthViewModel } from "./shared-proof-artifact.js";
import { createHistorySurfaceCanonicalStructureContract } from "../contracts/history-surface-canonical-structure-contract.js";

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function escapeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function containsExecutionLeak(value = "") {
  const text = escapeText(value, "").toLowerCase();
  return [
    "agent-runtime",
    "bootstrap validation failed",
    "recommended defaults are still provisional",
    "journey-onboarding-initialization",
    "validation",
    "apply",
    "invalid",
    "blocked",
    "invoked ",
    "artifact",
  ].some((token) => text.includes(token));
}

function sanitizeTimelineCopy(value = "", fallback = "") {
  const text = escapeText(value, fallback);
  if (!text) {
    return fallback;
  }
  if (containsExecutionLeak(text)) {
    return fallback;
  }
  return text;
}

function mapEventTypeLabel(type) {
  const map = {
    "task.assigned": "משימה",
    "task.completed": "משימה",
    "task.failed": "משימה",
    "roadmap.generated": "אבן דרך",
    "state.updated": "עדכון מצב",
  };
  return map[type] ?? "אירוע";
}

function mapEventTone(type) {
  if (type === "state.updated" || type === "task.completed") {
    return "success";
  }
  if (type === "task.failed") {
    return "warning";
  }
  return "primary";
}

function mapEventGlyph(type) {
  if (type === "state.updated" || type === "task.completed") {
    return "✓";
  }
  if (type === "roadmap.generated") {
    return "◷";
  }
  if (type === "task.failed") {
    return "!";
  }
  return "→";
}

function resolveTimelineEntries(project) {
  const events = normalizeArray(project.events);
  const liveEvents = normalizeArray(project.realtimeEventStream?.events).map((event) => ({
    type: event.status === "done" ? "state.updated" : "task.assigned",
    payload: { task: { summary: event.message } },
    timestamp: event.timestamp,
  }));
  const combined = [...events, ...liveEvents].filter((event) => {
    const payload = normalizeObject(event.payload);
    const task = normalizeObject(payload.task);
    return !containsExecutionLeak(task.summary ?? event.message ?? payload.taskId ?? "");
  });

  const artifactTruth = buildArtifactTruthViewModel(project);
  const artifactEntry = artifactTruth.artifact?.artifactId
    ? [{
        id: `artifact-${artifactTruth.artifact.artifactId}`,
        title: artifactTruth.title,
        description: artifactTruth.subtitle,
        timestamp: "השלב האחרון",
        kind: "תוצר",
        tone: "success",
        glyph: "◫",
      }]
    : [];

  const entries = [...artifactEntry, ...combined
    .slice()
    .reverse()
    .slice(0, 8)
    .map((event, index) => {
      const payload = normalizeObject(event.payload);
      const task = normalizeObject(payload.task);
      const title = sanitizeTimelineCopy(
        task.summary ?? payload.taskId ?? payload.projectId,
        "צעד שמקדם את התוצר",
      );
      const type = escapeText(event.type, "event");
      return {
        id: `${type}-${index}`,
        title,
        description: buildEntryDescription(event, payload),
        timestamp: escapeText(event.timestamp ?? payload.eventTime, "לא ידוע"),
        kind: mapEventTypeLabel(type),
        tone: mapEventTone(type),
        glyph: mapEventGlyph(type),
      };
    })];

  return entries.length
    ? entries
    : [
        {
          id: "fallback-understanding",
          title: "הבנת הפרויקט הושלמה",
          description: "אושרו קהל היעד, הבעיה והפתרון כדי להתחיל לעבוד.",
          timestamp: "לאחרונה",
          kind: "אבן דרך",
          tone: "success",
          glyph: "✓",
        },
      ];
}

function buildEntryDescription(event, payload) {
  const task = normalizeObject(payload.task);
  if (task.summary) {
    return sanitizeTimelineCopy(task.summary, "בוצע צעד שמקדם את התוצר קדימה.");
  }
  if (event.message) {
    return sanitizeTimelineCopy(event.message, "האירוע הזה קידם את התוצר ונשמר ברצף ההתקדמות.");
  }
  if (payload.taskId) {
    return "האירוע הזה נשמר סביב משימה פעילה בלולאה.";
  }
  if (payload.projectId) {
    return "האירוע נשמר בהיסטוריית הפרויקט ונשאר זמין לחזרה לאחור.";
  }
  return "האירוע נשמר בהיסטוריית הפרויקט.";
}

function buildStats(project, entries) {
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const completedTasks = roadmap.filter((task) => task.status === "done").length;
  const milestones = entries.filter((entry) => entry.kind === "אבן דרך" || entry.kind === "עדכון מצב").length;
  const filesCount = normalizeArray(project.generatedFiles ?? project.files).length
    || normalizeArray(project.generatedSurfaceProofSchema?.files).length
    || 0;
  const liveCount = normalizeArray(project.realtimeEventStream?.events).length;

  return [
    { label: "משימות הושלמו", value: String(completedTasks || Math.max(entries.length - 1, 1)) },
    { label: "אבני דרך", value: String(milestones || 1) },
    { label: "קבצים נוצרו", value: String(filesCount) },
    { label: "אירועים חיים", value: String(liveCount) },
  ];
}

function buildHistorySurfaceModel(project, entries, artifactTruth, stats) {
  const projectName = escapeText(project.name, "פרויקט Nexus");
  const goal = escapeText(project.goal, "מוצר שנבנה בתוך Nexus");
  const latestEntry = entries[0] ?? {};
  const artifactTitle = escapeText(artifactTruth.title, "התוצר האחרון");
  const currentStatus = escapeText(project.status, "working");
  const roadmap = normalizeArray(project.cycle?.roadmap);
  const snapshots = normalizeArray(project.snapshots ?? project.snapshotHistory ?? project.state?.snapshots);
  const meaningfulEntries = entries.slice(0, 6).map((entry) => ({
    id: escapeText(entry.id, "history-entry"),
    title: escapeText(entry.title, "שינוי משמעותי נשמר"),
    body: escapeText(entry.description, "Nexus שמרה את השינוי כחלק מזיכרון המוצר."),
    label: escapeText(entry.kind, "שינוי"),
    time: escapeText(entry.timestamp, "לאחרונה"),
    tone: escapeText(entry.tone, "primary"),
  }));

  const fallbackCheckpoint = {
    id: "current-product-state",
    title: "נקודת החזרה הנוכחית",
    body: `${projectName} נשמר עם ההקשר האחרון וניתן לחזור ממנו לבנייה.`,
    state: currentStatus,
  };

  const checkpointCandidates = snapshots.length
    ? snapshots.slice(0, 3).map((snapshot, index) => ({
        id: escapeText(snapshot.id ?? snapshot.snapshotId, `snapshot-${index + 1}`),
        title: escapeText(snapshot.title ?? snapshot.name, `נקודת חזרה ${index + 1}`),
        body: escapeText(snapshot.description ?? snapshot.summary, "נשמרה נקודת מצב שאפשר לחזור אליה בהמשך."),
        state: escapeText(snapshot.status ?? snapshot.state, "saved"),
      }))
    : [fallbackCheckpoint];

  const roadmapSnapshots = roadmap.slice(0, 3).map((task, index) => ({
    id: escapeText(task.id ?? task.taskId, `version-${index + 1}`),
    title: escapeText(task.title ?? task.summary, `גרסת עבודה ${index + 1}`),
    body: escapeText(task.description ?? task.status, "חלק מהתקדמות המוצר שנשמרה ברצף."),
  }));

  return {
    currentState: {
      projectName,
      title: "מה נשמר מהדרך עד עכשיו",
      body: `${artifactTitle} נשמר יחד עם ההקשר של ${goal}.`,
      statusLabel: currentStatus === "released" ? "שוחרר" : "נשמר לעבודה",
      lastMeaningfulChange: escapeText(latestEntry.title, "הבנת המוצר והשלד הראשון נשמרו"),
    },
    changeLog: meaningfulEntries,
    restoreCheckpoints: checkpointCandidates,
    continuityThread: [
      `ההקשר של ${projectName} ממשיך מהשיחה והבנייה לאותו workspace.`,
      "השינויים המשמעותיים נשמרים כזיכרון מוצר, לא כרשימת אירועים טכנית.",
      "אפשר לחזור לבנייה בלי לאבד את ההחלטות האחרונות.",
    ],
    versionSnapshots: roadmapSnapshots.length
      ? roadmapSnapshots
      : [
          {
            id: "first-saved-version",
            title: "גרסת המוצר הנוכחית",
            body: "הגרסה הנוכחית נשמרה כנקודת המשך עד שייכנסו גרסאות נוספות.",
          },
        ],
    returnToBuild: {
      label: "חזור לבנייה",
      body: "חזרה לסביבת הבנייה ממשיכה מאותו הקשר שמופיע כאן.",
      target: "loop",
    },
    stats,
  };
}

function resolveCrossSurfaceContinuityContract(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.crossSurfaceContinuityContract
      ?? safeProject.context?.crossSurfaceContinuityContract
      ?? safeProject.state?.crossSurfaceContinuityContract,
  );
}

function resolveWave4LiveVerificationMatrix(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.wave4LiveVerificationMatrix
      ?? safeProject.context?.wave4LiveVerificationMatrix
      ?? safeProject.state?.wave4LiveVerificationMatrix,
  );
}

function resolveCanonicalLearningSystemContract(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.canonicalLearningSystemContract
      ?? safeProject.context?.canonicalLearningSystemContract
      ?? safeProject.state?.canonicalLearningSystemContract,
  );
}

function resolveLearningDecisionImpact(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.learningDecisionImpact
      ?? safeProject.context?.learningDecisionImpact
      ?? safeProject.state?.learningDecisionImpact
      ?? safeProject.canonicalLearningSystemContract?.learningDecisionImpact
      ?? safeProject.context?.canonicalLearningSystemContract?.learningDecisionImpact,
  );
}

function resolveHistoryContinuityAgent(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.historyContinuityAgent
      ?? safeProject.context?.historyContinuityAgent
      ?? safeProject.state?.historyContinuityAgent,
  );
}

function mapHistoryAgentChangeLog(agent = {}, fallbackEntries = []) {
  const productHistory = normalizeArray(agent.productHistory);
  const source = productHistory.length ? productHistory : fallbackEntries;
  return source.slice(0, 6).map((entry, index) => {
    const summary = normalizeObject(entry.changeSummary);
    const label = entry.eventType === "pending-approval"
      ? "ממתין לאישור"
      : entry.requiresCheckpoint
        ? "שינוי משמעותי"
        : "שינוי מוצר";
    return {
      id: escapeText(entry.eventId ?? entry.id, `history-agent-entry-${index + 1}`),
      title: escapeText(summary.after ?? entry.title, "שינוי מוצר נשמר"),
      body: escapeText(entry.userReply ?? summary.unchanged ?? entry.description, "Nexus שמרה את השינוי כחלק מזיכרון המוצר."),
      label,
      time: escapeText(entry.createdAt ?? entry.timestamp, "לאחרונה"),
      tone: entry.eventType === "failed-change" ? "warning" : entry.eventType === "pending-approval" ? "primary" : "success",
    };
  });
}

function mapHistoryAgentCheckpoints(agent = {}, fallbackCheckpoints = []) {
  const checkpoints = normalizeArray(agent.checkpoints);
  const source = checkpoints.length ? checkpoints : fallbackCheckpoints;
  return source.slice(0, 4).map((checkpoint, index) => ({
    id: escapeText(checkpoint.checkpointId ?? checkpoint.id, `checkpoint-${index + 1}`),
    title: escapeText(checkpoint.title, "נקודת חזרה"),
    body: escapeText(checkpoint.body, "אפשר לבדוק חזרה לנקודה הזו לפני שינוי אמת מוצר."),
    state: escapeText(checkpoint.restoreAvailability, "safe"),
    restoreImpact: normalizeObject(checkpoint.restoreImpact),
    productDomainModel: escapeText(checkpoint.productSnapshot?.productDomainSkeleton?.models?.[0]?.name, ""),
  }));
}

function mapHistoryAgentVersionSnapshots(agent = {}, fallbackSnapshots = []) {
  const checkpoints = normalizeArray(agent.checkpoints);
  const productHistory = normalizeArray(agent.productHistory);
  if (!checkpoints.length && !productHistory.length) {
    return fallbackSnapshots;
  }

  const checkpointVersions = checkpoints.slice(0, 4).map((checkpoint, index) => {
    const snapshot = normalizeObject(checkpoint.productSnapshot);
    const runtime = normalizeObject(snapshot.runtimeSkeletonTruth);
    const domain = normalizeObject(snapshot.productDomainSkeleton);
    const domainModel = escapeText(domain.models?.[0]?.name, escapeText(domain.domainModel?.name, "אמת מוצר"));
    const impact = normalizeObject(checkpoint.restoreImpact);
    const willRestore = normalizeArray(impact.willRestore);
    const willRemove = normalizeArray(impact.willRemove);
    return {
      id: escapeText(checkpoint.checkpointId, `history-version-${index + 1}`),
      taskId: "EXP-003",
      title: escapeText(runtime.title, escapeText(checkpoint.title, `גרסה ${index + 1}`)),
      body: escapeText(snapshot.goal, escapeText(checkpoint.body, "גרסת מוצר שמורה עם נקודת חזרה גלויה.")),
      status: checkpoint.restoreAvailability === "possible-with-impact" ? "דורשת בדיקת השפעה" : "שמורה לחזרה",
      restoreCheckpointId: escapeText(checkpoint.checkpointId, ""),
      rollbackBoundary: escapeText(impact.releaseImpact, "אין השפעת שחרור בשלב הזה."),
      productDomainModel: domainModel,
      willRestore,
      willRemove,
    };
  });

  const historyVersions = productHistory
    .filter((entry) => entry.requiresCheckpoint !== true)
    .slice(0, Math.max(0, 4 - checkpointVersions.length))
    .map((entry, index) => ({
      id: escapeText(entry.eventId ?? entry.id, `history-change-version-${index + 1}`),
      taskId: "EXP-003",
      title: escapeText(entry.changeSummary?.after, "שינוי קטן נשמר"),
      body: escapeText(entry.userReply, "השינוי נשמר כחלק מגרסת העבודה הנוכחית."),
      status: "שינוי שמור",
      restoreCheckpointId: "",
      rollbackBoundary: "אין השפעת שחרור בשלב הזה.",
      productDomainModel: "",
      willRestore: normalizeArray(entry.restoreImpact?.willRestore),
      willRemove: normalizeArray(entry.restoreImpact?.willRemove),
    }));

  return [...checkpointVersions, ...historyVersions].length
    ? [...checkpointVersions, ...historyVersions]
    : fallbackSnapshots;
}

export function buildTimelineViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifactTruth = buildArtifactTruthViewModel(safeProject);
  const entries = resolveTimelineEntries(safeProject);
  const stats = buildStats(safeProject, entries);
  const contract = createHistorySurfaceCanonicalStructureContract();
  const history = buildHistorySurfaceModel(safeProject, entries, artifactTruth, stats);
  const historyContinuityAgent = resolveHistoryContinuityAgent(safeProject);
  if (historyContinuityAgent.taskId === "HIST-AGT-001") {
    history.changeLog = mapHistoryAgentChangeLog(historyContinuityAgent, history.changeLog);
    history.restoreCheckpoints = mapHistoryAgentCheckpoints(historyContinuityAgent, history.restoreCheckpoints);
    history.continuityThread = [
      escapeText(historyContinuityAgent.currentSummary, "נשמר רצף עבודה שאפשר להמשיך ממנו."),
      "שיחה, מוצר ושינוי מופרדים כדי שהמשתמש יבין מה קרה בלי לראות פרטים פנימיים.",
      escapeText(historyContinuityAgent.continuityAction?.summary, "המשך העבודה חוזר לאותו פרויקט ולאותו הקשר."),
    ];
    history.currentState.lastMeaningfulChange = escapeText(history.changeLog[0]?.title, history.currentState.lastMeaningfulChange);
    history.versionSnapshots = mapHistoryAgentVersionSnapshots(historyContinuityAgent, history.versionSnapshots);
    history.returnToBuild = {
      ...history.returnToBuild,
      label: escapeText(historyContinuityAgent.continuityAction?.label, history.returnToBuild.label),
      target: escapeText(historyContinuityAgent.continuityAction?.target, history.returnToBuild.target),
    };
  }
  const crossSurfaceContinuityContract = resolveCrossSurfaceContinuityContract(safeProject);
  const wave4LiveVerificationMatrix = resolveWave4LiveVerificationMatrix(safeProject);
  const canonicalLearningSystemContract = resolveCanonicalLearningSystemContract(safeProject);
  const learningDecisionImpact = resolveLearningDecisionImpact(safeProject);
  const dataOwnershipBoundary = normalizeObject(
    safeProject.dataOwnershipBoundary
      ?? safeProject.context?.dataOwnershipBoundary
      ?? safeProject.state?.dataOwnershipBoundary,
  );

  return {
    title: "מה נשמר מהדרך עד עכשיו",
    subtitle: "היסטוריה שמחזירה אותך להקשר, לשינויים ולנקודת החזרה הבטוחה.",
    projectName: safeProject.name ?? "Nexus",
    badge: qaMode ? "תצוגת בדיקה" : "זיכרון מוצר",
    contract,
    dataOwnershipBoundary,
    historyContinuityAgent: {
      taskId: escapeText(historyContinuityAgent.taskId, ""),
      agentId: escapeText(historyContinuityAgent.agentId, ""),
      status: escapeText(historyContinuityAgent.status, ""),
      responseSource: escapeText(historyContinuityAgent.responseSource, ""),
      currentSummary: escapeText(historyContinuityAgent.currentSummary, ""),
      conversationHistoryCount: escapeText(historyContinuityAgent.conversationHistoryCount, "0"),
      buildMutationHistoryCount: escapeText(historyContinuityAgent.buildMutationHistoryCount, "0"),
      restoreDecision: normalizeObject(historyContinuityAgent.restoreDecision),
      latestEvent: normalizeObject(historyContinuityAgent.latestEvent),
    },
    history,
    artifactTruth,
    entries,
    crossSurfaceContinuity: {
      statusLabel: escapeText(crossSurfaceContinuityContract.statusLabel, "הרצף בין המסכים עוד לא הוגדר"),
      visibleContinuityRule: escapeText(
        crossSurfaceContinuityContract.visibleContinuityRule,
        "build, proof, release, timeline, and continuation must stay visibly connected",
      ),
      explainablePath: escapeText(
        crossSurfaceContinuityContract.explainablePath,
        "execution:build -> proof:artifact -> proof:release-evidence -> execution:deployment-feedback -> next-task:continuation -> timeline:timeline",
      ),
      continuityChecks: normalizeArray(crossSurfaceContinuityContract.continuityChecks)
        .map((item) => escapeText(item))
        .filter(Boolean)
        .slice(0, 5),
      continuitySteps: normalizeArray(crossSurfaceContinuityContract.continuitySteps).map((step) => ({
        title: escapeText(step.title, "surface"),
        routeKey: escapeText(step.routeKey, "unknown-route"),
        visibleAnchor: escapeText(step.visibleAnchor, "not-yet-visible"),
        continuityRule: escapeText(step.continuityRule, "continuity must survive route restore"),
      })).slice(0, 6),
      restoreRule: escapeText(
        crossSurfaceContinuityContract.restoreRule,
        "cross-surface continuity must survive refresh, route restore, revisit, and transition back into execution",
      ),
    },
    wave4LiveVerificationMatrix: {
      statusLabel: escapeText(
        wave4LiveVerificationMatrix.statusLabel,
        "Wave 4 still lacks one deterministic live verification matrix",
      ),
      matrixRule: escapeText(
        wave4LiveVerificationMatrix.matrixRule,
        "every major Wave 4 capability must declare one visible route, one visible anchor, and restore checks before live reruns can close truthfully",
      ),
      strongerPreviewRule: escapeText(
        wave4LiveVerificationMatrix.strongerPreviewRule,
        "use the stronger preview path when available",
      ),
      restoreRule: escapeText(
        wave4LiveVerificationMatrix.restoreRule,
        "refresh, route restore, revisit, and transition checks must be explicit where product truth can silently break",
      ),
      summary: {
        totalLanes: escapeText(wave4LiveVerificationMatrix.summary?.totalLanes, "0"),
        executionRoutes: escapeText(wave4LiveVerificationMatrix.summary?.executionRoutes, "0"),
        proofRoutes: escapeText(wave4LiveVerificationMatrix.summary?.proofRoutes, "0"),
        restoreChecks: escapeText(wave4LiveVerificationMatrix.summary?.restoreChecks, "0"),
      },
      verificationLanes: normalizeArray(wave4LiveVerificationMatrix.verificationLanes).map((item) => ({
        laneId: escapeText(item.laneId, "unknown-lane"),
        title: escapeText(item.title, "Wave 4 capability"),
        routeKey: escapeText(item.routeKey, "unknown-route"),
        visibleAnchor: escapeText(item.visibleAnchor, "not-yet-visible"),
        verificationFocus: normalizeArray(item.verificationFocus).map((entry) => escapeText(entry)).filter(Boolean).slice(0, 3),
        passCriteria: normalizeArray(item.passCriteria).map((entry) => escapeText(entry)).filter(Boolean).slice(0, 2),
        restoreChecks: normalizeArray(item.restoreChecks).map((entry) => escapeText(entry)).filter(Boolean).slice(0, 2),
        strongerPreviewPath: escapeText(item.strongerPreviewPath, "qa-route-or-live-project"),
      })).slice(0, 10),
    },
    canonicalLearningSystemContract: {
      statusLabel: escapeText(
        canonicalLearningSystemContract.statusLabel,
        "Canonical learning system contract is not yet visible",
      ),
      contractRule: escapeText(
        canonicalLearningSystemContract.contractRule,
        "Nexus must separate project memory, user preference memory, and system learning before calling feedback a real learning system.",
      ),
      summary: {
        memoryLayers: escapeText(canonicalLearningSystemContract.summary?.memoryLayers, "0"),
        liveInputs: escapeText(canonicalLearningSystemContract.summary?.liveInputs, "0"),
        partialInputs: escapeText(canonicalLearningSystemContract.summary?.partialInputs, "0"),
        liveImpacts: escapeText(canonicalLearningSystemContract.summary?.liveImpacts, "0"),
        partialImpacts: escapeText(canonicalLearningSystemContract.summary?.partialImpacts, "0"),
        crossProjectPatterns: escapeText(canonicalLearningSystemContract.summary?.crossProjectPatterns, "0"),
      },
      memoryLayers: normalizeArray(canonicalLearningSystemContract.memoryLayers).map((item) => ({
        layerId: escapeText(item.layerId, "unknown-layer"),
        title: escapeText(item.title, "Learning layer"),
        status: escapeText(item.status, "next"),
        scope: escapeText(item.scope, "learning scope is not yet defined"),
        storedInputs: normalizeArray(item.storedInputs).map((entry) => escapeText(entry)).filter(Boolean).slice(0, 5),
        decisionImpact: normalizeArray(item.decisionImpact).map((entry) => escapeText(entry)).filter(Boolean).slice(0, 4),
        continuityRule: escapeText(item.continuityRule, "learning truth must survive restore"),
      })).slice(0, 3),
      decisionImpacts: normalizeArray(canonicalLearningSystemContract.decisionImpacts).map((item) => ({
        impactId: escapeText(item.impactId, "unknown-impact"),
        label: escapeText(item.label, "learning impact"),
        status: escapeText(item.status, "next"),
        currentEffect: escapeText(item.currentEffect, "not yet changing visible product behavior"),
        nextRequirement: escapeText(item.nextRequirement, "later implementation must prove this visibly"),
      })).slice(0, 8),
      continuityRules: normalizeArray(canonicalLearningSystemContract.continuityRules).map((item) => escapeText(item)).filter(Boolean).slice(0, 4),
      generationIntegrationRules: normalizeArray(canonicalLearningSystemContract.generationIntegrationRules).map((item) => escapeText(item)).filter(Boolean).slice(0, 3),
      explicitProhibitions: normalizeArray(canonicalLearningSystemContract.explicitProhibitions).map((item) => escapeText(item)).filter(Boolean).slice(0, 3),
      visibleProductExpectations: normalizeArray(canonicalLearningSystemContract.visibleProductExpectations).map((item) => escapeText(item)).filter(Boolean).slice(0, 4),
    },
    learningDecisionImpact: {
      statusLabel: escapeText(learningDecisionImpact.statusLabel, "learning impact עדיין לא משנה החלטות חיות"),
      strategy: escapeText(learningDecisionImpact.strategy, "not-yet-connected"),
      drivingSignals: normalizeArray(learningDecisionImpact.drivingSignals).map((item) => escapeText(item)).filter(Boolean).slice(0, 6),
      runtimeDecision: {
        label: escapeText(learningDecisionImpact.runtimeDecision?.label, "runtime decision not yet learning-driven"),
        currentEffect: escapeText(learningDecisionImpact.runtimeDecision?.currentEffect, "אין עדיין השפעה גלויה על runtime/package."),
      },
      releaseDecision: {
        label: escapeText(learningDecisionImpact.releaseDecision?.label, "release decision not yet learning-driven"),
        currentEffect: escapeText(learningDecisionImpact.releaseDecision?.currentEffect, "אין עדיין השפעה גלויה על release/deploy."),
      },
      continuationDecision: {
        title: escapeText(learningDecisionImpact.continuationDecision?.title, "continuation impact not yet learning-driven"),
        description: escapeText(learningDecisionImpact.continuationDecision?.description, "אין עדיין שינוי גלוי בהמשך הלולאה."),
        moves: normalizeArray(learningDecisionImpact.continuationDecision?.moves).map((item) => escapeText(item)).filter(Boolean).slice(0, 4),
      },
      nextTaskDecision: {
        title: escapeText(learningDecisionImpact.nextTaskDecision?.title, "next-task impact not yet learning-driven"),
        whyNow: escapeText(learningDecisionImpact.nextTaskDecision?.whyNow, "אין עדיין השפעה גלויה על next task selection."),
      },
      continuityRule: escapeText(
        learningDecisionImpact.continuityRule,
        "learning-driven decisions must survive revisit and route restore",
      ),
    },
    stats,
    primaryAction: {
      label: "חזור לצעד הנוכחי",
      target: "loop",
    },
    artifactAction: {
      label: artifactTruth.openAction.label,
      target: artifactTruth.openAction.target,
      supported: artifactTruth.openAction.supported,
    },
  };
}
