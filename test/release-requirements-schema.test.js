import test from "node:test";
import assert from "node:assert/strict";

import { defineReleaseRequirementsSchema } from "../src/core/release-requirements-schema.js";

test("release requirements schema combines target and domain requirements", () => {
  const schema = defineReleaseRequirementsSchema({
    releaseTarget: "web-deployment",
    domain: "saas",
  });

  assert.equal(schema.releaseTarget, "web-deployment");
  assert.equal(schema.requiredArtifacts.includes("build-output"), true);
  assert.equal(schema.requiredArtifacts.includes("app-shell"), true);
  assert.equal(schema.requiredMetadata.includes("deployment-target"), true);
  assert.equal(schema.requiredApprovals.includes("deployment-approval"), true);
});

test("release requirements schema falls back to private deployment defaults", () => {
  const schema = defineReleaseRequirementsSchema({
    releaseTarget: "unknown-target",
    domain: "generic",
  });

  assert.equal(schema.requiredArtifacts.includes("build-output"), true);
});
