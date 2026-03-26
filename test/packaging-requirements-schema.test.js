import test from "node:test";
import assert from "node:assert/strict";

import { definePackagingRequirementsSchema } from "../src/core/packaging-requirements-schema.js";

test("packaging requirements schema returns requirements for web deployment", () => {
  const { packagingRequirements } = definePackagingRequirementsSchema({
    buildArtifact: ["build-output", "static-assets"],
    releaseTarget: "web-deployment",
  });

  assert.equal(packagingRequirements.releaseTarget, "web-deployment");
  assert.equal(packagingRequirements.requiredPackageArtifacts.includes("static-bundle"), true);
  assert.equal(packagingRequirements.artifactCount, 2);
});

test("packaging requirements schema falls back to deployment package", () => {
  const { packagingRequirements } = definePackagingRequirementsSchema();

  assert.equal(packagingRequirements.requiredPackageArtifacts.includes("deployment-package"), true);
  assert.equal(Array.isArray(packagingRequirements.buildArtifacts), true);
});
