import test from "node:test";
import assert from "node:assert/strict";

import { createSecretResolutionModule } from "../src/core/secret-resolution-module.js";

test("secret resolution module resolves a safe credential reference without exposing the secret value", () => {
  const { secretResolutionState } = createSecretResolutionModule({
    projectId: "giftwallet",
    credentialReference: "credref_hosting-primary",
    credentialVaultRecord: {
      credentialReference: "credref_hosting-primary",
      secretReferenceLifecycle: {
        created: true,
        encrypted: true,
        resolved: false,
        revoked: false,
      },
    },
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: "external-capability-registry:github",
      providerEntries: [
        {
          registryEntryId: "external-capability:github",
          providerType: "github",
          authModes: ["oauth"],
          operationTypes: ["validate", "deploy", "poll"],
        },
      ],
    },
    sourceControlIntegration: {
      sourceControlIntegrationId: "source-control-integration:giftwallet",
      binding: {
        providerType: "github",
        verificationStatus: "verified",
        connectorStatus: "connected",
        linkedAccountId: "acct-1",
      },
    },
  });

  assert.equal(secretResolutionState.status, "ready");
  assert.equal(secretResolutionState.summary.canResolveSecret, true);
  assert.equal(secretResolutionState.summary.safeForConnectorUse, true);
  assert.equal(secretResolutionState.summary.secretValueExposed, false);
});

test("secret resolution module blocks revoked references from safe connector use", () => {
  const { secretResolutionState } = createSecretResolutionModule({
    projectId: "giftwallet",
    credentialReference: "credref_hosting-old",
    credentialVaultRecord: {
      credentialReference: "credref_hosting-old",
      secretReferenceLifecycle: {
        created: true,
        encrypted: true,
        resolved: false,
        revoked: true,
      },
    },
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: "external-capability-registry:github",
      providerEntries: [],
    },
    sourceControlIntegration: {
      sourceControlIntegrationId: "source-control-integration:giftwallet",
      binding: {
        providerType: "github",
        verificationStatus: "verified",
        connectorStatus: "connected",
      },
    },
  });

  assert.equal(secretResolutionState.status, "unresolved");
  assert.equal(secretResolutionState.summary.canResolveSecret, false);
  assert.equal(secretResolutionState.summary.safeForConnectorUse, false);
});
