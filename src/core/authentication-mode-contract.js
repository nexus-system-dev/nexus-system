import { defineProviderConnectorSchema } from "./provider-connector-schema.js";

function normalizeCredentials(credentials = null) {
  if (!credentials || typeof credentials !== "object" || Array.isArray(credentials)) {
    return {
      authMode: "manual",
      credentialReference: null,
      scopes: [],
      status: "connected",
    };
  }

  return {
    authMode: typeof credentials.authMode === "string" ? credentials.authMode : "manual",
    credentialReference: typeof credentials.credentialReference === "string" ? credentials.credentialReference : null,
    scopes: Array.isArray(credentials.scopes) ? credentials.scopes : [],
    status: typeof credentials.status === "string" ? credentials.status : "connected",
  };
}

export function createAuthenticationModeContract({
  providerType = "generic",
  credentials = null,
} = {}) {
  const { providerConnectorSchema } = defineProviderConnectorSchema({ providerType });
  const normalizedCredentials = normalizeCredentials(credentials);
  const supportedAuthModes = providerConnectorSchema.authenticationModes ?? ["manual"];
  const authMode = supportedAuthModes.includes(normalizedCredentials.authMode)
    ? normalizedCredentials.authMode
    : supportedAuthModes[0] ?? "manual";

  return {
    authModeDefinition: {
      providerType: providerConnectorSchema.providerType,
      authMode,
      supportedAuthModes,
      credentialReference: normalizedCredentials.credentialReference,
      scopes: normalizedCredentials.scopes,
      status: normalizedCredentials.status,
      requiresCredentials: authMode !== "manual",
    },
  };
}
