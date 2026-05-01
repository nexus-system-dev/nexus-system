import test from "node:test";
import assert from "node:assert/strict";

import { defineReliabilityAndSlaSchema } from "../src/core/reliability-sla-model.js";
import { createFailoverAndContinuityPlanner } from "../src/core/failover-continuity-planner.js";

test("reliability SLA schema builds canonical starter, standard, and enterprise tiers", () => {
  const starter = defineReliabilityAndSlaSchema({
    serviceTierDefinitions: {
      serviceTier: "starter",
    },
    runtimeCapabilities: {
      snapshotRestore: true,
    },
    projectId: "giftwallet",
  }).reliabilitySlaModel;
  const standard = defineReliabilityAndSlaSchema({
    serviceTierDefinitions: {
      serviceTier: "standard",
    },
    runtimeCapabilities: {
      snapshotRestore: true,
      automaticRecovery: true,
      supportsProviderFallback: true,
    },
    projectId: "giftwallet",
  }).reliabilitySlaModel;
  const enterprise = defineReliabilityAndSlaSchema({
    serviceTierDefinitions: {
      serviceTier: "enterprise",
    },
    runtimeCapabilities: {
      snapshotRestore: true,
      automaticRecovery: true,
      supportsRuntimeFailover: true,
      supportsWorkspaceFailover: true,
    },
    projectId: "giftwallet",
  }).reliabilitySlaModel;

  assert.equal(Boolean(starter.reliabilityModelId), true);
  assert.equal(Boolean(standard.reliabilityModelId), true);
  assert.equal(Boolean(enterprise.reliabilityModelId), true);
  assert.equal(starter.serviceTier, "starter");
  assert.equal(standard.serviceTier, "standard");
  assert.equal(enterprise.serviceTier, "enterprise");
});

test("reliability SLA schema defines canonical failure classes and recovery objectives", () => {
  const { reliabilitySlaModel } = defineReliabilityAndSlaSchema({
    serviceTierDefinitions: {
      serviceTier: "standard",
    },
    runtimeCapabilities: {
      snapshotRestore: true,
      automaticRecovery: true,
      supportsProviderFallback: true,
    },
    projectId: "giftwallet",
  });

  assert.equal(Array.isArray(reliabilitySlaModel.failureClasses), true);
  assert.equal(reliabilitySlaModel.failureClasses.length >= 6, true);
  assert.equal(reliabilitySlaModel.failureClasses.some((item) => item.classId === "runtime-outage"), true);
  assert.equal(reliabilitySlaModel.failureClasses.some((item) => item.classId === "workspace-cluster-outage"), true);
  assert.equal(Number.isFinite(reliabilitySlaModel.recoveryObjectives.rtoMinutes), true);
  assert.equal(Number.isFinite(reliabilitySlaModel.recoveryObjectives.rpoMinutes), true);
  assert.equal(reliabilitySlaModel.summary.readinessStatus, "ready");
});

test("canonical reliability model moves continuity planner to ready status", () => {
  const { reliabilitySlaModel } = defineReliabilityAndSlaSchema({
    serviceTierDefinitions: {
      serviceTier: "enterprise",
    },
    runtimeCapabilities: {
      snapshotRestore: true,
      automaticRecovery: true,
      supportsRuntimeFailover: true,
      supportsWorkspaceFailover: true,
      supportsProviderFallback: true,
    },
    projectId: "giftwallet",
  });

  const { continuityPlan } = createFailoverAndContinuityPlanner({
    reliabilitySlaModel,
    incidentAlert: {
      projectId: "giftwallet",
      incidentType: "runtime-outage",
      severity: "critical",
    },
  });

  assert.equal(Boolean(reliabilitySlaModel.reliabilityModelId), true);
  assert.equal(continuityPlan.planningStatus, "ready");
  assert.equal(continuityPlan.summary.planStatus, "ready");
  assert.equal(continuityPlan.decisionTrace.reliabilityInputStatus, "canonical");
});

test("reliability SLA schema normalizes malformed tier and notify role strings", () => {
  const { reliabilitySlaModel } = defineReliabilityAndSlaSchema({
    serviceTierDefinitions: {
      serviceTier: " standard ",
      ownerEscalationPolicy: {
        notifyRoles: [" owner ", " operator "],
      },
    },
    runtimeCapabilities: {
      snapshotRestore: true,
      automaticRecovery: true,
      supportsProviderFallback: true,
    },
    projectId: " giftwallet ",
  });

  assert.equal(reliabilitySlaModel.reliabilityModelId, "reliability-sla:giftwallet:standard");
  assert.equal(reliabilitySlaModel.projectId, "giftwallet");
  assert.deepEqual(reliabilitySlaModel.ownerEscalationPolicy.notifyRoles, ["owner", "operator"]);
});
