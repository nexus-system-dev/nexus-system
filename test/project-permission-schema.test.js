import test from "node:test";
import assert from "node:assert/strict";

import { defineProjectPermissionSchema } from "../src/core/project-permission-schema.js";

test("defineProjectPermissionSchema returns canonical project permissions for workspace roles", () => {
  const { projectPermissionSchema } = defineProjectPermissionSchema({
    workspaceModel: {
      workspaceId: "workspace-alpha",
      visibility: "workspace",
      roles: ["owner", "editor", "operator"],
    },
    projectType: "mobile-app",
  });

  assert.equal(projectPermissionSchema.permissionSchemaId, "project-permissions:workspace-alpha:mobile-app");
  assert.equal(projectPermissionSchema.projectType, "mobile-app");
  assert.equal(projectPermissionSchema.permissionsByRole.length, 3);
  assert.equal(projectPermissionSchema.permissionsByRole[0].role, "owner");
  assert.equal(projectPermissionSchema.permissionsByRole[0].capabilities.manageCredentials, true);
  assert.equal(projectPermissionSchema.permissionsByRole[1].capabilities.edit, true);
  assert.equal(projectPermissionSchema.permissionsByRole[2].capabilities.deploy, true);
  assert.equal(projectPermissionSchema.summary.deployCapableRoles, 2);
  assert.equal(projectPermissionSchema.summary.supportsCredentialManagement, true);
});

test("defineProjectPermissionSchema falls back safely without explicit workspace or project type", () => {
  const { projectPermissionSchema } = defineProjectPermissionSchema();

  assert.equal(projectPermissionSchema.workspaceId, null);
  assert.equal(projectPermissionSchema.projectType, "generic");
  assert.deepEqual(projectPermissionSchema.roles, ["viewer"]);
  assert.equal(projectPermissionSchema.permissionsByRole[0].capabilities.view, true);
  assert.equal(projectPermissionSchema.permissionsByRole[0].capabilities.edit, false);
  assert.equal(projectPermissionSchema.summary.approvalCapableRoles, 0);
});
