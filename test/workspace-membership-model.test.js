import test from "node:test";
import assert from "node:assert/strict";

import { defineWorkspaceAndMembershipModel } from "../src/core/workspace-membership-model.js";

test("workspace and membership model returns canonical owner workspace", () => {
  const { workspaceModel, membershipRecord } = defineWorkspaceAndMembershipModel({
    userIdentity: {
      userId: "user-1",
      displayName: "Owner User",
    },
  });

  assert.equal(workspaceModel.workspaceId, "workspace-user-1");
  assert.equal(workspaceModel.ownerUserId, "user-1");
  assert.equal(workspaceModel.roles[0], "owner");
  assert.equal(membershipRecord.role, "owner");
  assert.equal(membershipRecord.isOwner, true);
});

test("workspace and membership model respects provided workspace metadata", () => {
  const { workspaceModel, membershipRecord } = defineWorkspaceAndMembershipModel({
    userIdentity: {
      userId: "user-2",
    },
    workspaceMetadata: {
      workspaceId: "workspace-team-1",
      name: "Team One",
      roles: ["editor", "viewer"],
      ownerUserId: "owner-1",
      memberCount: 3,
    },
  });

  assert.equal(workspaceModel.workspaceId, "workspace-team-1");
  assert.equal(workspaceModel.name, "Team One");
  assert.equal(workspaceModel.memberCount, 3);
  assert.equal(membershipRecord.role, "editor");
  assert.equal(membershipRecord.isOwner, false);
});
