function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function cloneJson(value) {
  if (value === undefined) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function summarizeMutationRecord(record = {}, fallback = "שינוי מוצר נשמר.") {
  const summary = normalizeString(record.after)
    || normalizeString(record.summary)
    || normalizeString(record.visibleSummary)
    || normalizeString(record.changeSummary?.after)
    || fallback;
  return summary;
}

function classifyEventFromDecision(decision = {}, record = {}) {
  if (decision.status === "pending-approval") {
    return "pending-approval";
  }
  if (decision.status === "failed-safely") {
    return "failed-change";
  }
  if (decision.changeType === "visual") {
    return "visual-change";
  }
  if (decision.changeType === "product-truth") {
    return "product-truth-change";
  }
  if (record.requiresCheckpoint === true || record.checkpointRequired === true) {
    return "meaningful-change";
  }
  return "small-change";
}

function requiresCheckpoint(decision = {}, eventType = "") {
  return decision.requiresApproval === true
    || decision.changeType === "product-truth"
    || eventType === "pending-approval"
    || eventType === "meaningful-change";
}

function buildAffectedAreas({ decision = {}, record = {}, mutationTruth = {} } = {}) {
  const affected = normalizeObject(record.affectedAreas);
  return {
    screens: normalizeArray(affected.screens).length ? normalizeArray(affected.screens) : ["Build"],
    workflows: normalizeArray(affected.workflows).length ? normalizeArray(affected.workflows) : ["המשך בנייה"],
    regions: normalizeArray(affected.regions).length ? normalizeArray(affected.regions) : ["שלד מוצר"],
    design: normalizeArray(affected.design),
    productTruth: normalizeArray(affected.productTruth).length
      ? normalizeArray(affected.productTruth)
      : decision.requiresProductTruthMutation === true || mutationTruth.status === "applied"
        ? ["אמת מוצר"]
        : [],
    release: normalizeArray(affected.release),
    history: ["זיכרון מוצר"],
  };
}

function buildHistoryEnvelope({ project = {}, decision = {}, record = {}, mutationTruth = {}, index = 0 } = {}) {
  const eventType = classifyEventFromDecision(decision, record);
  const checkpointNeeded = requiresCheckpoint(decision, eventType);
  const after = summarizeMutationRecord(record);
  const before = checkpointNeeded
    ? "המצב הקודם נשמר כנקודת חזרה לפני שינוי משמעותי."
    : "המצב הקודם נשאר זמין ברצף העבודה.";

  return {
    agentId: "history-continuity-agent",
    taskId: "HIST-AGT-001",
    responseSource: "agent-envelope",
    eventId: normalizeString(record.historyRecordId, `history-continuity-${index + 1}`),
    eventType,
    changeSummary: {
      before,
      after,
      unchanged: "הקשר הפרויקט והשיחה נשארים מחוברים לאותו מוצר.",
    },
    reason: decision.changeType === "product-truth" ? "direction-change" : "user-request",
    affectedAreas: buildAffectedAreas({ decision, record, mutationTruth }),
    requiresCheckpoint: checkpointNeeded,
    checkpointReason: checkpointNeeded ? "זה שינוי שיכול לגרום למשתמש לרצות לחזור למצב הקודם." : "",
    restoreAvailability: checkpointNeeded ? "possible-with-impact" : "safe",
    restoreImpact: {
      willRestore: checkpointNeeded ? ["מצב המוצר לפני שינוי הכיוון"] : ["המצב הקודם של השינוי הקטן"],
      willRemove: checkpointNeeded ? ["שינויים שתלויים בכיוון החדש אם יאושרו"] : [],
      willKeep: ["השיחה", "זהות הפרויקט", "הקשר הבנייה"],
      releaseImpact: "אין השפעת שחרור בשלב הזה.",
    },
    productSnapshot: cloneJson(record.productSnapshot ?? record.snapshot ?? null),
    userReply: checkpointNeeded
      ? "שמרתי נקודת חזרה לפני שינוי משמעותי. לפני שחוזרים אליה צריך להבין מה יוסר ומה יישאר."
      : `נרשם שינוי מוצרי: ${after}`,
    status: decision.status === "pending-approval"
      ? "pending-approval"
      : checkpointNeeded
        ? "checkpoint-saved"
        : "recorded",
    createdAt: normalizeString(record.createdAt ?? record.timestamp, nowIso()),
    projectId: normalizeString(project.id),
  };
}

function createInitialEnvelope(project = {}) {
  return {
    agentId: "history-continuity-agent",
    taskId: "HIST-AGT-001",
    responseSource: "agent-envelope",
    eventId: "history-continuity-initial",
    eventType: "return-after-time",
    changeSummary: {
      before: "הפרויקט התחיל כרעיון.",
      after: "נשמר שלד ראשון שאפשר להמשיך ממנו.",
      unchanged: "זהות הפרויקט נשמרת.",
    },
    reason: "nexus-decision",
    affectedAreas: {
      screens: ["Build", "History"],
      workflows: ["המשך בנייה"],
      regions: ["שלד מוצר"],
      design: [],
      productTruth: ["אמת מוצר"],
      release: [],
      history: ["זיכרון מוצר"],
    },
    requiresCheckpoint: false,
    checkpointReason: "",
    restoreAvailability: "safe",
    restoreImpact: {
      willRestore: ["השלד הראשון"],
      willRemove: [],
      willKeep: ["השיחה", "זהות הפרויקט"],
      releaseImpact: "אין השפעת שחרור בשלב הזה.",
    },
    userReply: "נשמרה נקודת התחלה שאפשר לחזור ממנה להמשך בנייה.",
    status: "recorded",
    createdAt: nowIso(),
    projectId: normalizeString(project.id),
  };
}

function buildCheckpoint(project = {}, envelope = {}, index = 0) {
  const snapshot = normalizeObject(envelope.productSnapshot);
  return {
    checkpointId: `hist-checkpoint-${normalizeString(envelope.eventId, String(index + 1))}`,
    taskId: "HIST-AGT-001",
    sourceEventId: normalizeString(envelope.eventId),
    title: envelope.requiresCheckpoint ? "נקודת חזרה לפני שינוי משמעותי" : "נקודת חזרה לשינוי קטן",
    body: envelope.requiresCheckpoint
      ? "לפני שחוזרים לכאן, Nexus תסביר מה יוסר ומה יישאר."
      : "אפשר לחזור להבנת השינוי בלי לשנות אמת מוצר בשקט.",
    restoreAvailability: normalizeString(envelope.restoreAvailability, "safe"),
    restoreImpact: normalizeObject(envelope.restoreImpact),
    productSnapshot: {
      projectId: normalizeString(snapshot.projectId, normalizeString(project.id)),
      projectName: normalizeString(snapshot.projectName, normalizeString(project.name, "פרויקט Nexus")),
      goal: normalizeString(snapshot.goal, normalizeString(project.goal, "")),
      runtimeSkeletonId: normalizeString(snapshot.runtimeSkeletonTruth?.runtimeSkeletonId ?? project.runtimeSkeletonTruth?.runtimeSkeletonId ?? project.context?.runtimeSkeletonTruth?.runtimeSkeletonId),
      domainSkeletonId: normalizeString(snapshot.productDomainSkeleton?.domainSkeletonId ?? project.productDomainSkeleton?.domainSkeletonId ?? project.context?.productDomainSkeleton?.domainSkeletonId),
      artifactExpectation: cloneJson(snapshot.artifactExpectation ?? null),
      productSkeletonAgentOutput: cloneJson(snapshot.productSkeletonAgentOutput ?? null),
      runtimeSkeletonTruth: cloneJson(snapshot.runtimeSkeletonTruth ?? null),
      productDomainSkeleton: cloneJson(snapshot.productDomainSkeleton ?? null),
      productOwnedBackendSkeleton: cloneJson(snapshot.productOwnedBackendSkeleton ?? null),
      skeletonChoiceTruth: cloneJson(snapshot.skeletonChoiceTruth ?? null),
    },
    createdAt: normalizeString(envelope.createdAt, nowIso()),
  };
}

function buildReturnSummary(envelopes = []) {
  const meaningful = envelopes.filter((event) => event.requiresCheckpoint === true || event.eventType === "pending-approval");
  const small = envelopes.filter((event) => event.requiresCheckpoint !== true && event.eventType !== "return-after-time");
  const latest = envelopes[0] ?? {};
  const pieces = [];
  if (latest.changeSummary?.after) {
    pieces.push(latest.changeSummary.after);
  }
  if (meaningful.length > 0) {
    pieces.push("יש שינוי משמעותי או ממתין לאישור שצריך לזכור לפני המשך.");
  }
  if (small.length > 0) {
    pieces.push("שינויים קטנים נשמרו כהיסטוריית מוצר.");
  }
  return pieces.length
    ? pieces.join(" ")
    : "נשמר רצף עבודה שאפשר להמשיך ממנו.";
}

export function buildHistoryContinuityAgentEnvelope({ project = {} } = {}) {
  const safeProject = normalizeObject(project);
  const mutationHistory = normalizeArray(
    safeProject.mutationChangeHistory
      ?? safeProject.context?.mutationChangeHistory
      ?? safeProject.state?.mutationChangeHistory,
  );
  const buildMutationHistory = normalizeArray(
    safeProject.buildMutationHistory
      ?? safeProject.context?.buildMutationHistory
      ?? safeProject.state?.buildMutationHistory,
  );
  const mutationTruth = normalizeObject(
    safeProject.buildMutationTruth
      ?? safeProject.context?.buildMutationTruth
      ?? safeProject.state?.buildMutationTruth,
  );
  const currentDecision = normalizeObject(
    safeProject.mutationChangeDecision
      ?? safeProject.context?.mutationChangeDecision
      ?? safeProject.state?.mutationChangeDecision,
  );
  const existingRestoreDecision = normalizeObject(
    safeProject.historyContinuityAgent?.restoreDecision
      ?? safeProject.context?.historyContinuityAgent?.restoreDecision
      ?? safeProject.state?.historyContinuityAgent?.restoreDecision,
  );

  const envelopes = mutationHistory.length
    ? mutationHistory.slice().reverse().map((entry, index) => buildHistoryEnvelope({
        project: safeProject,
        decision: normalizeObject(entry.decision ?? entry.mutationChangeDecision ?? entry),
        record: {
          ...normalizeObject(entry.historyRecord ?? entry),
          productSnapshot: entry.productSnapshot ?? entry.historyRecord?.productSnapshot ?? null,
        },
        mutationTruth,
        index,
      }))
    : [createInitialEnvelope(safeProject)];

  const checkpoints = envelopes
    .filter((envelope) => envelope.requiresCheckpoint || envelope.restoreAvailability === "safe")
    .map((envelope, index) => buildCheckpoint(safeProject, envelope, index));
  const activeDecision = currentDecision.status === "pending-approval"
    ? buildHistoryEnvelope({
        project: safeProject,
        decision: currentDecision,
        record: normalizeObject(currentDecision.historyRecord),
        mutationTruth,
        index: 0,
      })
    : envelopes[0];

  return {
    agentId: "history-continuity-agent",
    taskId: "HIST-AGT-001",
    responseSource: "agent-envelope",
    status: activeDecision?.status === "pending-approval" ? "pending-approval" : "recorded",
    projectId: normalizeString(safeProject.id),
    currentSummary: buildReturnSummary(envelopes),
    conversationHistoryCount: normalizeArray(safeProject.companionConversation?.messages ?? safeProject.context?.companionConversation?.messages).length,
    productHistory: envelopes,
    changeHistory: envelopes,
    checkpoints,
    latestEvent: activeDecision,
    restoreDecision: Object.keys(existingRestoreDecision).length
      ? existingRestoreDecision
      : {
          status: "not-requested",
          restoreAvailability: checkpoints[0]?.restoreAvailability ?? "safe",
          restoreImpact: checkpoints[0]?.restoreImpact ?? null,
          userReply: checkpoints[0]
            ? "אפשר לבדוק חזרה לנקודה הזו בלי לשנות אמת מוצר בשקט."
            : "אין עדיין נקודת חזרה פעילה.",
        },
    continuityAction: {
      label: "חזור לבנייה",
      target: "loop",
      summary: "המשך העבודה חוזר לאותו פרויקט ולאותו הקשר.",
    },
    protectedInternalTerms: ["system ids", "file names", "function names", "provider details", "raw logs", "internal agent labels"],
    buildMutationHistoryCount: buildMutationHistory.length,
    generatedAt: nowIso(),
  };
}

export function createHistoryRestoreDecision({ project = {}, checkpointId = "" } = {}) {
  const envelope = buildHistoryContinuityAgentEnvelope({ project });
  const checkpoint = envelope.checkpoints.find((item) => item.checkpointId === checkpointId) ?? envelope.checkpoints[0] ?? null;
  if (!checkpoint) {
    return {
      ...envelope,
      restoreDecision: {
        status: "failed-safely",
        requestedCheckpointId: normalizeString(checkpointId),
        restoreAvailability: "not-possible",
        restoreImpact: {
          willRestore: [],
          willRemove: [],
          willKeep: ["המצב הנוכחי"],
          releaseImpact: "אין שינוי שחרור.",
        },
        userReply: "לא מצאתי נקודת חזרה בטוחה. המוצר הנוכחי לא השתנה.",
      },
    };
  }

  return {
    ...envelope,
    restoreDecision: {
      status: "impact-ready",
      requestedCheckpointId: checkpoint.checkpointId,
      restoreAvailability: checkpoint.restoreAvailability,
      restoreImpact: checkpoint.restoreImpact,
      productSnapshot: cloneJson(checkpoint.productSnapshot ?? null),
      userReply: "לפני שחוזרים לנקודה הזו, Nexus מציגה מה יחזור, מה יוסר ומה יישאר. עדיין לא בוצע שחזור.",
      requiresApproval: true,
      currentTruthUnchanged: true,
    },
  };
}

export function executeHistoryRestoreDecision({ project = {}, checkpointId = "" } = {}) {
  const envelope = buildHistoryContinuityAgentEnvelope({ project });
  const checkpoint = envelope.checkpoints.find((item) => item.checkpointId === checkpointId)
    ?? envelope.checkpoints.find((item) => item.checkpointId === envelope.restoreDecision?.requestedCheckpointId)
    ?? envelope.checkpoints[0]
    ?? null;
  const snapshot = normalizeObject(checkpoint?.productSnapshot);
  const hasProductTruth = Object.keys(normalizeObject(snapshot.productDomainSkeleton)).length > 0
    || Object.keys(normalizeObject(snapshot.runtimeSkeletonTruth)).length > 0;

  if (!checkpoint || !hasProductTruth) {
    return {
      ...envelope,
      restoreDecision: {
        status: "failed-safely",
        requestedCheckpointId: normalizeString(checkpointId),
        restoreAvailability: "not-possible",
        restoreImpact: {
          willRestore: [],
          willRemove: [],
          willKeep: ["המצב הנוכחי"],
          releaseImpact: "אין שינוי שחרור.",
        },
        userReply: "נקודת החזרה לא כוללת אמת מוצר מלאה, ולכן לא בוצע שחזור.",
        currentTruthUnchanged: true,
      },
      restoreExecution: {
        status: "blocked",
        executed: false,
        reason: "missing-product-snapshot",
      },
    };
  }

  return {
    ...envelope,
    status: "restored",
    latestEvent: {
      ...normalizeObject(envelope.latestEvent),
      status: "restored",
    },
    restoreDecision: {
      status: "restored",
      requestedCheckpointId: checkpoint.checkpointId,
      restoreAvailability: checkpoint.restoreAvailability,
      restoreImpact: checkpoint.restoreImpact,
      productSnapshot: cloneJson(snapshot),
      userReply: "שוחזר מצב המוצר מנקודת החזרה. נקסוס שמרה את ההיסטוריה ואת ההחלטה, והאמת הפעילה חזרה למצב שנבחר.",
      requiresApproval: false,
      currentTruthUnchanged: false,
    },
    restoreExecution: {
      status: "restored",
      executed: true,
      checkpointId: checkpoint.checkpointId,
      restoredProjectName: normalizeString(snapshot.projectName),
      restoredGoal: normalizeString(snapshot.goal),
      restoredRuntimeTitle: normalizeString(snapshot.runtimeSkeletonTruth?.title),
      restoredDomainModel: normalizeString(snapshot.productDomainSkeleton?.models?.[0]?.name),
      restoredAt: nowIso(),
    },
  };
}
