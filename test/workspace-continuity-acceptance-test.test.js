import test from "node:test";
import assert from "node:assert/strict";

import { createWorkspaceContinuityAcceptanceTest } from "../src/core/workspace-continuity-acceptance-test.js";

test("workspace-continuity acceptance test passes when navigation preserves project context", () => {
  const { acceptanceResult } = createWorkspaceContinuityAcceptanceTest({
    acceptanceScenario: {
      scenarios: [
        {
          scenarioKey: "workspace-continuity",
          expectedOutcome: "Workspace navigation preserves project context and resume continuity",
          requiredOutputs: ["workspaceNavigationModel"],
        },
      ],
    },
    workspaceNavigationModel: {
      projectId: "project-123",
      currentWorkspace: "development",
      availableWorkspaces: ["project-brain", "development", "release", "growth"],
      handoffContext: {
        projectId: "project-123",
        currentWorkspace: "development",
        resumeToken: "resume-123",
      },
      summary: {
        headline: "Project context is preserved across workspaces",
      },
    },
  });

  assert.equal(acceptanceResult.scenarioKey, "workspace-continuity");
  assert.equal(acceptanceResult.status, "passed");
  assert.equal(acceptanceResult.checks.scenarioResolved, true);
  assert.equal(acceptanceResult.checks.hasCrossWorkspaceNavigation, true);
  assert.equal(acceptanceResult.checks.hasHandoffContext, true);
  assert.equal(acceptanceResult.checks.hasResumeState, true);
});

test("workspace-continuity acceptance test fails safely when navigation continuity is missing", () => {
  const { acceptanceResult } = createWorkspaceContinuityAcceptanceTest({
    acceptanceScenario: { scenarios: [] },
    workspaceNavigationModel: {
      availableWorkspaces: ["development"],
    },
  });

  assert.equal(acceptanceResult.status, "failed");
  assert.equal(acceptanceResult.checks.scenarioResolved, false);
  assert.equal(acceptanceResult.checks.hasCrossWorkspaceNavigation, false);
  assert.equal(acceptanceResult.checks.hasHandoffContext, false);
  assert.equal(acceptanceResult.checks.hasResumeState, false);
});
