import test from "node:test";
import assert from "node:assert/strict";
import { createPreAuthConversionEventCollector } from "../src/core/pre-auth-conversion-event-collector.js";

test("pre-auth conversion event collector emits landing and auth handoff events", () => {
  const { preAuthConversionEvents } = createPreAuthConversionEventCollector({
    firstTouchAttribution: { firstTouchAttributionId: "touch-1", status: "ready", source: "community" },
    landingAuthHandoff: { status: "ready", destinationRoute: "/signup" },
  });
  assert.equal(preAuthConversionEvents.status, "ready");
  assert.equal(preAuthConversionEvents.events.length, 2);
});
