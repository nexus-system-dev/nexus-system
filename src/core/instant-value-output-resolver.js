function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function selectOutputType(projectIdentity, onboardingSession, domainCapabilities) {
  const requestedDeliverables = normalizeArray(onboardingSession.projectIntake?.requestedDeliverables);
  const taskTypes = normalizeArray(domainCapabilities.taskTypes);

  if (requestedDeliverables.includes("design-input")) {
    return "wireframe";
  }

  if (requestedDeliverables.includes("repo-link")) {
    return "repo-setup";
  }

  if (requestedDeliverables.includes("growth")) {
    return "plan";
  }

  if (taskTypes.includes("frontend") || taskTypes.includes("mobile")) {
    return "first-visible-artifact";
  }

  if (projectIdentity.successDefinition) {
    return "bootstrap";
  }

  return "plan";
}

function buildPreview(outputType, projectIdentity) {
  const projectName = projectIdentity.name ?? "this project";

  switch (outputType) {
    case "wireframe":
      return {
        headline: `A first wireframe is ready for ${projectName}`,
        emphasis: "visual-first",
      };
    case "repo-setup":
      return {
        headline: `A ready project repo is the fastest win for ${projectName}`,
        emphasis: "repo-foundation",
      };
    case "first-visible-artifact":
      return {
        headline: `A first real project result is ready for ${projectName}`,
        emphasis: "visible-output",
      };
    case "bootstrap":
      return {
        headline: `A working project foundation is the fastest win for ${projectName}`,
        emphasis: "execution-first",
      };
    default:
      return {
        headline: `A clear first project plan is ready for ${projectName}`,
        emphasis: "plan-first",
      };
  }
}

export function createInstantValueOutputResolver({
  projectIdentity = null,
  onboardingSession = null,
  domainCapabilities = null,
} = {}) {
  const normalizedProjectIdentity = normalizeObject(projectIdentity);
  const normalizedOnboardingSession = normalizeObject(onboardingSession);
  const normalizedDomainCapabilities = normalizeObject(domainCapabilities);
  const outputType = selectOutputType(
    normalizedProjectIdentity,
    normalizedOnboardingSession,
    normalizedDomainCapabilities,
  );

  return {
    instantValuePlan: {
      planId: `instant-value:${normalizedProjectIdentity.identityId ?? normalizedProjectIdentity.name ?? "unknown"}`,
      outputType,
      preview: buildPreview(outputType, normalizedProjectIdentity),
      requestedDeliverables: normalizeArray(normalizedOnboardingSession.projectIntake?.requestedDeliverables),
      summary: {
        prefersVisibleOutput: ["wireframe", "first-visible-artifact"].includes(outputType),
        isExecutionBacked: ["bootstrap", "repo-setup"].includes(outputType),
      },
    },
  };
}
