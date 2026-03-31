import test from "node:test";
import assert from "node:assert/strict";

import {
  createInMemoryRateLimitStore,
  createRateLimitingAndAbuseProtection,
} from "../src/core/rate-limiting-abuse-protection.js";

function createRequestContext(overrides = {}) {
  return {
    ipAddress: "127.0.0.1",
    timestamp: 1_000,
    pathName: "/api/projects/giftwallet/live-state",
    method: "GET",
    userId: "user-1",
    ...overrides,
  };
}

test("rate limiting allows open routes without mutating request buckets", () => {
  const store = createInMemoryRateLimitStore();
  const result = createRateLimitingAndAbuseProtection({
    requestContext: createRequestContext({
      pathName: "/api/health",
    }),
    routeDefinition: {
      method: "GET",
      path: "/api/health",
      tier: "open",
      kind: "open-api",
      bucketKey: "/api/health",
    },
    rateLimitStore: store,
  });

  assert.equal(result.rateLimitDecision.allowed, true);
  assert.equal(result.rateLimitDecision.decision, "allowed");
  assert.equal(result.updatedRateLimitStore.requestBuckets.size, 0);
});

test("critical routes are rate limited by IP and keep updated store state", () => {
  const store = createInMemoryRateLimitStore();
  let lastDecision = null;

  for (let index = 0; index < 5; index += 1) {
    const result = createRateLimitingAndAbuseProtection({
      requestContext: createRequestContext({
        ipAddress: "10.0.0.9",
        userId: null,
        pathName: "/api/auth/login",
        method: "POST",
        timestamp: 10_000 + index,
      }),
      routeDefinition: {
        method: "POST",
        path: "/api/auth/login",
        tier: "critical",
        kind: "auth",
        bucketKey: "/api/auth/*",
      },
      rateLimitStore: store,
    });

    lastDecision = result.rateLimitDecision;
    assert.equal(lastDecision.allowed, true);
  }

  const blocked = createRateLimitingAndAbuseProtection({
    requestContext: createRequestContext({
      ipAddress: "10.0.0.9",
      userId: null,
      pathName: "/api/auth/login",
      method: "POST",
      timestamp: 10_100,
    }),
    routeDefinition: {
      method: "POST",
      path: "/api/auth/login",
      tier: "critical",
      kind: "auth",
      bucketKey: "/api/auth/*",
    },
    rateLimitStore: store,
  });

  assert.equal(blocked.rateLimitDecision.allowed, false);
  assert.equal(blocked.rateLimitDecision.decision, "rate-limited");
  assert.equal(blocked.rateLimitDecision.retryAfterSeconds >= 1, true);
  assert.equal(store.requestBuckets.size, 1);
  assert.equal(store.clientSignals.get("critical:10.0.0.9").lastDecision, "rate-limited");
});

test("repeated auth failures escalate to abuse-blocked", () => {
  const store = createInMemoryRateLimitStore();
  const routeDefinition = {
    method: "POST",
    path: "/api/auth/login",
    tier: "critical",
    kind: "auth",
    bucketKey: "/api/auth/*",
  };

  for (let index = 0; index < 3; index += 1) {
    const requestContext = createRequestContext({
      ipAddress: "10.0.0.12",
      userId: null,
      pathName: "/api/auth/login",
      method: "POST",
      timestamp: 20_000 + index,
    });
    createRateLimitingAndAbuseProtection({
      requestContext,
      routeDefinition,
      rateLimitStore: store,
    });
    createRateLimitingAndAbuseProtection({
      requestContext: {
        ...requestContext,
        phase: "response",
        responseStatusCode: 401,
        timestamp: 20_100 + index,
      },
      routeDefinition,
      rateLimitStore: store,
    });
  }

  const blocked = createRateLimitingAndAbuseProtection({
    requestContext: createRequestContext({
      ipAddress: "10.0.0.12",
      userId: null,
      pathName: "/api/auth/login",
      method: "POST",
      timestamp: 21_000,
    }),
    routeDefinition,
    rateLimitStore: store,
  });

  assert.equal(blocked.rateLimitDecision.allowed, false);
  assert.equal(blocked.rateLimitDecision.decision, "abuse-blocked");
  assert.equal(blocked.rateLimitDecision.abuseSignals.authFailures, 3);
});

test("route scanning detection blocks clients that probe many unknown api routes", () => {
  const store = createInMemoryRateLimitStore();

  for (let index = 0; index < 5; index += 1) {
    const routeDefinition = {
      method: "GET",
      path: `/api/unknown-${index}`,
      tier: "critical",
      kind: "unknown-api",
      bucketKey: "/api/unknown",
    };
    const requestContext = createRequestContext({
      ipAddress: "10.0.0.14",
      userId: null,
      pathName: `/api/unknown-${index}`,
      method: "GET",
      timestamp: 30_000 + index,
    });

    createRateLimitingAndAbuseProtection({
      requestContext,
      routeDefinition,
      rateLimitStore: store,
    });
    createRateLimitingAndAbuseProtection({
      requestContext: {
        ...requestContext,
        phase: "response",
        responseStatusCode: 404,
        timestamp: 30_100 + index,
      },
      routeDefinition,
      rateLimitStore: store,
    });
  }

  const blocked = createRateLimitingAndAbuseProtection({
    requestContext: createRequestContext({
      ipAddress: "10.0.0.14",
      userId: null,
      pathName: "/api/unknown-next",
      method: "GET",
      timestamp: 31_000,
    }),
    routeDefinition: {
      method: "GET",
      path: "/api/unknown-next",
      tier: "critical",
      kind: "unknown-api",
      bucketKey: "/api/unknown",
    },
    rateLimitStore: store,
  });

  assert.equal(blocked.rateLimitDecision.allowed, false);
  assert.equal(blocked.rateLimitDecision.decision, "abuse-blocked");
  assert.equal(blocked.rateLimitDecision.abuseSignals.routeScanning, 5);
});
