import test from "node:test";
import assert from "node:assert/strict";

import { createApiRoutingAndMiddlewareLayer } from "../src/core/api-routing-middleware-layer.js";

test("api routing and middleware layer returns canonical api runtime", () => {
  const { apiRuntime } = createApiRoutingAndMiddlewareLayer({
    applicationRuntime: {
      runtimeId: "application-runtime-1",
    },
  });

  assert.equal(apiRuntime.status, "ready");
  assert.equal(apiRuntime.runtimeId, "application-runtime-1");
  assert.equal(apiRuntime.basePath, "/api");
  assert.equal(apiRuntime.totalRoutes >= 10, true);
  assert.equal(Array.isArray(apiRuntime.routeDefinitions), true);
  assert.equal(Array.isArray(apiRuntime.middlewareStack), true);
  assert.equal(typeof apiRuntime.routeIndex["POST:/api/auth/signup"], "string");
});

test("api routing and middleware layer respects explicit route definitions", () => {
  const { apiRuntime } = createApiRoutingAndMiddlewareLayer({
    applicationRuntime: {
      runtimeId: "application-runtime-2",
    },
    routeDefinitions: [
      {
        method: "GET",
        path: "/api/health",
        handler: "healthCheck",
        middlewares: ["request-context"],
      },
    ],
  });

  assert.equal(apiRuntime.totalRoutes, 1);
  assert.equal(apiRuntime.routeDefinitions[0].path, "/api/health");
  assert.equal(apiRuntime.routeIndex["GET:/api/health"], "healthCheck");
});
