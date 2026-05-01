import test from "node:test";
import assert from "node:assert/strict";

import { createServiceReliabilityDashboardModel } from "../src/core/service-reliability-dashboard-model.js";

test("service reliability dashboard model exposes canonical reliability and incident summary", () => {
  const { serviceReliabilityDashboard } = createServiceReliabilityDashboardModel({
    reliabilitySlaModel: {
      reliabilityModelId: "reliability-sla:giftwallet:standard",
      schemaStatus: "canonical",
      serviceTier: "standard",
      uptimeTargets: { monthlyPercent: 99.5, maxMonthlyDowntimeMinutes: 216 },
      recoveryObjectives: { rtoMinutes: 30, rpoMinutes: 15 },
    },
    continuityPlan: {
      continuityPlanId: "continuity-plan:giftwallet:runtime",
      planningStatus: "ready",
      recommendedMode: "recovery",
      affectedLayer: "runtime",
      recoveryDirection: { nextCheckpoint: "execute-recovery-checklist" },
    },
    incidentAlert: {
      status: "active",
      severity: "high",
      incidentCount: 2,
      affectedComponents: ["api-runtime", "queue"],
    },
    systemBottleneckSummary: {
      bottleneckType: "queue-lag",
      severity: "critical",
      queueObservability: { queueLagSeconds: 180 },
      signals: [{ type: "queue-lag" }, { type: "runtime-pressure" }],
    },
    liveProjectMonitoring: {
      status: "ready",
      healthStatus: "degraded",
    },
  });

  assert.equal(serviceReliabilityDashboard.status, "ready");
  assert.equal(serviceReliabilityDashboard.serviceTier, "standard");
  assert.equal(serviceReliabilityDashboard.incidentStatus, "active");
  assert.equal(serviceReliabilityDashboard.incidentCount, 2);
  assert.equal(serviceReliabilityDashboard.queueLagMinutes, 3);
  assert.equal(serviceReliabilityDashboard.workspacePressureStatus, "degraded");
  assert.equal(serviceReliabilityDashboard.summaryCards.length, 4);
});

test("service reliability dashboard model reports missing inputs when reliability or continuity are absent", () => {
  const { serviceReliabilityDashboard } = createServiceReliabilityDashboardModel({
    reliabilitySlaModel: null,
    continuityPlan: null,
  });

  assert.equal(serviceReliabilityDashboard.status, "missing-inputs");
  assert.deepEqual(serviceReliabilityDashboard.missingInputs, [
    "reliabilitySlaModel",
    "continuityPlan",
  ]);
});
