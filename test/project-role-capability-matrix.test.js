import test from "node:test";
import assert from "node:assert/strict";

import { createProjectRoleCapabilityMatrix } from "../src/core/project-role-capability-matrix.js";

test("createProjectRoleCapabilityMatrix expands project permission schema into canonical role matrix", () => {
  const { roleCapabilityMatrix } = createProjectRoleCapabilityMatrix({
    projectPermissionSchema: {
      permissionSchemaId: "project-permissions:workspace-alpha:mobile-app",
      projectType: "mobile-app",
      permissionsByRole: [
        {
          role: "owner",
          capabilities: {
            view: true,
            edit: true,
            run: true,
            approve: true,
            deploy: true,
            connectAccounts: true,
            manageCredentials: true,
          },
        },
        {
          role: "operator",
          capabilities: {
            view: true,
            edit: false,
            run: true,
            approve: false,
            deploy: true,
            connectAccounts: true,
            manageCredentials: true,
          },
        },
        {
          role: "viewer",
          capabilities: {
            view: true,
            edit: false,
            run: false,
            approve: false,
            deploy: false,
            connectAccounts: false,
            manageCredentials: false,
          },
        },
      ],
    },
  });

  assert.equal(roleCapabilityMatrix.permissionSchemaId, "project-permissions:workspace-alpha:mobile-app");
  assert.equal(roleCapabilityMatrix.roles.length, 5);
  assert.equal(roleCapabilityMatrix.roles[0].role, "owner");
  assert.equal(roleCapabilityMatrix.roles[1].role, "member");
  assert.equal(roleCapabilityMatrix.roles[1].capabilities.edit, false);
  assert.equal(roleCapabilityMatrix.roles[2].capabilities.deploy, true);
  assert.equal(roleCapabilityMatrix.roles[3].capabilities.approve, true);
  assert.equal(roleCapabilityMatrix.summary.privilegedRoles, 2);
  assert.equal(roleCapabilityMatrix.summary.approvalRoles, 2);
});

test("createProjectRoleCapabilityMatrix falls back safely without explicit permission schema", () => {
  const { roleCapabilityMatrix } = createProjectRoleCapabilityMatrix();

  assert.equal(roleCapabilityMatrix.permissionSchemaId, null);
  assert.equal(roleCapabilityMatrix.projectType, "generic");
  assert.equal(roleCapabilityMatrix.roles.length, 5);
  assert.equal(roleCapabilityMatrix.roles[4].role, "viewer");
  assert.equal(roleCapabilityMatrix.roles[4].capabilities.view, false);
  assert.equal(roleCapabilityMatrix.summary.privilegedRoles, 0);
});

test("createProjectRoleCapabilityMatrix normalizes malformed identifiers and role labels", () => {
  const { roleCapabilityMatrix } = createProjectRoleCapabilityMatrix({
    projectPermissionSchema: {
      permissionSchemaId: "  ",
      projectType: " MOBILE-APP ",
      permissionsByRole: [
        {
          role: " OWNER ",
          capabilities: {
            view: true,
            edit: true,
            run: true,
            approve: true,
            deploy: true,
            connectAccounts: true,
            manageCredentials: true,
          },
        },
        {
          role: " VIEWER ",
          capabilities: {
            view: true,
          },
        },
      ],
    },
  });

  assert.equal(roleCapabilityMatrix.roleCapabilityMatrixId, "role-capability-matrix:project-permissions:unknown");
  assert.equal(roleCapabilityMatrix.permissionSchemaId, null);
  assert.equal(roleCapabilityMatrix.projectType, "mobile-app");
  assert.equal(roleCapabilityMatrix.roles[0].role, "owner");
  assert.equal(roleCapabilityMatrix.roles[4].role, "viewer");
  assert.equal(roleCapabilityMatrix.roles[4].capabilities.view, true);
});
