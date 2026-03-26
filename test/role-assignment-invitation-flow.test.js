import test from "node:test";
import assert from "node:assert/strict";

import { createRoleAssignmentAndInvitationFlow } from "../src/core/role-assignment-invitation-flow.js";

test("role assignment and invitation flow returns pending invitation record", () => {
  const { invitationRecord, roleAssignment } = createRoleAssignmentAndInvitationFlow({
    workspaceModel: {
      workspaceId: "workspace-1",
      ownerUserId: "owner-1",
    },
    invitationRequest: {
      email: "teammate@example.com",
      role: "editor",
    },
  });

  assert.equal(invitationRecord.workspaceId, "workspace-1");
  assert.equal(invitationRecord.status, "pending");
  assert.equal(roleAssignment.role, "editor");
  assert.equal(roleAssignment.status, "assigned-pending-acceptance");
});

test("role assignment and invitation flow returns invalid invitation when email missing", () => {
  const { invitationRecord, roleAssignment } = createRoleAssignmentAndInvitationFlow({
    workspaceModel: {
      workspaceId: "workspace-1",
    },
    invitationRequest: {},
  });

  assert.equal(invitationRecord.status, "invalid");
  assert.equal(roleAssignment.status, "not-assigned");
});
