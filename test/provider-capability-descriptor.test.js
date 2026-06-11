import test from "node:test";
import assert from "node:assert/strict";

import { createProviderCapabilityDescriptor } from "../src/core/provider-capability-descriptor.js";

test("provider capability descriptor returns canonical capabilities", () => {
  const { providerCapabilities } = createProviderCapabilityDescriptor({
    providerSession: {
      providerType: "hosting",
      capabilities: ["deploy", "validate", "poll"],
      authenticationModes: ["api-key", "oauth"],
      operationTypes: ["validate", "deploy", "poll"],
    },
  });

  assert.equal(providerCapabilities.providerType, "hosting");
  assert.equal(providerCapabilities.supportsDeploy, true);
  assert.equal(providerCapabilities.supportsPolling, true);
});

test("provider capability descriptor falls back to generic empty capabilities", () => {
  const { providerCapabilities } = createProviderCapabilityDescriptor();

  assert.equal(providerCapabilities.providerType, "generic");
  assert.deepEqual(providerCapabilities.capabilities, []);
  assert.equal(providerCapabilities.supportsDeploy, false);
});

test("provider capability descriptor marks side-effect and creative operations", () => {
  const { providerCapabilities } = createProviderCapabilityDescriptor({
    providerSession: {
      providerType: "creative",
      capabilities: ["concept", "draft", "generate", "brand-safe"],
      authenticationModes: ["oauth"],
      operationTypes: ["validate", "generate", "export", "revoke"],
      scopes: ["write"],
    },
  });

  assert.equal(providerCapabilities.supportsCreativeGeneration, true);
  assert.equal(providerCapabilities.capabilityMetadata.find((entry) => entry.operationType === "generate")?.requiresApproval, true);
  assert.equal(providerCapabilities.capabilityMetadata.find((entry) => entry.operationType === "generate")?.modes.generate, true);
  assert.equal(providerCapabilities.capabilityMetadata.find((entry) => entry.operationType === "export")?.modes.export, true);
  assert.equal(providerCapabilities.approvalRequiredOperations.includes("generate"), true);
});
