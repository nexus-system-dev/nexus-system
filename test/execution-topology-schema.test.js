import test from "node:test";
import assert from "node:assert/strict";

import { defineExecutionTopologySchema } from "../src/core/execution-topology-schema.js";

test("execution topology schema returns canonical cloud local branch and remote entries", () => {
  const { executionTopology } = defineExecutionTopologySchema({
    executionSurfaces: [
      {
        dispatchMode: "temp-branch",
        resolvedSurface: {
          surfaceId: "temp-branch",
          surfaceType: "execution-surface",
          readiness: "partial",
          supports: ["branch-run", "command-execution"],
        },
      },
      {
        dispatchMode: "sandbox",
        resolvedSurface: {
          surfaceId: "sandbox",
          surfaceType: "execution-surface",
          readiness: "ready",
          supports: ["isolated-run"],
        },
      },
    ],
    environmentConfig: {
      projectId: "giftwallet",
      executionModes: ["agent", "local-terminal", "temp-branch", "xcode"],
      defaultMode: "temp-branch",
      provider: "vercel",
      target: "production",
      runtimeSource: "http://runtime.local",
    },
  });

  assert.equal(executionTopology.topologyId, "execution-topology:giftwallet");
  assert.equal(executionTopology.defaultMode, "temp-branch");
  assert.equal(executionTopology.topologies.length, 4);
  assert.equal(executionTopology.summary.includesLocal, true);
  assert.equal(executionTopology.summary.includesBranch, true);
  assert.equal(executionTopology.summary.includesRemoteSpecialized, true);
});

test("execution topology schema falls back to canonical empty state", () => {
  const { executionTopology } = defineExecutionTopologySchema();

  assert.equal(executionTopology.topologyId, "execution-topology:unknown-project");
  assert.equal(Array.isArray(executionTopology.topologies), true);
  assert.equal(executionTopology.summary.totalTopologies, 0);
});
