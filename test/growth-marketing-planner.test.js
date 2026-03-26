import test from "node:test";
import assert from "node:assert/strict";

import { buildGrowthMarketingPlanner } from "../src/core/growth-marketing-planner.js";

test("growth marketing planner creates onboarding acquisition retention and KPI tasks", () => {
  const tasks = buildGrowthMarketingPlanner({
    businessGoal: "Grow paid users",
    businessContext: {
      funnel: {
        acquisition: "needs-definition",
        activation: "baseline-defined",
        retention: "needs-definition",
      },
      kpis: ["activation-rate", "retention-rate"],
      gtmStage: "build",
    },
    businessBottleneck: {
      id: "business:approval-pending",
    },
    decisionIntelligence: {
      approvalRequired: [{ reason: "Confirm production domain" }],
    },
  });

  assert.equal(tasks.some((task) => task.id === "growth-acquisition-funnel"), true);
  assert.equal(tasks.some((task) => task.id === "growth-onboarding-flow"), true);
  assert.equal(tasks.some((task) => task.id === "growth-retention-loop"), true);
  assert.equal(tasks.some((task) => task.id === "growth-kpi-instrumentation"), true);
  assert.equal(tasks.some((task) => task.id === "growth-business-approvals"), true);
});
