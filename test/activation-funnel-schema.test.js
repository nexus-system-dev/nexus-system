import test from "node:test";
import assert from "node:assert/strict";
import { defineActivationFunnelSchema } from "../src/core/activation-funnel-schema.js";

test("activation funnel schema creates a ready funnel from website conversion and onboarding flow", () => {
  const { activationFunnel } = defineActivationFunnelSchema({
    websiteConversionFlow: { websiteConversionFlowId: "flow-1", status: "ready", entryRoute: "signup" },
    onboardingFlow: { status: "ready", activeScreen: "capture-vision" },
  });
  assert.equal(activationFunnel.status, "ready");
  assert.equal(activationFunnel.stages.length, 4);
  assert.equal(activationFunnel.currentStage, "onboarding");
});
