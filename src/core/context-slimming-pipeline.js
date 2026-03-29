function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeTokenBudget(tokenBudget) {
  if (Number.isFinite(tokenBudget)) {
    return {
      maxItems: Math.max(1, Math.floor(tokenBudget / 200)),
      maxSummaryItems: Math.max(1, Math.floor(tokenBudget / 400)),
      rawBudget: tokenBudget,
    };
  }

  const normalized = normalizeObject(tokenBudget);
  return {
    maxItems: normalized.maxItems ?? 3,
    maxSummaryItems: normalized.maxSummaryItems ?? 2,
    rawBudget: normalized.rawBudget ?? null,
  };
}

function sortByPriority(items = []) {
  return [...items].sort((left, right) => {
    const leftScore = (left.priorityScore ?? 0) + (left.relevanceScore ?? 0) + (left.freshnessScore ?? 0);
    const rightScore = (right.priorityScore ?? 0) + (right.relevanceScore ?? 0) + (right.freshnessScore ?? 0);
    return rightScore - leftScore;
  });
}

export function createContextSlimmingPipeline({
  relevanceFilteredContext = null,
  tokenBudget = null,
} = {}) {
  const filtered = normalizeObject(relevanceFilteredContext);
  const budget = normalizeTokenBudget(tokenBudget);
  const keptContext = sortByPriority(normalizeArray(filtered.keptContext)).slice(0, budget.maxItems);
  const summarizedContext = normalizeArray(filtered.summarizedContext).slice(0, budget.maxSummaryItems);
  const droppedContext = normalizeArray(filtered.droppedContext);

  return {
    slimmedContextPayload: {
      payloadId: `slimmed-context:${filtered.filterId ?? "context"}`,
      orderedContext: keptContext.map((item, index) => ({
        order: index + 1,
        itemId: item.itemId,
        section: item.section,
        source: item.source,
        summary: item.summary,
        payload: item.payload,
        tokenWeight: item.tokenWeight ?? null,
      })),
      summaries: summarizedContext,
      tokenBudget: budget.rawBudget,
      summary: {
        keptCount: keptContext.length,
        summaryCount: summarizedContext.length,
        droppedCount: droppedContext.length,
        isMinimalExecutionContext: true,
      },
    },
    droppedContextSummary: {
      summaryId: `dropped-context:${filtered.filterId ?? "context"}`,
      droppedSections: droppedContext.map((item) => item.section),
      droppedItems: droppedContext,
      totalDropped: droppedContext.length,
    },
  };
}
