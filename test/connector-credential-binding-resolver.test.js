import test from "node:test";
import assert from "node:assert/strict";

import { createConnectorCredentialBindingResolver } from "../src/core/connector-credential-binding-resolver.js";

test("connector credential binding resolver binds verified secret state to provider connector", () => {
  const { connectorCredentialBinding } = createConnectorCredentialBindingResolver({
    projectId: "giftwallet",
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: "external-capability-registry:github",
      providerEntries: [
        {
          registryEntryId: "external-capability:github",
          providerType: "github",
          authModes: ["oauth"],
        },
      ],
    },
    secretResolutionState: {
      secretResolutionStateId: "secret-resolution:giftwallet",
      resolution: {
        credentialReference: "credref_github-primary",
        providerType: "github",
        verificationStatus: "verified",
        connectorStatus: "connected",
      },
      providerBinding: {
        linkedAccountId: "acct-1",
      },
      summary: {
        safeForConnectorUse: true,
      },
    },
    providerConnector: {
      providerType: "github",
      status: "connected",
      operations: [{ operationType: "poll" }, { operationType: "deploy" }],
    },
    linkedAccounts: [
      {
        accountRecord: {
          accountId: "acct-1",
        },
        credentialReference: "credref_github-primary",
      },
    ],
  });

  assert.equal(connectorCredentialBinding.status, "ready");
  assert.equal(connectorCredentialBinding.binding.providerType, "github");
  assert.equal(connectorCredentialBinding.binding.linkedAccountId, "acct-1");
  assert.equal(connectorCredentialBinding.summary.safeForRuntimeUse, true);
  assert.equal(connectorCredentialBinding.summary.secretValueExposed, false);
});

test("connector credential binding resolver stays unresolved when secret state is unsafe", () => {
  const { connectorCredentialBinding } = createConnectorCredentialBindingResolver({
    projectId: "giftwallet",
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: "external-capability-registry:github",
      providerEntries: [],
    },
    secretResolutionState: {
      secretResolutionStateId: "secret-resolution:giftwallet",
      resolution: {
        credentialReference: "credref_github-old",
        providerType: "github",
      },
      summary: {
        safeForConnectorUse: false,
      },
    },
  });

  assert.equal(connectorCredentialBinding.status, "unresolved");
  assert.equal(connectorCredentialBinding.summary.safeForRuntimeUse, false);
});
