import { defineAiDesignResponseSchema } from "./ai-design-response-schema.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createAiDesignProviderAdapter({
  aiDesignRequest = null,
  providerConfig = null,
} = {}) {
  const normalizedProviderConfig = normalizeObject(providerConfig);
  const providerId = normalizeString(normalizedProviderConfig.providerId, "canonical-local-provider");
  const providerMode = normalizeString(normalizedProviderConfig.mode, "deterministic");
  const { aiDesignProposal } = defineAiDesignResponseSchema({
    aiDesignRequest,
    providerPayload: {
      source: providerId,
      summary: `Provider ${providerId} generated canonical proposal in ${providerMode} mode.`,
    },
  });

  return {
    aiDesignProviderResult: {
      providerResultId: `ai-design-provider-result:${providerId}:${aiDesignProposal.proposalId}`,
      providerId,
      mode: providerMode,
      status: "ready",
      aiDesignProposal,
    },
  };
}
