import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-growth-measure-"));
  return new ProjectService({
    eventLogPath: path.join(root, "events.ndjson"),
  });
}

function createProject(service) {
  return service.createProject({
    id: `growth-measure-${Date.now()}`,
    name: "Growth Measure Project",
    goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  });
}

test("ProjectService stores GROW-MEASURE-001 truth across growth agent and measurement writes", () => {
  const service = createService();
  const created = createProject(service);

  const afterAgent = service.runGrowthAgent({
    projectId: created.id,
    userInput: "תגדיר מדידה לדף נחיתה",
  });

  assert.equal(afterAgent.growthMeasurementTruth.taskId, "GROW-MEASURE-001");
  assert.equal(afterAgent.growthMeasurementTruth.status, "measurement-not-available-yet");

  const afterInternal = service.recordGrowthMeasurement({
    projectId: created.id,
    record: {
      source: "nexus-internal-event",
      sourceType: "internal-event",
      growthPath: "landing-experiment",
      experimentId: "exp-1",
      metric: "landing.opened",
      value: 1,
    },
  });
  const afterManual = service.recordGrowthMeasurement({
    projectId: created.id,
    record: {
      source: "user-report",
      sourceType: "manual",
      growthPath: "manual-demo-call",
      experimentId: "exp-1",
      metric: "understood-value",
      value: 1,
    },
  });

  assert.equal(afterInternal.growthMeasurementTruth.records.length, 1);
  assert.equal(afterManual.growthMeasurementTruth.records.length, 2);
  assert.deepEqual(afterManual.growthMeasurementTruth.records.map((record) => record.sourceType), ["internal-event", "manual"]);
  assert.equal(afterManual.context.growthMeasurementTruth.records.length, 2);
  assert.equal(afterManual.state.growthMeasurementTruth.records.length, 2);

  const restored = service.getProject(created.id);
  assert.equal(restored.growthMeasurementTruth.records.length, 2);
  assert.equal(restored.growthMeasurementTruth.learningSummary.conclusionLanguage, "initial-signal");
});
