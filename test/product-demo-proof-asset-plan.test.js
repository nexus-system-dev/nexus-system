import test from "node:test";
import assert from "node:assert/strict";
import { createProductDemoAndProofAssetPlan } from "../src/core/product-demo-proof-asset-plan.js";

test("product demo and proof asset plan combines website copy and milestones", () => {
  const { productProofPlan } = createProductDemoAndProofAssetPlan({
    websiteCopyPack: { websiteCopyPackId: "copy-1", status: "ready", pageCopy: [{ headline: "Nexus headline" }] },
    activationMilestones: { status: "ready", milestones: [{ milestone: "first-visible-result" }] },
  });
  assert.equal(productProofPlan.status, "ready");
  assert.equal(productProofPlan.assets.length, 2);
});
