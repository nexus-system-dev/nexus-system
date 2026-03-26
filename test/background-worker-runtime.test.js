import test from "node:test";
import assert from "node:assert/strict";

import { createBackgroundWorkerRuntime } from "../src/core/background-worker-runtime.js";

test("background worker runtime returns canonical worker and queued job", () => {
  const { workerRuntime, jobState } = createBackgroundWorkerRuntime({
    jobDefinition: {
      jobType: "polling",
      schedule: "interval",
    },
    runtimeConfig: {
      queueName: "nexus-background",
      concurrency: 2,
    },
  });

  assert.equal(workerRuntime.status, "ready");
  assert.equal(workerRuntime.queueName, "nexus-background");
  assert.equal(jobState.jobType, "polling");
  assert.equal(jobState.status, "queued");
});

test("background worker runtime returns idle job when disabled", () => {
  const { workerRuntime, jobState } = createBackgroundWorkerRuntime({
    jobDefinition: {
      enabled: false,
    },
  });

  assert.equal(workerRuntime.status, "idle");
  assert.equal(jobState.status, "idle");
});
