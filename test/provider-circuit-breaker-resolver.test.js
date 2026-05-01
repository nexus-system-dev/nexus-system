import test from "node:test";
import assert from "node:assert/strict";

import { createProviderCircuitBreakerResolver } from "../src/core/provider-circuit-breaker-resolver.js";

test("provider circuit breaker resolver fails fast when outage signals trip the provider circuit", () => {
  const { circuitBreakerDecision } = createProviderCircuitBreakerResolver({
    providerDegradationState: {
      providerType: "hosting",
      health: "outage",
      consecutiveFailures: 4,
      cooldownWindowMs: 300000,
      summary: {
        hasIncidentSignal: true,
      },
    },
    runtimeHealthSignals: {
      status: "degraded",
      dependencies: [
        {
          name: "hosting-connector",
          status: "failed",
          readiness: "not-ready",
          critical: true,
        },
      ],
    },
  });

  assert.equal(circuitBreakerDecision.providerType, "hosting");
  assert.equal(circuitBreakerDecision.circuitState, "open");
  assert.equal(circuitBreakerDecision.decision, "fail-fast");
  assert.equal(circuitBreakerDecision.summary.failFast, true);
  assert.equal(circuitBreakerDecision.summary.requiresCooldown, true);
  assert.equal(circuitBreakerDecision.retryAfterMs, 300000);
});

test("provider circuit breaker resolver allows controlled retry when provider is degraded but not fully down", () => {
  const { circuitBreakerDecision } = createProviderCircuitBreakerResolver({
    providerDegradationState: {
      providerType: "hosting",
      health: "degraded",
      consecutiveFailures: 2,
      cooldownWindowMs: 60000,
      summary: {
        hasIncidentSignal: false,
      },
    },
    runtimeHealthSignals: {
      status: "healthy",
      dependencies: [
        {
          name: "hosting-provider",
          status: "degraded",
          readiness: "ready",
          critical: true,
        },
      ],
    },
  });

  assert.equal(circuitBreakerDecision.circuitState, "half-open");
  assert.equal(circuitBreakerDecision.decision, "allow-retry");
  assert.equal(circuitBreakerDecision.summary.allowsRetry, true);
  assert.equal(circuitBreakerDecision.summary.failFast, false);
  assert.equal(circuitBreakerDecision.retryAfterMs >= 15000, true);
});

test("provider circuit breaker resolver keeps the circuit closed for healthy providers", () => {
  const { circuitBreakerDecision } = createProviderCircuitBreakerResolver({
    providerDegradationState: {
      providerType: "hosting",
      health: "healthy",
      consecutiveFailures: 0,
      cooldownWindowMs: 0,
      summary: {
        hasIncidentSignal: false,
      },
    },
    runtimeHealthSignals: {
      status: "healthy",
      isHealthy: true,
      dependencies: [
        {
          name: "database",
          status: "healthy",
          readiness: "ready",
          critical: true,
        },
      ],
    },
  });

  assert.equal(circuitBreakerDecision.circuitState, "closed");
  assert.equal(circuitBreakerDecision.decision, "allow");
  assert.equal(circuitBreakerDecision.summary.shouldTrip, false);
  assert.equal(Array.isArray(circuitBreakerDecision.dependencySignals), true);
});

test("provider circuit breaker resolver normalizes malformed provider identifiers and dependency signals", () => {
  const { circuitBreakerDecision } = createProviderCircuitBreakerResolver({
    providerDegradationState: {
      providerType: " hosting ",
      health: " degraded ",
      consecutiveFailures: 2,
      cooldownWindowMs: 45000,
      summary: {
        hasIncidentSignal: false,
      },
    },
    runtimeHealthSignals: {
      status: " degraded ",
      dependencies: [
        {
          name: " hosting-provider ",
          status: " degraded ",
          readiness: " ready ",
          critical: true,
        },
      ],
    },
  });

  assert.equal(circuitBreakerDecision.circuitBreakerDecisionId, "provider-circuit-breaker:hosting");
  assert.equal(circuitBreakerDecision.providerType, "hosting");
  assert.equal(circuitBreakerDecision.circuitState, "half-open");
  assert.equal(circuitBreakerDecision.dependencySignals[0].name, "hosting-provider");
  assert.equal(circuitBreakerDecision.dependencySignals[0].status, "degraded");
  assert.equal(circuitBreakerDecision.dependencySignals[0].readiness, "ready");
});
