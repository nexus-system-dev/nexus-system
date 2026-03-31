import test from "node:test";
import assert from "node:assert/strict";

import { createFailoverAndContinuityPlanner } from "../src/core/failover-continuity-planner.js";

test("failover continuity planner builds failover plan for critical runtime outage", () => {
  const { continuityPlan } = createFailoverAndContinuityPlanner({
    reliabilitySlaModel: {
      reliabilityModelId: "reliability:giftwallet",
      serviceTier: "enterprise",
      runtimeCapabilities: {
        supportsRuntimeFailover: true,
      },
    },
    incidentAlert: {
      projectId: "giftwallet",
      incidentType: "runtime-outage",
      severity: "critical",
      summary: "Runtime is unavailable",
    },
  });

  assert.equal(continuityPlan.recommendedMode, "failover");
  assert.equal(continuityPlan.failover.enabled, true);
  assert.equal(continuityPlan.failover.integrationStatus, "connected");
  assert.equal(Array.isArray(continuityPlan.failover.route), true);
});

test("failover continuity planner builds degraded queue fallback and marks missing SLA schema as partial", () => {
  const { continuityPlan } = createFailoverAndContinuityPlanner({
    incidentAlert: {
      projectId: "giftwallet",
      incidentType: "queue-stall",
      severity: "high",
    },
  });

  assert.equal(continuityPlan.affectedLayer, "queue");
  assert.equal(continuityPlan.recommendedMode, "degraded");
  assert.equal(continuityPlan.summary.planStatus, "partial");
  assert.equal(continuityPlan.summary.needsFallbackReliabilityModel, true);
});

test("failover continuity planner builds provider fallback route", () => {
  const { continuityPlan } = createFailoverAndContinuityPlanner({
    reliabilitySlaModel: {
      runtimeCapabilities: {
        supportsProviderFallback: true,
      },
    },
    incidentAlert: {
      projectId: "giftwallet",
      incidentType: "provider-outage",
      severity: "high",
    },
  });

  assert.equal(continuityPlan.affectedLayer, "provider");
  assert.equal(continuityPlan.fallbackActions.includes("switch-provider-route"), true);
  assert.equal(continuityPlan.recoveryDirection.nextCheckpoint, "stabilize-degraded-services");
});
