import { buildArtifactTruthViewModel } from "./shared-proof-artifact.js";

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

export function buildTimelineViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifactTruth = buildArtifactTruthViewModel(safeProject);
  const entries = resolveTimelineEntries(safeProject);
  const crossSurfaceContinuityContract = resolveCrossSurfaceContinuityContract(safeProject);
  const wave4LiveVerificationMatrix = resolveWave4LiveVerificationMatrix(safeProject);
  const canonicalLearningSystemContract = resolveCanonicalLearningSystemContract(safeProject);
  const learningDecisionImpact = resolveLearningDecisionImpact(safeProject);

  return {
    title: "איך התוצר התקדם עד כאן",
    subtitle: qaMode
      ? "זה מצב QA זמני למסך timeline גם בלי history מלא מה־runtime."
      : "רצף ההתקדמות של הפרויקט, עם התוצר האחרון והאירועים שהביאו אותנו עד לכאן.",
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "QA preview override" : "ציר עבודה",
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
    stats: buildStats(safeProject, entries),
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
