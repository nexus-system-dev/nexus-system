import test from "node:test";
import assert from "node:assert/strict";
import { createOwnerControlCenter } from "../src/core/owner-control-center.js";

test("owner control center assembles owner metrics shell", () => {
  const { ownerControlCenter } = createOwnerControlCenter({
    ownerControlPlane: { ownerControlPlaneId: "owner-control:1", status: "ready", healthStatus: "stable" },
    analyticsSummary: { status: "ready" },
    platformTrace: { traceId: "trace-1" },
    maintenanceBacklog: {
      status: "ready",
      items: [{ severity: "high" }, { severity: "medium" }],
    },
  });
  assert.equal(ownerControlCenter.status, "ready");
  assert.equal(ownerControlCenter.traceId, "trace-1");
  assert.equal(ownerControlCenter.maintenanceStatus, "ready");
  assert.equal(ownerControlCenter.maintenanceTaskCount, 2);
  assert.equal(ownerControlCenter.maintenanceUrgency, "high");
  assert.equal(ownerControlCenter.requiresMaintenanceReview, true);
  assert.equal(ownerControlCenter.recommendedActionCount, 4);
});
