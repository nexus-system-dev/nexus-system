function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createAdminOnlyAccessLayer({
  privilegedModeState = null,
  ownerControlPlane = null,
  requestContext = null,
} = {}) {
  const route = normalizeString(requestContext?.route, "owner-dashboard");
  const ownerRole = normalizeString(ownerControlPlane?.ownerRole, "owner");
  const canAccess = ownerRole === "owner" && privilegedModeState?.canEnterPrivilegedMode === true;
  const decision = canAccess ? "allow" : "deny";

  return {
    ownerAccessDecision: {
      ownerAccessDecisionId: `owner-access:${route}`,
      decision,
      route,
      ownerRole,
      requiresPrivilegedMode: true,
      isAllowed: canAccess,
      checks: [
        `privileged-mode:${privilegedModeState?.decision ?? "disabled"}`,
        `owner-role:${ownerRole}`,
      ],
      reason: canAccess ? "Owner route access is allowed" : "Owner route access requires privileged mode",
    },
  };
}
