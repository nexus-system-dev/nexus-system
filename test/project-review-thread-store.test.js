import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createProjectReviewThreadStore } from "../src/core/project-review-thread-store.js";

function createStore() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-review-thread-store-"));
  return createProjectReviewThreadStore({
    filePath: path.join(directory, "project-review-threads.ndjson"),
  });
}

test("project review thread store persists and queries thread records", () => {
  const store = createStore();
  store.upsert({
    threadId: "thread-1",
    projectId: "giftwallet",
    threadType: "review-thread",
    title: "Review pending changes",
    contextTarget: {
      workspaceArea: "developer-workspace",
      resourceType: "diff",
      resourceId: "exec-1",
    },
    messages: [],
    participants: [],
    status: "open",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  });

  const records = store.query({ projectId: "giftwallet" });
  assert.equal(records.length, 1);
  assert.equal(records[0].threadId, "thread-1");
});

test("project review thread store appends messages to existing records", () => {
  const store = createStore();
  store.upsert({
    threadId: "thread-1",
    projectId: "giftwallet",
    threadType: "comment-thread",
    title: "Release discussion",
    contextTarget: {
      workspaceArea: "release-workspace",
      resourceType: "release-step",
      resourceId: "release-1",
    },
    messages: [],
    participants: [],
    status: "open",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  });

  const record = store.appendMessage({
    threadId: "thread-1",
    projectId: "giftwallet",
    message: {
      messageId: "message-1",
      authorId: "user-1",
      authorName: "Owner",
      body: "Please validate this release step",
      status: "open",
      createdAt: "2025-01-01T00:05:00.000Z",
    },
  });

  assert.equal(record.messages.length, 1);
  assert.equal(record.participants[0].displayName, "Owner");
  assert.equal(record.updatedAt, "2025-01-01T00:05:00.000Z");
});
