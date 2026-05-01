function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function unique(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(capabilityLimitMap, messagingFramework) {
  const missingInputs = [];
  if (!normalizeString(capabilityLimitMap?.capabilityLimitMapId)) {
    missingInputs.push("capabilityLimitMap");
  }
  if (!normalizeString(messagingFramework?.messagingFrameworkId)) {
    missingInputs.push("messagingFramework");
  }
  return missingInputs;
}

export function createBoundaryDisclosureAndExpectationModel({
  capabilityLimitMap = null,
  messagingFramework = null,
} = {}) {
  const normalizedMap = normalizeObject(capabilityLimitMap);
  const normalizedMessaging = normalizeObject(messagingFramework);
  const missingInputs = buildMissingInputs(normalizedMap, normalizedMessaging);
  const requiresApproval = Array.isArray(normalizedMap?.limits) && normalizedMap.limits.includes("approval-required");

  return {
    boundaryDisclosureModel: {
      boundaryDisclosureModelId: `boundary-disclosure:${slugify(
        normalizedMap?.capabilityLimitMapId ?? normalizedMessaging?.messagingFrameworkId,
      )}`,
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      headline: normalizeString(normalizedMessaging?.headline) ?? "Nexus works inside explicit product boundaries.",
      expectationSummary:
        requiresApproval
          ? "Nexus can move work forward, but privileged or risky actions may pause for approval."
          : "Nexus can move work forward inside the current governed execution surface.",
      disclosureCards: [
        {
          surface: "workspace",
          title: "What Nexus will do",
          bullets: unique(normalizedMap?.promises),
        },
        {
          surface: "approval-flow",
          title: "What may require you",
          bullets: unique([
            ...(requiresApproval ? ["High-risk or privileged actions may require approval."] : []),
            ...(normalizedMap?.disclaimers ?? []),
          ]),
        },
        {
          surface: "website",
          title: "What Nexus will not claim",
          bullets: unique([...(normalizedMap?.nonGoals ?? []), ...(normalizedMap?.limits ?? [])]),
        },
      ],
      expectationFlags: {
        requiresApprovalDisclosure: requiresApproval,
        hasExecutionLimits: Array.isArray(normalizedMap?.limits) && normalizedMap.limits.length > 0,
        canShowMarketingExpectation:
          Array.isArray(normalizedMap?.promises) && normalizedMap.promises.length > 0 && Boolean(normalizedMessaging?.headline),
      },
    },
  };
}
