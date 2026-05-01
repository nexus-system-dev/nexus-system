import test from "node:test";
import assert from "node:assert/strict";

import { createPublicSiteAndAppBoundaryModel } from "../src/core/public-site-app-boundary-model.js";

test("public site and app boundary model exposes ready routes and handoff points", () => {
  const { siteAppBoundary } = createPublicSiteAndAppBoundaryModel({
    productDeliveryModel: {
      productDeliveryModelId: "product-delivery-model:nexus",
      status: "ready",
    },
    nexusWebsiteSchema: {
      status: "ready",
      pages: [{ pageId: "page:home" }, { pageId: "page:pricing" }],
    },
  });

  assert.equal(siteAppBoundary.status, "ready");
  assert.deepEqual(siteAppBoundary.publicRoutes, ["page:home", "page:pricing"]);
  assert.deepEqual(siteAppBoundary.appRoutes, ["/login", "/signup", "/app", "/onboarding"]);
});
