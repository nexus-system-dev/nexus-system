import test from "node:test";
import assert from "node:assert/strict";

import { createUserAgentOwnershipMappingModel } from "../src/core/user-agent-ownership-mapping-model.js";

test("user-agent ownership mapping model maps execution agents back to the human workspace owner", () => {
  const { userAgentMapping } = createUserAgentOwnershipMappingModel({
    projectId: "giftwallet",
    userIdentity: {
      userId: "user-1",
      displayName: "Yogev",
    },
    workspaceModel: {
      workspaceId: "workspace-user-1",
      ownerUserId: "user-1",
    },
    membershipRecord: {
      membershipId: "workspace-user-1:user-1",
      userId: "user-1",
      role: "owner",
      roles: ["owner"],
      isOwner: true,
    },
    projectOwnershipBinding: {
      projectId: "giftwallet",
      ownerUserId: "user-1",
      workspaceId: "workspace-user-1",
      role: "owner",
    },
    ownerAuthState: {
      trustLevel: "elevated",
      isAuthenticated: true,
    },
    taskExecutionMetric: {
      entries: [
        { agentId: "dev-agent" },
        { agentId: "qa-agent" },
        { agentId: "dev-agent" },
      ],
    },
  });

  assert.equal(userAgentMapping.status, "ready");
  assert.equal(userAgentMapping.ownerUserId, "user-1");
  assert.equal(userAgentMapping.workspaceId, "workspace-user-1");
  assert.deepEqual(userAgentMapping.humanUsers, [
    {
      humanUserId: "user-1",
      workspaceId: "workspace-user-1",
      membershipId: "workspace-user-1:user-1",
      projectId: "giftwallet",
      role: "owner",
      roles: ["owner"],
      isOwner: true,
      trustLevel: "elevated",
      isAuthenticated: true,
    },
  ]);
  assert.deepEqual(userAgentMapping.agentMappings, [
    {
      mappingId: "user-agent-mapping:giftwallet:dev-agent",
      agentId: "dev-agent",
      agentType: "development-agent",
      humanUserId: "user-1",
      ownerUserId: "user-1",
      workspaceId: "workspace-user-1",
      projectId: "giftwallet",
      relationship: "delegated-agent",
      mappingStatus: "owned",
    },
    {
      mappingId: "user-agent-mapping:giftwallet:qa-agent",
      agentId: "qa-agent",
      agentType: "qa-agent",
      humanUserId: "user-1",
      ownerUserId: "user-1",
      workspaceId: "workspace-user-1",
      projectId: "giftwallet",
      relationship: "delegated-agent",
      mappingStatus: "owned",
    },
  ]);
  assert.deepEqual(userAgentMapping.byAgent["dev-agent"], {
    humanUserId: "user-1",
    ownerUserId: "user-1",
    workspaceId: "workspace-user-1",
    projectId: "giftwallet",
    relationship: "delegated-agent",
    mappingStatus: "owned",
  });
  assert.deepEqual(userAgentMapping.summary, {
    totalHumanUsers: 1,
    totalMappedAgents: 2,
    ownedAgentCount: 2,
  });
});

test("user-agent ownership mapping model exposes missing inputs when no owner identity exists", () => {
  const { userAgentMapping } = createUserAgentOwnershipMappingModel({
    projectId: "giftwallet",
    taskResults: [{ agentId: "marketing-agent" }],
  });

  assert.equal(userAgentMapping.status, "missing-inputs");
  assert.equal(userAgentMapping.ownerUserId, null);
  assert.equal(userAgentMapping.summary.totalMappedAgents, 1);
  assert.equal(userAgentMapping.agentMappings[0].mappingStatus, "unresolved-owner");
});
