import test from "node:test";
import assert from "node:assert/strict";

import { createDevelopmentWorkspace } from "../src/core/development-workspace.js";

test("development workspace returns canonical unified workbench state", () => {
  const { developmentWorkspace } = createDevelopmentWorkspace({
    projectWorkbenchLayout: {
      workspaceId: "developer-workspace:nexus-app",
      layoutId: "project-workbench:developer-workspace:nexus-app",
      primaryNavigation: ["code-zone", "activity-zone", "output-zone", "assistant-zone"],
      defaults: {
        focusedZone: "code-zone",
      },
      panels: [{ panelId: "file-tree" }, { panelId: "terminal" }],
    },
    fileEditorContract: {
      workspaceId: "developer-workspace:nexus-app",
      fileTree: {
        items: [{ path: "src/app.js" }],
      },
      editor: {
        activeFilePath: "src/app.js",
        tabs: [{ tabId: "editor-tab-1", path: "src/app.js", isActive: true }],
        supportsInlineDiff: true,
      },
    },
    commandConsoleView: {
      consoleId: "command-console:nexus-app",
      status: "running",
      commands: [{ commandId: "console-command-1", command: "npm run dev" }],
      logStreams: {
        stdout: [{ id: "stdout-1", message: "started" }],
        stderr: [],
      },
      agentCommandActivity: [{ assignmentId: "assignment-1" }],
      summary: {
        totalCommands: 1,
        hasErrors: false,
      },
    },
  });

  assert.equal(developmentWorkspace.workspaceId, "developer-workspace:nexus-app");
  assert.equal(developmentWorkspace.layoutId, "project-workbench:developer-workspace:nexus-app");
  assert.equal(developmentWorkspace.navigation.focusedZone, "code-zone");
  assert.equal(developmentWorkspace.codeSurface.editor.activeFilePath, "src/app.js");
  assert.equal(developmentWorkspace.executionSurface.status, "running");
  assert.equal(developmentWorkspace.workspaceSummary.totalFiles, 1);
});

test("development workspace falls back to canonical empty state", () => {
  const { developmentWorkspace } = createDevelopmentWorkspace();

  assert.equal(developmentWorkspace.workspaceId, null);
  assert.equal(Array.isArray(developmentWorkspace.navigation.primaryNavigation), true);
  assert.equal(Array.isArray(developmentWorkspace.codeSurface.fileTree.items), true);
  assert.equal(Array.isArray(developmentWorkspace.executionSurface.commands), true);
});
