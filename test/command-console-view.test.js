import test from "node:test";
import assert from "node:assert/strict";

import { createTerminalAndCommandConsoleView } from "../src/core/command-console-view.js";

test("terminal and command console view returns canonical commands and log streams", () => {
  const { commandConsoleView } = createTerminalAndCommandConsoleView({
    executionStatusPayload: {
      projectId: "nexus-app",
      progressState: { status: "running" },
      bootstrapPlannedCommands: [
        {
          commands: [
            { command: "npm", args: ["run", "build"], executionMode: "local-terminal" },
          ],
        },
      ],
      bootstrapAssignments: [
        {
          assignmentId: "assignment-1",
          taskId: "task-1",
          targetId: "agent-1",
          dispatchMode: "agent-runtime",
          status: "assigned",
        },
      ],
    },
    formattedLogs: [
      { id: "command-1", type: "command", level: "info", message: "npm run build -> ok", source: "execution" },
      { id: "log-1", type: "log", level: "error", message: "stderr line", source: "runtime" },
    ],
  });

  assert.equal(commandConsoleView.consoleId, "command-console:nexus-app");
  assert.equal(commandConsoleView.status, "running");
  assert.equal(commandConsoleView.commands[0].command, "npm run build");
  assert.equal(commandConsoleView.logStreams.stdout.length, 1);
  assert.equal(commandConsoleView.logStreams.stderr.length, 1);
  assert.equal(commandConsoleView.agentCommandActivity[0].targetId, "agent-1");
  assert.equal(commandConsoleView.summary.hasErrors, true);
});

test("terminal and command console view falls back to idle console", () => {
  const { commandConsoleView } = createTerminalAndCommandConsoleView();

  assert.equal(commandConsoleView.status, "idle");
  assert.equal(Array.isArray(commandConsoleView.commands), true);
  assert.equal(Array.isArray(commandConsoleView.logStreams.stdout), true);
  assert.equal(Array.isArray(commandConsoleView.agentCommandActivity), true);
});
