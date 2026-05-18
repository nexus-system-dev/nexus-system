import test from "node:test";
import assert from "node:assert/strict";

import { defineAiDesignRequestSchema } from "../src/core/ai-design-request-schema.js";
import { createClassAwareGenerationContract } from "../src/core/class-aware-generation-contract.js";
import { createClassSpecificSurfaceEvolutionRules } from "../src/core/class-specific-surface-evolution-rules.js";

test("ai design request schema carries class-aware generation contract into the request", () => {
  const classAwareGenerationContract = createClassAwareGenerationContract({
    productClass: "internal-tool",
    artifactExpectation: {
      title: "Support queue workspace",
      projectType: "internal-tool",
      proofFocus: ["queue ownership", "next operational move"],
    },
  });
  const classSpecificSurfaceEvolutionRules = createClassSpecificSurfaceEvolutionRules({
    productClass: "internal-tool",
    classAwareGenerationContract,
  });

  const { aiDesignRequest } = defineAiDesignRequestSchema({
    projectId: "project-1",
    selectedTask: {
      id: "task-1",
      summary: "Render the first support workspace",
      lane: "product",
      taskType: "implementation",
    },
    screenContract: {
      screenId: "screen-1",
      screenType: "workspace",
      title: "Support workspace",
    },
    renderableScreenModel: {
      modelId: "model-1",
      screenId: "screen-1",
      screenType: "workspace",
      title: "Support workspace",
      regions: [
        { regionId: "queue", slot: "queue", componentType: "panel", role: "queue-panel" },
      ],
    },
    renderableScreenComposition: {
      compositionId: "composition-1",
      screenId: "screen-1",
      currentPhase: "populated",
      ctaAnchors: [{ ctaId: "cta-1", label: "Action", anchor: "primary" }],
    },
    classAwareGenerationContract,
    classSpecificSurfaceEvolutionRules,
    artifactExpectation: {
      expectationId: "expectation-1",
      projectType: "internal-tool",
      title: "Support queue workspace",
    },
  });

  assert.equal(aiDesignRequest.classAwareGenerationContract.productClass, "internal-tool");
  assert.equal(aiDesignRequest.classAwareGenerationContract.generationMode, "workspace-operations");
  assert.equal(aiDesignRequest.generationIntent.primaryAction.actionIntent, "operate");
  assert.equal(aiDesignRequest.generationIntent.surfaceMutationModel, "queue-workspace");
  assert.equal(aiDesignRequest.classSpecificSurfaceEvolutionRules.evolutionFamily, "workspace-evolution");
  assert.equal(aiDesignRequest.classSpecificSurfaceEvolutionRules.frontendSurfaceType, "operations-workspace");
  assert.equal(aiDesignRequest.classSpecificSurfaceEvolutionRules.backendStateType, "queue-state");
  assert.equal(aiDesignRequest.classSpecificSurfaceEvolutionRules.sceneType, "queue-workspace");
  assert.equal(
    aiDesignRequest.classSpecificSurfaceEvolutionRules.requiredVisibleChanges.includes("queue surface evolves"),
    true,
  );
});
