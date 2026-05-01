import test from "node:test";
import assert from "node:assert/strict";

import { createAppLandingEntryExperience } from "../src/core/app-landing-entry-experience.js";

test("app landing entry experience exposes CTA and first visit states", () => {
  const { appLandingEntry } = createAppLandingEntryExperience({
    siteAppBoundary: { siteAppBoundaryId: "boundary-1", status: "ready", trustBoundary: "marketing-site-to-authenticated-app" },
    accessModeDecision: { status: "ready", mode: "waitlist" },
    productCtaStrategy: {
      status: "ready",
      primaryCta: { label: "Request access" },
      secondaryCtas: [{ label: "See demo" }],
    },
  });

  assert.equal(appLandingEntry.status, "ready");
  assert.equal(appLandingEntry.heroTitle, "Request access");
  assert.equal(appLandingEntry.firstVisitStates[0].mode, "waitlist");
});
