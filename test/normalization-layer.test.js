import test from "node:test";
import assert from "node:assert/strict";

import { normalizeProjectSources } from "../src/core/normalization-layer.js";

test("normalization layer converts raw sources into one managed shape", () => {
  const normalized = normalizeProjectSources({
    scan: {
      path: "/tmp/project",
      summary: "scan summary",
      stack: {
        frontend: ["React"],
        backend: ["Express"],
        database: ["Postgres"],
      },
      findings: {
        hasAuth: true,
      },
      gaps: ["missing tests"],
      knowledge: {
        summary: "README summary",
        readme: { path: "README.md" },
        docs: [{ path: "docs/arch.md" }],
      },
    },
    externalSnapshot: {
      source: "casino-api",
      confidence: 0.9,
      syncedAt: "2026-01-01T00:00:00.000Z",
      health: { status: "degraded" },
      features: { hasAuth: true },
      flows: { registration: { status: "partial" } },
      technical: { stack: { backend: "Express" } },
      roadmapContext: { criticalDependencies: ["Database Schema"] },
    },
    gitSnapshot: {
      provider: "github",
      repo: { fullName: "openai/nexus" },
      branches: [{ name: "main" }],
      commits: [{ sha: "abc" }],
      pullRequests: [{ id: 1 }],
      diffs: [{ id: "pr-1" }],
    },
    runtimeSnapshot: {
      source: "runtime-sources",
      ci: [{ status: "failed" }],
      deployments: [{ status: "degraded" }],
      errorLogs: [{ count: 2 }],
      monitoring: [{ status: "alert" }],
      analytics: { activeUsers: 100 },
      productMetrics: { activationRate: 0.4 },
    },
  });

  assert.equal(normalized.scan.connected, true);
  assert.equal(normalized.external.source, "casino-api");
  assert.equal(normalized.git.data.repo.fullName, "openai/nexus");
  assert.equal(normalized.runtime.data.ci[0].status, "failed");
  assert.equal(normalized.knowledge.readme.path, "README.md");
});
