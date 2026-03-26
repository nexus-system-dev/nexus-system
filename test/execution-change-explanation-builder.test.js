import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionChangeExplanationBuilder } from "../src/core/execution-change-explanation-builder.js";

test("execution change explanation builder summarizes execution artifacts and state advances", () => {
  const { changeExplanation } = createExecutionChangeExplanationBuilder({
    executionResult: {
      requestId: "bootstrap-exec-1",
      status: "completed",
      artifacts: ["project-root", "readme"],
    },
    bootstrapStateUpdate: {
      bootstrap: {
        status: "completed",
      },
    },
    releaseStateUpdate: {
      release: {
        status: "validated",
      },
      transitionEvents: [{ type: "release.completed" }],
    },
  });

  assert.equal(changeExplanation.executionStatus, "completed");
  assert.equal(changeExplanation.updatedArtifacts.length, 2);
  assert.equal(changeExplanation.changedWhat, "בוצעו שינויים חדשים והפרויקט התקדם צעד נוסף.");
  assert.equal(changeExplanation.stateAdvances.includes("שלב ההקמה הראשוני הושלם."), true);
  assert.equal(changeExplanation.summary.hasReleaseImpact, true);
});

test("execution change explanation builder falls back safely with partial inputs", () => {
  const { changeExplanation } = createExecutionChangeExplanationBuilder();

  assert.equal(changeExplanation.executionStatus, "unknown");
  assert.equal(Array.isArray(changeExplanation.updatedArtifacts), true);
  assert.equal(Array.isArray(changeExplanation.stateAdvances), true);
});
