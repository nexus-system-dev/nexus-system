import test from "node:test";
import assert from "node:assert/strict";

import { createEntryDecisionSupportFlow } from "../src/core/entry-decision-support-flow.js";

test("entry decision support flow recommends demo for demo intent visitors", () => {
  const { entryDecisionSupport } = createEntryDecisionSupportFlow({
    entryStateVariants: { entryStateVariantsId: "variants-1", status: "ready", variants: [{ kind: "new-user" }, { kind: "returning-user" }] },
    accessModeDecision: { status: "ready", mode: "open-access" },
    entryOrientationPanel: { status: "ready", headline: "Why trust Nexus" },
    visitorContext: { channelIntent: "demo-request" },
  });

  assert.equal(entryDecisionSupport.status, "ready");
  assert.equal(entryDecisionSupport.recommendedPath, "demo");
});
