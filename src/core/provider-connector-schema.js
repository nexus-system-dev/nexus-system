const PROVIDER_CAPABILITY_SCHEMA = {
  hosting: {
    providerType: "hosting",
    authenticationModes: ["api-key", "oauth"],
    capabilities: ["deploy", "validate", "poll"],
    operationTypes: ["validate", "deploy", "poll", "revoke"],
  },
  store: {
    providerType: "store",
    authenticationModes: ["oauth", "service-account"],
    capabilities: ["submit", "poll", "metadata"],
    operationTypes: ["validate", "submit", "poll", "revoke"],
  },
  analytics: {
    providerType: "analytics",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["read", "write", "sync"],
    operationTypes: ["validate", "sync", "revoke"],
  },
  "ad-platform": {
    providerType: "ad-platform",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["campaigns", "audiences", "reporting"],
    operationTypes: ["validate", "sync", "revoke"],
  },
  generic: {
    providerType: "generic",
    authenticationModes: ["manual"],
    capabilities: ["validate"],
    operationTypes: ["validate"],
  },
};

export function defineProviderConnectorSchema({ providerType = "generic" } = {}) {
  const normalizedProviderType =
    typeof providerType === "string" && providerType.trim() ? providerType.trim().toLowerCase() : "generic";

  return {
    providerConnectorSchema:
      PROVIDER_CAPABILITY_SCHEMA[normalizedProviderType] ?? PROVIDER_CAPABILITY_SCHEMA.generic,
  };
}
