import test from "node:test";
import assert from "node:assert/strict";

import { createArtifactReadinessValidator } from "../src/core/artifact-readiness-validator.js";

test("artifact readiness validator passes when required artifacts exist", () => {
  const { artifactValidation } = createArtifactReadinessValidator({
    projectArtifacts: ["build-output", "static-assets", "runtime-config", "app-shell", "auth-module"],
    releaseRequirements: {
      requiredArtifacts: ["build-output", "app-shell"],
    },
  });

  assert.equal(artifactValidation.isReady, true);
  assert.deepEqual(artifactValidation.missingArtifacts, []);
});

test("artifact readiness validator reports missing artifacts", () => {
  const { artifactValidation } = createArtifactReadinessValidator({
    projectArtifacts: ["build-output"],
    releaseRequirements: {
      requiredArtifacts: ["build-output", "auth-module"],
    },
  });

  assert.equal(artifactValidation.isReady, false);
  assert.equal(artifactValidation.missingArtifacts.includes("auth-module"), true);
});
