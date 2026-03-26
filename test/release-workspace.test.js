import test from "node:test";
import assert from "node:assert/strict";

import { createReleaseWorkspace } from "../src/core/release-workspace.js";

test("release workspace returns canonical build deploy and validation state", () => {
  const { releaseWorkspace } = createReleaseWorkspace({
    releasePlan: {
      releaseTarget: "web-deployment",
      releaseTag: "v1.2.0",
      environments: ["staging", "production"],
    },
    validationReport: {
      status: "ready",
      isReady: true,
      blockingIssues: [],
    },
    releaseTimeline: {
      releaseRunId: "release-run:giftwallet:web-deployment",
      currentStage: "publish",
      currentStatus: "published",
      eventCount: 2,
      events: [{ eventId: "evt-1" }, { eventId: "evt-2" }],
    },
    releaseStatus: {
      status: "published",
      terminalStates: ["published", "failed"],
    },
    deploymentRequest: {
      provider: "vercel",
      target: "production",
      strategy: "rolling",
      requiresApproval: true,
    },
    qualityGateDecision: {
      decision: "allow",
    },
  });

  assert.equal(releaseWorkspace.workspaceId, "release-run:giftwallet:web-deployment");
  assert.equal(releaseWorkspace.releaseTarget, "web-deployment");
  assert.equal(releaseWorkspace.buildAndDeploy.currentStatus, "published");
  assert.equal(releaseWorkspace.validation.status, "ready");
  assert.equal(releaseWorkspace.deployment.provider, "vercel");
  assert.equal(releaseWorkspace.summary.terminal, true);
  assert.equal(releaseWorkspace.summary.totalEvents, 2);
});

test("release workspace falls back to canonical empty state", () => {
  const { releaseWorkspace } = createReleaseWorkspace();

  assert.equal(releaseWorkspace.workspaceId, "release-workspace:unknown");
  assert.equal(releaseWorkspace.releaseTarget, null);
  assert.equal(releaseWorkspace.validation.status, "unknown");
  assert.equal(Array.isArray(releaseWorkspace.timeline.events), true);
  assert.equal(releaseWorkspace.summary.isBlocked, false);
});
