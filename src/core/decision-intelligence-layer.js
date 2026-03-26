function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function buildApprovalDecisions({ approvals = [], recommendedDefaults = null, businessContext = null }) {
  const decisions = [];

  for (const approval of approvals) {
    decisions.push({
      type: "approval-required",
      reason: approval,
      source: "project-approvals",
    });
  }

  if (recommendedDefaults?.provisional) {
    decisions.push({
      type: "approval-required",
      reason: "Recommended defaults are still provisional",
      source: "recommended-defaults",
    });
  }

  if (businessContext?.constraints?.includes("defaults-need-confirmation")) {
    decisions.push({
      type: "approval-required",
      reason: "Business defaults still need confirmation",
      source: "business-context",
    });
  }

  return decisions;
}

function buildExecutableDecisions({ executionModes = [], stackRecommendation = null, domain = "generic" }) {
  const decisions = [];

  if (stackRecommendation?.frontend || stackRecommendation?.backend) {
    decisions.push({
      type: "auto-executable",
      reason: `Initial stack recommendation is available for ${domain}`,
      source: "stack-recommendation",
    });
  }

  if (executionModes.includes("agent")) {
    decisions.push({
      type: "auto-executable",
      reason: "Agent execution is available",
      source: "execution-modes",
    });
  }

  if (executionModes.includes("temp-branch") || executionModes.includes("sandbox")) {
    decisions.push({
      type: "auto-executable",
      reason: "Controlled execution mode is available",
      source: "execution-modes",
    });
  }

  return decisions;
}

function buildUncertainDecisions({ requiredActions = [], businessContext = null, domainClassification = null }) {
  const decisions = [];

  for (const action of requiredActions) {
    decisions.push({
      type: "uncertain",
      reason: action,
      source: "required-actions",
    });
  }

  if ((domainClassification?.confidenceScores?.[domainClassification.domain] ?? 1) < 0.75) {
    decisions.push({
      type: "uncertain",
      reason: "Domain confidence is still low",
      source: "domain-classification",
    });
  }

  if (businessContext?.funnel?.acquisition === "needs-definition") {
    decisions.push({
      type: "uncertain",
      reason: "Acquisition funnel still needs definition",
      source: "business-context",
    });
  }

  if (businessContext?.funnel?.conversion === "blocked") {
    decisions.push({
      type: "uncertain",
      reason: "Conversion path is blocked",
      source: "business-context",
    });
  }

  return decisions;
}

export function buildDecisionIntelligenceLayer({
  approvals = [],
  requiredActions = [],
  recommendedDefaults = null,
  businessContext = null,
  executionModes = [],
  stackRecommendation = null,
  domain = "generic",
  domainClassification = null,
} = {}) {
  const approvalRequired = buildApprovalDecisions({
    approvals,
    recommendedDefaults,
    businessContext,
  });
  const autoExecutable = buildExecutableDecisions({
    executionModes,
    stackRecommendation,
    domain,
  });
  const uncertain = buildUncertainDecisions({
    requiredActions,
    businessContext,
    domainClassification,
  });

  return {
    approvalRequired,
    autoExecutable,
    uncertain,
    summary: {
      requiresApproval: approvalRequired.length > 0,
      canAutoExecute: autoExecutable.length > 0 && approvalRequired.length === 0,
      hasUncertainty: uncertain.length > 0,
    },
    decisionTypes: unique([
      ...(approvalRequired.length > 0 ? ["approval-required"] : []),
      ...(autoExecutable.length > 0 ? ["auto-executable"] : []),
      ...(uncertain.length > 0 ? ["uncertain"] : []),
    ]),
  };
}
