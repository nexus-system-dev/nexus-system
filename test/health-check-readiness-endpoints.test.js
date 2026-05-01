import test from "node:test";
import assert from "node:assert/strict";

import { createHealthCheckAndReadinessEndpoints } from "../src/core/health-check-readiness-endpoints.js";

test("health and readiness endpoints return healthy and ready runtime status", () => {
  const { healthStatus, readinessStatus } = createHealthCheckAndReadinessEndpoints({
    runtimeHealthSignals: {
      runtimeId: "runtime-1",
      checkedAt: "2025-01-01T00:00:00.000Z",
      startupSteps: [
        { step: "load-env", status: "completed" },
        { step: "create-api-runtime", status: "completed" },
      ],
      dependencies: [
        { name: "project-service", status: "healthy", readiness: "ready", critical: true },
        { name: "api-runtime", status: "healthy", readiness: "ready", critical: true },
      ],
    },
  });

  assert.equal(healthStatus.runtimeId, "runtime-1");
  assert.equal(healthStatus.status, "healthy");
  assert.equal(healthStatus.isHealthy, true);
  assert.equal(healthStatus.summary.totalDependencies, 2);
  assert.equal(readinessStatus.runtimeId, "runtime-1");
  assert.equal(readinessStatus.status, "ready");
  assert.equal(readinessStatus.isReady, true);
  assert.deepEqual(readinessStatus.blockers, []);
});

test("health and readiness endpoints surface degraded dependencies and blockers", () => {
  const { healthStatus, readinessStatus } = createHealthCheckAndReadinessEndpoints({
    runtimeHealthSignals: {
      startupSteps: [
        { step: "load-env", status: "completed" },
        { step: "create-api-runtime", status: "pending" },
      ],
      dependencies: [
        { name: "project-service", status: "healthy", readiness: "ready", critical: true },
        { name: "api-runtime", status: "down", readiness: "not-ready", critical: true },
      ],
    },
  });

  assert.equal(healthStatus.status, "degraded");
  assert.equal(healthStatus.isHealthy, false);
  assert.equal(readinessStatus.status, "not-ready");
  assert.equal(readinessStatus.isReady, false);
  assert.equal(readinessStatus.blockers.includes("startup:create-api-runtime"), true);
  assert.equal(readinessStatus.blockers.includes("dependency:api-runtime"), true);
});

test("health and readiness endpoints normalize malformed dependency strings", () => {
  const { healthStatus, readinessStatus } = createHealthCheckAndReadinessEndpoints({
    runtimeHealthSignals: {
      runtimeId: " runtime-1 ",
      checkedAt: " 2026-04-20T12:00:00.000Z ",
      startupSteps: [
        { step: "create-api-runtime", status: "pending" },
      ],
      dependencies: [
        {
          dependencyId: "  ",
          name: " api-runtime ",
          status: " DOWN ",
          readiness: " NOT-READY ",
          critical: true,
          details: [" timeout ", "   "],
        },
      ],
    },
  });

  assert.equal(healthStatus.runtimeId, "runtime-1");
  assert.equal(healthStatus.checkedAt, "2026-04-20T12:00:00.000Z");
  assert.equal(healthStatus.dependencyStatus[0].dependencyId, "api-runtime");
  assert.equal(healthStatus.dependencyStatus[0].name, "api-runtime");
  assert.equal(healthStatus.dependencyStatus[0].status, "down");
  assert.equal(healthStatus.dependencyStatus[0].readiness, "not-ready");
  assert.deepEqual(healthStatus.dependencyStatus[0].details, ["timeout"]);
  assert.equal(readinessStatus.blockers.includes("dependency:api-runtime"), true);
});
