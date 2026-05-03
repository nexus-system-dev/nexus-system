import test from "node:test";
import assert from "node:assert/strict";

import { defineExternalCapabilityRegistrySchema } from "../src/core/external-capability-registry-schema.js";

test("external capability registry schema records auth modes, scopes, operations, and linked accounts", () => {
  const { externalCapabilityRegistry } = defineExternalCapabilityRegistrySchema({
    systemCapabilityRegistry: {
      systemCapabilityRegistryId: "system-capability-registry:nexus",
      executionModes: ["sandbox", "temp-branch"],
      supportedWorkflows: ["action:view", "action:deploy"],
    },
    providerSession: {
      providerType: "hosting",
      authenticationModes: ["api-key", "oauth"],
      scopes: ["deploy:write", "project:read"],
      status: "connected",
    },
    providerConnectorSchema: {
      providerType: "hosting",
      authenticationModes: ["api-key", "oauth"],
      capabilities: ["deploy", "validate", "poll"],
      operationTypes: ["validate", "deploy", "poll", "revoke"],
    },
    providerCapabilities: {
      providerType: "hosting",
      capabilities: ["deploy", "validate", "poll"],
    },
    providerOperations: [
      { operationType: "validate", supported: true, requiresApproval: false },
      { operationType: "deploy", supported: true, requiresApproval: true },
      { operationType: "poll", supported: true, requiresApproval: false },
    ],
    providerConnector: {
      status: "connected",
    },
    verificationResult: {
      status: "verified",
    },
    linkedAccounts: [
      {
        accountRecord: {
          accountId: "acct-1",
          accountType: "hosting",
          connectionMode: "oauth",
        },
        credentialReference: "cred-1",
        providerSession: {
          providerType: "hosting",
          authMode: "oauth",
          scopes: ["deploy:write"],
        },
        verificationResult: {
          status: "verified",
        },
      },
    ],
  });

  assert.equal(externalCapabilityRegistry.status, "ready");
  assert.equal(externalCapabilityRegistry.summary.providerCount, 1);
  assert.equal(externalCapabilityRegistry.providerEntries[0].authModes.includes("oauth"), true);
  assert.equal(externalCapabilityRegistry.providerEntries[0].scopes.includes("deploy:write"), true);
  assert.equal(externalCapabilityRegistry.providerEntries[0].operationalGuarantees.supportsPolling, true);
  assert.equal(externalCapabilityRegistry.providerEntries[0].linkedAccounts[0].accountId, "acct-1");
});

test("external capability registry schema reports missing inputs when system capability registry is absent", () => {
  const { externalCapabilityRegistry } = defineExternalCapabilityRegistrySchema({
    providerSession: {
      providerType: "hosting",
    },
  });

  assert.equal(externalCapabilityRegistry.status, "missing-inputs");
  assert.deepEqual(externalCapabilityRegistry.missingInputs, ["systemCapabilityRegistry"]);
  assert.equal(externalCapabilityRegistry.providerEntries.length, 1);
});
