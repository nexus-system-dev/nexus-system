import { createProviderSessionFactory } from "./provider-session-factory.js";

export function createProviderConnectorContract({
  providerType = "generic",
  credentials = null,
} = {}) {
  const { providerSession } = createProviderSessionFactory({
    providerType,
    credentials,
  });

  return {
    providerSession,
  };
}
