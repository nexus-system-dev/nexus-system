import test from "node:test";
import assert from "node:assert/strict";

import { createPublicLandingAuthHandoffFlow } from "../src/core/public-landing-auth-handoff-flow.js";

test("public landing auth handoff resolves request-access handoff route", () => {
  const { landingAuthHandoff } = createPublicLandingAuthHandoffFlow({
    siteAppBoundary: {
      siteAppBoundaryId: "site-app-boundary:nexus",
      status: "ready",
      trustBoundary: "marketing-site-to-authenticated-app",
    },
    accessModeDecision: {
      status: "ready",
      mode: "request-access",
    },
    productCtaStrategy: {
      status: "ready",
      primaryCta: {
        ctaId: "cta:request-access",
        label: "Request access",
      },
    },
  });

  assert.equal(landingAuthHandoff.status, "ready");
  assert.equal(landingAuthHandoff.destinationRoute, "/request-access");
  assert.equal(landingAuthHandoff.preserveMarketingContext, true);
});
