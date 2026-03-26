function createToken(prefix, userId) {
  const safeUserId = userId ?? "anonymous";
  return `${prefix}-${safeUserId}-${Date.now()}`;
}

export function createSessionAndTokenManagement({
  userIdentity = null,
  authenticationState = null,
} = {}) {
  const isAuthenticated = authenticationState?.isAuthenticated === true;
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + (60 * 60 * 1000)).toISOString();
  const sessionId = isAuthenticated ? `session-${userIdentity?.userId ?? "anonymous"}-${Date.now()}` : null;

  return {
    sessionState: {
      sessionId,
      status: isAuthenticated ? "active" : "inactive",
      issuedAt: isAuthenticated ? issuedAt : null,
      expiresAt: isAuthenticated ? expiresAt : null,
      isRevoked: false,
      userId: userIdentity?.userId ?? null,
    },
    tokenBundle: {
      accessToken: isAuthenticated ? createToken("access", userIdentity?.userId) : null,
      refreshToken: isAuthenticated ? createToken("refresh", userIdentity?.userId) : null,
      tokenType: isAuthenticated ? "bearer" : null,
      expiresAt: isAuthenticated ? expiresAt : null,
    },
  };
}
