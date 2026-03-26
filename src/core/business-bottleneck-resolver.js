function buildBottleneck(id, title, reason, severity, source) {
  return {
    id,
    title,
    reason,
    severity,
    source,
  };
}

export function resolveBusinessBottleneck({
  businessContext = null,
  decisionIntelligence = null,
  recommendedDefaults = null,
} = {}) {
  const funnel = businessContext?.funnel ?? {};
  const constraints = businessContext?.constraints ?? [];
  const approvalRequired = decisionIntelligence?.approvalRequired ?? [];
  const uncertain = decisionIntelligence?.uncertain ?? [];

  if (funnel.acquisition === "needs-definition") {
    return buildBottleneck(
      "business:acquisition-funnel",
      "Acquisition funnel is not defined",
      "Growth cannot be planned without a defined acquisition path",
      "high",
      "business-context",
    );
  }

  if (funnel.conversion === "blocked") {
    return buildBottleneck(
      "business:conversion-blocked",
      "Conversion path is blocked",
      "Revenue or activation path is blocked by unresolved business inputs",
      "high",
      "business-context",
    );
  }

  if (approvalRequired.length > 0) {
    return buildBottleneck(
      "business:approval-pending",
      "Business approval is pending",
      approvalRequired[0].reason,
      "medium",
      "decision-intelligence",
    );
  }

  if (constraints.includes("defaults-need-confirmation") || recommendedDefaults?.provisional) {
    return buildBottleneck(
      "business:defaults-not-confirmed",
      "Business defaults are not confirmed",
      "Recommended defaults still require confirmation before execution",
      "medium",
      "recommended-defaults",
    );
  }

  if (uncertain.length > 0) {
    return buildBottleneck(
      "business:uncertainty",
      "Business uncertainty remains",
      uncertain[0].reason,
      "medium",
      "decision-intelligence",
    );
  }

  return buildBottleneck(
    "business:no-blocker",
    "No business bottleneck detected",
    "Current business context does not expose a primary blocker",
    "low",
    "system",
  );
}
