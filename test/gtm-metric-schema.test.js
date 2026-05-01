import test from "node:test";
import assert from "node:assert/strict";
import { defineGtmMetricSchema } from "../src/core/gtm-metric-schema.js";
test("gtm metric schema exposes canonical launch metrics", () => {
  const { gtmMetricSchema } = defineGtmMetricSchema({ launchCampaignBrief: { launchCampaignBriefId: "brief-1", status: "ready" }, websiteConversionFlow: { status: "ready", entryRoute: "signup" } });
  assert.equal(gtmMetricSchema.status, "ready");
  assert.equal(gtmMetricSchema.metrics.includes("campaign-attribution"), true);
});
