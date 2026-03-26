const BUILD_TARGET_BASELINES = {
  "private-deployment": ["app-build"],
  "web-deployment": ["web-build", "static-assets-build"],
  "app-store": ["mobile-build", "store-assets-build"],
  "play-store": ["mobile-build", "store-assets-build"],
  "internal-distribution": ["package-build"],
  "pdf-publishing": ["pdf-build"],
  "epub-publishing": ["epub-build"],
  "content-delivery": ["content-build"],
  "private-distribution": ["distribution-build"],
};

const DOMAIN_BUILD_OVERRIDES = {
  saas: ["auth-build", "backend-build"],
  casino: ["wallet-build", "payments-build"],
  "mobile-app": ["mobile-shell-build"],
  "agency-system": ["reporting-build"],
  book: ["manuscript-build"],
  "content-product": ["content-package-build"],
};

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function buildArtifactManifest(buildTargets = [], releaseTarget) {
  return {
    releaseTarget,
    outputs: buildTargets.map((target) => ({
      buildTarget: target,
      artifactId: `${target}-artifact`,
    })),
  };
}

export function createBuildTargetResolver({
  domain = "generic",
  releaseTarget = "private-deployment",
} = {}) {
  const buildTargets = unique([
    ...(BUILD_TARGET_BASELINES[releaseTarget] ?? BUILD_TARGET_BASELINES["private-deployment"]),
    ...(DOMAIN_BUILD_OVERRIDES[domain] ?? []),
  ]);

  return {
    buildTargets,
    artifactManifest: buildArtifactManifest(buildTargets, releaseTarget),
  };
}
