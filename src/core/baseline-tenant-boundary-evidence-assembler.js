function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createBaselineTenantBoundaryEvidenceAssembler({
  tenantIsolationSchema = null,
  workspaceIsolationDecision = null,
  projectAuthorizationDecision = null,
} = {}) {
  const normalizedTenantIsolationSchema = normalizeObject(tenantIsolationSchema);
  const normalizedWorkspaceIsolationDecision = normalizeObject(workspaceIsolationDecision);
  const normalizedProjectAuthorizationDecision = normalizeObject(projectAuthorizationDecision);
  const isolationBoundary = normalizedTenantIsolationSchema.isolationBoundary ?? "workspace";
  const workspaceDecision = normalizedWorkspaceIsolationDecision.decision ?? "restricted";
  const authorizationDecision = normalizedProjectAuthorizationDecision.decision ?? "blocked";
  const evidenceStatus =
    workspaceDecision === "blocked"
      ? "blocked"
      : authorizationDecision === "requires-approval"
        ? "requires-approval"
        : workspaceDecision === "allowed" && authorizationDecision === "allowed"
          ? "allowed"
          : "restricted";

  return {
    tenantBoundaryEvidence: {
      tenantBoundaryEvidenceId: `tenant-boundary-evidence:${normalizedTenantIsolationSchema.workspaceId ?? "workspace"}`,
      workspaceId: normalizedTenantIsolationSchema.workspaceId ?? normalizedWorkspaceIsolationDecision.workspaceId ?? null,
      isolationBoundary,
      evidenceStatus,
      workspaceIsolationDecision: workspaceDecision,
      authorizationDecision,
      resourceType: normalizedWorkspaceIsolationDecision.resourceType ?? "resource",
      requiredCapability: normalizedProjectAuthorizationDecision.requiredCapability ?? "view",
      evidenceChecks: [
        ...((Array.isArray(normalizedTenantIsolationSchema.leakSignals) ? normalizedTenantIsolationSchema.leakSignals : []).map((signal) => `schema:${signal}`)),
        ...((Array.isArray(normalizedWorkspaceIsolationDecision.checks) ? normalizedWorkspaceIsolationDecision.checks : []).map((check) => `workspace:${check}`)),
        ...((Array.isArray(normalizedProjectAuthorizationDecision.checks) ? normalizedProjectAuthorizationDecision.checks : []).map((check) => `authorization:${check}`)),
      ],
      summary: {
        isBlocked: evidenceStatus === "blocked",
        requiresApproval: evidenceStatus === "requires-approval",
        isWithinBoundary: evidenceStatus === "allowed",
      },
    },
  };
}
