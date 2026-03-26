function inferAuthMethod(credentials, userIdentity) {
  if (typeof credentials?.authMethod === "string" && credentials.authMethod) {
    return credentials.authMethod;
  }

  if (typeof credentials?.providerToken === "string" && credentials.providerToken) {
    return userIdentity?.authMetadata?.provider ?? "oauth";
  }

  if (typeof credentials?.password === "string" && credentials.password) {
    return "password";
  }

  if (typeof userIdentity?.authMetadata?.provider === "string" && userIdentity.authMetadata.provider) {
    return userIdentity.authMetadata.provider;
  }

  return "password";
}

function inferAuthenticationStatus(userIdentity, credentials) {
  if (!userIdentity?.userId && !userIdentity?.email) {
    return "anonymous";
  }

  if (credentials?.isLoggedOut === true) {
    return "logged-out";
  }

  if (
    typeof credentials?.password === "string"
    || typeof credentials?.providerToken === "string"
    || userIdentity?.authMetadata?.sessionStatus === "authenticated"
  ) {
    return "authenticated";
  }

  return "identified";
}

export function createAuthenticationSystem({
  userIdentity = null,
  credentials = null,
} = {}) {
  const status = inferAuthenticationStatus(userIdentity, credentials);
  const authMethod = inferAuthMethod(credentials, userIdentity);

  return {
    authenticationState: {
      status,
      isAuthenticated: status === "authenticated",
      requiresVerification: userIdentity?.verificationStatus !== "verified",
      authMethod,
      loginState: status === "authenticated" ? "active-session" : "idle",
      availableFlows: [
        "signup",
        "login",
        "logout",
        userIdentity?.verificationStatus !== "verified" ? "verify-email" : null,
      ].filter(Boolean),
      authMetadata: {
        provider: userIdentity?.authMetadata?.provider ?? authMethod,
        sessionStatus: userIdentity?.authMetadata?.sessionStatus ?? "unknown",
        hasMfa: userIdentity?.authMetadata?.hasMfa ?? false,
      },
      userId: userIdentity?.userId ?? null,
      email: userIdentity?.email ?? null,
    },
  };
}
