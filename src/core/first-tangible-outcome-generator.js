function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function humanizeArtifact(artifact) {
  const text = String(artifact ?? "").toLowerCase();

  if (text.includes("app-shell")) {
    return "starter app shell";
  }

  if (text.includes("auth")) {
    return "working auth flow";
  }

  if (text.includes("billing")) {
    return "billing foundation";
  }

  if (text.includes("project-root") || text.includes("repo")) {
    return "ready project repo";
  }

  if (text.includes("readme")) {
    return "project guide";
  }

  return String(artifact ?? "project asset");
}

function inferPrimaryValue(artifacts) {
  const artifactText = artifacts.map(humanizeArtifact);

  if (artifactText.some((item) => item === "starter app shell")) {
    return {
      outcomeType: "starter-app",
      headline: "Your starter app is ready",
      detail: "You already have a first app structure you can build on immediately.",
    };
  }

  if (artifactText.some((item) => item === "working auth flow")) {
    return {
      outcomeType: "first-user-flow",
      headline: "Your first user flow is ready",
      detail: "The project already has a visible foundation for sign-up and login work.",
    };
  }

  if (artifactText.some((item) => item === "ready project repo")) {
    return {
      outcomeType: "ready-repo",
      headline: "Your project repo is ready",
      detail: "You can already open a real project structure and keep moving from there.",
    };
  }

  return {
    outcomeType: "first-visible-artifact",
    headline: "Your first project result is ready",
    detail: "The project already has something concrete you can inspect and improve.",
  };
}

function inferOutcomeType(instantValuePlan, bootstrapResult, projectState) {
  if (normalizeArray(bootstrapResult.artifacts).length > 0) {
    return inferPrimaryValue(normalizeArray(bootstrapResult.artifacts)).outcomeType;
  }

  if (instantValuePlan.outputType) {
    return instantValuePlan.outputType;
  }

  if (projectState.diffPreview?.headline) {
    return "visible-change";
  }

  return "project-foundation";
}

function inferPreview(instantValuePlan, bootstrapResult, projectState) {
  const artifacts = normalizeArray(bootstrapResult.artifacts);

  if (artifacts.length > 0) {
    const primaryValue = inferPrimaryValue(artifacts);
    return {
      headline: primaryValue.headline,
      detail: primaryValue.detail,
      primaryArtifact: humanizeArtifact(artifacts[0]),
      visibleResult: primaryValue.outcomeType,
    };
  }

  if (instantValuePlan.preview) {
    return instantValuePlan.preview;
  }

  return {
    headline: `${projectState.projectName ?? projectState.projectId ?? "This project"} is ready to start`,
    detail: "The project foundation is prepared so the next step can produce something visible quickly.",
    primaryArtifact: null,
  };
}

export function createFirstTangibleOutcomeGenerator({
  instantValuePlan = null,
  projectState = null,
  bootstrapResult = null,
} = {}) {
  const normalizedInstantValuePlan = normalizeObject(instantValuePlan);
  const normalizedProjectState = normalizeObject(projectState);
  const normalizedBootstrapResult = normalizeObject(bootstrapResult);
  const outcomeType = inferOutcomeType(
    normalizedInstantValuePlan,
    normalizedBootstrapResult,
    normalizedProjectState,
  );
  const preview = inferPreview(
    normalizedInstantValuePlan,
    normalizedBootstrapResult,
    normalizedProjectState,
  );
  const artifacts = normalizeArray(normalizedBootstrapResult.artifacts);

  return {
    firstValueOutput: {
      outputId: `first-value:${normalizedProjectState.projectId ?? "unknown"}`,
      outcomeType,
      preview,
      artifacts,
      userVisibleArtifacts: artifacts.map(humanizeArtifact),
      summary: {
        artifactCount: artifacts.length,
        bootstrapStatus: normalizedBootstrapResult.status ?? "unknown",
        feelsReal: artifacts.length > 0 || outcomeType !== "project-foundation",
      },
    },
  };
}
