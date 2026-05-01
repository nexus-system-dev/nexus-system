import test from "node:test";
import assert from "node:assert/strict";
import { createGoToMarketPlanningModel } from "../src/core/go-to-market-planning-model.js";
test("go to market planning model composes campaign channels with funnel stages", () => {
  const { goToMarketPlan } = createGoToMarketPlanningModel({ launchCampaignBrief: { launchCampaignBriefId: "brief-1", status: "ready", channels: ["website"] }, websiteConversionFlow: { status: "ready", entryRoute: "signup" }, activationFunnel: { status: "ready", stages: [{ stageId: "signup" }] } });
  assert.equal(goToMarketPlan.status, "ready");
  assert.equal(goToMarketPlan.channels.length, 1);
});
