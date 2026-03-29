import test from "node:test";
import assert from "node:assert/strict";

import { createSystemBottleneckDetector } from "../src/core/system-bottleneck-detector.js";

test("system bottleneck detector flags queue lag runtime pressure and provider failures", () => {
  const { systemBottleneckSummary } = createSystemBottleneckDetector({
    platformTrace: {
      traceId: "trace-1",
      steps: [
        { source: "github-connector", status: "failed", message: "GitHub connector timeout" },
        { source: "runtime-worker", status: "failed", message: "Execution lane blocked" },
      ],
      logs: [
        { message: "queue stall detected on nexus-background" },
      ],
    },
    healthStatus: {
      status: "degraded",
      isReady: false,
      dependencyStatus: [
        { name: "api-runtime", status: "down" },
        { name: "background-worker", status: "degraded" },
      ],
      blockers: ["dependency:background-worker"],
      incidentAlert: {
        affectedComponents: ["github-connector"],
      },
    },
    queueObservability: {
      queueName: "nexus-background",
      lagSeconds: 180,
      retryPressure: 4,
      deadLetterCount: 1,
      queueDepth: 18,
    },
  });

  assert.equal(systemBottleneckSummary.status, "blocked");
  assert.equal(systemBottleneckSummary.severity, "critical");
  assert.equal(systemBottleneckSummary.bottleneckType, "queue-lag");
  assert.equal(systemBottleneckSummary.queueObservability.queueLagSeconds, 180);
  assert.equal(systemBottleneckSummary.runtimePressure.degradedDependencies.includes("api-runtime"), true);
  assert.equal(systemBottleneckSummary.providerFailures.affectedProviders.includes("github-connector"), true);
  assert.equal(systemBottleneckSummary.signals.length >= 4, true);
});

test("system bottleneck detector stays clear without pressure signals", () => {
  const { systemBottleneckSummary } = createSystemBottleneckDetector({
    platformTrace: {
      traceId: "trace-2",
      steps: [{ source: "runtime", status: "completed", message: "ok" }],
      logs: [{ message: "all good" }],
    },
    healthStatus: {
      status: "healthy",
      isReady: true,
      dependencyStatus: [{ name: "api-runtime", status: "healthy" }],
    },
    queueObservability: {
      queueName: "nexus-background",
      lagSeconds: 0,
      retryPressure: 0,
      queueDepth: 0,
    },
  });

  assert.equal(systemBottleneckSummary.status, "clear");
  assert.equal(systemBottleneckSummary.bottleneckType, "none");
  assert.equal(systemBottleneckSummary.signals.length, 0);
});
