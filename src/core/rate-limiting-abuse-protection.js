function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function createEmptyStore() {
  return {
    requestBuckets: new Map(),
    clientSignals: new Map(),
  };
}

function ensureStore(rateLimitStore) {
  const normalized = normalizeObject(rateLimitStore);
  return {
    requestBuckets: normalized.requestBuckets instanceof Map ? normalized.requestBuckets : new Map(),
    clientSignals: normalized.clientSignals instanceof Map ? normalized.clientSignals : new Map(),
  };
}

function pruneWindow(timestamps = [], nowMs, windowMs) {
  return timestamps.filter((timestamp) => Number.isFinite(timestamp) && (nowMs - timestamp) <= windowMs);
}

function pruneEventWindow(events = [], nowMs, windowMs) {
  return events.filter((event) => {
    const timestamp = Number(event?.timestamp);
    return Number.isFinite(timestamp) && (nowMs - timestamp) <= windowMs;
  });
}

function resolveTier(routeDefinition = {}) {
  const tier = normalizeString(routeDefinition.tier, "standard");
  return ["critical", "standard", "open"].includes(tier) ? tier : "standard";
}

function resolveIdentity({ tier, requestContext = {} }) {
  if (tier === "critical") {
    return normalizeString(requestContext.ipAddress, "unknown-ip");
  }

  if (tier === "standard") {
    return normalizeString(requestContext.userId, `anonymous:${normalizeString(requestContext.ipAddress, "unknown-ip")}`);
  }

  return "open";
}

function getTierPolicy(tier) {
  if (tier === "critical") {
    return {
      limit: 5,
      windowMs: 10_000,
      burstLimit: 8,
      burstWindowMs: 2_000,
    };
  }

  if (tier === "standard") {
    return {
      limit: 12,
      windowMs: 10_000,
      burstLimit: 18,
      burstWindowMs: 2_000,
    };
  }

  return {
    limit: Number.POSITIVE_INFINITY,
    windowMs: 10_000,
    burstLimit: Number.POSITIVE_INFINITY,
    burstWindowMs: 2_000,
  };
}

function getClientState(store, identityKey) {
  const previous = store.clientSignals.get(identityKey);
  if (previous) {
    return previous;
  }

  const created = {
    authFailures: [],
    scannedRoutes: [],
    blockedUntil: null,
    lastDecision: "allowed",
  };
  store.clientSignals.set(identityKey, created);
  return created;
}

function observeResponse({ requestContext = {}, routeDefinition = {}, store, nowMs }) {
  const tier = resolveTier(routeDefinition);
  if (tier === "open") {
    return;
  }

  const identity = resolveIdentity({ tier, requestContext });
  const identityKey = `${tier}:${identity}`;
  const clientState = getClientState(store, identityKey);
  const responseStatusCode = Number(requestContext.responseStatusCode ?? 0);
  const routePath = normalizeString(routeDefinition.path, requestContext.pathName ?? "unknown-route");
  const routeKind = normalizeString(routeDefinition.kind, null);

  clientState.authFailures = pruneWindow(clientState.authFailures, nowMs, 5 * 60_000);
  clientState.scannedRoutes = pruneEventWindow(clientState.scannedRoutes, nowMs, 60_000);

  if (routeKind === "auth" && responseStatusCode >= 400) {
    clientState.authFailures.push(nowMs);
  }

  if (routeKind === "unknown-api" && responseStatusCode === 404) {
    clientState.scannedRoutes.push({
      routePath,
      timestamp: nowMs,
    });
  }

  const authFailureThreshold = 3;
  const routeScanThreshold = 5;
  const distinctScannedRoutes = new Set(clientState.scannedRoutes.map((event) => event.routePath)).size;
  if (clientState.authFailures.length >= authFailureThreshold || distinctScannedRoutes >= routeScanThreshold) {
    clientState.blockedUntil = nowMs + (5 * 60_000);
    clientState.lastDecision = "abuse-blocked";
  }
}

export function createRateLimitingAndAbuseProtection({
  requestContext = null,
  routeDefinition = null,
  rateLimitStore = null,
} = {}) {
  const normalizedRequestContext = normalizeObject(requestContext);
  const normalizedRouteDefinition = normalizeObject(routeDefinition);
  const updatedRateLimitStore = ensureStore(rateLimitStore);
  const nowMs = Number(normalizedRequestContext.timestamp ?? Date.now());
  const phase = normalizeString(normalizedRequestContext.phase, "request");
  const tier = resolveTier(normalizedRouteDefinition);

  if (phase === "response") {
    observeResponse({
      requestContext: normalizedRequestContext,
      routeDefinition: normalizedRouteDefinition,
      store: updatedRateLimitStore,
      nowMs,
    });

    return {
      rateLimitDecision: {
        allowed: true,
        decision: "allowed",
        tier,
        retryAfterSeconds: 0,
        reason: "response-observed",
      },
      updatedRateLimitStore,
    };
  }

  if (tier === "open") {
    return {
      rateLimitDecision: {
        allowed: true,
        decision: "allowed",
        tier,
        retryAfterSeconds: 0,
        reason: "open-route",
      },
      updatedRateLimitStore,
    };
  }

  const identity = resolveIdentity({ tier, requestContext: normalizedRequestContext });
  const routeGroup = normalizeString(normalizedRouteDefinition.bucketKey, normalizeString(normalizedRouteDefinition.path, "unknown-route"));
  const identityKey = `${tier}:${identity}`;
  const bucketKey = `${identityKey}:${routeGroup}`;
  const policy = getTierPolicy(tier);
  const requestBucket = updatedRateLimitStore.requestBuckets.get(bucketKey) ?? [];
  const prunedWindow = pruneWindow(requestBucket, nowMs, policy.windowMs);
  const burstWindow = pruneWindow(requestBucket, nowMs, policy.burstWindowMs);
  const clientState = getClientState(updatedRateLimitStore, identityKey);

  clientState.authFailures = pruneWindow(clientState.authFailures, nowMs, 5 * 60_000);
  clientState.scannedRoutes = pruneEventWindow(clientState.scannedRoutes, nowMs, 60_000);
  const routeScanningCount = new Set(clientState.scannedRoutes.map((event) => event.routePath)).size;

  if (Number.isFinite(clientState.blockedUntil) && clientState.blockedUntil > nowMs) {
    const retryAfterSeconds = Math.max(1, Math.ceil((clientState.blockedUntil - nowMs) / 1000));
    clientState.lastDecision = "abuse-blocked";
    return {
      rateLimitDecision: {
        allowed: false,
        decision: "abuse-blocked",
        tier,
        retryAfterSeconds,
        reason: "client-blocked",
        abuseSignals: {
          authFailures: clientState.authFailures.length,
          routeScanning: routeScanningCount,
        },
      },
      updatedRateLimitStore,
    };
  }

  if (burstWindow.length >= policy.burstLimit) {
    clientState.blockedUntil = nowMs + (60 * 1000);
    clientState.lastDecision = "abuse-blocked";
    return {
      rateLimitDecision: {
        allowed: false,
        decision: "abuse-blocked",
        tier,
        retryAfterSeconds: 60,
        reason: "burst-requests",
        abuseSignals: {
          burstRequests: burstWindow.length,
          authFailures: clientState.authFailures.length,
          routeScanning: routeScanningCount,
        },
      },
      updatedRateLimitStore,
    };
  }

  if (prunedWindow.length >= policy.limit) {
    const oldestAllowedTimestamp = prunedWindow[0] ?? nowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil(((oldestAllowedTimestamp + policy.windowMs) - nowMs) / 1000));
    clientState.lastDecision = "rate-limited";
    return {
      rateLimitDecision: {
        allowed: false,
        decision: "rate-limited",
        tier,
        retryAfterSeconds,
        reason: "tier-window-exceeded",
        abuseSignals: {
          requestCount: prunedWindow.length,
        },
      },
      updatedRateLimitStore,
    };
  }

  const updatedBucket = [...prunedWindow, nowMs];
  updatedRateLimitStore.requestBuckets.set(bucketKey, updatedBucket);
  clientState.lastDecision = "allowed";

  return {
    rateLimitDecision: {
      allowed: true,
      decision: "allowed",
      tier,
      retryAfterSeconds: 0,
      reason: "within-tier-limit",
      abuseSignals: {
        requestCount: updatedBucket.length,
        authFailures: clientState.authFailures.length,
        routeScanning: routeScanningCount,
      },
    },
    updatedRateLimitStore,
  };
}

export function createInMemoryRateLimitStore() {
  return createEmptyStore();
}
