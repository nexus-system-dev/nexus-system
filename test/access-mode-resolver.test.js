import test from "node:test";
import assert from "node:assert/strict";

import { createAccessModeResolver } from "../src/core/access-mode-resolver.js";

test("access mode resolver prefers request-access when an access request exists", () => {
  const { accessModeDecision } = createAccessModeResolver({
    productDeliveryModel: {
      productDeliveryModelId: "product-delivery-model:nexus",
      status: "ready",
      defaultAccessMode: "request-access",
      launchStage: "mvp",
    },
    launchStage: "mvp",
    visitorContext: {
      channelIntent: "evaluation",
    },
    accessRequest: {
      status: "submitted",
    },
  });

  assert.equal(accessModeDecision.status, "ready");
  assert.equal(accessModeDecision.mode, "request-access");
  assert.equal(accessModeDecision.preferredRoute, "request-access");
});
