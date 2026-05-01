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

function buildProjectStateItems(projectState) {
  const state = normalizeObject(projectState);

  return [
    {
      itemId: "project-active-bottleneck",
      source: "project-state",
      section: "activeBottleneck",
      summary:
        normalizeString(state.activeBottleneck?.reason)
        ?? normalizeString(state.activeBottleneck?.bottleneckId)
        ?? "No active bottleneck",
      payload: state.activeBottleneck ?? null,
    },
    {
      itemId: "project-screen-review",
      source: "project-state",
      section: "screenReviewReport",
      summary: `Blocked screens: ${state.screenReviewReport?.summary?.blockedScreens ?? 0}`,
      payload: state.screenReviewReport ?? null,
    },
    {
      itemId: "project-progress",
      source: "project-state",
      section: "progressState",
      summary: `Progress: ${state.progressState?.percent ?? 0}%`,
      payload: state.progressState ?? null,
    },
    {
      itemId: "project-approvals",
      source: "project-state",
      section: "approvals",
      summary: `Approvals: ${normalizeArray(state.approvals).length}`,
      payload: normalizeArray(state.approvals),
    },
    {
      itemId: "project-events",
      source: "project-state",
      section: "events",
      summary: `Events: ${normalizeArray(state.events).length}`,
      payload: normalizeArray(state.events),
    },
  ];
}

function buildScreenContextItems(screenContext) {
  const context = normalizeObject(screenContext);
  const currentSurface = normalizeString(context.currentSurface) ?? normalizeString(context.surface) ?? "workspace";
  const currentTask = normalizeString(context.currentTask) ?? normalizeString(context.taskId);
  const urgency = normalizeString(context.urgency) ?? "normal";

  return [
    {
      itemId: "screen-current-surface",
      source: "interaction-context",
      section: "currentSurface",
      summary: currentSurface,
      payload: currentSurface,
    },
    {
      itemId: "screen-current-task",
      source: "interaction-context",
      section: "currentTask",
      summary: currentTask ?? "No task in focus",
      payload: currentTask,
    },
    {
      itemId: "screen-urgency",
      source: "interaction-context",
      section: "urgency",
      summary: urgency,
      payload: urgency,
    },
  ];
}

function resolveAction(entry) {
  const priority = entry.priorityScore ?? 0;
  const relevance = entry.relevanceScore ?? 0;
  const freshness = entry.freshnessScore ?? 0;

  if (priority >= 0.75 || relevance >= 0.7) {
    return "keep";
  }

  if (freshness >= 0.6 || priority >= 0.45) {
    return "summarize";
  }

  return "drop";
}

function decorateItems(items, entry) {
  const normalizedSource = normalizeString(entry.source);
  const tokenWeight = typeof entry.tokenWeight === "number" && Number.isFinite(entry.tokenWeight) ? entry.tokenWeight : 0;
  const relevanceScore = typeof entry.relevanceScore === "number" && Number.isFinite(entry.relevanceScore) ? entry.relevanceScore : 0;
  const priorityScore = typeof entry.priorityScore === "number" && Number.isFinite(entry.priorityScore) ? entry.priorityScore : 0;
  const freshnessScore = typeof entry.freshnessScore === "number" && Number.isFinite(entry.freshnessScore) ? entry.freshnessScore : 0;

  return items
    .filter((item) => item.source === normalizedSource)
    .map((item) => ({
      ...item,
      action: resolveAction(entry),
      tokenWeight,
      relevanceScore,
      priorityScore,
      freshnessScore,
      reasons: normalizeArray(entry.reasons)
        .filter((reason) => typeof reason === "string" && reason.trim())
        .map((reason) => reason.trim()),
    }));
}

export function createContextRelevanceFilter({
  contextRelevanceSchema = null,
  projectState = null,
  screenContext = null,
} = {}) {
  const schema = normalizeObject(contextRelevanceSchema);
  const entries = normalizeArray(schema.contextEntries);
  const items = [
    ...buildProjectStateItems(projectState),
    ...buildScreenContextItems(screenContext),
  ];
  const decoratedItems = entries.flatMap((entry) => decorateItems(items, entry));
  const kept = decoratedItems.filter((item) => item.action === "keep");
  const summarized = decoratedItems.filter((item) => item.action === "summarize");
  const dropped = decoratedItems.filter((item) => item.action === "drop");

  return {
    relevanceFilteredContext: {
      filterId: `relevance-filter:${normalizeString(schema.schemaId) ?? "context"}`,
      keptContext: kept,
      summarizedContext: summarized.map((item) => ({
        itemId: item.itemId,
        section: item.section,
        summary: item.summary,
        source: item.source,
      })),
      droppedContext: dropped.map((item) => ({
        itemId: item.itemId,
        section: item.section,
        source: item.source,
      })),
      summary: {
        keptCount: kept.length,
        summarizedCount: summarized.length,
        droppedCount: dropped.length,
        preservesHighPriorityContext: kept.some((item) => item.priorityScore >= 0.75),
      },
    },
  };
}
