import { createAuthenticationModeContract } from "./authentication-mode-contract.js";
import { defineProviderConnectorSchema } from "./provider-connector-schema.js";

export function createProviderSessionFactory({
  providerType = "generic",
  credentials = null,
} = {}) {
  const { providerConnectorSchema } = defineProviderConnectorSchema({ providerType });
  const { authModeDefinition } = createAuthenticationModeContract({
    providerType,
    credentials,
  });

  return {
    providerSession: {
      providerType: providerConnectorSchema.providerType,
      credentialReference: authModeDefinition.credentialReference,
      authMode: authModeDefinition.authMode,
      scopes: authModeDefinition.scopes,
      status: authModeDefinition.status,
      capabilities: providerConnectorSchema.capabilities,
      authenticationModes: providerConnectorSchema.authenticationModes,
      operationTypes: providerConnectorSchema.operationTypes,
    },
  };
}
