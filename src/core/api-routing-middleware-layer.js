function buildDefaultRouteDefinitions() {
  return [
    { method: "GET", path: "/api/health", handler: "getHealthStatus", middlewares: ["request-context", "response-serializer"] },
    { method: "GET", path: "/api/readiness", handler: "getReadinessStatus", middlewares: ["request-context", "response-serializer"] },
    { method: "POST", path: "/api/auth/signup", handler: "signupUser", middlewares: ["json-body-parser", "error-boundary"] },
    { method: "POST", path: "/api/auth/login", handler: "loginUser", middlewares: ["json-body-parser", "error-boundary"] },
    { method: "POST", path: "/api/auth/logout", handler: "logoutUser", middlewares: ["json-body-parser", "error-boundary"] },
    { method: "POST", path: "/api/onboarding/sessions", handler: "createOnboardingSession", middlewares: ["json-body-parser", "error-boundary"] },
    { method: "POST", path: "/api/onboarding/intake", handler: "createProjectIntake", middlewares: ["json-body-parser", "error-boundary"] },
    { method: "GET", path: "/api/projects", handler: "listProjects", middlewares: ["request-context", "response-serializer"] },
    { method: "GET", path: "/api/projects/:projectId", handler: "getProject", middlewares: ["request-context", "response-serializer"] },
    { method: "POST", path: "/api/projects/:projectId/run-cycle", handler: "runCycle", middlewares: ["request-context", "json-body-parser", "error-boundary"] },
    { method: "GET", path: "/api/projects/:projectId/release-tracking", handler: "getReleaseTracking", middlewares: ["request-context", "response-serializer"] },
    { method: "GET", path: "/api/projects/:projectId/diff-preview", handler: "getDiffPreview", middlewares: ["request-context", "response-serializer"] },
    { method: "GET", path: "/api/projects/:projectId/policy", handler: "getPolicyPayload", middlewares: ["request-context", "response-serializer"] },
    { method: "GET", path: "/api/projects/:projectId/approvals", handler: "listApprovals", middlewares: ["request-context", "response-serializer"] },
    { method: "POST", path: "/api/projects/:projectId/approvals/approve", handler: "captureApproval", middlewares: ["request-context", "json-body-parser", "error-boundary"] },
    { method: "POST", path: "/api/projects/:projectId/accounts/link", handler: "linkExternalAccount", middlewares: ["request-context", "json-body-parser", "error-boundary"] },
  ];
}

function normalizeRouteDefinitions(routeDefinitions) {
  if (Array.isArray(routeDefinitions) && routeDefinitions.length > 0) {
    return routeDefinitions.map((route) => ({
      method: route.method ?? "GET",
      path: route.path ?? "/",
      handler: route.handler ?? "unknown-handler",
      middlewares: Array.isArray(route.middlewares) ? route.middlewares : [],
    }));
  }

  return buildDefaultRouteDefinitions();
}

export function createApiRoutingAndMiddlewareLayer({
  applicationRuntime = null,
  routeDefinitions = null,
} = {}) {
  const normalizedRouteDefinitions = normalizeRouteDefinitions(routeDefinitions);
  const middlewareStack = [
    {
      id: "request-context",
      stage: "pre-routing",
      description: "build request context and route metadata",
    },
    {
      id: "auth-middleware",
      stage: "authorization",
      description: "attach authentication, session validation and workspace access to request context",
    },
    {
      id: "json-body-parser",
      stage: "request-parsing",
      description: "parse JSON body for mutable API requests",
    },
    {
      id: "request-validation",
      stage: "validation",
      description: "normalize request payloads and produce canonical error envelopes",
    },
    {
      id: "response-serializer",
      stage: "post-handler",
      description: "serialize canonical payloads to JSON responses",
    },
    {
      id: "error-boundary",
      stage: "error-handling",
      description: "capture unhandled route errors and return error envelopes",
    },
  ];

  const routeIndex = normalizedRouteDefinitions.reduce((index, route) => {
    index[`${route.method}:${route.path}`] = route.handler;
    return index;
  }, {});

  return {
    apiRuntime: {
      apiRuntimeId: `api-runtime-${Date.now()}`,
      status: "ready",
      runtimeId: applicationRuntime?.runtimeId ?? null,
      basePath: "/api",
      totalRoutes: normalizedRouteDefinitions.length,
      routeDefinitions: normalizedRouteDefinitions,
      middlewareStack,
      routeIndex,
    },
  };
}
