import test from "node:test";
import assert from "node:assert/strict";

import { createDeploymentArtifactPreparer } from "../src/core/deployment-artifact-preparer.js";

test("deployment artifact preparer returns prepared artifact for web deployment", () => {
  const { preparedArtifact } = createDeploymentArtifactPreparer({
    buildArtifact: ["build-output", "static-assets"],
    deploymentConfig: {
      provider: "vercel",
      target: "web-deployment",
      environment: "production",
      executionMode: "api",
      capabilities: ["static-hosting"],
    },
  });

  assert.equal(preparedArtifact.provider, "vercel");
  assert.equal(preparedArtifact.target, "web-deployment");
  assert.equal(preparedArtifact.packageFormat, "static-bundle");
  assert.equal(preparedArtifact.artifacts.length, 2);
});

test("deployment artifact preparer falls back to generic bundle", () => {
  const { preparedArtifact } = createDeploymentArtifactPreparer();

  assert.equal(preparedArtifact.packageFormat, "service-bundle");
  assert.equal(Array.isArray(preparedArtifact.artifacts), true);
});
