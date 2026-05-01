import { test } from "node:test";
import assert from "node:assert/strict";
import { createBudgetConstraintEngine } from "../src/core/budget-constraint-engine.js";

test("createBudgetConstraintEngine returns valid engine for empty input", () => {
  const engine = createBudgetConstraintEngine({});
  assert.ok(typeof engine.constraintSource === "string");
  assert.equal(engine.fallbackApplied, true);
  assert.equal(typeof engine.classifyThreshold, "function");
});

test("createBudgetConstraintEngine uses pricing+policy when pricingMetadata has unitPrice", () => {
  const engine = createBudgetConstraintEngine({
    pricingMetadata: { unitPrice: 0.02, currency: "USD" },
  });
  assert.equal(engine.constraintSource, "pricing+policy");
  assert.equal(engine.fallbackApplied, false);
});

test("createBudgetConstraintEngine detects workspace signals", () => {
  const engine = createBudgetConstraintEngine({
    workspaceModel: { workspaceId: "ws-1", serviceTier: "pro" },
  });
  assert.equal(engine.workspaceSignalsPresent, true);
});

test("createBudgetConstraintEngine classifyThreshold soft limit triggers on requires-escalation", () => {
  const engine = createBudgetConstraintEngine({ overrunStatus: "requires-escalation" });
  const result = engine.classifyThreshold("requires-escalation");
  assert.equal(result.softLimitTriggered, true);
  assert.equal(result.hardLimitTriggered, false);
});

test("createBudgetConstraintEngine classifyThreshold hard limit triggers on blocked", () => {
  const engine = createBudgetConstraintEngine({ overrunStatus: "blocked" });
  const result = engine.classifyThreshold("blocked");
  assert.equal(result.hardLimitTriggered, true);
  assert.equal(result.softLimitTriggered, false);
});

test("createBudgetConstraintEngine falls back to policy-only when no pricing metadata", () => {
  const engine = createBudgetConstraintEngine({ pricingMetadata: {} });
  assert.equal(engine.constraintSource, "policy-only");
  assert.equal(engine.fallbackApplied, true);
});
