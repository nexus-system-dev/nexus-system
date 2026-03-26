import test from "node:test";
import assert from "node:assert/strict";

import { createDeploymentProviderResolver } from "../src/core/deployment-provider-resolver.js";

test("deployment provider resolver returns provider adapter for deployment request", () => {
  const { providerAdapter } = createDeploymentProviderResolver({
    deploymentRequest: {
      requestId: "deployment-request-web",
      provider: "vercel",
      target: "web-deployment",
      environment: "production",
      deploymentMetadata: {
        artifactCount: 2,
      },
    },
  });

  assert.equal(providerAdapter.provider, "vercel");
  assert.equal(providerAdapter.target, "web-deployment");
  assert.equal(providerAdapter.capabilities.includes("preview-deployments"), true);
  assert.equal(providerAdapter.requestMetadata.requestId, "deployment-request-web");
});

test("deployment provider resolver falls back to generic adapter", () => {
  const { providerAdapter } = createDeploymentProviderResolver({
    deploymentRequest: {
      requestId: "deployment-request-unknown",
    },
  });

  assert.equal(providerAdapter.provider, "generic");
  assert.equal(providerAdapter.executionModes.includes("manual"), true);
});
