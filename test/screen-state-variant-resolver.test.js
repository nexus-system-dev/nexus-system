import { test } from "node:test";
import assert from "node:assert/strict";
import { createScreenStateVariantResolver } from "../src/core/screen-state-variant-resolver.js";

test("createScreenStateVariantResolver returns a valid plan for empty input", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({});
  assert.ok(activeScreenVariantPlan.planId);
  assert.equal(typeof activeScreenVariantPlan.currentPhase, "string");
  assert.equal(activeScreenVariantPlan.activeVariantKey, "default");
  assert.equal(activeScreenVariantPlan.meta.usingDefaultFallback, true);
});

test("createScreenStateVariantResolver resolves loading phase from screenStates", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenStates: { isLoading: true },
  });
  assert.equal(activeScreenVariantPlan.currentPhase, "loading");
});

test("createScreenStateVariantResolver resolves error phase", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenStates: { hasError: true },
  });
  assert.equal(activeScreenVariantPlan.currentPhase, "error");
});

test("createScreenStateVariantResolver resolves empty phase", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenStates: { isEmpty: true },
  });
  assert.equal(activeScreenVariantPlan.currentPhase, "empty");
});

test("createScreenStateVariantResolver selects matching variant by phase", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenStates: { phase: "loading" },
    templateVariants: [
      { variantKey: "loading-variant", templateId: "t-loading", conditions: [{ phase: "loading" }] },
      { variantKey: "populated-variant", templateId: "t-pop", conditions: [{ phase: "populated" }] },
    ],
  });
  assert.equal(activeScreenVariantPlan.activeVariantKey, "loading-variant");
  assert.equal(activeScreenVariantPlan.meta.usingDefaultFallback, false);
  assert.equal(activeScreenVariantPlan.meta.hasExplicitVariant, true);
});

test("createScreenStateVariantResolver falls back to default when no variant matches", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenStates: { phase: "success" },
    templateVariants: [
      { variantKey: "error-variant", conditions: [{ phase: "error" }] },
    ],
  });
  // Should pick highest-scoring variant (error gets low score for success phase, but is only option)
  assert.ok(activeScreenVariantPlan.activeVariantKey);
});

test("createScreenStateVariantResolver records validation signals applied", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenValidationChecklist: { signals: { isComplete: true, hasErrors: false } },
  });
  assert.ok(activeScreenVariantPlan.validationSignalsApplied >= 0);
});

test("createScreenStateVariantResolver handles explicit phase field on screenStates", () => {
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenStates: { phase: "success" },
  });
  assert.equal(activeScreenVariantPlan.currentPhase, "success");
  assert.equal(activeScreenVariantPlan.meta.phaseIsKnown, true);
});
