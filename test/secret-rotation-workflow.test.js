import test from "node:test";
import assert from "node:assert/strict";

import { createSecretRotationWorkflow } from "../src/core/secret-rotation-workflow.js";

function buildLinkedAccount(accountId, credentialReference = "credref_old", overrides = {}) {
  return {
    accountRecord: {
      accountId,
      provider: "hosting",
      accountType: "hosting",
      connectionMode: "api-key",
      status: "connected",
      credentialReference,
      metadata: {},
    },
    credentialReference,
    credentialVaultRecord: {
      credentialReference,
      credentialKey: "giftwallet-hosting-primary",
      status: "stored",
      encryptedCredential: {
        algorithm: "aes-256-cbc",
        iv: "iv",
        ciphertext: "ciphertext",
      },
      secretReferenceLifecycle: {
        created: true,
        encrypted: true,
        resolved: false,
        revoked: false,
      },
    },
    providerSession: {
      providerType: "hosting",
      authMode: "api-key",
      status: "connected",
      operationTypes: ["verify", "revoke", "submit"],
    },
    ...overrides,
  };
}

test("secret rotation workflow invalidates old reference, re-encrypts, and updates all dependent connectors", () => {
  const project = {
    id: "giftwallet",
    linkedAccounts: [
      buildLinkedAccount("account-1"),
      buildLinkedAccount("account-2"),
    ],
  };

  const { rotationResult, linkedAccounts } = createSecretRotationWorkflow({
    credentialReference: "credref_old",
    rotationRequest: {
      newValue: "next-secret",
      requestedBy: "owner-1",
      reason: "routine-rotation",
    },
    project,
  });

  assert.equal(rotationResult.status, "completed");
  assert.equal(rotationResult.oldReference.secretReferenceLifecycle.revoked, true);
  assert.equal(typeof rotationResult.newReference.credentialReference, "string");
  assert.notEqual(rotationResult.newReference.credentialReference, "credref_old");
  assert.equal(linkedAccounts.every((account) => account.credentialReference === rotationResult.newReference.credentialReference), true);
  assert.equal(rotationResult.affectedConnectors.every((connector) => connector.updated === true), true);
  assert.equal(rotationResult.requestedBy, "owner-1");
});

test("secret rotation workflow fails at invalidation when no dependent connectors are found", () => {
  const { rotationResult } = createSecretRotationWorkflow({
    credentialReference: "credref_missing",
    rotationRequest: {
      newValue: "next-secret",
      requestedBy: "owner-1",
    },
    project: {
      id: "giftwallet",
      linkedAccounts: [],
    },
  });

  assert.equal(rotationResult.status, "failed");
  assert.equal(rotationResult.failedAt, "invalidation");
});

test("secret rotation workflow fails at re-encryption when replacement secret is missing", () => {
  const { rotationResult } = createSecretRotationWorkflow({
    credentialReference: "credref_old",
    rotationRequest: {
      requestedBy: "owner-1",
    },
    project: {
      id: "giftwallet",
      linkedAccounts: [buildLinkedAccount("account-1")],
    },
  });

  assert.equal(rotationResult.status, "failed");
  assert.equal(rotationResult.failedAt, "re-encryption");
});

test("secret rotation workflow fails at re-encryption when encryption module returns null", () => {
  const { rotationResult } = createSecretRotationWorkflow({
    credentialReference: "credref_old",
    rotationRequest: {
      newValue: "next-secret",
      requestedBy: "owner-1",
    },
    project: {
      id: "giftwallet",
      linkedAccounts: [buildLinkedAccount("account-1")],
    },
    encryptionModule: () => ({ encryptedCredential: null }),
  });

  assert.equal(rotationResult.status, "failed");
  assert.equal(rotationResult.failedAt, "re-encryption");
});

test("secret rotation workflow returns partial when connector update does not finish for all accounts", () => {
  const { rotationResult, linkedAccounts } = createSecretRotationWorkflow({
    credentialReference: "credref_old",
    rotationRequest: {
      newValue: "next-secret",
      requestedBy: "owner-1",
    },
    project: {
      id: "giftwallet",
      linkedAccounts: [
        buildLinkedAccount("account-1"),
        buildLinkedAccount("account-2", "credref_old", {
          metadata: { simulateRotationFailure: true },
        }),
      ],
    },
  });

  assert.equal(rotationResult.status, "partial");
  assert.equal(rotationResult.failedAt, "connector-update");
  assert.equal(rotationResult.connectorUpdateErrors.length, 1);
  assert.equal(linkedAccounts[0].credentialReference, rotationResult.newReference.credentialReference);
  assert.equal(linkedAccounts[1].credentialReference, "credref_old");
});

test("secret rotation workflow normalizes malformed request and provider fields", () => {
  const { rotationResult } = createSecretRotationWorkflow({
    credentialReference: " credref_old ",
    rotationRequest: {
      newValue: "next-secret",
      requestedBy: " owner-1 ",
      reason: " routine-rotation ",
      mode: " manual ",
    },
    project: {
      id: " giftwallet ",
      linkedAccounts: [buildLinkedAccount("account-1", "credref_old", {
        accountRecord: {
          accountId: "account-1",
          provider: " hosting ",
          accountType: "hosting",
          connectionMode: " api-key ",
          status: " connected ",
          credentialReference: "credref_old",
          metadata: {},
        },
        providerSession: {
          providerType: " hosting ",
          authMode: " api-key ",
          status: " connected ",
          operationTypes: ["verify"],
        },
      })],
    },
  });

  assert.equal(rotationResult.requestedBy, "owner-1");
  assert.equal(rotationResult.reason, "routine-rotation");
  assert.equal(rotationResult.mode, "manual");
  assert.equal(rotationResult.status, "completed");
});
