import test from "node:test";
import assert from "node:assert/strict";

import { createProviderRecoveryProbeFlow } from "../src/core/provider-recovery-probe-flow.js";

test("provider recovery probe flow schedules a delayed probe when the circuit is open", () => {
  const { providerRecoveryProbe } = createProviderRecoveryProbeFlow({
    circuitBreakerDecision: {
      providerType: "hosting",
      circuitState: "open",
      decision: "fail-fast",
      cooldownWindowMs: 300000,
      retryAfterMs: 300000,
    },
    providerSession: {
      providerType: "hosting",
      operationTypes: ["poll", "deploy"],
    },
  });

  assert.equal(providerRecoveryProbe.status, "scheduled");
  assert.equal(providerRecoveryProbe.probeAction, "schedule-probe");
  assert.equal(providerRecoveryProbe.reopenDecision, "hold-closed");
  assert.equal(providerRecoveryProbe.schedule.trigger, "worker-scheduled");
  assert.equal(providerRecoveryProbe.schedule.pollOperation, "poll");
  assert.equal(providerRecoveryProbe.workerJob.jobType, "provider-recovery-probe");
  assert.equal(providerRecoveryProbe.summary.requiresWorker, true);
});

test("provider recovery probe flow attempts controlled reopen when the circuit is half-open", () => {
  const { providerRecoveryProbe } = createProviderRecoveryProbeFlow({
    circuitBreakerDecision: {
      providerType: "hosting",
      circuitState: "half-open",
      decision: "allow-retry",
      cooldownWindowMs: 60000,
      retryAfterMs: 15000,
    },
    providerSession: {
      providerType: "hosting",
      operationTypes: ["status-check"],
    },
  });

  assert.equal(providerRecoveryProbe.status, "active");
  assert.equal(providerRecoveryProbe.probeAction, "attempt-reopen");
  assert.equal(providerRecoveryProbe.reopenDecision, "controlled-reopen");
  assert.equal(providerRecoveryProbe.schedule.trigger, "inline-controlled");
  assert.equal(providerRecoveryProbe.schedule.pollOperation, "status-check");
  assert.equal(providerRecoveryProbe.summary.canReopen, true);
});

test("provider recovery probe flow stays idle when the circuit is closed", () => {
  const { providerRecoveryProbe } = createProviderRecoveryProbeFlow({
    circuitBreakerDecision: {
      providerType: "hosting",
      circuitState: "closed",
      decision: "allow",
      cooldownWindowMs: 0,
      retryAfterMs: 0,
    },
    providerSession: {
      providerType: "hosting",
      operationTypes: [],
    },
  });

  assert.equal(providerRecoveryProbe.status, "not-needed");
  assert.equal(providerRecoveryProbe.probeAction, "keep-open");
  assert.equal(providerRecoveryProbe.reopenDecision, "no-reopen-needed");
  assert.equal(providerRecoveryProbe.summary.canProbe, false);
});
