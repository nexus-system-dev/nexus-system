import { createCredentialEncryptionModule } from "./credential-encryption-module.js";

function sanitizeSegment(value, fallback = "secret") {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

export function createCredentialVaultInterface({
  credentialKey,
  credentialValue,
  credentialReference = null,
  encryptedCredential: encryptedCredentialInput = null,
} = {}) {
  const normalizedKey = sanitizeSegment(credentialKey, "secret");
  const hasValue =
    typeof credentialValue === "string" ? credentialValue.length > 0 : credentialValue !== null && credentialValue !== undefined;
  const referenceId = typeof credentialReference === "string" && credentialReference.trim()
    ? credentialReference.trim()
    : `credref_${normalizedKey}`;
  const encryptedCredential = encryptedCredentialInput ?? createCredentialEncryptionModule({
    plainCredential: credentialValue,
  }).encryptedCredential;

  return {
    credentialReference: referenceId,
    encryptedCredential,
    credentialVaultRecord: {
      credentialReference: referenceId,
      credentialKey: normalizedKey,
      status: hasValue ? "stored" : "pending",
      encryptedCredential,
      secretReferenceLifecycle: {
        created: true,
        encrypted: Boolean(encryptedCredential),
        resolved: false,
        revoked: false,
      },
    },
  };
}
