import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createDurableProjectCreationEventHistoryStore } from "../src/core/durable-project-creation-event-history-store.js";

test("durable project creation event history store survives restart and deduplicates replay", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-creation-history-"));
  const filePath = path.join(directory, "project-creation-events.ndjson");

  const firstStore = createDurableProjectCreationEventHistoryStore({ filePath });
  firstStore.append({
    projectCreationEventId: "project-creation:launch-studio:2026-01-01T10:00:00.000Z",
    userId: "user-1",
    projectId: "launch-studio",
    creationSource: "project-creation",
    timestamp: "2026-01-01T10:00:00.000Z",
  });
  firstStore.append({
    projectCreationEventId: "project-creation:launch-studio:2026-01-01T10:00:00.000Z",
    userId: "user-1",
    projectId: "launch-studio",
    creationSource: "project-creation",
    timestamp: "2026-01-01T10:00:00.000Z",
  });

  const restartedStore = createDurableProjectCreationEventHistoryStore({ filePath });
  const records = restartedStore.readAll();

  assert.equal(records.length, 1);
  assert.equal(records[0].projectId, "launch-studio");
});
