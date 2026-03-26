import test from "node:test";
import assert from "node:assert/strict";

import { createBootstrapValidationModule } from "../src/core/bootstrap-validation-module.js";

test("bootstrap validation module marks result valid when expected artifacts exist", () => {
  const { validationResult } = createBootstrapValidationModule({
    bootstrapResult: {
      status: "planned",
      artifacts: ["project-root", "readme", "config"],
    },
    expectedArtifacts: ["project-root", "readme"],
    scan: { exists: true },
    taskResults: [{ taskId: "bootstrap-saas-1", status: "completed" }],
  });

  assert.equal(validationResult.isValid, true);
  assert.deepEqual(validationResult.missingArtifacts, []);
  assert.equal(validationResult.validationEvidence.scannedProject, true);
});

test("bootstrap validation module marks result invalid when artifacts are missing", () => {
  const { validationResult } = createBootstrapValidationModule({
    bootstrapResult: {
      status: "failed",
      artifacts: ["project-root"],
    },
    expectedArtifacts: ["project-root", "readme"],
    taskResults: [],
  });

  assert.equal(validationResult.isValid, false);
  assert.equal(validationResult.missingArtifacts.includes("readme"), true);
  assert.equal(validationResult.validationEvidence.executionStatus, "failed");
});
