export function createAccountVerificationModule({
  providerSession = null,
} = {}) {
  const providerType = providerSession?.providerType ?? "generic";
  const authMode = providerSession?.authMode ?? "manual";
  const credentialReference = providerSession?.credentialReference ?? null;
  const capabilities = Array.isArray(providerSession?.capabilities) ? providerSession.capabilities : [];
  const hasUsableCredentials = authMode === "manual" || Boolean(credentialReference);

  return {
    verificationResult: {
      providerType,
      authMode,
      isVerified: hasUsableCredentials && capabilities.length > 0,
      status: hasUsableCredentials ? "verified" : "missing-credentials",
      credentialReference,
      availableCapabilities: capabilities,
      blockingIssues: hasUsableCredentials ? [] : ["missing-credential-reference"],
    },
  };
}
