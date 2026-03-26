import test from "node:test";
import assert from "node:assert/strict";

import { resolveBusinessBottleneck } from "../src/core/business-bottleneck-resolver.js";

test("business bottleneck resolver identifies the main business blocker", () => {
  const businessBottleneck = resolveBusinessBottleneck({
    businessContext: {
      funnel: {
        acquisition: "needs-definition",
        conversion: "blocked",
      },
      constraints: ["defaults-need-confirmation"],
    },
    decisionIntelligence: {
      approvalRequired: [{ reason: "Confirm production domain" }],
      uncertain: [{ reason: "Acquisition funnel still needs definition" }],
    },
    recommendedDefaults: {
      provisional: true,
    },
  });

  assert.equal(businessBottleneck.id, "business:acquisition-funnel");
  assert.equal(businessBottleneck.severity, "high");
  assert.equal(businessBottleneck.source, "business-context");
});
