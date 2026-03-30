function normalizeWorkspaceModel(workspaceModel) {
  return workspaceModel && typeof workspaceModel === "object" ? workspaceModel : {};
}

function normalizeResourceDefinitions(resourceDefinitions) {
  return Array.isArray(resourceDefinitions) ? resourceDefinitions.filter((entry) => entry && typeof entry === "object") : [];
}

function inferDefaultResources(workspaceModel) {
  return [
    {
      resourceType: "project-state",
      scope: "project",
      workspaceId: workspaceModel.workspaceId ?? null,
      tenantBoundary: "workspace",
      sensitivity: "high",
    },
    {
      resourceType: "artifacts",
      scope: "workspace",
      workspaceId: workspaceModel.workspaceId ?? null,
      tenantBoundary: "workspace",
      sensitivity: "high",
    },
    {
      resourceType: "logs",
      scope: "workspace",
      workspaceId: workspaceModel.workspaceId ?? null,
      tenantBoundary: "workspace",
      sensitivity: "medium",
    },
    {
      resourceType: "linked-accounts",
      scope: "workspace",
      workspaceId: workspaceModel.workspaceId ?? null,
      tenantBoundary: "workspace",
      sensitivity: "critical",
    },
  ];
}

function buildResources(workspaceModel, resourceDefinitions) {
  const source = resourceDefinitions.length > 0 ? resourceDefinitions : inferDefaultResources(workspaceModel);
  return source.map((resource, index) => ({
    resourceId: resource.resourceId ?? `tenant-resource:${workspaceModel.workspaceId ?? "workspace"}:${resource.resourceType ?? "resource"}:${index + 1}`,
    resourceType: resource.resourceType ?? "resource",
    scope: resource.scope ?? "workspace",
    workspaceId: resource.workspaceId ?? workspaceModel.workspaceId ?? null,
    tenantBoundary: resource.tenantBoundary ?? "workspace",
    sensitivity: resource.sensitivity ?? "medium",
    crossTenantAccessAllowed: resource.crossTenantAccessAllowed === true,
  }));
}

export function defineTenantIsolationSchema({
  workspaceModel = null,
  resourceDefinitions = null,
} = {}) {
  const normalizedWorkspaceModel = normalizeWorkspaceModel(workspaceModel);
  const normalizedResourceDefinitions = normalizeResourceDefinitions(resourceDefinitions);
  const isolatedResources = buildResources(normalizedWorkspaceModel, normalizedResourceDefinitions);

  return {
    tenantIsolationSchema: {
      tenantIsolationSchemaId: `tenant-isolation:${normalizedWorkspaceModel.workspaceId ?? "workspace"}`,
      workspaceId: normalizedWorkspaceModel.workspaceId ?? null,
      workspaceVisibility: normalizedWorkspaceModel.visibility ?? "private",
      isolationBoundary: "workspace",
      tenantSubjects: {
        users: true,
        workspaces: true,
        projects: true,
        sharedResources: true,
      },
      accessRules: {
        denyCrossTenantReadsByDefault: true,
        denyCrossTenantWritesByDefault: true,
        requireWorkspaceMatchForArtifacts: true,
        requireWorkspaceMatchForLinkedAccounts: true,
      },
      isolatedResources,
      leakSignals: [
        "workspace-id-mismatch",
        "resource-owner-mismatch",
        "cross-tenant-learning-signal",
        "provider-session-boundary-breach",
      ],
      summary: {
        totalResources: isolatedResources.length,
        criticalResources: isolatedResources.filter((resource) => resource.sensitivity === "critical").length,
        crossTenantExceptions: isolatedResources.filter((resource) => resource.crossTenantAccessAllowed).length,
      },
    },
  };
}
