import test from "node:test";
import assert from "node:assert/strict";

import { createDesktopShellScopeContract } from "../src/core/desktop-shell-scope-contract.js";

test("desktop shell scope contract differentiates current browser-backed path from future shell path", () => {
  const { desktopShellScopeContract } = createDesktopShellScopeContract({
    projectId: "project-1",
    productClass: "saas",
    localWorkspaceContract: {
      workspaceMode: "browser-backed-local-workspace",
    },
    localDevelopmentBridge: {
      summary: {
        isReady: true,
      },
    },
    cloudWorkspaceModel: {
      summary: {
        isReady: true,
      },
    },
  });

  assert.equal(desktopShellScopeContract.shellFamily, "browser-backed-shell");
  assert.equal(desktopShellScopeContract.shellStatus, "scope-defined-not-implemented");
  assert.equal(desktopShellScopeContract.shellPathDecision.currentWave4Path, "browser-backed-local-workspace");
  assert.equal(desktopShellScopeContract.shellPathDecision.preferredFutureShell, "local-bridge-shell");
  assert.equal(desktopShellScopeContract.runtimeBindings.releaseWorkflowMode, "local-command-handoff");
});

test("desktop shell scope contract routes mobile-app toward remote apple shell when ready", () => {
  const { desktopShellScopeContract } = createDesktopShellScopeContract({
    projectId: "project-2",
    productClass: "mobile-app",
    localWorkspaceContract: {
      workspaceMode: "local-bridge-attached-workspace",
    },
    remoteMacRunner: {
      summary: {
        isReady: true,
      },
    },
  });

  assert.equal(desktopShellScopeContract.shellFamily, "apple-desktop-shell");
  assert.equal(desktopShellScopeContract.shellPathDecision.preferredFutureShell, "remote-apple-shell");
  assert.equal(desktopShellScopeContract.runtimeBindings.releaseWorkflowMode, "apple-build-handoff");
});
