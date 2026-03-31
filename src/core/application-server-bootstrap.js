import fs from "node:fs";
import path from "node:path";

import { loadEnvFile } from "./load-env.js";
import { createApiRoutingAndMiddlewareLayer } from "./api-routing-middleware-layer.js";
import { createAuthMiddleware } from "./auth-middleware.js";
import { createRequestValidationAndErrorBoundaryLayer } from "./request-validation-error-boundary-layer.js";
import { createBackgroundWorkerRuntime } from "./background-worker-runtime.js";
import { createHealthCheckAndReadinessEndpoints } from "./health-check-readiness-endpoints.js";
import { createPlatformObservabilityTransport } from "./platform-observability-transport.js";
import { ProjectService } from "./project-service.js";
import { createInMemoryRateLimitStore } from "./rate-limiting-abuse-protection.js";

function resolveConfig(runtimeConfig = {}) {
  const rootDir = runtimeConfig.rootDir ?? path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
  return {
    rootDir,
    publicDir: runtimeConfig.publicDir ?? path.resolve(rootDir, "web"),
    dataDir: runtimeConfig.dataDir ?? path.resolve(rootDir, "data"),
    eventLogPath: runtimeConfig.eventLogPath ?? path.resolve(runtimeConfig.dataDir ?? path.resolve(rootDir, "data"), "events.ndjson"),
    auditLogPath: runtimeConfig.auditLogPath ?? path.resolve(runtimeConfig.dataDir ?? path.resolve(rootDir, "data"), "system-audit.ndjson"),
    snapshotLogPath: runtimeConfig.snapshotLogPath ?? path.resolve(runtimeConfig.dataDir ?? path.resolve(rootDir, "data"), "project-snapshots.ndjson"),
    host: runtimeConfig.host ?? process.env.HOST ?? "127.0.0.1",
    port: runtimeConfig.port ?? process.env.PORT ?? 4001,
    seedDemoProjects: runtimeConfig.seedDemoProjects === true,
  };
}

export function createApplicationServerBootstrap({
  runtimeConfig = {},
  createServer,
  serviceFactory,
} = {}) {
  loadEnvFile();

  const config = resolveConfig(runtimeConfig);
  fs.mkdirSync(config.dataDir, { recursive: true });
  const platformObservabilityTransport = createPlatformObservabilityTransport();
  const rateLimitStore = createInMemoryRateLimitStore();

  const projectService = serviceFactory
    ? serviceFactory({
        eventLogPath: config.eventLogPath,
        auditLogPath: config.auditLogPath,
        snapshotLogPath: config.snapshotLogPath,
        platformObservabilityTransport,
      })
    : new ProjectService({
        eventLogPath: config.eventLogPath,
        auditLogPath: config.auditLogPath,
        snapshotLogPath: config.snapshotLogPath,
        platformObservabilityTransport,
      });

  const startupSteps = [
    { step: "load-env", status: "completed" },
    { step: "ensure-data-dir", status: "completed", path: config.dataDir },
    { step: "create-project-service", status: "completed", eventLogPath: config.eventLogPath },
  ];

  if (config.seedDemoProjects) {
    projectService.seedDemoProject();
    projectService.seedCasinoProject();
    startupSteps.push({
      step: "seed-demo-projects",
      status: "completed",
      seededProjectIds: ["giftwallet", "royal-casino"],
    });
  }

  const { apiRuntime } = createApiRoutingAndMiddlewareLayer({
    applicationRuntime: {
      runtimeId: `application-runtime-${Date.now()}`,
    },
  });
  const { authenticatedRequest } = createAuthMiddleware({
    requestContext: {
      requestId: `bootstrap-request-${Date.now()}`,
      projectId: "bootstrap-project",
    },
    sessionState: {
      sessionId: "bootstrap-session",
      status: "active",
      userId: "bootstrap-user",
    },
    authenticationState: {
      isAuthenticated: true,
      userId: "bootstrap-user",
    },
    accessDecision: {
      canView: true,
      effectiveRole: "owner",
      allowedActions: ["view", "edit", "run", "approve", "deploy"],
    },
    sessionSecurityDecision: {
      decision: "valid",
      isBlocked: false,
      requiresRotation: false,
      reason: "Bootstrap session is valid",
      triggeredControls: [],
    },
  });
  const { validatedRequest, errorEnvelope } = createRequestValidationAndErrorBoundaryLayer({
    requestPayload: {
      userInput: {
        email: "demo@example.com",
      },
    },
    routeDefinition: {
      method: "POST",
      path: "/api/auth/login",
      handler: "loginUser",
      requiredFields: ["userInput"],
    },
  });
  const { workerRuntime, jobState } = createBackgroundWorkerRuntime({
    jobDefinition: {
      jobType: "polling",
      schedule: "interval",
      payload: {
        scope: "release-status",
      },
    },
    runtimeConfig: {
      queueName: "nexus-background",
      concurrency: 2,
    },
  });
  startupSteps.push({
    step: "create-api-runtime",
    status: apiRuntime ? "completed" : "pending",
    totalRoutes: apiRuntime?.totalRoutes ?? 0,
  });
  startupSteps.push({
    step: "create-auth-middleware",
    status: authenticatedRequest ? "completed" : "pending",
    authStatus: authenticatedRequest?.authStatus ?? null,
  });
  startupSteps.push({
    step: "create-request-validation-layer",
    status: validatedRequest ? "completed" : "pending",
    validationStatus: errorEnvelope?.status ?? null,
  });
  startupSteps.push({
    step: "create-background-worker-runtime",
    status: workerRuntime ? "completed" : "pending",
    queueName: workerRuntime?.queueName ?? null,
  });

  const runtimeId = apiRuntime.runtimeId ?? `application-runtime-${Date.now()}`;
  const { healthStatus, readinessStatus } = createHealthCheckAndReadinessEndpoints({
    runtimeHealthSignals: {
      runtimeId,
      startupSteps,
      dependencies: [
        {
          name: "project-service",
          status: "healthy",
          readiness: "ready",
          critical: true,
          details: [`projects:${projectService.listProjects().length}`],
        },
        {
          name: "api-runtime",
          status: apiRuntime ? "healthy" : "down",
          readiness: apiRuntime ? "ready" : "not-ready",
          critical: true,
          details: [`routes:${apiRuntime?.totalRoutes ?? 0}`],
        },
        {
          name: "auth-middleware",
          status: authenticatedRequest?.isAuthenticated ? "healthy" : "degraded",
          readiness: authenticatedRequest?.hasWorkspaceAccess === false ? "not-ready" : "ready",
          critical: true,
          details: [`auth:${authenticatedRequest?.authStatus ?? "unknown"}`],
        },
        {
          name: "request-validation",
          status: errorEnvelope?.status === "ok" ? "healthy" : "degraded",
          readiness: validatedRequest?.isValid ? "ready" : "not-ready",
          critical: true,
          details: [`validation:${errorEnvelope?.status ?? "unknown"}`],
        },
        {
          name: "background-worker",
          status: workerRuntime ? "healthy" : "down",
          readiness: workerRuntime?.status === "ready" ? "ready" : "not-ready",
          critical: false,
          details: [`queue:${workerRuntime?.queueName ?? "unknown"}`],
        },
      ],
    },
  });

  const server = typeof createServer === "function"
    ? createServer(projectService, {
        runtimeId,
        healthStatus,
        readinessStatus,
        rateLimitStore,
      })
    : null;
  startupSteps.push({
    step: "create-http-server",
    status: server ? "completed" : "pending",
  });
  platformObservabilityTransport.recordTraceEnvelope({
    platformTrace: {
      traceId: `${runtimeId}:startup`,
      route: "/runtime/startup",
      method: "SYSTEM",
      service: runtimeId,
      status: "completed",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      steps: startupSteps.map((step, index) => ({
        stepId: `startup-step-${index + 1}`,
        source: runtimeId,
        status: step.status ?? "observed",
        timestamp: new Date().toISOString(),
        message: step.step,
      })),
    },
    platformLogs: startupSteps.map((step, index) => ({
      logId: `${runtimeId}:startup-log-${index + 1}`,
      level: step.status === "completed" ? "info" : "warn",
      source: runtimeId,
      message: `${step.step}:${step.status ?? "observed"}`,
      timestamp: new Date().toISOString(),
      metadata: step,
    })),
  });

  return {
    applicationRuntime: {
      runtimeId,
      status: "ready",
      host: config.host,
      port: Number(config.port),
      publicDir: config.publicDir,
      dataDir: config.dataDir,
      eventLogPath: config.eventLogPath,
      auditLogPath: config.auditLogPath,
      snapshotLogPath: config.snapshotLogPath,
      startupSteps,
      projectService,
      server,
      apiRuntime,
      authenticatedRequest,
      validatedRequest,
      errorEnvelope,
      workerRuntime,
      jobState,
      healthStatus,
      readinessStatus,
      platformObservabilityTransport,
      rateLimitStore,
    },
  };
}
