function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizePriority(value) {
  const normalized = normalizeString(value);
  return normalized === "high" || normalized === "medium" || normalized === "low" ? normalized : null;
}

function normalizeExecutionOrder(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10);
  }
  return null;
}

function formatExecutionOrder(value) {
  return String(value).padStart(3, "0");
}

function hasCanonicalInventorySequence(inventory) {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return false;
  }

  const orders = inventory
    .map((task) => normalizeExecutionOrder(task?.execution_order))
    .filter((order) => Number.isFinite(order))
    .sort((left, right) => left - right);

  if (orders.length !== inventory.length || orders[0] !== 1) {
    return false;
  }

  for (let index = 1; index < orders.length; index += 1) {
    if (orders[index] !== orders[index - 1] + 1) {
      return false;
    }
  }

  return true;
}

function buildMissingInputs({
  canonicalTaskInventory,
  importAndContinueRoadmap,
  postExecutionEvaluation,
  postExecutionReport,
  crossLayerFeedbackState,
  adaptiveExecutionDecision,
  systemOptimizationPlan,
}) {
  const missingInputs = [];

  if (!hasCanonicalInventorySequence(canonicalTaskInventory)) {
    missingInputs.push("canonical-task-inventory");
  }
  if (normalizeString(importAndContinueRoadmap?.status) !== "ready") {
    missingInputs.push("import-and-continue-roadmap");
  }
  if (!normalizeString(postExecutionEvaluation?.status)) {
    missingInputs.push("post-execution-evaluation");
  }
  if (!normalizeString(postExecutionReport?.status)) {
    missingInputs.push("post-execution-report");
  }
  if (!normalizeString(crossLayerFeedbackState?.status)) {
    missingInputs.push("cross-layer-feedback-state");
  }
  if (normalizeString(adaptiveExecutionDecision?.status) !== "ready") {
    missingInputs.push("adaptive-execution-decision");
  }
  if (normalizeString(systemOptimizationPlan?.status) !== "ready") {
    missingInputs.push("system-optimization-plan");
  }

  return missingInputs;
}

function buildInsightRecommendations(productIterationInsights) {
  return normalizeArray(productIterationInsights?.recommendations)
    .map((recommendation) => ({
      recommendationId: normalizeString(recommendation?.recommendationId),
      area: normalizeString(recommendation?.area),
      insight: normalizeString(recommendation?.insight),
      priority: normalizePriority(recommendation?.priority),
      actionType: normalizeString(recommendation?.actionType),
    }))
    .filter((recommendation) => recommendation.insight && recommendation.priority && recommendation.actionType);
}

function buildRegenerationCandidates(importAndContinueRoadmap) {
  return normalizeArray(importAndContinueRoadmap?.roadmapItems)
    .map((item) => ({
      taskId: normalizeString(item?.taskId),
      title: normalizeString(item?.title),
      detail: normalizeString(item?.detail),
      priority: normalizePriority(item?.priority) ?? "medium",
      evidence: normalizeArray(item?.evidence).map((entry) => normalizeString(entry)).filter(Boolean),
      dependencyIds: normalizeArray(item?.dependencyIds).map((entry) => normalizeString(entry)).filter(Boolean),
      sourceType: normalizeString(item?.sourceType, "unknown"),
    }))
    .filter((item) => item.taskId && item.title && item.evidence.length > 0);
}

function buildCanonicalTaskName(candidate) {
  return `Continue imported ${candidate.sourceType}: ${candidate.title}`;
}

function buildProposalDependencies({
  candidate,
  previousProposal = null,
  inventoryDependencyOrder,
  proposedExecutionOrder,
}) {
  const dependencies = [];

  if (previousProposal?.execution_order) {
    dependencies.push(previousProposal.execution_order);
  } else if (inventoryDependencyOrder) {
    dependencies.push(inventoryDependencyOrder);
  }

  return {
    upstreamExecutionOrders: dependencies,
    sourceDependencyIds: candidate.dependencyIds,
    proposedExecutionOrder,
  };
}

function buildSupportSummary({
  postExecutionEvaluation,
  postExecutionReport,
  crossLayerFeedbackState,
  adaptiveExecutionDecision,
  systemOptimizationPlan,
  recommendations,
}) {
  return {
    evaluationStatus: normalizeString(postExecutionEvaluation?.status, "missing"),
    reportStatus: normalizeString(postExecutionReport?.status, "missing"),
    feedbackStatus: normalizeString(crossLayerFeedbackState?.status, "missing"),
    adaptiveStatus: normalizeString(adaptiveExecutionDecision?.status, "missing"),
    optimizationStatus: normalizeString(systemOptimizationPlan?.status, "missing"),
    recommendationCount: recommendations.length,
    feedbackActions: normalizeArray(crossLayerFeedbackState?.feedbackActions).map((entry) => normalizeString(entry)).filter(Boolean),
    optimizationTargets: normalizeArray(systemOptimizationPlan?.optimizationTargets).map((entry) => normalizeString(entry)).filter(Boolean),
  };
}

function hasSufficientSupport({ supportSummary, recommendations }) {
  return recommendations.length > 0
    && supportSummary.feedbackActions.length > 0
    && supportSummary.optimizationTargets.length > 0
    && supportSummary.reportStatus !== "missing"
    && supportSummary.evaluationStatus !== "missing";
}

export function createCanonicalBacklogRegenerationBridge({
  projectId = null,
  canonicalTaskInventory = null,
  importAndContinueRoadmap = null,
  postExecutionEvaluation = null,
  postExecutionReport = null,
  crossLayerFeedbackState = null,
  adaptiveExecutionDecision = null,
  systemOptimizationPlan = null,
  productIterationInsights = null,
  anchorExecutionOrder = "049",
} = {}) {
  const inventory = normalizeArray(canonicalTaskInventory);
  const missingInputs = buildMissingInputs({
    canonicalTaskInventory: inventory,
    importAndContinueRoadmap,
    postExecutionEvaluation,
    postExecutionReport,
    crossLayerFeedbackState,
    adaptiveExecutionDecision,
    systemOptimizationPlan,
  });

  const bridgeId = `canonical-backlog-regeneration:${normalizeString(projectId, "unknown-project")}`;
  if (missingInputs.length > 0) {
    return {
      canonicalBacklogRegeneration: {
        regenerationBridgeId: bridgeId,
        projectId: normalizeString(projectId),
        status: "missing-inputs",
        missingInputs,
        proposedCanonicalTasks: [],
        dependencyGraph: [],
        insertionPlan: null,
      },
    };
  }

  const recommendations = buildInsightRecommendations(productIterationInsights);
  const candidates = buildRegenerationCandidates(importAndContinueRoadmap);
  const supportSummary = buildSupportSummary({
    postExecutionEvaluation,
    postExecutionReport,
    crossLayerFeedbackState,
    adaptiveExecutionDecision,
    systemOptimizationPlan,
    recommendations,
  });

  if (!hasSufficientSupport({ supportSummary, recommendations }) || candidates.length === 0) {
    return {
      canonicalBacklogRegeneration: {
        regenerationBridgeId: bridgeId,
        projectId: normalizeString(projectId),
        status: "insufficient-evidence",
        missingInputs: [],
        rejectionReasons: [
          recommendations.length === 0 ? "no-supported-insights" : null,
          candidates.length === 0 ? "no-roadmap-items-ready-for-canonicalization" : null,
          supportSummary.feedbackActions.length === 0 ? "no-feedback-actions" : null,
          supportSummary.optimizationTargets.length === 0 ? "no-optimization-targets" : null,
        ].filter(Boolean),
        supportSummary,
        proposedCanonicalTasks: [],
        dependencyGraph: [],
        insertionPlan: null,
      },
    };
  }

  const highestInventoryOrder = Math.max(
    ...inventory.map((task) => normalizeExecutionOrder(task.execution_order)).filter((order) => Number.isFinite(order)),
  );
  const insertionStart = highestInventoryOrder + 1;
  const inventoryDependencyOrder = formatExecutionOrder(highestInventoryOrder);
  let previousProposal = null;

  const proposedCanonicalTasks = candidates.map((candidate, index) => {
    const executionOrder = formatExecutionOrder(insertionStart + index);
    const recommendation = recommendations[index % recommendations.length];
    const dependencies = buildProposalDependencies({
      candidate,
      previousProposal,
      inventoryDependencyOrder,
      proposedExecutionOrder: executionOrder,
    });

    const proposal = {
      execution_order: executionOrder,
      taskName: buildCanonicalTaskName(candidate),
      state: "blocked",
      sourceTaskId: candidate.taskId,
      sourceType: candidate.sourceType,
      priority: candidate.priority,
      detail: candidate.detail,
      dependencies,
      sourceEvidence: candidate.evidence,
      supportingInsight: recommendation,
      regenerationSource: {
        anchorExecutionOrder,
        importRoadmapId: normalizeString(importAndContinueRoadmap?.roadmapId),
        postExecutionReportId: normalizeString(postExecutionReport?.postExecutionReportId),
        adaptiveExecutionDecisionId: normalizeString(adaptiveExecutionDecision?.adaptiveExecutionDecisionId),
        systemOptimizationPlanId: normalizeString(systemOptimizationPlan?.systemOptimizationPlanId),
      },
    };

    previousProposal = proposal;
    return proposal;
  });

  return {
    canonicalBacklogRegeneration: {
      regenerationBridgeId: bridgeId,
      projectId: normalizeString(projectId),
      status: "ready",
      missingInputs: [],
      supportSummary,
      insertionPlan: {
        insertionStrategy: "append-after-current-canonical-tail",
        anchorExecutionOrder,
        currentCanonicalTail: inventoryDependencyOrder,
        nextExecutionOrderStart: formatExecutionOrder(insertionStart),
      },
      proposedCanonicalTasks,
      dependencyGraph: proposedCanonicalTasks.map((task) => ({
        execution_order: task.execution_order,
        dependsOnExecutionOrders: task.dependencies.upstreamExecutionOrders,
        dependsOnSourceTaskIds: task.dependencies.sourceDependencyIds,
      })),
    },
  };
}
