import test from "node:test";
import assert from "node:assert/strict";

import { createWebsiteConversionFlow } from "../src/core/website-conversion-flow.js";

test("website conversion flow routes unauthenticated request-access traffic into signup", () => {
  const { websiteConversionFlow } = createWebsiteConversionFlow({
    productCtaStrategy: {
      productCtaStrategyId: "product-cta-strategy:operators",
      status: "ready",
      primaryCta: { ctaId: "cta:request-access", label: "Request access" },
    },
    authenticationState: {
      status: "anonymous",
      isAuthenticated: false,
    },
  });

  assert.equal(websiteConversionFlow.status, "ready");
  assert.equal(websiteConversionFlow.entryRoute, "signup");
  assert.equal(websiteConversionFlow.steps.includes("access-capture"), true);
});
