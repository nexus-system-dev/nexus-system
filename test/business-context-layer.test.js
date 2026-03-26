import test from "node:test";
import assert from "node:assert/strict";

import { buildBusinessContextLayer } from "../src/core/business-context-layer.js";

test("business context layer derives target audience funnel kpis gtm stage and constraints", () => {
  const businessContext = buildBusinessContextLayer({
    domain: "saas",
    goal: "Reach product teams and grow paid users",
    knowledgeGaps: ["No acquisition funnel", "Missing payment flow"],
    runtimeSnapshot: {
      analytics: {
        activeUsers: 120,
      },
      productMetrics: {
        activationRate: 0.42,
      },
      deployments: [{ status: "healthy" }],
    },
    gitSnapshot: {
      repo: {
        fullName: "openai/nexus",
      },
    },
    stateConstraints: {
      budget: "lean",
      maturity: "growth",
    },
    recommendedDefaults: {
      provisional: true,
      hosting: {
        target: "web-deployment",
      },
      delivery: {
        strategy: "mvp-first",
      },
    },
  });

  assert.equal(businessContext.targetAudience, "Reach product teams and grow paid users");
  assert.equal(typeof businessContext.positioning, "string");
  assert.equal(businessContext.funnel.acquisition, "needs-definition");
  assert.equal(businessContext.funnel.conversion, "blocked");
  assert.equal(businessContext.kpis.includes("active-users"), true);
  assert.equal(businessContext.kpis.includes("activation-rate"), true);
  assert.equal(businessContext.gtmStage, "live");
  assert.equal(businessContext.constraints.includes("budget:lean"), true);
  assert.equal(businessContext.constraints.includes("defaults-need-confirmation"), true);
});
