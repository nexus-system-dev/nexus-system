const FEATURE_FLAG_ROUTE_REGISTRY = {
  "live-updates": {
    capabilities: ["live-updates", "workspace-live-stream"],
    routes: [
      "/api/projects/*/live-state",
      "/api/projects/*/events",
    ],
  },
  "ai-design-proposals": {
    capabilities: ["ai-design-proposals"],
    routes: [
      "/api/projects/*/design-proposals",
    ],
  },
  "provider-runtime-execution": {
    capabilities: ["provider-runtime-execution", "external-account-mutations"],
    routes: [
      "/api/projects/*/accounts/link",
      "/api/projects/*/accounts/verify",
      "/api/projects/*/accounts/rotate",
    ],
  },
  "emergency-execution-stop": {
    capabilities: ["execution-stop"],
    routes: [
      "/api/projects/*/accounts/link",
      "/api/projects/*/accounts/verify",
      "/api/projects/*/accounts/rotate",
      "/api/projects/*/rollback",
    ],
  },
};

export function createFeatureFlagRouteRegistry() {
  return {
    featureFlagRouteRegistry: FEATURE_FLAG_ROUTE_REGISTRY,
  };
}
