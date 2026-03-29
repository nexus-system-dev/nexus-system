function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildProjectStateItems(projectState) {
  const state = normalizeObject(projectState);

  return [
    {
      itemId: "project-active-bottleneck",
      source: "project-state",
      section: "activeBottleneck",
      summary: state.activeBottleneck?.reason ?? state.activeBottleneck?.bottleneckId ?? "No active bottleneck",
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

  return [
    {
      itemId: "screen-current-surface",
      source: "interaction-context",
      section: "currentSurface",
      summary: context.currentSurface ?? context.surface ?? "workspace",
      payload: context.currentSurface ?? context.surface ?? "workspace",
    },
    {
      itemId: "screen-current-task",
      source: "interaction-context",
      section: "currentTask",
      summary: context.currentTask ?? context.taskId ?? "No task in focus",
      payload: context.currentTask ?? context.taskId ?? null,
    },
    {
      itemId: "screen-urgency",
      source: "interaction-context",
      section: "urgency",
      summary: context.urgency ?? "normal",
      payload: context.urgency ?? "normal",
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
  return items
    .filter((item) => item.source === entry.source)
    .map((item) => ({
      ...item,
      action: resolveAction(entry),
      tokenWeight: entry.tokenWeight,
      relevanceScore: entry.relevanceScore,
      priorityScore: entry.priorityScore,
      freshnessScore: entry.freshnessScore,
      reasons: normalizeArray(entry.reasons),
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
      filterId: `relevance-filter:${schema.schemaId ?? "context"}`,
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
