import test from "node:test";
import assert from "node:assert/strict";

import { defineProductDeliveryModelSchema } from "../src/core/product-delivery-model-schema.js";

test("product delivery model schema derives a ready web-first delivery model", () => {
  const { productDeliveryModel } = defineProductDeliveryModelSchema({
    businessContext: {
      gtmStage: "beta",
    },
    distributionConstraints: ["governed-rollout", "approval-required"],
    nexusWebsiteSchema: {
      websiteSchemaId: "website-schema:nexus",
    },
  });

  assert.equal(productDeliveryModel.status, "ready");
  assert.equal(productDeliveryModel.deliverySurface, "web-first");
  assert.equal(productDeliveryModel.launchStage, "beta");
  assert.equal(productDeliveryModel.defaultAccessMode, "waitlist");
  assert.deepEqual(productDeliveryModel.supportedClients, [
    "web-app",
    "future-cli",
    "future-desktop-wrapper",
  ]);
});
