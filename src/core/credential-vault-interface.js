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
} = {}) {
  const normalizedKey = sanitizeSegment(credentialKey, "secret");
  const hasValue =
    typeof credentialValue === "string" ? credentialValue.length > 0 : credentialValue !== null && credentialValue !== undefined;
  const referenceId = `credref_${normalizedKey}`;
  const { encryptedCredential } = createCredentialEncryptionModule({
    plainCredential: credentialValue,
  });

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
