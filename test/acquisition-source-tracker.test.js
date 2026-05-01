import test from "node:test";
import assert from "node:assert/strict";
import { createAcquisitionSourceTracker } from "../src/core/acquisition-source-tracker.js";
test("acquisition source tracker records a normalized acquisition entry", () => {
  const { acquisitionSourceMetrics } = createAcquisitionSourceTracker({ gtmMetricSchema: { gtmMetricSchemaId: "schema-1", status: "ready" }, projectCreationEvent: { projectId: "giftwallet" }, userActivityEvent: { currentSurface: "community" }, attributionMetadata: { source: "community" } });
  assert.equal(acquisitionSourceMetrics.status, "ready");
  assert.equal(acquisitionSourceMetrics.entries[0].source, "community");
});
