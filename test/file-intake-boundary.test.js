import test from "node:test";
import assert from "node:assert/strict";

import { createFirstReleaseFileIntakeBoundary } from "../src/core/file-intake-boundary.js";

test("FILE-001 accepts first-release document inputs and routes them into understanding", () => {
  const boundary = createFirstReleaseFileIntakeBoundary({
    projectId: "lead-tool",
    sessionId: "session-1",
    uploadedFiles: [
      { name: "requirements.md", type: "text/markdown", content: "# Leads\nNeed owner and status." },
      { name: "screen.png", type: "image/png", size: 180_000 },
    ],
  });

  assert.equal(boundary.taskId, "FILE-001");
  assert.equal(boundary.status, "ready");
  assert.equal(boundary.acceptedFiles.length, 2);
  assert.equal(boundary.understandingInputs.length, 1);
  assert.equal(boundary.referenceOnlyInputs.length, 1);
  assert.equal(boundary.productUnderstandingRouting.status, "routed-to-project-understanding");
  assert.equal(boundary.policy.maxFiles, 8);
  assert.equal(boundary.policy.retentionPolicy, "project-lifecycle-until-user-delete");
});

test("FILE-001 rejects unsupported, too large, and over-count files without routing them", () => {
  const oversized = "x".repeat((2 * 1024 * 1024) + 1);
  const boundary = createFirstReleaseFileIntakeBoundary({
    uploadedFiles: [
      { name: "one.md", content: "ok" },
      { name: "two.exe", content: "bad" },
      { name: "three.txt", content: oversized },
      { name: "four.md", content: "ok" },
      { name: "five.md", content: "ok" },
      { name: "six.md", content: "ok" },
      { name: "seven.md", content: "ok" },
      { name: "eight.md", content: "ok" },
      { name: "nine.md", content: "ok" },
      { name: "ten.md", content: "ok" },
    ],
  });

  assert.equal(boundary.status, "bounded-with-rejections");
  assert.equal(boundary.rejectedFiles.some((file) => file.reason === "unsupported-file-type"), true);
  assert.equal(boundary.rejectedFiles.some((file) => file.reason === "file-too-large"), true);
  assert.equal(boundary.rejectedFiles.some((file) => file.reason === "too-many-files"), true);
  assert.equal(boundary.acceptedFiles.some((file) => file.name === "two.exe"), false);
  assert.equal(boundary.acceptedFiles.some((file) => file.name === "three.txt"), false);
  assert.equal(boundary.policy.deleteBehavior, "user-removes-from-project-intake-before-release");
});
