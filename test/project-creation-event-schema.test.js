import test from "node:test";
import assert from "node:assert/strict";

import { defineProjectCreationEventSchema } from "../src/core/project-creation-event-schema.js";

test("project creation event schema binds createProjectDraft to the draft id", () => {
  const { projectCreationEvent } = defineProjectCreationEventSchema({
    userId: "user-1",
    projectId: "launch-studio",
    creationSource: "project-creation",
    timestamp: "2026-04-13T10:00:00.000Z",
  });

  assert.deepEqual(Object.keys(projectCreationEvent), [
    "projectCreationEventId",
    "userId",
    "projectId",
    "creationSource",
    "timestamp",
  ]);
  assert.equal(projectCreationEvent.projectCreationEventId, "project-creation:launch-studio:2026-04-13T10:00:00.000Z");
  assert.equal(projectCreationEvent.userId, "user-1");
  assert.equal(projectCreationEvent.projectId, "launch-studio");
  assert.equal(projectCreationEvent.creationSource, "project-creation");
  assert.equal(projectCreationEvent.timestamp, "2026-04-13T10:00:00.000Z");
});
