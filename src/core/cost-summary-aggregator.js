function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeCostMetric(metric) {
  const normalized = normalizeObject(metric);
  return {
    quantity: normalizeFiniteNumber(normalized.quantity),
    unit: normalizeString(normalized.unit) ?? null,
    totalCost: normalizeFiniteNumber(normalized.totalCost),
    source:
      normalizeString(normalized.source)
      ?? normalizeString(normalized.sourceType)
      ?? null,
    currency: normalizeString(normalized.currency)?.toLowerCase() ?? null,
    recordedAt: normalizeString(normalized.recordedAt) ?? null,
    projectId:
      normalizeString(normalized.projectId)
      ?? normalizeString(normalized.projectScope?.projectId)
      ?? (normalizeString(normalized.scopeType)?.toLowerCase() === "project" ? normalizeString(normalized.scopeId) : null),
    userId:
      normalizeString(normalized.userId)
      ?? normalizeString(normalized.userScope?.userId)
      ?? (normalizeString(normalized.scopeType)?.toLowerCase() === "user" ? normalizeString(normalized.scopeId) : null),
    workspaceId:
      normalizeString(normalized.workspaceId)
      ?? (normalizeString(normalized.scopeType)?.toLowerCase() === "workspace" ? normalizeString(normalized.scopeId) : null),
    usageType: normalizeString(normalized.usageType)?.toLowerCase() ?? null,
  };
}

function buildBreakdownEntry(metric, fallbackUnit = null) {
  const normalized = normalizeCostMetric(metric);
  return {
    quantity: normalized.quantity,
    unit: normalized.unit ?? fallbackUnit,
    totalCost: normalized.totalCost,
    source: normalized.source,
  };
}

function collectCurrencies(metrics) {
  return metrics
    .map((metric) => normalizeCostMetric(metric).currency)
    .filter(Boolean);
}

function resolveCurrency(metrics) {
  const currencies = [...new Set(collectCurrencies(metrics))];

  if (currencies.length === 0) {
    return {
      currency: "usd",
      currencyMismatch: false,
    };
  }

  if (currencies.length === 1) {
    return {
      currency: currencies[0],
      currencyMismatch: false,
    };
  }

  return {
    currency: null,
    currencyMismatch: true,
  };
}

function sumTotals(entries) {
  return entries.reduce((sum, entry) => {
    const totalCost = normalizeFiniteNumber(entry?.totalCost);
    return totalCost !== null ? sum + totalCost : sum;
  }, 0);
}

function addScopedTotal(bucket, key, value) {
  if (!key || value === null) {
    return;
  }

  bucket[key] = (bucket[key] ?? 0) + value;
}

function buildGroupedByScope(metrics) {
  const byProject = {};
  const byUser = {};
  const byWorkspace = {};

  for (const metric of metrics) {
    const normalized = normalizeCostMetric(metric);
    if (normalized.totalCost === null) {
      continue;
    }

    addScopedTotal(byProject, normalized.projectId, normalized.totalCost);
    addScopedTotal(byUser, normalized.userId, normalized.totalCost);
    addScopedTotal(byWorkspace, normalized.workspaceId, normalized.totalCost);
  }

  return {
    byProject,
    byUser,
    byWorkspace,
  };
}

function buildPeriod(metrics) {
  const timestamps = metrics
    .map((metric) => normalizeCostMetric(metric).recordedAt)
    .filter(Boolean)
    .map((value) => ({ raw: value, parsed: Date.parse(value) }))
    .filter((entry) => Number.isFinite(entry.parsed))
    .sort((left, right) => left.parsed - right.parsed);

  if (timestamps.length === 0) {
    return {
      earliest: null,
      latest: null,
    };
  }

  return {
    earliest: timestamps[0].raw,
    latest: timestamps[timestamps.length - 1].raw,
  };
}

function resolveSummaryStatus(coreMetrics, currencyMismatch) {
  const allCoreMissing = coreMetrics.every((metric) => metric === null);
  if (allCoreMissing) {
    return "missing-inputs";
  }

  const coreStates = coreMetrics.map((metric) => normalizeCostMetric(metric));
  const allCoreComplete = coreStates.every((metric) => metric.totalCost !== null);
  if (allCoreComplete && !currencyMismatch) {
    return "complete";
  }

  return "partial";
}

export function createCostSummaryAggregator({
  platformCostMetric = null,
  aiUsageMetric = null,
  storageCostMetric = null,
  workspaceComputeMetric = null,
  buildDeployCostMetric = null,
} = {}) {
  const providerMetric = normalizeCostMetric(platformCostMetric).usageType === "provider-operation"
    ? platformCostMetric
    : null;
  const breakdown = {
    model: buildBreakdownEntry(aiUsageMetric),
    workspace: buildBreakdownEntry(workspaceComputeMetric),
    storage: buildBreakdownEntry(storageCostMetric),
    build: buildBreakdownEntry(buildDeployCostMetric, "build-minute"),
    providerOperation: buildBreakdownEntry(providerMetric),
  };

  const allDimensionEntries = [
    breakdown.model,
    breakdown.workspace,
    breakdown.storage,
    breakdown.build,
    breakdown.providerOperation,
  ];
  const costBearingMetrics = [
    aiUsageMetric,
    workspaceComputeMetric,
    storageCostMetric,
    buildDeployCostMetric,
    providerMetric,
  ];
  const { currency, currencyMismatch } = resolveCurrency(costBearingMetrics);
  const totalEstimatedCost = currencyMismatch ? null : sumTotals(allDimensionEntries);
  const groupedByScope = buildGroupedByScope(costBearingMetrics);
  const period = buildPeriod(costBearingMetrics);
  const summaryStatus = resolveSummaryStatus(
    [aiUsageMetric, workspaceComputeMetric, storageCostMetric],
    currencyMismatch,
  );
  const dimensionsWithCost = allDimensionEntries.filter((entry) => entry.totalCost !== null).length;
  const dimensionsMissingCost = allDimensionEntries.length - dimensionsWithCost;
  const scopeCount = [
    ...Object.keys(groupedByScope.byProject),
    ...Object.keys(groupedByScope.byUser),
    ...Object.keys(groupedByScope.byWorkspace),
  ].length;

  return {
    costSummary: {
      costSummaryId: `cost-summary:${period.latest ?? period.earliest ?? "no-period"}`,
      breakdown,
      groupedByScope,
      totalEstimatedCost,
      currency,
      currencyMismatch,
      period,
      summary: {
        totalCost: totalEstimatedCost,
        dimensionsWithCost,
        dimensionsMissingCost,
        totalDimensions: 5,
        hasBuildCost: breakdown.build.totalCost !== null,
        hasProviderCost: breakdown.providerOperation.totalCost !== null,
        summaryStatus,
        scopeCount,
      },
    },
  };
}
