function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function defineOwnerControlPlaneSchema({
  ownerContext = null,
  platformState = null,
} = {}) {
  const normalizedOwnerContext = normalizeObject(ownerContext);
  const normalizedPlatformState = normalizeObject(platformState);

  return {
    ownerControlPlane: {
      ownerControlPlaneId: `owner-control:${slugify(normalizedOwnerContext?.ownerId ?? normalizedPlatformState?.workspaceId)}`,
      status: "ready",
      missingInputs: [],
      ownerId: normalizeString(normalizedOwnerContext?.ownerId) ?? "owner",
      ownerRole: normalizeString(normalizedOwnerContext?.ownerRole) ?? "owner",
      workspaceId: normalizeString(normalizedPlatformState?.workspaceId) ?? "workspace",
      healthStatus: normalizeString(normalizedPlatformState?.healthStatus) ?? "stable",
      criticalViews: ["health", "growth", "revenue", "delivery"],
    },
  };
}
