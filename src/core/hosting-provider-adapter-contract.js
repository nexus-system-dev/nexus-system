const PROVIDER_CAPABILITY_MATRIX = {
  vercel: {
    providerType: "vercel",
    targets: ["web-deployment"],
    environments: ["preview", "production"],
    capabilities: ["static-hosting", "serverless-functions", "preview-deployments", "env-management"],
    executionModes: ["api", "cli"],
  },
  netlify: {
    providerType: "netlify",
    targets: ["web-deployment", "content-delivery"],
    environments: ["preview", "production"],
    capabilities: ["static-hosting", "edge-functions", "preview-deployments", "env-management"],
    executionModes: ["api", "cli"],
  },
  railway: {
    providerType: "railway",
    targets: ["private-deployment", "web-deployment"],
    environments: ["staging", "production"],
    capabilities: ["container-deployments", "database-plugins", "env-management"],
    executionModes: ["api", "cli"],
  },
  render: {
    providerType: "render",
    targets: ["private-deployment", "web-deployment"],
    environments: ["staging", "production"],
    capabilities: ["web-services", "worker-services", "cron-jobs", "env-management"],
    executionModes: ["api"],
  },
  firebase: {
    providerType: "firebase",
    targets: ["web-deployment", "content-delivery"],
    environments: ["preview", "production"],
    capabilities: ["static-hosting", "functions", "preview-channels", "analytics"],
    executionModes: ["cli"],
  },
  generic: {
    providerType: "generic",
    targets: ["private-deployment"],
    environments: ["staging", "production"],
    capabilities: ["deployments"],
    executionModes: ["manual"],
  },
};

function normalizeProviderConfig(providerConfig = {}) {
  if (!providerConfig || typeof providerConfig !== "object" || Array.isArray(providerConfig)) {
    return {
      provider: "generic",
      target: "private-deployment",
    };
  }

  return {
    provider: typeof providerConfig.provider === "string" && providerConfig.provider.trim()
      ? providerConfig.provider.trim().toLowerCase()
      : "generic",
    target: typeof providerConfig.target === "string" && providerConfig.target.trim()
      ? providerConfig.target.trim()
      : "private-deployment",
    region: typeof providerConfig.region === "string" ? providerConfig.region.trim() : null,
    team: typeof providerConfig.team === "string" ? providerConfig.team.trim() : null,
  };
}

export function createHostingProviderAdapterContract({ providerConfig = {} } = {}) {
  const normalizedConfig = normalizeProviderConfig(providerConfig);
  const providerDefinition = PROVIDER_CAPABILITY_MATRIX[normalizedConfig.provider] ?? PROVIDER_CAPABILITY_MATRIX.generic;

  return {
    hostingAdapter: {
      provider: providerDefinition.providerType,
      target: normalizedConfig.target,
      config: normalizedConfig,
      supportedTargets: providerDefinition.targets,
      environments: providerDefinition.environments,
      capabilities: providerDefinition.capabilities,
      executionModes: providerDefinition.executionModes,
      providerCapabilityMatrix: providerDefinition,
    },
  };
}
