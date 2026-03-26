import test from "node:test";
import assert from "node:assert/strict";

import { createMetadataReadinessValidator } from "../src/core/metadata-readiness-validator.js";

test("metadata readiness validator passes when required metadata exists", () => {
  const { metadataValidation } = createMetadataReadinessValidator({
    projectArtifacts: ["deployment-target", "environment-config", "version-info"],
    releaseRequirements: {
      requiredMetadata: ["deployment-target", "environment-config"],
    },
  });

  assert.equal(metadataValidation.isReady, true);
  assert.deepEqual(metadataValidation.missingMetadata, []);
});

test("metadata readiness validator reports missing metadata", () => {
  const { metadataValidation } = createMetadataReadinessValidator({
    projectArtifacts: ["deployment-target"],
    releaseRequirements: {
      requiredMetadata: ["deployment-target", "version-info"],
    },
  });

  assert.equal(metadataValidation.isReady, false);
  assert.equal(metadataValidation.missingMetadata.includes("version-info"), true);
});
