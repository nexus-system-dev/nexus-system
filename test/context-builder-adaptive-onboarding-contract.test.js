import test from "node:test";
import assert from "node:assert/strict";

import { buildProjectContext } from "../src/core/context-builder.js";

const TEST_CANONICAL_TASK_INVENTORY = Array.from({ length: 3 }, (_, index) => ({
  execution_order: String(index + 1).padStart(3, "0"),
  taskName: `Canonical Task ${String(index + 1).padStart(3, "0")}`,
  lane: "Test Lane",
  state: "trueGreen",
  blocker: null,
  bridgeCondition: null,
}));

test("context builder exposes adaptive onboarding agent contract in canonical context", () => {
  const context = buildProjectContext({
    id: "ops-queue",
    goal: "לבנות כלי פנימי לצוות תפעול",
    state: {
      knowledge: {},
      product: {},
      stack: {},
    },
    onboardingSession: {
      sessionId: "session-1",
      projectDraftId: "ops-queue",
      projectIntake: {
        projectName: "Ops Queue",
        visionText: "כלי פנימי לצוות תפעול",
        projectType: "internal-tool",
        uploadedFiles: [],
        externalLinks: [],
        requestedDeliverables: [],
      },
      conversation: {
        answers: {
          "target-audience": "צוות תפעול",
          "core-problem": "אין להם מסך אחד לתור העבודה",
        },
      },
    },
    canonicalTaskInventory: TEST_CANONICAL_TASK_INVENTORY,
  });

  assert.equal(context.adaptiveOnboardingAgentContract.contractFamily, "adaptive-onboarding-agent");
  assert.equal(context.adaptiveOnboardingAgentContract.currentProjectType, "internal-tool");
  assert.equal(Array.isArray(context.adaptiveOnboardingAgentContract.behaviors), true);
  assert.equal(context.adaptiveOnboardingAgentContract.behaviors.some((item) => item.label === "bounded handoff into generation"), true);
});
