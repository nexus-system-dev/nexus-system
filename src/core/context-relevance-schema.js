function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function clamp(value, min = 0, max = 1) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
}

function scoreProjectState(projectState) {
  const normalizedProjectState = normalizeObject(projectState);
  const screenReviewReport = normalizeObject(normalizedProjectState.screenReviewReport);
  const activeBottleneck = normalizeObject(normalizedProjectState.activeBottleneck);
  const progressState = normalizeObject(normalizedProjectState.progressState);
  const approvals = normalizeArray(normalizedProjectState.approvals);
  const events = normalizeArray(normalizedProjectState.events);
  const progressStatus = normalizeString(progressState.status) ?? "idle";
  const projectSourceId =
    normalizeString(normalizedProjectState.id)
    ?? normalizeString(normalizedProjectState.projectId)
    ?? "project";

  const relevance = clamp(
    0.35
      + ((screenReviewReport.summary?.blockedScreens ?? 0) > 0 ? 0.2 : 0)
      + (activeBottleneck.bottleneckId ? 0.15 : 0)
      + (approvals.length > 0 ? 0.1 : 0),
  );
  const priority = clamp(
    0.3
      + (progressStatus === "blocked" ? 0.3 : 0)
      + ((screenReviewReport.summary?.blockedScreens ?? 0) > 0 ? 0.2 : 0)
      + (approvals.length > 0 ? 0.1 : 0),
  );
  const freshness = clamp(
    0.35
      + (events.length > 0 ? 0.25 : 0)
      + (progressState.percent > 0 ? 0.15 : 0),
  );

  return {
    source: "project-state",
    sourceId: projectSourceId,
    relevanceScore: Number(relevance.toFixed(2)),
    priorityScore: Number(priority.toFixed(2)),
    freshnessScore: Number(freshness.toFixed(2)),
    tokenWeight: 0,
    reasons: [
      screenReviewReport.summary?.blockedScreens > 0 ? "screen-review-has-blockers" : null,
      activeBottleneck.bottleneckId ? "active-bottleneck-present" : null,
      approvals.length > 0 ? "approval-pressure-present" : null,
      progressStatus ? `progress-status:${progressStatus}` : null,
    ].filter(Boolean),
  };
}

function scoreInteractionContext(interactionContext) {
  const normalizedInteractionContext = normalizeObject(interactionContext);
  const currentSurface =
    normalizeString(normalizedInteractionContext.currentSurface)
    ?? normalizeString(normalizedInteractionContext.surface)
    ?? "workspace";
  const urgency = normalizeString(normalizedInteractionContext.urgency) ?? "normal";
  const currentTask =
    normalizeString(normalizedInteractionContext.currentTask)
    ?? normalizeString(normalizedInteractionContext.taskId);
  const visible = normalizedInteractionContext.visible !== false;
  const interactionSourceId =
    normalizeString(normalizedInteractionContext.sessionId)
    ?? normalizeString(normalizedInteractionContext.projectId)
    ?? currentSurface;

  const relevance = clamp(
    0.4
      + (currentSurface === "workspace" ? 0.15 : 0)
      + (currentTask ? 0.15 : 0)
      + (visible ? 0.1 : 0),
  );
  const priority = clamp(
    0.3
      + (urgency === "critical" ? 0.45 : urgency === "high" ? 0.3 : urgency === "low" ? 0.05 : 0.15)
      + (currentTask ? 0.1 : 0),
  );
  const freshness = clamp(0.7 + (visible ? 0.1 : 0));

  return {
    source: "interaction-context",
    sourceId: interactionSourceId,
    relevanceScore: Number(relevance.toFixed(2)),
    priorityScore: Number(priority.toFixed(2)),
    freshnessScore: Number(freshness.toFixed(2)),
    tokenWeight: 0,
    reasons: [
      `surface:${currentSurface}`,
      currentTask ? "task-in-focus" : null,
      `urgency:${urgency}`,
      visible ? "currently-visible" : "background-context",
    ].filter(Boolean),
  };
}

function applyTokenWeights(entries) {
  const total = entries.reduce(
    (sum, entry) => sum + (entry.relevanceScore * 0.45) + (entry.priorityScore * 0.35) + (entry.freshnessScore * 0.2),
    0,
  );

  if (total <= 0) {
    return entries.map((entry) => ({
      ...entry,
      tokenWeight: Number((1 / entries.length).toFixed(2)),
    }));
  }

  return entries.map((entry) => {
    const compositeScore =
      (entry.relevanceScore * 0.45)
      + (entry.priorityScore * 0.35)
      + (entry.freshnessScore * 0.2);

    return {
      ...entry,
      tokenWeight: Number((compositeScore / total).toFixed(2)),
    };
  });
}

function buildOrdering(entries) {
  return [...entries]
    .sort((left, right) => {
      const leftComposite = (left.relevanceScore * 0.45) + (left.priorityScore * 0.35) + (left.freshnessScore * 0.2);
      const rightComposite = (right.relevanceScore * 0.45) + (right.priorityScore * 0.35) + (right.freshnessScore * 0.2);
      return rightComposite - leftComposite;
    })
    .map((entry, index) => ({
      rank: index + 1,
      source: entry.source,
      sourceId: entry.sourceId,
      tokenWeight: entry.tokenWeight,
    }));
}

function buildBudgetGuidance(entries) {
  const highestPriority = entries.reduce((max, entry) => Math.max(max, entry.priorityScore), 0);
  const highestFreshness = entries.reduce((max, entry) => Math.max(max, entry.freshnessScore), 0);

  return {
    ai: {
      targetShare: Number((entries.filter((entry) => entry.source === "interaction-context").reduce((sum, entry) => sum + entry.tokenWeight, 0)).toFixed(2)),
      strategy: highestPriority >= 0.75 ? "preserve-high-priority-context" : "balanced-context-window",
    },
    review: {
      targetShare: Number((entries.filter((entry) => entry.source === "project-state").reduce((sum, entry) => sum + entry.tokenWeight, 0)).toFixed(2)),
      strategy: highestFreshness >= 0.75 ? "prefer-latest-review-context" : "preserve-decision-history",
    },
    execution: {
      targetShare: Number((entries.reduce((sum, entry) => sum + entry.tokenWeight, 0)).toFixed(2)),
      strategy: highestPriority >= 0.75 ? "minimal-high-signal-context" : "ordered-execution-context",
    },
  };
}

export function defineContextRelevanceSchema({
  projectState = null,
  interactionContext = null,
} = {}) {
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedInteractionContext = normalizeObject(interactionContext);
  const scoredEntries = applyTokenWeights([
    scoreProjectState(normalizedProjectState),
    scoreInteractionContext(normalizedInteractionContext),
  ]);
  const schemaSourceId =
    normalizeString(normalizedProjectState.id)
    ?? normalizeString(normalizedProjectState.projectId)
    ?? "project";

  const overallPriority = Math.max(...scoredEntries.map((entry) => entry.priorityScore));
  const overallFreshness = Math.max(...scoredEntries.map((entry) => entry.freshnessScore));

  return {
    contextRelevanceSchema: {
      schemaId: `context-relevance:${schemaSourceId}`,
      dimensions: ["relevance", "priority", "freshness", "tokenWeight"],
      contextEntries: scoredEntries,
      ordering: buildOrdering(scoredEntries),
      tokenBudgetGuidance: buildBudgetGuidance(scoredEntries),
      summary: {
        totalEntries: scoredEntries.length,
        highestPriorityScore: Number(overallPriority.toFixed(2)),
        freshestScore: Number(overallFreshness.toFixed(2)),
        prefersAggressiveSlimming: overallPriority >= 0.75,
        isReadyForAiReviewExecution: scoredEntries.every((entry) => entry.tokenWeight > 0),
      },
    },
  };
}
