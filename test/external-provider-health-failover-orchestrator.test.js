import test from "node:test";
import assert from "node:assert/strict";

import { createExternalProviderHealthFailoverOrchestrator } from "../src/core/external-provider-health-failover-orchestrator.js";

test("external provider health and failover orchestrator promotes failover when provider outage and failover support are both real", () => {
  const { externalProviderHealthAndFailover } = createExternalProviderHealthFailoverOrchestrator({
    externalCapabilityRegistry: {
      summary: {
        providerCount: 2,
      },
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: true,
      },
    },
    providerDegradationState: {
      providerType: "hosting",
      health: "outage",
    },
    circuitBreakerDecision: {
      circuitState: "open",
      decision: "fail-fast",
    },
    providerRecoveryProbe: {
      status: "scheduled",
      reopenDecision: "hold-closed",
      workerJob: {
        nextRunInMs: 300000,
      },
    },
    continuityPlan: {
      failover: {
        enabled: true,
        target: "standby-runtime",
        route: ["freeze-provider-route", "promote-standby", "validate-provider-health"],
      },
      summary: {
        canFailover: true,
      },
    },
  });

  assert.equal(externalProviderHealthAndFailover.lifecycleState, "failover");
  assert.equal(externalProviderHealthAndFailover.integrationStatus, "connected");
  assert.equal(externalProviderHealthAndFailover.failover.requested, true);
  assert.equal(externalProviderHealthAndFailover.providerRoute.activeTarget, "standby-runtime");
  assert.equal(externalProviderHealthAndFailover.summary.canFailover, true);
  assert.equal(externalProviderHealthAndFailover.summary.requiresFallbackRoute, true);
});

test("external provider health and failover orchestrator stays degraded when provider can recover in place", () => {
  const { externalProviderHealthAndFailover } = createExternalProviderHealthFailoverOrchestrator({
    externalCapabilityRegistry: {
      summary: {
        providerCount: 1,
      },
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: true,
      },
    },
    providerDegradationState: {
      providerType: "hosting",
      health: "degraded",
    },
    circuitBreakerDecision: {
      circuitState: "half-open",
      decision: "allow-retry",
    },
    providerRecoveryProbe: {
      status: "active",
      reopenDecision: "controlled-reopen",
      workerJob: {
        nextRunInMs: 15000,
      },
    },
    continuityPlan: {
      failover: {
        enabled: false,
      },
      summary: {
        canFailover: false,
      },
    },
  });

  assert.equal(externalProviderHealthAndFailover.lifecycleState, "degraded");
  assert.equal(externalProviderHealthAndFailover.failover.requested, false);
  assert.equal(externalProviderHealthAndFailover.recovery.reopenDecision, "controlled-reopen");
  assert.equal(externalProviderHealthAndFailover.summary.canRecoverInPlace, true);
  assert.equal(externalProviderHealthAndFailover.providerRoute.activeTarget, "hosting-primary");
});

test("external provider health and failover orchestrator blocks failover when connector binding is not runtime-safe", () => {
  const { externalProviderHealthAndFailover } = createExternalProviderHealthFailoverOrchestrator({
    externalCapabilityRegistry: {
      summary: {
        providerCount: 2,
      },
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: false,
      },
    },
    providerDegradationState: {
      providerType: "hosting",
      health: "outage",
    },
    circuitBreakerDecision: {
      circuitState: "open",
      decision: "fail-fast",
    },
    providerRecoveryProbe: {
      status: "scheduled",
      reopenDecision: "hold-closed",
    },
    continuityPlan: {
      failover: {
        enabled: true,
        target: "standby-runtime",
      },
      summary: {
        canFailover: true,
      },
    },
  });

  assert.equal(externalProviderHealthAndFailover.integrationStatus, "blocked");
  assert.equal(externalProviderHealthAndFailover.summary.canFailover, false);
});
