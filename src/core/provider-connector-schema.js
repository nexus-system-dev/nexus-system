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
  messaging: {
    providerType: "messaging",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["draft", "send", "sync"],
    operationTypes: ["validate", "draft", "send", "poll", "revoke"],
  },
  whatsapp: {
    providerType: "whatsapp",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["draft", "send", "sync"],
    operationTypes: ["validate", "draft", "send", "poll", "revoke"],
  },
  payment: {
    providerType: "payment",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["read", "checkout-draft", "charge", "refund"],
    operationTypes: ["validate", "draft", "charge", "refund", "poll", "revoke"],
  },
  stripe: {
    providerType: "stripe",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["read", "checkout-draft", "charge", "refund"],
    operationTypes: ["validate", "draft", "charge", "refund", "poll", "revoke"],
  },
  email: {
    providerType: "email",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["draft", "test", "send", "audience-sync"],
    operationTypes: ["validate", "draft", "test", "send", "poll", "revoke"],
  },
  creative: {
    providerType: "creative",
    authenticationModes: ["oauth", "api-key", "manual"],
    capabilities: ["concept", "draft", "generate", "edit", "import", "export", "brand-safe"],
    operationTypes: ["validate", "concept", "draft", "generate", "edit", "import", "export", "revoke"],
  },
  figma: {
    providerType: "figma",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["concept", "draft", "import", "export", "design-read", "design-write"],
    operationTypes: ["validate", "import", "export", "poll", "revoke"],
  },
  "ad-platform": {
    providerType: "ad-platform",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["draft", "campaigns", "audiences", "reporting", "publish", "spend"],
    operationTypes: ["validate", "draft", "sync", "publish", "spend", "poll", "revoke"],
  },
  deploy: {
    providerType: "deploy",
    authenticationModes: ["oauth", "api-key"],
    capabilities: ["validate", "deploy", "publish", "poll"],
    operationTypes: ["validate", "deploy", "publish", "poll", "revoke"],
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
