import test from "node:test";
import assert from "node:assert/strict";
import { createConversionAnalyticsModel } from "../src/core/conversion-analytics-model.js";

test("conversion analytics model computes total pre-auth events", () => {
  const { conversionAnalytics } = createConversionAnalyticsModel({
    preAuthConversionEvents: { preAuthConversionEventsId: "pre-1", status: "ready", events: [{}, {}] },
    websiteActivationFunnel: { status: "ready" },
  });
  assert.equal(conversionAnalytics.status, "ready");
  assert.equal(conversionAnalytics.totalPreAuthEvents, 2);
});
