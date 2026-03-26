export function defineUserIdentitySchema({
  userProfile = null,
  authMetadata = null,
} = {}) {
  const email = typeof userProfile?.email === "string" ? userProfile.email : null;
  const authProvider = typeof authMetadata?.provider === "string" ? authMetadata.provider : "password";
  const verificationStatus =
    typeof userProfile?.verificationStatus === "string"
      ? userProfile.verificationStatus
      : email
        ? "verified"
        : "unverified";

  return {
    userIdentity: {
      userId: userProfile?.userId ?? null,
      email,
      displayName:
        typeof userProfile?.displayName === "string"
          ? userProfile.displayName
          : userProfile?.userId ?? "anonymous-user",
      status: typeof userProfile?.status === "string" ? userProfile.status : "active",
      verificationStatus,
      authMetadata: {
        provider: authProvider,
        sessionStatus: typeof authMetadata?.sessionStatus === "string" ? authMetadata.sessionStatus : "unknown",
        hasMfa: authMetadata?.hasMfa === true,
        lastLoginAt: typeof authMetadata?.lastLoginAt === "string" ? authMetadata.lastLoginAt : null,
      },
    },
  };
}
