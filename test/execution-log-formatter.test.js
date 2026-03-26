import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionLogFormatter } from "../src/core/execution-log-formatter.js";

test("execution log formatter returns formatted logs and user-facing messages", () => {
  const { formattedLogs, userFacingMessages } = createExecutionLogFormatter({
    rawLogs: [
      {
        level: "info",
        message: "Bootstrap started",
        timestamp: "2026-01-01T00:00:00.000Z",
      },
    ],
    commandOutputs: [
      {
        command: "create-app-shell",
        output: "app-shell, project-root",
        exitCode: 0,
      },
    ],
  });

  assert.equal(formattedLogs.length, 2);
  assert.equal(formattedLogs[0].type, "log");
  assert.equal(formattedLogs[1].type, "command");
  assert.equal(userFacingMessages[0].includes("לוג"), true);
  assert.equal(userFacingMessages[1].includes("פקודה"), true);
});
