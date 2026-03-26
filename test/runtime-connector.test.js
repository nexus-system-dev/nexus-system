import test from "node:test";
import assert from "node:assert/strict";

import { RuntimeSourcesConnector } from "../src/core/runtime-connector.js";
import { RuntimeSourceAdapter } from "../src/core/runtime-source-adapter.js";

test("runtime connector fetches runtime sources snapshot", async () => {
  const responses = {
    "http://runtime.local/ci": { ok: true, json: async () => [{ provider: "github-actions", status: "failed" }] },
    "http://runtime.local/test-results": { ok: true, json: async () => [{ suite: "unit", status: "failed" }] },
    "http://runtime.local/deployments": { ok: true, json: async () => [{ environment: "staging", status: "degraded" }] },
    "http://runtime.local/error-logs": { ok: true, json: async () => [{ service: "api", count: 5 }] },
    "http://runtime.local/monitoring": { ok: true, json: async () => [{ service: "api", status: "alert" }] },
    "http://runtime.local/analytics": { ok: true, json: async () => ({ activeUsers: 120 }) },
    "http://runtime.local/product-metrics": { ok: true, json: async () => ({ activationRate: 0.34 }) },
  };

  const connector = new RuntimeSourcesConnector({
    fetchImpl: async (url) => responses[url],
  });

  const snapshot = await connector.fetchSnapshot({
    baseUrl: "http://runtime.local",
  });

  assert.equal(snapshot.ci[0].status, "failed");
  assert.equal(snapshot.deployments[0].environment, "staging");
  assert.equal(snapshot.analytics.activeUsers, 120);
});

test("runtime adapter normalizes runtime snapshot into state patch", () => {
  const adapter = new RuntimeSourceAdapter();
  const normalized = adapter.normalize({
    snapshot: {
      syncedAt: "2026-01-01T00:00:00.000Z",
      ci: [{ provider: "github-actions", status: "failed", branch: "main" }],
      testResults: [{ suite: "unit", status: "failed" }],
      deployments: [{ environment: "staging", status: "degraded" }],
      errorLogs: [{ service: "api", count: 5 }],
      monitoring: [{ service: "api", status: "alert" }],
      analytics: { activeUsers: 120 },
      productMetrics: { activationRate: 0.34 },
    },
  });

  assert.equal(normalized.runtimeSnapshot.ci[0].status, "failed");
  assert.equal(normalized.statePatch.runtime.errorCount, 5);
  assert.equal(normalized.knownGaps.includes("CI נכשל או לא ירוק"), true);
  assert.equal(normalized.knownGaps.includes("יש שגיאות runtime פעילות"), true);
});
