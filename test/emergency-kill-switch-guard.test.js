import test from "node:test";
import assert from "node:assert/strict";

import { createEmergencyKillSwitchGuard } from "../src/core/emergency-kill-switch-guard.js";

test("critical incident activates kill switch", () => {
  const { killSwitchDecision } = createEmergencyKillSwitchGuard({
    incidentAlert: {
      status: "active",
      severity: "critical",
      incidentType: "queue-stall",
      affectedComponents: ["background-worker"],
    },
    featureFlagDecision: {
      flagResults: [],
    },
  });

  assert.equal(killSwitchDecision.isActive, true);
  assert.equal(killSwitchDecision.triggeredBy, "incident");
});

test("connector outage kills only provider execution", () => {
  const { killSwitchDecision } = createEmergencyKillSwitchGuard({
    incidentAlert: {
      status: "active",
      severity: "critical",
      incidentType: "connector-outage",
      affectedComponents: ["connector-service"],
    },
    featureFlagDecision: {
      flagResults: [],
    },
  });

  assert.deepEqual(killSwitchDecision.killedPaths, ["provider-execution"]);
});

test("queue stall kills only agent runtime", () => {
  const { killSwitchDecision } = createEmergencyKillSwitchGuard({
    incidentAlert: {
      status: "active",
      severity: "critical",
      incidentType: "queue-stall",
      affectedComponents: ["background-worker"],
    },
    featureFlagDecision: {
      flagResults: [],
    },
  });

  assert.deepEqual(killSwitchDecision.killedPaths, ["agent-runtime"]);
});

test("emergency execution stop activates global kill", () => {
  const { killSwitchDecision } = createEmergencyKillSwitchGuard({
    incidentAlert: {
      status: "clear",
      severity: "low",
      affectedComponents: [],
    },
    featureFlagDecision: {
      flagResults: [
        {
          flagId: "emergency-execution-stop",
          reason: "kill-switch",
        },
      ],
    },
  });

  assert.equal(killSwitchDecision.isActive, true);
  assert.equal(killSwitchDecision.globalKill, true);
  assert.equal(killSwitchDecision.triggeredBy, "flag");
});

test("no trigger keeps kill switch inactive", () => {
  const { killSwitchDecision } = createEmergencyKillSwitchGuard({
    incidentAlert: {
      status: "clear",
      severity: "low",
      affectedComponents: [],
    },
    featureFlagDecision: {
      flagResults: [],
    },
  });

  assert.equal(killSwitchDecision.isActive, false);
  assert.equal(killSwitchDecision.triggeredBy, "none");
});

test("kill switch can be triggered by both incident and flag", () => {
  const { killSwitchDecision } = createEmergencyKillSwitchGuard({
    incidentAlert: {
      status: "active",
      severity: "critical",
      incidentType: "connector-outage",
      affectedComponents: ["connector-service"],
    },
    featureFlagDecision: {
      flagResults: [
        {
          flagId: "emergency-execution-stop",
          reason: "kill-switch",
        },
      ],
    },
  });

  assert.equal(killSwitchDecision.triggeredBy, "both");
  assert.equal(killSwitchDecision.killedPaths.includes("provider-execution"), true);
  assert.equal(killSwitchDecision.killedPaths.includes("agent-runtime"), true);
});
