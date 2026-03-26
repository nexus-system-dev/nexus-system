import test from "node:test";
import assert from "node:assert/strict";

import { defineDiffPreviewSchema } from "../src/core/diff-preview-schema.js";

test("diff preview schema returns canonical preview payload", () => {
  const { diffPreviewSchema } = defineDiffPreviewSchema({
    executionPlan: {
      executionRequestId: "exec-1",
      taskId: "task-1",
      actionType: "apply-code-change",
      target: "sandbox",
    },
    changeSet: [
      { kind: "code", path: "src/app.js", operation: "modify" },
      { kind: "migration", path: "db/migrations/001.sql", operation: "add" },
    ],
  });

  assert.equal(diffPreviewSchema.previewId, "exec-1");
  assert.equal(diffPreviewSchema.executionPlan.taskId, "task-1");
  assert.equal(diffPreviewSchema.changeSummary.totalChanges, 2);
  assert.equal(diffPreviewSchema.changeSummary.includesCodeChanges, true);
  assert.equal(diffPreviewSchema.changeSummary.includesMigrationChanges, true);
});

test("diff preview schema falls back to empty preview", () => {
  const { diffPreviewSchema } = defineDiffPreviewSchema();

  assert.equal(diffPreviewSchema.previewId, "diff-preview:pending");
  assert.equal(diffPreviewSchema.changeSummary.totalChanges, 0);
  assert.equal(Array.isArray(diffPreviewSchema.changeSet), true);
});
