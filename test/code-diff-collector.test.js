import test from "node:test";
import assert from "node:assert/strict";

import { createCodeDiffCollector } from "../src/core/code-diff-collector.js";

test("code diff collector returns canonical code diff entries from planned changes", () => {
  const { codeDiff } = createCodeDiffCollector({
    plannedChanges: [
      {
        id: "change-1",
        kind: "code",
        operation: "add",
        path: "src/auth/module.ts",
        summary: "create-auth-module",
        command: "create-auth-module",
        args: ["saas", "node"],
      },
      {
        id: "change-2",
        kind: "infra",
        operation: "modify",
        path: "vercel.json",
      },
    ],
  });

  assert.equal(codeDiff.totalCodeChanges, 1);
  assert.equal(codeDiff.files[0].path, "src/auth/module.ts");
  assert.equal(codeDiff.files[0].operation, "add");
  assert.equal(codeDiff.affectedPaths.includes("src/auth/module.ts"), true);
});

test("code diff collector falls back to empty diff", () => {
  const { codeDiff } = createCodeDiffCollector();

  assert.equal(codeDiff.totalCodeChanges, 0);
  assert.equal(Array.isArray(codeDiff.files), true);
  assert.equal(codeDiff.files.length, 0);
});
