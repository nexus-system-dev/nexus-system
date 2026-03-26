import test from "node:test";
import assert from "node:assert/strict";

import { createHostingProviderAdapterContract } from "../src/core/hosting-provider-adapter-contract.js";

test("hosting provider adapter contract returns canonical provider adapter with capability matrix", () => {
  const { hostingAdapter } = createHostingProviderAdapterContract({
    providerConfig: {
      provider: "vercel",
      target: "web-deployment",
    },
  });

  assert.equal(hostingAdapter.provider, "vercel");
  assert.equal(hostingAdapter.target, "web-deployment");
  assert.equal(hostingAdapter.supportedTargets.includes("web-deployment"), true);
  assert.equal(hostingAdapter.capabilities.includes("preview-deployments"), true);
  assert.equal(hostingAdapter.providerCapabilityMatrix.providerType, "vercel");
});

test("hosting provider adapter contract falls back to generic provider", () => {
  const { hostingAdapter } = createHostingProviderAdapterContract({
    providerConfig: {
      provider: "unknown-provider",
    },
  });

  assert.equal(hostingAdapter.provider, "generic");
  assert.equal(hostingAdapter.executionModes.includes("manual"), true);
});
