import test from "node:test";
import assert from "node:assert/strict";

import { createReactiveWorkspaceRefreshModel } from "../src/core/reactive-workspace-refresh-model.js";

test("reactive workspace refresh model updates panels and progress from a live channel", () => {
  const { reactiveWorkspaceState } = createReactiveWorkspaceRefreshModel({
    liveUpdateChannel: {
      channelId: "live-channel:realtime-stream:run-1",
      transportMode: "websocket",
      subscriptions: {
        totalTopics: 4,
      },
      summary: {
        isLive: true,
      },
    },
    developerWorkspace: {
      workspaceId: "developer-workspace:project-1",
      terminal: {
        status: "running",
        outputPreview: [{ message: "npm test" }],
      },
      diffPanel: {
        headline: "2 files changed",
        totalChanges: 2,
        requiresApproval: true,
      },
      logsPanel: {
        hasErrors: false,
      },
      contextSummary: {
        progressStatus: "running",
        progressPercent: 48,
      },
      fileTree: {
        totalFiles: 7,
      },
    },
  });

  assert.equal(reactiveWorkspaceState.refreshMode, "reactive-push");
  assert.equal(reactiveWorkspaceState.progressBar.percent, 48);
  assert.equal(reactiveWorkspaceState.progressBar.animated, true);
  assert.equal(reactiveWorkspaceState.panelRefreshes.diff.status, "changed");
  assert.equal(reactiveWorkspaceState.diffState.requiresApproval, true);
  assert.equal(reactiveWorkspaceState.artifactView.hasOutputPreview, true);
});

test("reactive workspace refresh model falls back safely without live inputs", () => {
  const { reactiveWorkspaceState } = createReactiveWorkspaceRefreshModel();

  assert.equal(typeof reactiveWorkspaceState.refreshStateId, "string");
  assert.equal(reactiveWorkspaceState.refreshMode, "scheduled-refresh");
  assert.equal(typeof reactiveWorkspaceState.progressBar.percent, "number");
  assert.equal(typeof reactiveWorkspaceState.summary.isLive, "boolean");
});
