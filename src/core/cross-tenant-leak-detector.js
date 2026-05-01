function normalizeTenantBoundaryEvidence(tenantBoundaryEvidence) {
  return tenantBoundaryEvidence && typeof tenantBoundaryEvidence === "object"
    ? tenantBoundaryEvidence
    : {};
}

function collectLeakSignals(tenantBoundaryEvidence) {
  return Array.from(
    new Set(
      (Array.isArray(tenantBoundaryEvidence.evidenceChecks) ? tenantBoundaryEvidence.evidenceChecks : [])
        .filter((check) => (
          check.includes("mismatch")
          || check.includes("blocked")
          || check.includes("cross-tenant")
        )),
    ),
  );
}

function buildChecks(tenantBoundaryEvidence, leakSignals, severity) {
  if (severity === "clear" && leakSignals.length === 0) {
    return ["no-cross-tenant-leak-detected"];
  }

  return Array.isArray(tenantBoundaryEvidence.evidenceChecks)
    ? tenantBoundaryEvidence.evidenceChecks
    : [];
}

export function createCrossTenantLeakDetector({
  tenantBoundaryEvidence = null,
} = {}) {
  const normalizedTenantBoundaryEvidence = normalizeTenantBoundaryEvidence(tenantBoundaryEvidence);
  const leakSignals = collectLeakSignals(normalizedTenantBoundaryEvidence);
  const severity = normalizedTenantBoundaryEvidence.evidenceStatus === "blocked"
    ? "critical"
    : normalizedTenantBoundaryEvidence.evidenceStatus === "requires-approval"
      ? "warning"
      : "clear";
  const checks = buildChecks(normalizedTenantBoundaryEvidence, leakSignals, severity);

  return {
    leakageAlert: {
      leakageAlertId: `tenant-leakage:${normalizedTenantBoundaryEvidence.tenantBoundaryEvidenceId ?? "workspace"}`,
      workspaceId: normalizedTenantBoundaryEvidence.workspaceId ?? null,
      requestWorkspaceId: normalizedTenantBoundaryEvidence.workspaceId ?? null,
      severity,
      status: severity === "clear" ? "clear" : "active",
      isActive: severity !== "clear",
      leakSignals,
      checks,
      affectedScopes: [
        normalizedTenantBoundaryEvidence.resourceType ?? null,
      ].filter(Boolean),
      recommendedAction:
        severity === "critical"
          ? "Block the cross-tenant path and inspect tenant-boundary evidence."
          : severity === "warning"
            ? "Review tenant-boundary evidence before allowing additional state sharing."
            : "No tenant leakage detected.",
      reason:
        severity === "critical"
          ? "Tenant-boundary evidence reported a blocked isolation path."
          : severity === "warning"
            ? "Tenant-boundary evidence requires approval before additional state sharing."
            : "Tenant-boundary evidence remains inside the allowed workspace boundary.",
    },
  };
}
