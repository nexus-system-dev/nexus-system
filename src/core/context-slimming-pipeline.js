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

function normalizeTokenBudget(tokenBudget) {
  if (Number.isFinite(tokenBudget)) {
    return {
      maxItems: Math.max(1, Math.floor(tokenBudget / 200)),
      maxSummaryItems: Math.max(1, Math.floor(tokenBudget / 400)),
      rawBudget: tokenBudget,
    };
  }

  const normalized = normalizeObject(tokenBudget);
  const maxItems =
    typeof normalized.maxItems === "number" && Number.isFinite(normalized.maxItems)
      ? Math.max(1, Math.floor(normalized.maxItems))
      : 3;
  const maxSummaryItems =
    typeof normalized.maxSummaryItems === "number" && Number.isFinite(normalized.maxSummaryItems)
      ? Math.max(1, Math.floor(normalized.maxSummaryItems))
      : 2;

  return {
    maxItems,
    maxSummaryItems,
    rawBudget:
      typeof normalized.rawBudget === "number" && Number.isFinite(normalized.rawBudget)
        ? normalized.rawBudget
        : null,
  };
}

function sortByPriority(items = []) {
  return [...items].sort((left, right) => {
    const leftScore =
      ((typeof left.priorityScore === "number" && Number.isFinite(left.priorityScore)) ? left.priorityScore : 0)
      + ((typeof left.relevanceScore === "number" && Number.isFinite(left.relevanceScore)) ? left.relevanceScore : 0)
      + ((typeof left.freshnessScore === "number" && Number.isFinite(left.freshnessScore)) ? left.freshnessScore : 0);
    const rightScore =
      ((typeof right.priorityScore === "number" && Number.isFinite(right.priorityScore)) ? right.priorityScore : 0)
      + ((typeof right.relevanceScore === "number" && Number.isFinite(right.relevanceScore)) ? right.relevanceScore : 0)
      + ((typeof right.freshnessScore === "number" && Number.isFinite(right.freshnessScore)) ? right.freshnessScore : 0);
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
  const normalizedFilterId = normalizeString(filtered.filterId) ?? "context";

  return {
    slimmedContextPayload: {
      payloadId: `slimmed-context:${normalizedFilterId}`,
      orderedContext: keptContext.map((item, index) => ({
        order: index + 1,
        itemId: normalizeString(item.itemId) ?? `context-item-${index + 1}`,
        section: normalizeString(item.section) ?? "unknown",
        source: normalizeString(item.source) ?? "unknown",
        summary: normalizeString(item.summary) ?? null,
        payload: item.payload,
        tokenWeight:
          typeof item.tokenWeight === "number" && Number.isFinite(item.tokenWeight)
            ? item.tokenWeight
            : null,
      })),
      summaries: summarizedContext.map((item, index) => ({
        itemId: normalizeString(item.itemId) ?? `summary-item-${index + 1}`,
        section: normalizeString(item.section) ?? "unknown",
        source: normalizeString(item.source) ?? "unknown",
        summary: normalizeString(item.summary) ?? null,
      })),
      tokenBudget: budget.rawBudget,
      summary: {
        keptCount: keptContext.length,
        summaryCount: summarizedContext.length,
        droppedCount: droppedContext.length,
        isMinimalExecutionContext: true,
      },
    },
    droppedContextSummary: {
      summaryId: `dropped-context:${normalizedFilterId}`,
      droppedSections: droppedContext.map((item) => normalizeString(item.section) ?? "unknown"),
      droppedItems: droppedContext.map((item, index) => ({
        itemId: normalizeString(item.itemId) ?? `dropped-item-${index + 1}`,
        section: normalizeString(item.section) ?? "unknown",
        source: normalizeString(item.source) ?? "unknown",
      })),
      totalDropped: droppedContext.length,
    },
  };
}
