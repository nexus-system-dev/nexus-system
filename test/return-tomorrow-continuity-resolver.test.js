import test from "node:test";
import assert from "node:assert/strict";

import { createReturnTomorrowContinuityResolver } from "../src/core/return-tomorrow-continuity-resolver.js";

test("return tomorrow continuity resolver emits resume-workspace when durable continuity exists", () => {
  const { returnTomorrowContinuity } = createReturnTomorrowContinuityResolver({
    sessionState: {
      sessionId: "session-2",
      status: "active",
      userId: "user-1",
    },
    projectState: {
      workspaceNavigationModel: {
        projectId: "giftwallet",
        currentWorkspace: { key: "project-brain" },
        handoffContext: {
          resumeToken: "resume:giftwallet:project-brain:none",
        },
      },
    },
    postAuthRedirect: {
      destination: "workbench",
    },
    userSessionHistory: {
      byUser: {
        "user-1": {
          totalSessions: 2,
        },
      },
    },
    returningUserMetric: {
      isReturningUser: true,
    },
  });

  assert.equal(returnTomorrowContinuity.status, "ready");
  assert.equal(returnTomorrowContinuity.canResumeTomorrow, true);
  assert.equal(returnTomorrowContinuity.recommendedDestination, "resume-workspace");
  assert.equal(returnTomorrowContinuity.resumeWorkspace, "project-brain");
});

test("return tomorrow continuity resolver fails safely without active session continuity", () => {
  const { returnTomorrowContinuity } = createReturnTomorrowContinuityResolver({
    sessionState: {
      status: "inactive",
    },
    projectState: {
      workspaceNavigationModel: {
        projectId: "giftwallet",
      },
    },
  });

  assert.equal(returnTomorrowContinuity.status, "missing-inputs");
  assert.deepEqual(returnTomorrowContinuity.missingInputs, ["sessionState"]);
});
