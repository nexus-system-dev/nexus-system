import crypto from "node:crypto";

const DEFAULT_SECRET = "the-nexus-local-secret";

function deriveKey(secret = DEFAULT_SECRET) {
  return crypto.createHash("sha256").update(secret).digest();
}

export function createCredentialEncryptionModule({
  plainCredential = null,
  secret = DEFAULT_SECRET,
} = {}) {
  if (plainCredential === null || plainCredential === undefined || plainCredential === "") {
    return {
      encryptedCredential: null,
    };
  }

  const iv = crypto.randomBytes(16);
  const key = deriveKey(secret);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plainCredential), "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedCredential: {
      algorithm: "aes-256-cbc",
      iv: iv.toString("hex"),
      ciphertext: encrypted.toString("hex"),
    },
  };
}
