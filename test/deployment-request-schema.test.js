import test from "node:test";
import assert from "node:assert/strict";

import { defineDeploymentRequestSchema } from "../src/core/deployment-request-schema.js";

test("deployment request schema returns canonical deployment request", () => {
  const { deploymentRequest } = defineDeploymentRequestSchema({
    buildArtifact: ["build-output", "static-assets"],
    deploymentConfig: {
      provider: "vercel",
      target: "web-deployment",
      environment: "production",
      executionMode: "api",
      capabilities: ["static-hosting"],
    },
  });

  assert.equal(deploymentRequest.provider, "vercel");
  assert.equal(deploymentRequest.target, "web-deployment");
  assert.equal(deploymentRequest.environment, "production");
  assert.equal(deploymentRequest.buildArtifacts.length, 2);
  assert.equal(deploymentRequest.deploymentConfig.executionMode, "api");
});

test("deployment request schema falls back to defaults", () => {
  const { deploymentRequest } = defineDeploymentRequestSchema();

  assert.equal(deploymentRequest.provider, "generic");
  assert.equal(deploymentRequest.target, "private-deployment");
  assert.equal(Array.isArray(deploymentRequest.buildArtifacts), true);
});
