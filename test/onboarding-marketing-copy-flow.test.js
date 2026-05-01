import test from "node:test";
import assert from "node:assert/strict";
import { createOnboardingMarketingCopyFlow } from "../src/core/onboarding-marketing-copy-flow.js";

test("onboarding marketing copy flow builds ready touchpoints", () => {
  const { onboardingMarketingFlow } = createOnboardingMarketingCopyFlow({
    activationFunnel: { activationFunnelId: "funnel-1", status: "ready" },
    messagingFramework: { status: "ready", headline: "Run governed execution", subheadline: "Keep momentum", valueProps: [{ label: "Ship the first outcome" }] },
  });
  assert.equal(onboardingMarketingFlow.status, "ready");
  assert.equal(onboardingMarketingFlow.touchpoints.length, 3);
});
