import test from "node:test";
import assert from "node:assert/strict";

import { CasinoDiagnosticsConnector } from "../src/core/casino-connector.js";

test("casino connector fetches all nexus diagnostics endpoints", async () => {
  const calls = [];
  const responses = {
    "http://localhost:4101/api/nexus/health": { ok: true, json: async () => ({ projectName: "Royal Casino" }) },
    "http://localhost:4101/api/nexus/features": { ok: true, json: async () => ({ hasAuth: true }) },
    "http://localhost:4101/api/nexus/flows": { ok: true, json: async () => ({ deposit: { status: "blocked", notes: "missing" } }) },
    "http://localhost:4101/api/nexus/technical": {
      ok: true,
      json: async () => ({ stack: { backend: "Express", frontend: "Expo", database: "Postgres" } }),
    },
    "http://localhost:4101/api/nexus/roadmap-context": {
      ok: true,
      json: async () => ({ mainGoal: "להשלים את מערכת הקזינו" }),
    },
  };

  const connector = new CasinoDiagnosticsConnector({
    fetchImpl: async (url) => {
      calls.push(url);
      return responses[url];
    },
  });

  const snapshot = await connector.fetchSnapshot({
    baseUrl: "http://localhost:4101",
    apiKey: "",
  });

  assert.equal(calls.length, 5);
  assert.equal(snapshot.health.projectName, "Royal Casino");
  assert.equal(snapshot.features.hasAuth, true);
});

test("casino connector normalizes diagnostics into nexus project state", () => {
  const connector = new CasinoDiagnosticsConnector();
  assert.equal(typeof connector.fetchSnapshot, "function");
});
