function normalizeWorkspaceModel(workspaceModel) {
  return workspaceModel && typeof workspaceModel === "object" ? workspaceModel : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeProjectType(projectType) {
  return normalizeString(projectType, "generic").toLowerCase();
}

function normalizeRoles(workspaceModel) {
  const roles = Array.isArray(workspaceModel.roles)
    ? workspaceModel.roles.map((role) => normalizeString(role, null)?.toLowerCase()).filter(Boolean)
    : [];
  return roles.length > 0 ? [...new Set(roles)] : ["viewer"];
}

function createCapabilitySet({
  view = false,
  edit = false,
  run = false,
  approve = false,
  deploy = false,
  connectAccounts = false,
  manageCredentials = false,
} = {}) {
  return {
    view,
    edit,
    run,
    approve,
    deploy,
    connectAccounts,
    manageCredentials,
  };
}

function createBaseCapabilities() {
  return {
    owner: createCapabilitySet({
      view: true,
      edit: true,
      run: true,
      approve: true,
      deploy: true,
      connectAccounts: true,
      manageCredentials: true,
    }),
    admin: createCapabilitySet({
      view: true,
      edit: true,
      run: true,
      approve: true,
      deploy: true,
      connectAccounts: true,
      manageCredentials: true,
    }),
    editor: createCapabilitySet({
      view: true,
      edit: true,
      run: true,
      approve: false,
      deploy: false,
      connectAccounts: false,
      manageCredentials: false,
    }),
    operator: createCapabilitySet({
      view: true,
      edit: false,
      run: true,
      approve: false,
      deploy: true,
      connectAccounts: true,
      manageCredentials: false,
    }),
    viewer: createCapabilitySet({
      view: true,
      edit: false,
      run: false,
      approve: false,
      deploy: false,
      connectAccounts: false,
      manageCredentials: false,
    }),
  };
}

function applyProjectTypePolicy(capabilitiesByRole, projectType) {
  if (projectType === "marketing-site" || projectType === "landing-page") {
    capabilitiesByRole.operator.deploy = false;
  }

  if (projectType === "mobile-app") {
    capabilitiesByRole.operator.manageCredentials = true;
  }

  if (projectType === "internal-tool" || projectType === "generic") {
    capabilitiesByRole.operator.connectAccounts = false;
  }

  return capabilitiesByRole;
}

function summarizeCapabilities(capabilitiesByRole, roles) {
  return {
    totalRoles: roles.length,
    deployCapableRoles: roles.filter((role) => capabilitiesByRole[role].deploy).length,
    approvalCapableRoles: roles.filter((role) => capabilitiesByRole[role].approve).length,
    credentialCapableRoles: roles.filter((role) => capabilitiesByRole[role].manageCredentials).length,
  };
}

export function defineProjectPermissionSchema({
  workspaceModel = null,
  projectType = null,
} = {}) {
  const normalizedWorkspaceModel = normalizeWorkspaceModel(workspaceModel);
  const normalizedProjectType = normalizeProjectType(projectType);
  const roles = normalizeRoles(normalizedWorkspaceModel);
  const capabilitiesByRole = applyProjectTypePolicy(createBaseCapabilities(), normalizedProjectType);

  return {
    projectPermissionSchema: {
      permissionSchemaId: `project-permissions:${normalizeString(normalizedWorkspaceModel.workspaceId, "workspace")}:${normalizedProjectType}`,
      workspaceId: normalizeString(normalizedWorkspaceModel.workspaceId, null),
      projectType: normalizedProjectType,
      visibility: normalizeString(normalizedWorkspaceModel.visibility, "private"),
      supportedActions: [
        "view",
        "edit",
        "run",
        "approve",
        "deploy",
        "connect-accounts",
        "manage-credentials",
      ],
      roles,
      permissionsByRole: roles.map((role) => ({
        role,
        capabilities: capabilitiesByRole[role] ?? capabilitiesByRole.viewer,
      })),
      escalationRules: {
        deployRequiresPrivilegedRole: true,
        credentialActionsRequireTrustedRole: true,
        approvalCanUnblockExecution: true,
      },
      summary: {
        ...summarizeCapabilities(capabilitiesByRole, roles),
        supportsCredentialManagement: roles.some(
          (role) => (capabilitiesByRole[role] ?? capabilitiesByRole.viewer).manageCredentials,
        ),
      },
    },
  };
}
