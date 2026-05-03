import test from "node:test";
import assert from "node:assert/strict";

import { createSourceControlIntegrationBinder } from "../src/core/source-control-integration-binder.js";

test("source control integration binder binds external capability registry to repository state", () => {
  const { sourceControlIntegration } = createSourceControlIntegrationBinder({
    projectId: "giftwallet",
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: "external-capability-registry:hosting",
      providerEntries: [
        {
          registryEntryId: "external-capability:github",
          providerType: "github",
          authModes: ["oauth", "api-key"],
          operationTypes: ["validate", "deploy", "poll"],
          operationalGuarantees: {
            connectorStatus: "connected",
            verificationStatus: "verified",
          },
        },
      ],
    },
    gitSnapshot: {
      provider: "github",
      repo: {
        fullName: "openai/nexus",
        defaultBranch: "main",
      },
      branches: [{ name: "main" }],
      commits: [{ sha: "abc123" }],
      pullRequests: [{ id: 14 }],
    },
    linkedAccounts: [
      {
        accountRecord: {
          accountId: "acct-1",
          metadata: {
            provider: "github",
          },
        },
        credentialReference: "cred-1",
        verificationResult: {
          status: "verified",
        },
        providerSession: {
          providerType: "github",
        },
      },
    ],
  });

  assert.equal(sourceControlIntegration.status, "ready");
  assert.equal(sourceControlIntegration.repository.fullName, "openai/nexus");
  assert.equal(sourceControlIntegration.binding.providerType, "github");
  assert.equal(sourceControlIntegration.binding.linkedAccountId, "acct-1");
  assert.equal(sourceControlIntegration.importContinuation.canContinueFromRepository, true);
});

test("source control integration binder reports missing inputs without registry binding", () => {
  const { sourceControlIntegration } = createSourceControlIntegrationBinder({
    projectId: "giftwallet",
    gitSnapshot: {
      provider: "github",
      repo: {
        fullName: "openai/nexus",
      },
    },
  });

  assert.equal(sourceControlIntegration.status, "missing-inputs");
  assert.deepEqual(sourceControlIntegration.missingInputs, ["externalCapabilityRegistry"]);
});
