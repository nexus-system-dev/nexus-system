function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function inferProjectName(projectIntake, businessContext, domainDecision) {
  return (
    normalizeString(projectIntake.projectName) ??
    normalizeString(projectIntake.name) ??
    normalizeString(businessContext.positioning) ??
    `${domainDecision.domain ?? "generic"} project`
  );
}

function inferVision(projectIntake, businessContext, domainDecision) {
  return (
    normalizeString(projectIntake.visionText) ??
    normalizeString(projectIntake.goal) ??
    normalizeString(businessContext.positioning) ??
    `Build a focused ${domainDecision.domain ?? "generic"} product`
  );
}

function inferSuccessDefinition(projectIntake, businessContext) {
  if (Array.isArray(projectIntake.requestedDeliverables) && projectIntake.requestedDeliverables.length > 0) {
    return `Deliver ${projectIntake.requestedDeliverables.join(", ")}`;
  }

  if (Array.isArray(businessContext.kpis) && businessContext.kpis.length > 0) {
    return `Move the core KPIs: ${businessContext.kpis.join(", ")}`;
  }

  return "Reach a clear first working outcome";
}

function inferDifferentiation(projectIntake, businessContext, domainDecision) {
  return (
    normalizeString(projectIntake.differentiation) ??
    normalizeString(businessContext.positioning) ??
    `Purpose-built for ${domainDecision.domain ?? "generic"} workflows`
  );
}

function inferTone(projectIntake, domainDecision) {
  return (
    normalizeString(projectIntake.tone) ??
    (domainDecision.domain === "agency-system" ? "operational" : "clear")
  );
}

export function defineProjectIdentitySchema({
  projectIntake = null,
  businessContext = null,
  domainDecision = null,
} = {}) {
  const normalizedProjectIntake = normalizeObject(projectIntake);
  const normalizedBusinessContext = normalizeObject(businessContext);
  const normalizedDomainDecision = normalizeObject(domainDecision);

  const projectIdentity = {
    identityId: `project-identity:${normalizedProjectIntake.projectName ?? normalizedDomainDecision.domain ?? "unknown"}`,
    name: inferProjectName(
      normalizedProjectIntake,
      normalizedBusinessContext,
      normalizedDomainDecision,
    ),
    vision: inferVision(
      normalizedProjectIntake,
      normalizedBusinessContext,
      normalizedDomainDecision,
    ),
    audience: normalizeString(normalizedBusinessContext.targetAudience, "early users"),
    successDefinition: inferSuccessDefinition(normalizedProjectIntake, normalizedBusinessContext),
    differentiation: inferDifferentiation(
      normalizedProjectIntake,
      normalizedBusinessContext,
      normalizedDomainDecision,
    ),
    tone: inferTone(normalizedProjectIntake, normalizedDomainDecision),
    summary: {
      domain: normalizedDomainDecision.domain ?? "generic",
      hasExplicitAudience: Boolean(normalizedBusinessContext.targetAudience),
      hasExplicitDeliverables: Array.isArray(normalizedProjectIntake.requestedDeliverables)
        && normalizedProjectIntake.requestedDeliverables.length > 0,
    },
  };

  return {
    projectIdentity,
  };
}
