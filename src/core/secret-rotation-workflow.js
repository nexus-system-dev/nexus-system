import crypto from "node:crypto";

import { createRotationRequestSchema } from "./rotation-request-schema.js";
import { createDependentConnectorResolver } from "./dependent-connector-resolver.js";
import { createProviderConnectorContract } from "./provider-connector-contract.js";
import { createProviderCapabilityDescriptor } from "./provider-capability-descriptor.js";
import { createProviderOperationContract } from "./provider-operation-contract.js";
import { createProviderConnectorAssembler } from "./provider-connector-assembler.js";
import { createAccountVerificationModule } from "./account-verification-module.js";
import { createCredentialVaultInterface } from "./credential-vault-interface.js";
import { createCredentialEncryptionModule } from "./credential-encryption-module.js";

function buildRotationId() {
  return `credential-rotation:${Date.now()}:${crypto.randomBytes(4).toString("hex")}`;
}

function cloneAccount(account) {
  return account && typeof account === "object" ? structuredClone(account) : account;
}

function normalizeOldReference(credentialReference, affectedConnectors) {
  const matchedRecord = affectedConnectors[0]?.linkedAccount?.credentialVaultRecord ?? null;
  if (credentialReference && typeof credentialReference === "object") {
    return {
      credentialReference: credentialReference.credentialReference ?? matchedRecord?.credentialReference ?? null,
      credentialKey: credentialReference.credentialKey ?? matchedRecord?.credentialKey ?? null,
      status: credentialReference.status ?? matchedRecord?.status ?? null,
      encryptedCredential: credentialReference.encryptedCredential ?? matchedRecord?.encryptedCredential ?? null,
      secretReferenceLifecycle: {
        ...(matchedRecord?.secretReferenceLifecycle ?? {}),
        ...(credentialReference.secretReferenceLifecycle ?? {}),
      },
    };
  }

  return {
    credentialReference: typeof credentialReference === "string" ? credentialReference : matchedRecord?.credentialReference ?? null,
    credentialKey: matchedRecord?.credentialKey ?? null,
    status: matchedRecord?.status ?? null,
    encryptedCredential: matchedRecord?.encryptedCredential ?? null,
    secretReferenceLifecycle: {
      ...(matchedRecord?.secretReferenceLifecycle ?? {}),
    },
  };
}

function buildFailedResult({
  rotationId,
  failedAt,
  oldReference,
  requestedBy,
  reason,
  affectedConnectors = [],
  error,
}) {
  return {
    rotationResult: {
      rotationId,
      status: "failed",
      failedAt,
      oldReference,
      newReference: null,
      affectedConnectors,
      rotatedAt: new Date().toISOString(),
      requestedBy,
      reason,
      error: error?.message ?? error ?? null,
    },
    linkedAccounts: null,
  };
}

export function createSecretRotationWorkflow({
  credentialReference = null,
  rotationRequest = null,
  project = null,
  vaultInterface = createCredentialVaultInterface,
  encryptionModule = createCredentialEncryptionModule,
} = {}) {
  const rotationId = buildRotationId();
  const { rotationRequest: normalizedRotationRequest, validationError } = createRotationRequestSchema(rotationRequest);
  const { affectedConnectors } = createDependentConnectorResolver({
    project,
    credentialReference,
  });
  const oldReference = normalizeOldReference(credentialReference, affectedConnectors);

  if (!oldReference.credentialReference || affectedConnectors.length === 0) {
    return buildFailedResult({
      rotationId,
      failedAt: "invalidation",
      oldReference,
      requestedBy: normalizedRotationRequest.requestedBy,
      reason: normalizedRotationRequest.reason,
      affectedConnectors,
      error: "Credential reference is not attached to any linked connector",
    });
  }

  if (validationError) {
    return buildFailedResult({
      rotationId,
      failedAt: validationError.failedAt,
      oldReference,
      requestedBy: normalizedRotationRequest.requestedBy,
      reason: normalizedRotationRequest.reason,
      affectedConnectors,
      error: validationError.message,
    });
  }

  const invalidatedReference = {
    ...oldReference,
    status: "revoked",
    secretReferenceLifecycle: {
      ...(oldReference.secretReferenceLifecycle ?? {}),
      revoked: true,
      revokedAt: new Date().toISOString(),
    },
  };

  const encryptedCredential = encryptionModule({
    plainCredential: normalizedRotationRequest.nextCredentialValue,
  }).encryptedCredential;

  if (!encryptedCredential) {
    return buildFailedResult({
      rotationId,
      failedAt: "re-encryption",
      oldReference: invalidatedReference,
      requestedBy: normalizedRotationRequest.requestedBy,
      reason: normalizedRotationRequest.reason,
      affectedConnectors,
      error: "Unable to encrypt replacement credential",
    });
  }

  let nextReferencePayload;
  try {
    nextReferencePayload = vaultInterface({
      credentialKey: oldReference.credentialKey ?? `${project?.id ?? "project"}-rotated-secret`,
      credentialValue: normalizedRotationRequest.nextCredentialValue,
      encryptedCredential,
      credentialReference: `${oldReference.credentialReference}:rotated:${Date.now()}`,
    });
  } catch (error) {
    return buildFailedResult({
      rotationId,
      failedAt: "re-encryption",
      oldReference: invalidatedReference,
      requestedBy: normalizedRotationRequest.requestedBy,
      reason: normalizedRotationRequest.reason,
      affectedConnectors,
      error,
    });
  }

  const accounts = Array.isArray(project?.linkedAccounts) ? project.linkedAccounts.map(cloneAccount) : [];
  const connectorUpdateErrors = [];

  for (const connector of affectedConnectors) {
    const accountIndex = connector.index;
    const linkedAccount = accounts[accountIndex];
    if (!linkedAccount) {
      connectorUpdateErrors.push({
        accountId: connector.accountId,
        reason: "Linked account is missing during connector update",
      });
      continue;
    }

    if (linkedAccount.metadata?.simulateRotationFailure === true) {
      connectorUpdateErrors.push({
        accountId: connector.accountId,
        reason: "Simulated connector update failure",
      });
      continue;
    }

    linkedAccount.credentialReference = nextReferencePayload.credentialReference;
    linkedAccount.encryptedCredential = nextReferencePayload.encryptedCredential;
    linkedAccount.credentialVaultRecord = nextReferencePayload.credentialVaultRecord;
    linkedAccount.previousCredentialReference = invalidatedReference.credentialReference;
    linkedAccount.revokedCredentialVaultRecord = invalidatedReference;
    if (linkedAccount.accountRecord) {
      linkedAccount.accountRecord.credentialReference = nextReferencePayload.credentialReference;
      linkedAccount.accountRecord.metadata = {
        ...(linkedAccount.accountRecord.metadata ?? {}),
        previousCredentialReference: invalidatedReference.credentialReference,
      };
    }

    const authMode = linkedAccount.accountRecord?.connectionMode ?? linkedAccount.providerSession?.authMode ?? "manual";
    const status = linkedAccount.accountRecord?.status ?? linkedAccount.providerSession?.status ?? "connected";
    const providerType = linkedAccount.accountRecord?.provider ?? linkedAccount.providerSession?.providerType ?? "generic";
    const { providerSession } = createProviderConnectorContract({
      providerType,
      credentials: {
        credentialReference: nextReferencePayload.credentialReference,
        authMode,
        status,
      },
    });
    const { providerCapabilities } = createProviderCapabilityDescriptor({ providerSession });
    const { providerOperations } = createProviderOperationContract({ providerSession });
    const { providerConnector } = createProviderConnectorAssembler({
      providerSession,
      providerCapabilities,
      providerOperations,
    });
    const { verificationResult } = createAccountVerificationModule({ providerSession });
    linkedAccount.providerSession = providerSession;
    linkedAccount.providerCapabilities = providerCapabilities;
    linkedAccount.providerOperations = providerOperations;
    linkedAccount.providerConnector = providerConnector;
    linkedAccount.verificationResult = verificationResult;
  }

  const status = connectorUpdateErrors.length === 0
    ? "completed"
    : connectorUpdateErrors.length < affectedConnectors.length
      ? "partial"
      : "failed";

  return {
    rotationResult: {
      rotationId,
      status,
      failedAt: status === "completed" ? null : "connector-update",
      oldReference: invalidatedReference,
      newReference: nextReferencePayload.credentialVaultRecord,
      affectedConnectors: affectedConnectors.map((connector) => ({
        accountId: connector.accountId,
        provider: connector.provider,
        accountType: connector.accountType,
        updated: !connectorUpdateErrors.some((error) => error.accountId === connector.accountId),
      })),
      rotatedAt: new Date().toISOString(),
      requestedBy: normalizedRotationRequest.requestedBy,
      reason: normalizedRotationRequest.reason,
      mode: normalizedRotationRequest.mode,
      connectorUpdateErrors,
    },
    linkedAccounts: accounts,
  };
}
