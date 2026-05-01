import { defineAiDesignRequestSchema } from "./ai-design-request-schema.js";
import { createAiDesignProviderAdapter } from "./ai-design-provider-adapter.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createAiDesignService({
  projectId = null,
  projectState = null,
  selectedTask = null,
  screenContract = null,
  renderableScreenModel = null,
  renderableScreenComposition = null,
  screenFlowMap = null,
  screenStates = null,
  designTokens = null,
  componentContract = null,
  slimmedContextPayload = null,
  providerConfig = null,
} = {}) {
  const { aiDesignRequest } = defineAiDesignRequestSchema({
    projectId,
    selectedTask,
    screenContract,
    renderableScreenModel,
    renderableScreenComposition,
    screenFlowMap,
    screenStates,
    designTokens,
    componentContract,
    slimmedContextPayload,
  });
  const { aiDesignProviderResult } = createAiDesignProviderAdapter({
    aiDesignRequest,
    providerConfig,
  });

  return {
    aiDesignServiceResult: {
      serviceResultId: `ai-design-service:${aiDesignRequest.requestId ?? "unknown"}`,
      projectId,
      status: aiDesignProviderResult.status ?? "ready",
      sourceProjectStateId: normalizeObject(projectState).projectId ?? projectId,
      aiDesignRequest,
      aiDesignProviderResult,
    },
  };
}
