import test from "node:test";
import assert from "node:assert/strict";

import { createProductionHealthValidationModule } from "../src/core/production-health-validation-module.js";

test("production health validation module returns ready state when deployment and health checks pass", () => {
  const { productionHealthValidation } = createProductionHealthValidationModule({
    deploymentResultEnvelope: {
      requestId: "deployment-request-web",
      environment: "production",
      summary: {
        isReadyForLaunchVerification: true,
      },
    },
    validationReport: {
      isReady: true,
    },
    liveProjectMonitoring: {
      healthStatus: "stable",
      releaseStatus: "active",
      alerts: [],
    },
    observedHealth: {
      status: "stable",
    },
  });

  assert.equal(productionHealthValidation.status, "ready");
  assert.equal(productionHealthValidation.summary.canConfirmLaunch, true);
  assert.equal(productionHealthValidation.summary.failedChecks, 0);
});

test("production health validation module blocks when validation or runtime health is degraded", () => {
  const { productionHealthValidation } = createProductionHealthValidationModule({
    deploymentResultEnvelope: {
      summary: {
        isReadyForLaunchVerification: false,
      },
    },
    validationReport: {
      isReady: false,
    },
    liveProjectMonitoring: {
      healthStatus: "degraded",
      alerts: ["owner-incident-active"],
    },
    observedHealth: {
      status: "degraded",
    },
  });

  assert.equal(productionHealthValidation.status, "blocked");
  assert.equal(productionHealthValidation.blockedReasons.includes("deployment-result-unready"), true);
  assert.equal(productionHealthValidation.blockedReasons.includes("release-validation-blocked"), true);
  assert.equal(productionHealthValidation.blockedReasons.includes("production-health-degraded"), true);
  assert.equal(productionHealthValidation.blockedReasons.includes("active-production-alerts"), true);
});
