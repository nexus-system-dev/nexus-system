import test from "node:test";
import assert from "node:assert/strict";

import { createCrossWorkspaceNavigationModel } from "../src/core/cross-workspace-navigation-model.js";

test("cross workspace navigation model returns canonical routes and shared project context", () => {
  const { workspaceNavigationModel } = createCrossWorkspaceNavigationModel({
    projectBrainWorkspace: {
      workspaceId: "project-brain:giftwallet",
      overview: {
        projectId: "giftwallet",
        nextAction: "Approve deploy",
      },
    },
    developmentWorkspace: {
      workspaceId: "developer-workspace:giftwallet",
      codeSurface: {
        editor: {
          activeFilePath: "src/app.js",
        },
      },
    },
    releaseWorkspace: {
      workspaceId: "release-run:giftwallet:web-deployment",
      buildAndDeploy: {
        currentStatus: "published",
      },
    },
    projectExplanation: {
      nextAction: {
        selectedAction: "open-release-checklist",
      },
    },
    activeBottleneck: {
      blockerType: "release-blocker",
    },
    releaseStatus: {
      status: "published",
    },
    growthWorkspace: {
      workspaceId: "growth-workspace",
      strategy: {
        contentGoal: "Launch acquisition funnel",
      },
    },
  });

  assert.equal(workspaceNavigationModel.projectId, "giftwallet");
  assert.equal(workspaceNavigationModel.currentWorkspace?.key, "project-brain");
  assert.equal(workspaceNavigationModel.availableWorkspaces.length, 4);
  assert.equal(workspaceNavigationModel.handoffContext.nextAction, "open-release-checklist");
  assert.equal(workspaceNavigationModel.handoffContext.activeFilePath, "src/app.js");
  assert.equal(workspaceNavigationModel.handoffContext.releaseStatus, "blocked");
  assert.equal(workspaceNavigationModel.handoffContext.currentWorkspace, "project-brain");
  assert.match(workspaceNavigationModel.handoffContext.resumeToken, /^resume:giftwallet:project-brain:/);
  assert.equal(workspaceNavigationModel.summary.totalWorkspaces, 4);
});

test("cross workspace navigation model falls back to empty canonical state", () => {
  const { workspaceNavigationModel } = createCrossWorkspaceNavigationModel();

  assert.equal(workspaceNavigationModel.projectId, null);
  assert.equal(Array.isArray(workspaceNavigationModel.availableWorkspaces), true);
  assert.equal(Array.isArray(workspaceNavigationModel.routes), true);
  assert.equal(workspaceNavigationModel.summary.totalWorkspaces, 0);
});
