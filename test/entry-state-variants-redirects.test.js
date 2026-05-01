import test from "node:test";
import assert from "node:assert/strict";

import { createEntryStateVariantsAndRedirects } from "../src/core/entry-state-variants-redirects.js";

test("entry state variants prefer new user redirect for first project kickoff", () => {
  const { entryStateVariants } = createEntryStateVariantsAndRedirects({
    appEntryDecision: { appEntryDecisionId: "entry-1", status: "ready", decision: "direct-app" },
    postLoginDestination: { status: "ready", destination: "first-project-kickoff" },
    appLandingEntry: { status: "ready", heroTitle: "Request access" },
  });

  assert.equal(entryStateVariants.status, "ready");
  assert.equal(entryStateVariants.defaultVariant, "new-user");
});
