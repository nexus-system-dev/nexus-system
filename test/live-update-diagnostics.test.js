import test from "node:test";
import assert from "node:assert/strict";

import { appendLiveUpdateDiagnosticEvent } from "../web/shared/live-update-diagnostics.js";

test("live update diagnostics append a visible non-blocking OBS-001 event", () => {
  const project = appendLiveUpdateDiagnosticEvent({
    id: "giftwallet",
    events: [{ type: "state.updated", payload: { projectId: "giftwallet" } }],
  }, {
    projectId: "giftwallet",
  });

  const diagnostic = project.events.at(-1);

  assert.equal(project.events.length, 2);
  assert.equal(diagnostic.type, "diagnostic.live-events.unavailable");
  assert.equal(diagnostic.payload.projectId, "giftwallet");
  assert.equal(diagnostic.payload.taskId, "OBS-001");
  assert.match(diagnostic.payload.summary, /scheduled refresh/);
});

test("live update diagnostics tolerate malformed project state", () => {
  const project = appendLiveUpdateDiagnosticEvent(null, {
    projectId: "demo",
    summary: "Live stream unavailable.",
  });

  assert.equal(project.events.length, 1);
  assert.equal(project.events[0].payload.projectId, "demo");
  assert.equal(project.events[0].payload.summary, "Live stream unavailable.");
});
