function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function unique(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function buildProductVision(productVision, projectIdentity, nexusPositioning) {
  const normalizedVision = normalizeObject(productVision);
  const normalizedIdentity = normalizeObject(projectIdentity);
  const normalizedPositioning = normalizeObject(nexusPositioning);

  return {
    statement:
      normalizeString(normalizedVision?.statement)
      ?? normalizeString(normalizedIdentity?.vision)
      ?? normalizeString(normalizedPositioning?.promise)
      ?? null,
    problem:
      normalizeString(normalizedVision?.problem)
      ?? normalizeString(normalizedPositioning?.problem)
      ?? normalizeString(normalizedIdentity?.vision)
      ?? null,
    promise:
      normalizeString(normalizedVision?.promise)
      ?? normalizeString(normalizedPositioning?.promise)
      ?? null,
    audience:
      normalizeString(normalizedVision?.audience)
      ?? normalizeString(normalizedIdentity?.audience)
      ?? normalizeString(normalizedPositioning?.audience)
      ?? null,
  };
}

function buildMissingInputs(productVision, projectAuthorizationDecision) {
  const missingInputs = [];
  if (!normalizeString(productVision?.statement) && !normalizeString(productVision?.problem)) {
    missingInputs.push("productVision");
  }
  if (!normalizeString(projectAuthorizationDecision?.decision)) {
    missingInputs.push("projectAuthorizationDecision");
  }
  return missingInputs;
}

function resolveAutomationClass(decisionIntelligence, projectAuthorizationDecision) {
  const requiresApproval = decisionIntelligence?.summary?.requiresApproval === true;
  if (projectAuthorizationDecision?.isBlocked === true) {
    return "user-owned";
  }
  if (requiresApproval || projectAuthorizationDecision?.requiresApproval === true) {
    return "governed-automation";
  }
  return "autonomous-execution";
}

function buildSupportedWorkflows(projectAuthorizationDecision, decisionIntelligence) {
  const authorizationChecks = Array.isArray(projectAuthorizationDecision?.allowedActions)
    ? projectAuthorizationDecision.allowedActions
    : [];
  const autoExecutable = Array.isArray(decisionIntelligence?.autoExecutable)
    ? decisionIntelligence.autoExecutable.map((item) => normalizeString(item?.decisionType ?? item?.actionType ?? item?.reason))
    : [];
  return unique([
    "analyze-project",
    "generate-roadmap",
    "run-governed-execution",
    ...authorizationChecks.map((value) => `action:${value}`),
    ...autoExecutable,
  ]);
}

function buildUnsupportedOperations(projectAuthorizationDecision, decisionIntelligence) {
  const blockedChecks = Array.isArray(projectAuthorizationDecision?.checks)
    ? projectAuthorizationDecision.checks
    : [];
  const uncertain = Array.isArray(decisionIntelligence?.uncertain)
    ? decisionIntelligence.uncertain.map((item) => normalizeString(item?.decisionType ?? item?.actionType ?? item?.reason))
    : [];
  return unique([
    ...(projectAuthorizationDecision?.isBlocked === true ? [normalizeString(projectAuthorizationDecision?.requiredCapability)] : []),
    ...blockedChecks,
    ...uncertain,
  ]);
}

export function defineProductBoundarySchema({
  productVision = null,
  projectIdentity = null,
  nexusPositioning = null,
  projectAuthorizationDecision = null,
  decisionIntelligence = null,
} = {}) {
  const resolvedVision = buildProductVision(productVision, projectIdentity, nexusPositioning);
  const normalizedDecision = normalizeObject(projectAuthorizationDecision);
  const normalizedIntelligence = normalizeObject(decisionIntelligence);
  const missingInputs = buildMissingInputs(resolvedVision, normalizedDecision);
  const automationClass = resolveAutomationClass(normalizedIntelligence, normalizedDecision);
  const supportedWorkflows = buildSupportedWorkflows(normalizedDecision, normalizedIntelligence);
  const unsupportedOperations = buildUnsupportedOperations(normalizedDecision, normalizedIntelligence);

  return {
    productBoundaryModel: {
      productBoundaryModelId: `product-boundary:${slugify(
        projectIdentity?.identityId ?? nexusPositioning?.nexusPositioningId ?? resolvedVision.statement,
      )}`,
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      productVision: resolvedVision,
      boundarySummary:
        resolvedVision.promise
          ? `Nexus owns governed execution for ${resolvedVision.audience ?? "the user"}, while the user keeps approval and product accountability.`
          : "Nexus owns governed execution, while the user keeps approval and product accountability.",
      automationClass,
      automationPolicy: {
        canAutoExecute: normalizedIntelligence?.summary?.canAutoExecute === true && normalizedDecision?.isBlocked !== true,
        requiresApproval: normalizedIntelligence?.summary?.requiresApproval === true || normalizedDecision?.requiresApproval === true,
        blockedByAuthorization: normalizedDecision?.isBlocked === true,
      },
      supportedWorkflows,
      unsupportedOperations,
      userResponsibilities: unique([
        "provide business goal and source-of-truth context",
        "approve high-risk or privileged actions",
        "own final product and business decisions",
      ]),
      systemResponsibilities: unique([
        "analyze current project state",
        "recommend next best actions",
        "execute allowed workflows under governance",
      ]),
    },
  };
}
