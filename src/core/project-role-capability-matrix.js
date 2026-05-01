function normalizeProjectPermissionSchema(projectPermissionSchema) {
  return projectPermissionSchema && typeof projectPermissionSchema === "object" ? projectPermissionSchema : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createEmptyCapabilities() {
  return {
    view: false,
    edit: false,
    run: false,
    approve: false,
    deploy: false,
    connectAccounts: false,
    manageCredentials: false,
  };
}

function toActionSet(capabilities) {
  const actionMap = {
    view: "view",
    edit: "edit",
    run: "run",
    approve: "approve",
    deploy: "deploy",
    connectAccounts: "connect-accounts",
    manageCredentials: "manage-credentials",
  };

  return Object.entries(actionMap)
    .filter(([key]) => capabilities[key] === true)
    .map(([, action]) => action);
}

function buildCapabilitiesByRole(projectPermissionSchema) {
  const entries = Array.isArray(projectPermissionSchema.permissionsByRole)
    ? projectPermissionSchema.permissionsByRole
    : [];

  return Object.fromEntries(
    entries.map((entry) => [
      normalizeString(entry?.role, "viewer")?.toLowerCase(),
      {
        ...createEmptyCapabilities(),
        ...(entry?.capabilities ?? {}),
      },
    ]),
  );
}

function resolveRoleCapabilities(baseCapabilities, role) {
  if (baseCapabilities[role]) {
    return baseCapabilities[role];
  }

  if (role === "member") {
    return baseCapabilities.editor ?? baseCapabilities.viewer ?? createEmptyCapabilities();
  }

  if (role === "reviewer") {
    return {
      ...createEmptyCapabilities(),
      ...(baseCapabilities.viewer ?? {}),
      approve: true,
    };
  }

  return baseCapabilities.viewer ?? createEmptyCapabilities();
}

function buildRoleEntry(baseCapabilities, role) {
  const capabilities = resolveRoleCapabilities(baseCapabilities, role);

  return {
    role,
    capabilities,
    allowedActions: toActionSet(capabilities),
    summary: {
      canOperateIndependently: capabilities.run || capabilities.deploy,
      requiresEscalationForSensitiveActions: !capabilities.deploy || !capabilities.manageCredentials,
      canAffectProduction: capabilities.deploy || capabilities.manageCredentials,
    },
  };
}

export function createProjectRoleCapabilityMatrix({
  projectPermissionSchema = null,
} = {}) {
  const normalizedProjectPermissionSchema = normalizeProjectPermissionSchema(projectPermissionSchema);
  const baseCapabilities = buildCapabilitiesByRole(normalizedProjectPermissionSchema);
  const orderedRoles = ["owner", "member", "operator", "reviewer", "viewer"];
  const roleEntries = orderedRoles.map((role) => buildRoleEntry(baseCapabilities, role));

  return {
    roleCapabilityMatrix: {
      roleCapabilityMatrixId: `role-capability-matrix:${normalizeString(normalizedProjectPermissionSchema.permissionSchemaId, "project-permissions:unknown")}`,
      permissionSchemaId: normalizeString(normalizedProjectPermissionSchema.permissionSchemaId, null),
      projectType: normalizeString(normalizedProjectPermissionSchema.projectType, "generic")?.toLowerCase(),
      roles: roleEntries,
      actionFamilies: {
        collaboration: ["view", "edit", "approve"],
        execution: ["run", "deploy"],
        integrations: ["connect-accounts", "manage-credentials"],
      },
      summary: {
        totalRoles: roleEntries.length,
        privilegedRoles: roleEntries.filter(
          (entry) => entry.capabilities.deploy || entry.capabilities.manageCredentials,
        ).length,
        approvalRoles: roleEntries.filter((entry) => entry.capabilities.approve).length,
      },
    },
  };
}
