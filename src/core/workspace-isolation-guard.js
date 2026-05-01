function normalizeTenantIsolationSchema(tenantIsolationSchema) {
  return tenantIsolationSchema && typeof tenantIsolationSchema === "object" ? tenantIsolationSchema : {};
}

function normalizeRequestContext(requestContext) {
  return requestContext && typeof requestContext === "object" ? requestContext : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveResourceMatch(resources, requestContext) {
  const resourceId = normalizeString(requestContext.resourceId, null);
  const resourceType = normalizeString(requestContext.resourceType, null);

  if (resourceId) {
    const byId = resources.find((resource) => normalizeString(resource?.resourceId, null) === resourceId);
    if (byId) {
      return byId;
    }
  }

  if (resourceType) {
    return resources.find((resource) => normalizeString(resource?.resourceType, null) === resourceType) ?? null;
  }

  return resources[0] ?? null;
}

function buildChecks({
  schemaWorkspaceId,
  requestWorkspaceId,
  resourceWorkspaceId,
  resource,
  crossTenantAccessAllowed,
}) {
  const checks = [];

  if (schemaWorkspaceId) {
    checks.push("tenant-schema-loaded");
  }

  if (requestWorkspaceId && schemaWorkspaceId && requestWorkspaceId !== schemaWorkspaceId) {
    checks.push("request-workspace-mismatch");
  }

  if (resourceWorkspaceId && schemaWorkspaceId && resourceWorkspaceId !== schemaWorkspaceId) {
    checks.push("resource-workspace-mismatch");
  }

  if (resource?.tenantBoundary) {
    checks.push(`boundary:${resource.tenantBoundary}`);
  }

  if (crossTenantAccessAllowed) {
    checks.push("cross-tenant-exception");
  }

  return checks;
}

export function createWorkspaceIsolationGuard({
  tenantIsolationSchema = null,
  requestContext = null,
} = {}) {
  const normalizedTenantIsolationSchema = normalizeTenantIsolationSchema(tenantIsolationSchema);
  const normalizedRequestContext = normalizeRequestContext(requestContext);
  const isolatedResources = Array.isArray(normalizedTenantIsolationSchema.isolatedResources)
    ? normalizedTenantIsolationSchema.isolatedResources
    : [];
  const resource = resolveResourceMatch(isolatedResources, normalizedRequestContext);
  const schemaWorkspaceId = normalizeString(normalizedTenantIsolationSchema.workspaceId, null);
  const requestWorkspaceId = normalizeString(normalizedRequestContext.workspaceId, schemaWorkspaceId);
  const resourceWorkspaceId = normalizeString(resource?.workspaceId, requestWorkspaceId);
  const crossTenantAccessAllowed = resource?.crossTenantAccessAllowed === true;

  const requestWorkspaceMismatch = Boolean(
    schemaWorkspaceId && requestWorkspaceId && requestWorkspaceId !== schemaWorkspaceId,
  );
  const resourceWorkspaceMismatch = Boolean(
    schemaWorkspaceId && resourceWorkspaceId && resourceWorkspaceId !== schemaWorkspaceId,
  );

  let decision = "allowed";
  if ((requestWorkspaceMismatch || resourceWorkspaceMismatch) && !crossTenantAccessAllowed) {
    decision = "blocked";
  } else if (!resource) {
    decision = "restricted";
  }

  const checks = buildChecks({
    schemaWorkspaceId,
    requestWorkspaceId,
    resourceWorkspaceId,
    resource,
    crossTenantAccessAllowed,
  });
  const triggeredLeakSignals = decision === "blocked"
    ? (normalizedTenantIsolationSchema.leakSignals ?? []).filter((signal) => (
      signal === "workspace-id-mismatch"
      || signal === "resource-owner-mismatch"
    ))
    : [];

  return {
    workspaceIsolationDecision: {
      workspaceIsolationDecisionId: `workspace-isolation:${requestWorkspaceId ?? "workspace"}:${normalizeString(normalizedRequestContext.actionType, "access")}`,
      workspaceId: schemaWorkspaceId,
      requestWorkspaceId,
      resourceWorkspaceId,
      resourceId: normalizeString(resource?.resourceId, normalizeString(normalizedRequestContext.resourceId, null)),
      resourceType: normalizeString(resource?.resourceType, normalizeString(normalizedRequestContext.resourceType, "resource")),
      actionType: normalizeString(normalizedRequestContext.actionType, "read"),
      decision,
      isAllowed: decision === "allowed",
      isBlocked: decision === "blocked",
      requiresScopedReview: decision === "restricted",
      crossTenantAccessAllowed,
      checks,
      triggeredLeakSignals,
      reason:
        decision === "blocked"
          ? "Request crosses workspace isolation boundary"
          : decision === "restricted"
            ? "Requested resource is outside the known tenant isolation scope"
            : "Request stays within the workspace isolation boundary",
    },
  };
}
