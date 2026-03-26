import test from "node:test";
import assert from "node:assert/strict";

import { SourceAdapterRegistry } from "../src/core/source-adapter.js";
import { CasinoSourceAdapter } from "../src/core/casino-source-adapter.js";
import { RuntimeSourceAdapter } from "../src/core/runtime-source-adapter.js";

test("source adapter registry resolves the casino adapter by source type", () => {
  const registry = new SourceAdapterRegistry([new CasinoSourceAdapter()]);
  const adapter = registry.resolve({ type: "casino-api" });

  assert.equal(adapter instanceof CasinoSourceAdapter, true);
});

test("source adapter registry resolves the runtime adapter by source type", () => {
  const registry = new SourceAdapterRegistry([new CasinoSourceAdapter(), new RuntimeSourceAdapter()]);
  const adapter = registry.resolve({ type: "runtime-sources" });

  assert.equal(adapter instanceof RuntimeSourceAdapter, true);
});

test("casino adapter normalizes diagnostics into nexus internal shape", () => {
  const adapter = new CasinoSourceAdapter();
  const normalized = adapter.normalize({
    source: { type: "casino-api" },
    existingGoal: "Existing goal",
    snapshot: {
      health: {
        projectName: "Royal Casino",
        status: "degraded",
        blockingIssues: ["db unknown"],
      },
      features: {
        hasAuth: true,
        hasPayments: false,
        hasAnalytics: false,
      },
      flows: {
        registration: {
          status: "partial",
          notes: "frontend missing",
        },
      },
      technical: {
        stack: {
          backend: "Node.js + Express + TypeScript",
          frontend: "Expo React Native",
          database: "PostgreSQL (planned)",
        },
        knownTechnicalGaps: ["no migrations"],
      },
      roadmapContext: {
        mainGoal: "Complete Auth System",
        knownMissingParts: ["Wallet"],
        criticalDependencies: ["Database Schema"],
      },
    },
  });

  assert.equal(normalized.name, "Royal Casino");
  assert.equal(normalized.state.product.hasAuth, true);
  assert.equal(normalized.state.product.hasPaymentIntegration, false);
  assert.equal(normalized.approvals[0], "נדרש אישור או פתרון עבור: Database Schema");
  assert.equal(normalized.externalSnapshot.blockedFlows.length, 1);
  assert.equal(normalized.externalSnapshot.confidence, 0.9);
});
