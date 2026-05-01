import test from "node:test";
import assert from "node:assert/strict";
import { createOutageResponseManager } from "../src/core/outage-response-manager.js";

test("outage response manager emits ready response plan", () => {
  const { outageResponsePlan } = createOutageResponseManager({
    ownerIncident: { ownerIncidentId: "incident-1", status: "ready", incidentState: "active" },
    continuityPlan: { continuityPlanId: "continuity-1", summary: { status: "ready" } },
  });

  assert.equal(outageResponsePlan.status, "ready");
  assert.equal(outageResponsePlan.ownerActions.length, 3);
});
