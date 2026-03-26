const BASE_RELEASE_REQUIREMENTS = {
  "private-deployment": {
    requiredArtifacts: ["build-output", "runtime-config"],
    requiredMetadata: [],
    requiredApprovals: [],
  },
  "web-deployment": {
    requiredArtifacts: ["build-output", "static-assets", "runtime-config"],
    requiredMetadata: ["deployment-target"],
    requiredApprovals: ["deployment-approval"],
  },
  "app-store": {
    requiredArtifacts: ["mobile-binary", "store-assets"],
    requiredMetadata: ["store-metadata", "version-info"],
    requiredApprovals: ["store-release-approval"],
  },
  "play-store": {
    requiredArtifacts: ["mobile-binary", "store-assets"],
    requiredMetadata: ["store-metadata", "version-info"],
    requiredApprovals: ["store-release-approval"],
  },
  "internal-distribution": {
    requiredArtifacts: ["package-bundle"],
    requiredMetadata: ["distribution-channel"],
    requiredApprovals: ["distribution-approval"],
  },
  "pdf-publishing": {
    requiredArtifacts: ["pdf-output"],
    requiredMetadata: ["book-metadata"],
    requiredApprovals: ["publishing-approval"],
  },
  "epub-publishing": {
    requiredArtifacts: ["epub-output"],
    requiredMetadata: ["book-metadata"],
    requiredApprovals: ["publishing-approval"],
  },
  "content-delivery": {
    requiredArtifacts: ["content-package"],
    requiredMetadata: ["delivery-format"],
    requiredApprovals: ["content-release-approval"],
  },
  "private-distribution": {
    requiredArtifacts: ["distribution-package"],
    requiredMetadata: [],
    requiredApprovals: ["distribution-approval"],
  },
};

const DOMAIN_REQUIREMENTS = {
  saas: {
    requiredArtifacts: ["app-shell", "auth-module"],
    requiredMetadata: ["environment-config"],
    requiredApprovals: ["stack-approval"],
  },
  casino: {
    requiredArtifacts: ["auth-module", "wallet-module"],
    requiredMetadata: ["compliance-notes"],
    requiredApprovals: ["compliance-approval"],
  },
  "mobile-app": {
    requiredArtifacts: ["mobile-shell", "navigation"],
    requiredMetadata: ["bundle-id"],
    requiredApprovals: ["mobile-release-approval"],
  },
};

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function defineReleaseRequirementsSchema({
  releaseTarget = "private-deployment",
  domain = "generic",
} = {}) {
  const base = BASE_RELEASE_REQUIREMENTS[releaseTarget] ?? BASE_RELEASE_REQUIREMENTS["private-deployment"];
  const domainSpecific = DOMAIN_REQUIREMENTS[domain] ?? {
    requiredArtifacts: [],
    requiredMetadata: [],
    requiredApprovals: [],
  };

  return {
    releaseTarget,
    domain,
    requiredArtifacts: unique([
      ...(base.requiredArtifacts ?? []),
      ...(domainSpecific.requiredArtifacts ?? []),
    ]),
    requiredMetadata: unique([
      ...(base.requiredMetadata ?? []),
      ...(domainSpecific.requiredMetadata ?? []),
    ]),
    requiredApprovals: unique([
      ...(base.requiredApprovals ?? []),
      ...(domainSpecific.requiredApprovals ?? []),
    ]),
  };
}
