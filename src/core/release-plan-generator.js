const RELEASE_TARGET_TAXONOMY = {
  "private-deployment": {
    category: "deployment",
    steps: ["build", "validate", "deploy", "track"],
  },
  "web-deployment": {
    category: "deployment",
    steps: ["build", "validate", "assets", "deploy", "track"],
  },
  "app-store": {
    category: "store-release",
    steps: ["build", "validate", "metadata", "package", "submit", "track"],
  },
  "play-store": {
    category: "store-release",
    steps: ["build", "validate", "metadata", "package", "submit", "track"],
  },
  "internal-distribution": {
    category: "distribution",
    steps: ["build", "validate", "package", "distribute", "track"],
  },
  "pdf-publishing": {
    category: "publishing",
    steps: ["prepare-content", "validate", "package", "publish", "track"],
  },
  "epub-publishing": {
    category: "publishing",
    steps: ["prepare-content", "validate", "package", "publish", "track"],
  },
  "content-delivery": {
    category: "content",
    steps: ["prepare-content", "validate", "assets", "deliver", "track"],
  },
  "private-distribution": {
    category: "distribution",
    steps: ["validate", "package", "distribute", "track"],
  },
};

function inferReleaseTarget({ projectState = {}, domainProfile = null, releaseTarget = null } = {}) {
  if (releaseTarget) {
    return releaseTarget;
  }

  if (projectState?.recommendedDefaults?.hosting?.target === "web-deployment") {
    return "web-deployment";
  }

  return domainProfile?.releaseTargets?.[0] ?? "private-deployment";
}

function buildReleaseSteps({ releaseTarget, lifecyclePhase, domain }) {
  const taxonomy = RELEASE_TARGET_TAXONOMY[releaseTarget] ?? RELEASE_TARGET_TAXONOMY["private-deployment"];

  return taxonomy.steps.map((step, index) => ({
    id: `release-step-${index + 1}`,
    step,
    order: index + 1,
    domain,
    lifecyclePhase,
    status: "planned",
  }));
}

export function createReleasePlanGenerator({
  projectState = {},
  domain = "generic",
  releaseTarget = null,
  domainProfile = null,
} = {}) {
  const resolvedReleaseTarget = inferReleaseTarget({
    projectState,
    domainProfile,
    releaseTarget,
  });
  const lifecyclePhase = projectState?.lifecycle?.currentPhase ?? "planning";
  const releaseSteps = buildReleaseSteps({
    releaseTarget: resolvedReleaseTarget,
    lifecyclePhase,
    domain,
  });

  return {
    releasePlan: {
      domain,
      lifecyclePhase,
      releaseTarget: resolvedReleaseTarget,
      releaseTargetTaxonomy:
        RELEASE_TARGET_TAXONOMY[resolvedReleaseTarget] ?? RELEASE_TARGET_TAXONOMY["private-deployment"],
      stepCount: releaseSteps.length,
    },
    releaseSteps,
  };
}
