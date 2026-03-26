import test from "node:test";
import assert from "node:assert/strict";

import { createProjectWorkbenchLayout } from "../src/core/project-workbench-layout.js";

test("project workbench layout returns canonical zones and panels", () => {
  const { projectWorkbenchLayout } = createProjectWorkbenchLayout({
    developerWorkspace: {
      workspaceId: "developer-workspace:nexus-app",
      fileTree: {
        totalFiles: 3,
        items: [
          { path: "src/app.js", source: "diff-preview" },
          { path: "dist/app.js", source: "artifact-storage" },
        ],
      },
      editor: {
        activeFilePath: "src/app.js",
        openFiles: [{ path: "src/app.js" }],
      },
      terminal: {
        status: "running",
        commandHistory: [{ command: "npm run dev" }],
      },
      diffPanel: {
        totalChanges: 2,
      },
      logsPanel: {
        totalLogs: 4,
        hasErrors: false,
      },
      agentActivity: {
        assignments: [{ assignmentId: "assign-1" }],
      },
      contextSummary: {
        nextAction: "Review diff",
      },
    },
    screenTemplateSchema: {
      templateId: "workspace-template",
      templateType: "workspace",
      supportsAssistant: true,
    },
  });

  assert.equal(projectWorkbenchLayout.templateType, "workspace");
  assert.equal(projectWorkbenchLayout.zones.length, 4);
  assert.equal(projectWorkbenchLayout.zones[0].zoneId, "code-zone");
  assert.equal(projectWorkbenchLayout.panels.find((panel) => panel.panelId === "terminal").status, "running");
  assert.equal(projectWorkbenchLayout.panels.find((panel) => panel.panelId === "artifacts").itemCount, 1);
  assert.equal(projectWorkbenchLayout.defaults.assistantPinned, true);
});

test("project workbench layout falls back to canonical workspace defaults", () => {
  const { projectWorkbenchLayout } = createProjectWorkbenchLayout();

  assert.equal(projectWorkbenchLayout.templateId, "workspace-template");
  assert.equal(projectWorkbenchLayout.zones.length, 4);
  assert.equal(projectWorkbenchLayout.defaults.focusedZone, "code-zone");
});
