import test from "node:test";
import assert from "node:assert/strict";

import { createLocalWorkspaceContract } from "../src/core/local-workspace-contract.js";

test("local workspace contract makes browser-backed workspace continuity explicit", () => {
  const { localWorkspaceContract } = createLocalWorkspaceContract({
    projectId: "project-1",
    projectName: "Ops Workspace",
    productClass: "internal-tool",
    workspaceNavigationModel: {
      projectId: "project-1",
      currentWorkspace: {
        key: "project-brain",
        projectId: "project-1",
      },
      handoffContext: {
        currentWorkspace: "project-brain",
        resumeToken: "resume:project-1:project-brain:none",
      },
    },
    splitWorkspaceLiveBuildSurfaceModel: {
      workspaceFamily: "operations-split-workspace",
      regions: {
        build: {
          visibleMilestones: ["workspace-visible", "queue-visible"],
        },
      },
    },
    returnTomorrowContinuity: {
      canResumeTomorrow: true,
      continuitySource: "returning-user-metric",
      resumeWorkspace: "project-brain",
      resumeToken: "resume:project-1:project-brain:none",
    },
    buildProgressionStateMachine: {
      summary: {
        currentRouteKey: "execution",
      },
    },
  });

  assert.equal(localWorkspaceContract.status, "ready");
  assert.equal(localWorkspaceContract.workspaceMode, "browser-backed-local-workspace");
  assert.equal(localWorkspaceContract.desktopShellStatus, "deferred-to-w4-mbn-010");
  assert.equal(localWorkspaceContract.identity.currentWorkspaceKey, "project-brain");
  assert.equal(localWorkspaceContract.continuity.resumeWorkspace, "project-brain");
  assert.equal(localWorkspaceContract.continuity.continuityGuarantees.includes("active workspace survives reopen"), true);
});
