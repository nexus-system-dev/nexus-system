import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-social-campaign-"));
  return new ProjectService({
    eventLogPath: path.join(root, "events.ndjson"),
  });
}

function createProject(service) {
  return service.createProject({
    id: `social-campaign-${Date.now()}`,
    name: "Social Campaign Project",
    goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
    state: {
      artifactExpectation: { projectType: "internal-tool" },
      runtimeSkeletonTruth: {
        runtimeSkeletonId: "runtime-social-campaign-service",
        title: "ניהול לידים",
        productClass: "internal-tool",
      },
      productDomainSkeleton: {
        productDomainSkeletonId: "domain-social-campaign-service",
      },
      productOwnedBackendSkeleton: {
        productOwnedBackendSkeletonId: "backend-social-campaign-service",
        productionBackend: false,
      },
    },
  });
}

test("ProjectService stores GROW-AGT-002 truth through growth and explicit campaign runs", () => {
  const service = createService();
  const created = createProject(service);

  const afterGrowth = service.runGrowthAgent({
    projectId: created.id,
    userInput: "Make a short launch campaign for this",
  });

  assert.equal(afterGrowth.socialCampaignExecutionAgent.taskId, "GROW-AGT-002");
  assert.equal(afterGrowth.socialCampaignExecutionAgent.status, "ready-for-approval");
  assert.equal(afterGrowth.context.socialCampaignExecutionAgent.status, "ready-for-approval");
  assert.equal(afterGrowth.state.socialCampaignExecutionAgent.status, "ready-for-approval");

  const needsProvider = service.runSocialCampaignExecutionAgent({
    projectId: created.id,
    userInput: "Schedule this for Instagram.",
  });
  assert.equal(needsProvider.socialCampaignExecutionAgent.status, "needs-provider");
  assert.equal(needsProvider.socialCampaignExecutionAgent.externalExecutionPerformed, false);

  const approvedSchedule = service.runSocialCampaignExecutionAgent({
    projectId: created.id,
    userInput: "Schedule this for Instagram.",
    providerConnection: {
      provider: "instagram",
      connected: true,
      account: "ig-account-1",
      scopes: ["schedule"],
    },
    approvalDecisions: {
      postApprovals: [
        { postId: "post-1", provider: "instagram", action: "schedule", approved: true },
      ],
    },
  });

  assert.equal(approvedSchedule.socialCampaignExecutionAgent.status, "scheduled");
  assert.equal(approvedSchedule.socialCampaignExecutionAgent.externalExecutionPerformed, true);

  const restored = service.getProject(created.id);
  assert.equal(restored.socialCampaignExecutionAgent.status, "scheduled");
  assert.equal(restored.context.socialCampaignExecutionAgent.status, "scheduled");
  assert.equal(restored.state.socialCampaignExecutionAgent.status, "scheduled");
});
