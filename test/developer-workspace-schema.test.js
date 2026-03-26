import test from "node:test";
import assert from "node:assert/strict";

import { defineDeveloperWorkspaceSchema } from "../src/core/developer-workspace-schema.js";

test("developer workspace schema returns canonical workbench for project and execution state", () => {
  const { developerWorkspace } = defineDeveloperWorkspaceSchema({
    projectState: {
      projectId: "nexus-app",
      projectName: "Nexus App",
      storageRecord: {
        artifacts: [{ path: "dist/app.js" }],
        attachments: [{ path: "attachments/spec.pdf" }],
      },
      diffPreview: {
        headline: "לפני הביצוע יוחלו שינויי קוד",
        summary: { totalChanges: 2 },
        approvalGuidance: { required: true },
        sections: {
          code: [{ path: "src/app.js" }],
          migrations: [],
          infra: [],
        },
        affectedAreas: {
          codePaths: ["src/app.js"],
          migrationPaths: [],
        },
      },
      recommendedActions: [{ title: "Review generated diff" }],
    },
    executionState: {
      progressState: { status: "running" },
      progressPercent: 42,
      formattedLogs: [{ id: "log-1", level: "info", message: "build started" }],
      platformLogs: [{ id: "platform-1", level: "warn", message: "queue delay" }],
      bootstrapPlannedCommands: [{ commands: [{ command: "npm", args: ["run", "build"] }] }],
      bootstrapAssignments: [{ assignmentId: "assign-1", taskId: "task-1", targetId: "agent-1", status: "assigned" }],
      taskResults: [{ taskId: "task-1", status: "completed" }],
      incidentAlert: { status: "clear" },
    },
  });

  assert.equal(developerWorkspace.workspaceId, "developer-workspace:nexus-app");
  assert.equal(developerWorkspace.fileTree.totalFiles, 3);
  assert.equal(developerWorkspace.editor.activeFilePath, "src/app.js");
  assert.equal(developerWorkspace.terminal.commandHistory[0].command, "npm run build");
  assert.equal(developerWorkspace.diffPanel.totalChanges, 2);
  assert.equal(developerWorkspace.logsPanel.totalLogs, 2);
  assert.equal(developerWorkspace.agentActivity.assignedAgents[0], "agent-1");
  assert.equal(developerWorkspace.contextSummary.nextAction, "Review generated diff");
});

test("developer workspace schema falls back to empty canonical workspace", () => {
  const { developerWorkspace } = defineDeveloperWorkspaceSchema();

  assert.equal(developerWorkspace.screenType, "workspace");
  assert.equal(developerWorkspace.fileTree.totalFiles, 0);
  assert.equal(developerWorkspace.terminal.status, "idle");
  assert.equal(developerWorkspace.logsPanel.totalLogs, 0);
});
