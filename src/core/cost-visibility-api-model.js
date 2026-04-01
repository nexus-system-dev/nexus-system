function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildBreakdownEntries(costSummary) {
  const breakdown = normalizeObject(costSummary.breakdown);
  const totalEstimatedCost = normalizeFiniteNumber(costSummary.totalEstimatedCost);

  return Object.entries(breakdown).map(([dimension, entry]) => {
    const normalizedEntry = normalizeObject(entry);
    const totalCost = normalizeFiniteNumber(normalizedEntry.totalCost);
    return {
      dimension,
      label: dimension,
      totalCost,
      quantity: normalizeFiniteNumber(normalizedEntry.quantity),
      unit: normalizeString(normalizedEntry.unit),
      pct:
        totalEstimatedCost === null || totalCost === null
          ? null
          : totalCost / totalEstimatedCost,
    };
  });
}

function buildTopCostDrivers(breakdownEntries) {
  return breakdownEntries
    .filter((entry) => entry.totalCost !== null)
    .sort((left, right) => right.totalCost - left.totalCost)
    .map((entry, index) => ({
      rank: index + 1,
      dimension: entry.dimension,
      totalCost: entry.totalCost,
      pct: entry.pct,
    }));
}

function buildBudgetStatus(budgetDecision) {
  const normalizedBudgetDecision = normalizeObject(budgetDecision);

  if (Object.keys(normalizedBudgetDecision).length === 0) {
    return {
      status: "unknown",
      allowed: null,
      remainingBudget: null,
      currency: null,
      perSessionLimit: null,
      hasWarning: false,
      reason: "Budget decision not computed",
    };
  }

  return {
    status: normalizeString(normalizedBudgetDecision.decision, "unknown"),
    allowed: typeof normalizedBudgetDecision.allowed === "boolean" ? normalizedBudgetDecision.allowed : null,
    remainingBudget: normalizeFiniteNumber(normalizedBudgetDecision.remainingBudget),
    currency: normalizeString(normalizedBudgetDecision.currency),
    perSessionLimit: normalizeFiniteNumber(normalizedBudgetDecision.perSessionLimit),
    hasWarning: normalizeString(normalizedBudgetDecision.decision, "unknown") !== "allowed",
    reason: normalizeString(normalizedBudgetDecision.reason),
  };
}

export function createCostVisibilityApiModel({
  costSummary = null,
  budgetDecision = null,
} = {}) {
  const normalizedCostSummary = normalizeObject(costSummary);

  if (Object.keys(normalizedCostSummary).length === 0) {
    return {
      costVisibilityPayload: null,
      costDashboardModel: null,
    };
  }

  const totalCost = normalizeFiniteNumber(
    normalizedCostSummary.totalEstimatedCost ?? normalizedCostSummary.summary?.totalCost,
  );
  const currency = normalizeString(normalizedCostSummary.currency);
  const breakdown = buildBreakdownEntries(normalizedCostSummary);
  const topCostDrivers = buildTopCostDrivers(breakdown);
  const budgetStatus = buildBudgetStatus(budgetDecision);
  const summaryStatus = normalizeString(normalizedCostSummary.summary?.summaryStatus);
  const groupedByScope = normalizeObject(normalizedCostSummary.groupedByScope);
  const period = normalizeObject(normalizedCostSummary.period);

  const costVisibilityPayload = {
    costVisibilityPayloadId: `cost-visibility-payload:${normalizedCostSummary.costSummaryId ?? "unknown-cost-summary"}`,
    totalCost,
    currency,
    breakdown,
    topCostDrivers,
    groupedByScope: Object.keys(groupedByScope).length > 0 ? groupedByScope : null,
    period: Object.keys(period).length > 0 ? period : null,
    budgetStatus,
    summaryStatus,
  };

  const costDashboardModel = {
    dashboardId: `cost-dashboard:${normalizedCostSummary.costSummaryId ?? "unknown-cost-summary"}`,
    kpiCards: [
      {
        componentType: "stat-card",
        title: "Total Cost",
        value: totalCost,
        subtitle: currency,
      },
      {
        componentType: "stat-card",
        title: "Cost Drivers",
        value: topCostDrivers.length,
        subtitle: null,
      },
      {
        componentType: "stat-card",
        title: "Budget Status",
        value: budgetStatus.status,
        subtitle: null,
      },
    ],
    breakdownTable: {
      componentType: "table",
      columns: ["dimension", "totalCost", "pct"],
      rows: breakdown.map((entry) => ({
        dimension: entry.dimension,
        totalCost: entry.totalCost,
        pct: entry.pct,
      })),
    },
    alertBanner: budgetStatus.hasWarning
      ? {
          componentType: "status-chip",
          status: budgetStatus.status,
          message: budgetStatus.reason || "Budget issue detected",
        }
      : null,
  };

  return {
    costVisibilityPayload,
    costDashboardModel,
  };
}
