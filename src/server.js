import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createApplicationServerBootstrap } from "./core/application-server-bootstrap.js";
import {
  createInMemoryRateLimitStore,
  createRateLimitingAndAbuseProtection,
} from "./core/rate-limiting-abuse-protection.js";
import { createFeatureFlagResolver } from "./core/feature-flag-resolver.js";
import { createEmergencyKillSwitchGuard } from "./core/emergency-kill-switch-guard.js";
import { createActionLevelProjectAuthorizationResolver } from "./core/action-level-project-authorization-resolver.js";
import { createPrivilegedActionAuthorityResolver } from "./core/privileged-action-authority-resolver.js";
import { defineProjectPermissionSchema } from "./core/project-permission-schema.js";
import { createProjectRoleCapabilityMatrix } from "./core/project-role-capability-matrix.js";
import { defineTenantIsolationSchema } from "./core/tenant-isolation-schema.js";
import { createWorkspaceIsolationGuard } from "./core/workspace-isolation-guard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../web");

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendFile(response, filePath) {
  const ext = path.extname(filePath);
  const type =
    ext === ".html"
      ? "text/html; charset=utf-8"
      : ext === ".css"
        ? "text/css; charset=utf-8"
        : "application/javascript; charset=utf-8";

  response.writeHead(200, { "Content-Type": type });
  response.end(fs.readFileSync(filePath));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function getPlatformObservability(projectService) {
  return typeof projectService.getPlatformObservability === "function"
    ? projectService.getPlatformObservability()
    : {
        platformTraces: [],
        platformLogs: [],
        summary: {
          totalTraces: 0,
          totalLogs: 0,
          activeTraces: 0,
          latestTraceId: null,
          latestLogId: null,
        },
      };
}

function getObservabilityTransport(projectService) {
  return projectService?.platformObservabilityTransport ?? null;
}

function resolveWorkspaceId(urlPathname) {
  const segments = urlPathname.split("/");
  if (segments[1] !== "api") {
    return null;
  }

  if (segments[2] === "projects" || segments[2] === "workspaces") {
    return segments[3] ?? null;
  }

  return null;
}

function resolveIpAddress(request) {
  const forwarded = request.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return request.socket?.remoteAddress ?? request.connection?.remoteAddress ?? "127.0.0.1";
}

function resolveRequestUserId(request) {
  const headerValue = request.headers?.["x-user-id"];
  return typeof headerValue === "string" && headerValue.trim().length > 0 ? headerValue.trim() : null;
}

function resolveRequestActorType(request, project = null, userId = null) {
  const headerValue = request.headers?.["x-actor-type"];
  if (typeof headerValue === "string" && headerValue.trim().length > 0) {
    return headerValue.trim().toLowerCase();
  }

  if (!userId) {
    return "viewer";
  }

  const ownerUserId =
    project?.state?.workspaceModel?.ownerUserId
    ?? project?.context?.workspaceModel?.ownerUserId
    ?? project?.userId
    ?? null;

  return ownerUserId && ownerUserId === userId ? "owner" : "viewer";
}

function resolveRequestWorkspaceHeader(request, fallback = null) {
  const headerValue = request.headers?.["x-workspace-id"];
  return typeof headerValue === "string" && headerValue.trim().length > 0 ? headerValue.trim() : fallback;
}

function resolveRequestEnvironment(request, fallback = null) {
  const headerValue = request.headers?.["x-environment"];
  if (typeof headerValue === "string" && headerValue.trim()) {
    return headerValue.trim();
  }
  return fallback;
}

function resolveRequestRiskLevel(request) {
  const headerValue = request.headers?.["x-risk-level"];
  return typeof headerValue === "string" && headerValue.trim() ? headerValue.trim() : null;
}

function resolveRequestRiskFlags(request) {
  const headerValue = request.headers?.["x-risk-flags"];
  if (typeof headerValue !== "string" || !headerValue.trim()) {
    return [];
  }
  return headerValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function routeMatchesPattern(pathname, pattern) {
  const normalizedPath = typeof pathname === "string" ? pathname : "/";
  const normalizedPattern = typeof pattern === "string" ? pattern : "";
  if (!normalizedPattern.includes("*")) {
    return normalizedPath === normalizedPattern;
  }
  const escaped = normalizedPattern
    .split("*")
    .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^/]+");
  return new RegExp(`^${escaped}$`).test(normalizedPath);
}

function resolveKilledExecutionPath(pathname, routeDefinition) {
  const path = typeof pathname === "string" ? pathname : "/";
  const kind = routeDefinition?.kind ?? null;
  if (path.includes("/accounts/") || path.includes("/rollback")) {
    return "provider-execution";
  }
  if (kind === "project-api") {
    return "risky-capabilities";
  }
  return null;
}

function resolveRouteDefinition(method, pathname) {
  const route = typeof pathname === "string" ? pathname : "/";
  const verb = typeof method === "string" ? method : "GET";

  const openExactRoutes = new Set([
    "GET /api/health",
    "GET /api/readiness",
  ]);
  if (openExactRoutes.has(`${verb} ${route}`)) {
    return {
      method: verb,
      path: route,
      tier: "open",
      kind: "open-api",
      bucketKey: route,
      isKnownRoute: true,
    };
  }

  if (verb === "GET" && route === "/api/observability") {
    return {
      method: verb,
      path: route,
      tier: "standard",
      kind: "observability",
      bucketKey: route,
      isKnownRoute: true,
    };
  }

  if (route.startsWith("/api/auth/")) {
    return {
      method: verb,
      path: route,
      tier: "critical",
      kind: "auth",
      bucketKey: "/api/auth/*",
      isKnownRoute: true,
    };
  }

  if (verb === "POST" && route === "/api/project-drafts") {
    return {
      method: verb,
      path: route,
      tier: "critical",
      kind: "project-creation",
      bucketKey: route,
      isKnownRoute: true,
    };
  }

  if (route.startsWith("/api/onboarding/")) {
    return {
      method: verb,
      path: route,
      tier: "standard",
      kind: "onboarding",
      bucketKey: "/api/onboarding/*",
      isKnownRoute: true,
    };
  }

  if (route.startsWith("/api/projects/")) {
    const suffix = route.split("/").slice(4).join("/");
    return {
      method: verb,
      path: route,
      tier: "standard",
      kind: "project-api",
      bucketKey: suffix ? `/api/projects/*/${suffix}` : "/api/projects/*",
      isKnownRoute: true,
    };
  }

  if (route.startsWith("/api/workspaces/")) {
    return {
      method: verb,
      path: route,
      tier: "standard",
      kind: "workspace-billing-api",
      bucketKey: "/api/workspaces/*/billing/*",
      isKnownRoute: true,
    };
  }

  if (route === "/api/audit-logs" || route === "/api/security-audit-logs" || route === "/api/project-snapshots") {
    return {
      method: verb,
      path: route,
      tier: "standard",
      kind: "system-api",
      bucketKey: route,
      isKnownRoute: true,
    };
  }

  if (route.startsWith("/api/")) {
    return {
      method: verb,
      path: route,
      tier: "critical",
      kind: "unknown-api",
      bucketKey: "/api/unknown",
      isKnownRoute: false,
    };
  }

  return {
    method: verb,
    path: route,
    tier: "open",
    kind: "static",
    bucketKey: route,
    isKnownRoute: true,
  };
}

function getProjectLiveState(projectService, projectId) {
  const project = projectService.getProject(projectId);
  if (!project) {
    return null;
  }

  return {
    projectId,
    progressState: project.progressState ?? null,
    reactiveWorkspaceState: project.reactiveWorkspaceState ?? null,
    realtimeEventStream: project.realtimeEventStream ?? null,
    liveUpdateChannel: project.liveUpdateChannel ?? null,
    liveLogStream: project.liveLogStream ?? null,
    formattedLogs: project.formattedLogs ?? [],
    commandConsoleView: project.commandConsoleView ?? null,
    projectPresenceState: project.projectPresenceState ?? null,
    reviewThreadState: project.reviewThreadState ?? null,
    collaborationFeed: project.collaborationFeed ?? null,
    continuityPlan: project.continuityPlan ?? null,
    disasterRecoveryChecklist: project.disasterRecoveryChecklist ?? null,
    businessContinuityState: project.businessContinuityState ?? null,
    events: project.events ?? [],
  };
}

function writeSseEvent(response, eventName, payload) {
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function normalizeProjectRouteSuffix(pathname) {
  return pathname.split("/").slice(4).join("/");
}

function resolveProjectRouteAction(method, pathname) {
  const normalizedMethod = typeof method === "string" ? method.toUpperCase() : "GET";
  const suffix = normalizeProjectRouteSuffix(pathname);

  if (normalizedMethod === "GET") {
    if (!suffix || suffix === "events" || suffix === "live-state" || suffix === "live-events" || suffix === "audit" || suffix === "review-threads" || suffix === "scan" || suffix === "analysis" || suffix === "external" || suffix === "git" || suffix === "runtime" || suffix === "notion" || suffix === "release-tracking" || suffix === "diff-preview" || suffix === "policy" || suffix === "approvals" || suffix === "business-continuity" || suffix === "continuity-plan" || suffix === "disaster-recovery-checklist") {
      return "view";
    }
  }

  if (normalizedMethod === "POST") {
    if (suffix === "proposal-edits" || suffix === "presence" || suffix === "review-threads" || suffix === "privacy-rights-requests") {
      return "edit";
    }

    if (suffix === "partial-acceptance" || suffix === "approvals/approve" || suffix === "approvals/reject" || suffix === "approvals/revoke") {
      return "approve";
    }

    if (suffix === "rollback-executions" || suffix === "snapshot-backup-schedule" || suffix === "snapshot-backups/run" || suffix === "snapshot-backup-worker" || suffix === "snapshot-backup-worker/run" || suffix === "snapshot-retention-policy" || suffix === "snapshot-retention-cleanup" || suffix === "business-continuity/actions" || suffix === "run-cycle" || suffix === "scan" || suffix === "analyze" || suffix === "sync-casino" || suffix === "connect-git" || suffix === "sync-runtime" || suffix === "sync-notion") {
      return "deploy";
    }

    if (suffix === "accounts/link") {
      return "connect-account";
    }

    if (suffix === "accounts/rotate") {
      return "manage-credentials";
    }

    if (suffix === "accounts/verify") {
      return "inspect";
    }
  }

  if (normalizedMethod === "DELETE" && suffix.startsWith("accounts/")) {
    return "manage-credentials";
  }

  return normalizedMethod === "GET" ? "view" : "edit";
}

function resolveProjectRouteResourceType(pathname) {
  const suffix = normalizeProjectRouteSuffix(pathname);

  if (!suffix || suffix === "events" || suffix === "audit" || suffix === "live-state" || suffix === "live-events") {
    return "project-state";
  }

  if (suffix.startsWith("accounts/") || suffix === "accounts") {
    return "linked-accounts";
  }

  if (suffix.includes("snapshot") || suffix.includes("rollback")) {
    return "artifacts";
  }

  if (suffix.includes("log") || suffix === "runtime" || suffix === "analysis" || suffix === "scan") {
    return "logs";
  }

  return "project-state";
}

function buildProjectAccessEnforcement({ request, pathname, project = null, userId = null } = {}) {
  if (!project?.state?.roleCapabilityMatrix || !project?.state?.tenantIsolationSchema) {
    return null;
  }

  if (!userId) {
    return {
      httpStatus: 401,
      payload: {
        error: "Authentication required",
        reason: "authentication-required",
      },
    };
  }

  const actorType = resolveRequestActorType(request, project, userId);
  const projectAction = resolveProjectRouteAction(request.method, pathname);
  const resourceType = resolveProjectRouteResourceType(pathname);
  const policyDecision =
    projectAction === "deploy" || projectAction === "run" || projectAction === "approve"
      ? project.state.policyDecision ?? null
      : null;
  const requestedWorkspaceId = resolveRequestWorkspaceHeader(
    request,
    project?.state?.workspaceModel?.workspaceId
      ?? project?.context?.workspaceModel?.workspaceId
      ?? null,
  );

  const { projectAuthorizationDecision } = createActionLevelProjectAuthorizationResolver({
    actorType,
    projectAction,
    roleCapabilityMatrix: project.state.roleCapabilityMatrix ?? null,
    policyDecision,
  });
  const { workspaceIsolationDecision } = createWorkspaceIsolationGuard({
    tenantIsolationSchema: project.state.tenantIsolationSchema ?? null,
    requestContext: {
      workspaceId: requestedWorkspaceId,
      resourceType,
      resourceId: `project-route:${pathname}`,
      actionType: projectAction,
    },
  });

  if (workspaceIsolationDecision.isBlocked === true || workspaceIsolationDecision.requiresScopedReview === true) {
    return {
      httpStatus: 403,
      payload: {
        error: "Workspace isolation violation",
        reason: "workspace-isolation-blocked",
        workspaceIsolationDecision,
      },
    };
  }

  if (projectAuthorizationDecision.isBlocked === true) {
    return {
      httpStatus: 403,
      payload: {
        error: "Forbidden",
        reason: "project-authorization-blocked",
        projectAuthorizationDecision,
        workspaceIsolationDecision,
      },
    };
  }

  if (projectAuthorizationDecision.requiresApproval === true) {
    return {
      httpStatus: 403,
      payload: {
        error: "Approval required",
        reason: "project-authorization-requires-approval",
        projectAuthorizationDecision,
        workspaceIsolationDecision,
      },
    };
  }

  const { privilegedAuthorityDecision } = createPrivilegedActionAuthorityResolver({
    projectAuthorizationDecision,
    approvalStatus: project.state.approvalStatus ?? null,
    deployPolicyDecision: project.state.deployPolicyDecision ?? null,
    credentialPolicyDecision: project.state.credentialPolicyDecision ?? null,
  });

  if (
    privilegedAuthorityDecision.isPrivilegedAction === true
    && (privilegedAuthorityDecision.isBlocked === true || privilegedAuthorityDecision.requiresApproval === true)
  ) {
    return {
      httpStatus: 403,
      payload: {
        error: privilegedAuthorityDecision.requiresApproval === true ? "Privileged approval required" : "Privileged action blocked",
        reason: privilegedAuthorityDecision.requiresApproval === true
          ? "privileged-approval-required"
          : "privileged-action-blocked",
        projectAuthorizationDecision,
        workspaceIsolationDecision,
        privilegedAuthorityDecision,
      },
    };
  }

  return null;
}

function buildProjectCollectionAccessEnforcement({
  request,
  pathname,
  projectService = null,
  userId = null,
} = {}) {
  if (!userId) {
    return {
      httpStatus: 401,
      payload: {
        error: "Authentication required",
        reason: "authentication-required",
      },
    };
  }

  const authPayload = typeof projectService?.getUserAuthPayload === "function"
    ? projectService.getUserAuthPayload(userId)
    : null;
  const workspaceModel = authPayload?.workspaceModel ?? null;
  if (!workspaceModel) {
    return {
      httpStatus: 401,
      payload: {
        error: "Authentication required",
        reason: "authentication-required",
      },
    };
  }

  const { projectPermissionSchema } = defineProjectPermissionSchema({
    workspaceModel,
    projectType: "generic",
  });
  const { roleCapabilityMatrix } = createProjectRoleCapabilityMatrix({
    projectPermissionSchema,
  });
  const { tenantIsolationSchema } = defineTenantIsolationSchema({
    workspaceModel,
  });

  return buildProjectAccessEnforcement({
    request,
    pathname,
    userId,
    project: {
      userId,
      state: {
        workspaceModel,
        roleCapabilityMatrix,
        tenantIsolationSchema,
        approvalStatus: null,
        deployPolicyDecision: null,
        credentialPolicyDecision: null,
      },
      context: {
        workspaceModel,
      },
    },
  });
}

export function createServer(projectService, runtimeStatus = {}) {
  const rateLimitStore = runtimeStatus.rateLimitStore ?? createInMemoryRateLimitStore();
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const segments = url.pathname.split("/");
    const observabilityTransport = getObservabilityTransport(projectService);
    const routeDefinition = resolveRouteDefinition(request.method, url.pathname);
    const requestId = request.headers?.["x-request-id"] ?? `${request.method ?? "GET"}:${url.pathname}:${Date.now()}`;
    const requestStartedAt = Date.now();
    const requestTimestamp = Date.now();
    const workspaceId = resolveWorkspaceId(url.pathname);
    const resolvedUserId = resolveRequestUserId(request);
    const baseRequestContext = {
      requestId,
      pathName: url.pathname,
      method: request.method ?? "GET",
      ipAddress: resolveIpAddress(request),
      timestamp: requestTimestamp,
      userId: resolvedUserId,
    };
    const { rateLimitDecision } = createRateLimitingAndAbuseProtection({
      requestContext: baseRequestContext,
      routeDefinition,
      rateLimitStore,
    });
    const requestTrace = observabilityTransport?.startHttpRequest({
      requestId,
      route: url.pathname,
      method: request.method,
      workspaceId: resolveWorkspaceId(url.pathname),
      service: runtimeStatus.runtimeId ?? "http-server",
    });
    if (!rateLimitDecision.allowed) {
      observabilityTransport?.finishHttpRequest({
        traceId: requestTrace?.traceId ?? requestId,
        route: url.pathname,
        method: request.method,
        statusCode: 429,
        durationMs: Date.now() - requestStartedAt,
        service: runtimeStatus.runtimeId ?? "http-server",
      });
      sendJson(response, 429, {
        error: rateLimitDecision.decision,
        rateLimitDecision,
      }, {
        "Retry-After": String(rateLimitDecision.retryAfterSeconds ?? 1),
      });
      return;
    }

    const routedProject = workspaceId
      ? (
          url.pathname.startsWith("/api/workspaces/")
            ? (typeof projectService?.getProjectByWorkspaceId === "function"
                ? projectService.getProjectByWorkspaceId(workspaceId)
                : null)
            : (typeof projectService?.getProject === "function"
                ? projectService.getProject(workspaceId)
                : null)
        )
      : null;
    const featureFlagSchema = routedProject?.state?.featureFlagSchema ?? routedProject?.context?.featureFlagSchema ?? null;
    const incidentAlert = routedProject?.state?.incidentAlert ?? routedProject?.context?.incidentAlert ?? null;
    const { featureFlagDecision } = createFeatureFlagResolver({
      featureFlagSchema,
      requestContext: {
        workspaceId,
        userId: resolvedUserId,
        actorId: resolvedUserId,
        environment: resolveRequestEnvironment(request, featureFlagSchema?.environmentConfig?.environment ?? null),
        riskLevel: resolveRequestRiskLevel(request),
        riskFlags: resolveRequestRiskFlags(request),
      },
    });
    const { killSwitchDecision } = createEmergencyKillSwitchGuard({
      featureFlagDecision,
      incidentAlert,
    });
    const blockedRouteEntry = (featureFlagDecision?.blockedRoutes ?? []).find((entry) => routeMatchesPattern(url.pathname, entry.route));
    if (blockedRouteEntry) {
      observabilityTransport?.finishHttpRequest({
        traceId: requestTrace?.traceId ?? requestId,
        route: url.pathname,
        method: request.method,
        statusCode: 403,
        durationMs: Date.now() - requestStartedAt,
        service: runtimeStatus.runtimeId ?? "http-server",
      });
      sendJson(response, 403, {
        reason: "feature-disabled",
        flagId: blockedRouteEntry.flagId,
        featureFlagDecision,
      });
      return;
    }
    const executionPath = resolveKilledExecutionPath(url.pathname, routeDefinition);
    if (killSwitchDecision?.isActive === true && executionPath && killSwitchDecision.killedPaths?.includes(executionPath)) {
      observabilityTransport?.finishHttpRequest({
        traceId: requestTrace?.traceId ?? requestId,
        route: url.pathname,
        method: request.method,
        statusCode: 503,
        durationMs: Date.now() - requestStartedAt,
        service: runtimeStatus.runtimeId ?? "http-server",
      });
      sendJson(response, 503, {
        reason: "kill-switch-active",
        killedPaths: killSwitchDecision.killedPaths,
        triggeredBy: killSwitchDecision.triggeredBy,
        killSwitchDecision,
      });
      return;
    }
    if (url.pathname === "/api/projects" && (request.method === "GET" || request.method === "POST")) {
      const enforcement = buildProjectCollectionAccessEnforcement({
        request,
        pathname: url.pathname,
        projectService,
        userId: resolvedUserId,
      });
      if (enforcement) {
        observabilityTransport?.finishHttpRequest({
          traceId: requestTrace?.traceId ?? requestId,
          route: url.pathname,
          method: request.method,
          statusCode: enforcement.httpStatus,
          durationMs: Date.now() - requestStartedAt,
          service: runtimeStatus.runtimeId ?? "http-server",
        });
        sendJson(response, enforcement.httpStatus, enforcement.payload);
        return;
      }
    }
    if (routeDefinition.kind === "project-api" && workspaceId) {
      const enforcement = buildProjectAccessEnforcement({
        request,
        pathname: url.pathname,
        project: routedProject,
        userId: resolvedUserId,
      });
      if (enforcement) {
        observabilityTransport?.finishHttpRequest({
          traceId: requestTrace?.traceId ?? requestId,
          route: url.pathname,
          method: request.method,
          statusCode: enforcement.httpStatus,
          durationMs: Date.now() - requestStartedAt,
          service: runtimeStatus.runtimeId ?? "http-server",
        });
        sendJson(response, enforcement.httpStatus, enforcement.payload);
        return;
      }
    }
    const originalEnd = response.end.bind(response);
    response.end = (body) => {
      createRateLimitingAndAbuseProtection({
        requestContext: {
          ...baseRequestContext,
          phase: "response",
          responseStatusCode: response.statusCode ?? 200,
          timestamp: Date.now(),
        },
        routeDefinition,
        rateLimitStore,
      });
      observabilityTransport?.finishHttpRequest({
        traceId: requestTrace?.traceId ?? requestId,
        route: url.pathname,
        method: request.method,
        statusCode: response.statusCode ?? 200,
        durationMs: Date.now() - requestStartedAt,
        service: runtimeStatus.runtimeId ?? "http-server",
      });
      return originalEnd(body);
    };

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { healthStatus: runtimeStatus.healthStatus ?? null });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/readiness") {
      sendJson(response, 200, { readinessStatus: runtimeStatus.readinessStatus ?? null });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/observability") {
      sendJson(response, 200, {
        runtimeId: runtimeStatus.runtimeId ?? null,
        observability: getPlatformObservability(projectService),
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/audit-logs") {
      sendJson(response, 200, {
        auditLogs: typeof projectService.getSystemAuditLogs === "function"
          ? projectService.getSystemAuditLogs({
              projectId: url.searchParams.get("projectId") ?? null,
              workspaceId: url.searchParams.get("workspaceId") ?? null,
              category: url.searchParams.get("category") ?? null,
              actorId: url.searchParams.get("actorId") ?? null,
            })
          : [],
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/security-audit-logs") {
      sendJson(response, 200, {
        securityAuditLogs: typeof projectService.getSecurityAuditLogs === "function"
          ? projectService.getSecurityAuditLogs({
              projectId: url.searchParams.get("projectId") ?? null,
              workspaceId: url.searchParams.get("workspaceId") ?? null,
              eventType: url.searchParams.get("eventType") ?? null,
              severity: url.searchParams.get("severity") ?? null,
              actorId: url.searchParams.get("actorId") ?? null,
            })
          : [],
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/project-snapshots") {
      sendJson(response, 200, {
        projectSnapshots: typeof projectService.getProjectSnapshots === "function"
          ? projectService.getProjectSnapshots({
              projectId: url.searchParams.get("projectId") ?? null,
              workspaceId: url.searchParams.get("workspaceId") ?? null,
              triggerType: url.searchParams.get("triggerType") ?? null,
              reason: url.searchParams.get("reason") ?? null,
            })
          : [],
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/signup") {
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.signupUser({
        userInput: body.userInput,
        credentials: body.credentials,
      });
      sendJson(response, 201, result);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.loginUser({
        userInput: body.userInput,
        credentials: body.credentials,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "User not found" });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.logoutUser({
        userInput: body.userInput,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "User not found" });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/project-drafts") {
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.createProjectDraft({
        userInput: body.userInput,
        projectCreationInput: body.projectCreationInput,
      });
      sendJson(response, result ? 201 : 404, result ?? { error: "User not found" });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/onboarding/sessions") {
      const body = await parseBody(request).catch(() => ({}));
      const session = projectService.createOnboardingSession({
        userId: body.userId,
        projectDraftId: body.projectDraftId,
        initialInput: body.initialInput,
      });
      sendJson(response, 201, { onboardingSession: session });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/onboarding/intake") {
      const body = await parseBody(request).catch(() => ({}));
      const intake = projectService.createProjectIntake({
        visionText: body.visionText,
        uploadedFiles: body.uploadedFiles,
        externalLinks: body.externalLinks,
      });
      sendJson(response, 200, intake);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/onboarding/resolve-step") {
      const body = await parseBody(request).catch(() => ({}));
      const resolved = projectService.resolveOnboardingStep({
        sessionId: body.sessionId,
        projectIntake: body.projectIntake,
      });
      sendJson(response, resolved ? 200 : 404, resolved ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/onboarding/commands") {
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.handleOnboardingCommand({
        sessionId: body.sessionId,
        actionType: body.actionType,
        payload: body.payload,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Session not found" });
      return;
    }

    if (request.method === "PATCH" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/intake")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.updateOnboardingIntake({
        sessionId,
        visionText: body.visionText,
        uploadedFiles: body.uploadedFiles,
        externalLinks: body.externalLinks,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/files")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.uploadOnboardingFiles({
        sessionId,
        uploadedFiles: body.uploadedFiles,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Session not found" });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/step")) {
      const sessionId = segments[4];
      const step = projectService.getOnboardingCurrentStep(sessionId);
      sendJson(response, step ? 200 : 404, step ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/finish")) {
      const sessionId = segments[4];
      const result = projectService.finishOnboardingSession(sessionId);
      sendJson(response, result ? 200 : 404, result ?? { error: "Session not found" });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/onboarding/sessions/")) {
      const sessionId = segments[4];
      const session = projectService.getOnboardingSession(sessionId);
      sendJson(response, session ? 200 : 404, session ? { onboardingSession: session } : { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/proposal-edits")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.submitProposalEdits({
        projectId,
        userEditInput: body.userEditInput,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/partial-acceptance")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.submitPartialAcceptance({
        projectId,
        approvalOutcome: body.approvalOutcome,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (
      request.method === "POST"
      && url.pathname.startsWith("/api/workspaces/")
      && url.pathname.includes("/billing/")
    ) {
      const workspaceId = segments[3];
      const actionType = segments[5];
      if (!resolveRequestUserId(request)) {
        sendJson(response, 401, { error: "Authentication required" });
        return;
      }

      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.performWorkspaceBillingAction === "function"
        ? projectService.performWorkspaceBillingAction({
            workspaceId,
            actionType,
            billingInput: body,
            userId: resolveRequestUserId(request),
          })
        : null;

      if (!result) {
        sendJson(response, 404, { error: "Workspace not found" });
        return;
      }

      if (result.error) {
        sendJson(response, result.httpStatus ?? 400, { error: result.error });
        return;
      }

      sendJson(response, result.httpStatus ?? 200, result.billingPayload);
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/rollback-executions")) {
      const projectId = segments[3];
      const result = typeof projectService.executeProjectRollback === "function"
        ? projectService.executeProjectRollback({ projectId })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/snapshot-backup-schedule")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.configureSnapshotBackupSchedule === "function"
        ? projectService.configureSnapshotBackupSchedule({
            projectId,
            scheduleInput: body.scheduleInput,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/snapshot-backups/run")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.runSnapshotBackupNow === "function"
        ? projectService.runSnapshotBackupNow({
            projectId,
            triggerType: body.triggerType ?? "manual",
            reason: body.reason ?? null,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/snapshot-backup-worker")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.configureSnapshotBackupWorker === "function"
        ? projectService.configureSnapshotBackupWorker({
            projectId,
            workerInput: body.workerInput,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/snapshot-backup-worker/run")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.runSnapshotBackupWorkerTick === "function"
        ? projectService.runSnapshotBackupWorkerTick({
            projectId,
            triggerType: body.triggerType ?? "manual-worker-run",
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/snapshot-retention-policy")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.configureSnapshotRetentionPolicy === "function"
        ? projectService.configureSnapshotRetentionPolicy({
            projectId,
            retentionInput: body.retentionInput,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/snapshot-retention-cleanup")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.runSnapshotRetentionCleanup === "function"
        ? projectService.runSnapshotRetentionCleanup({
            projectId,
            triggerType: body.triggerType ?? "manual-cleanup",
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/business-continuity/actions")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.applyBusinessContinuityAction === "function"
        ? projectService.applyBusinessContinuityAction({
            projectId,
            actionInput: body.actionInput,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/presence")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.updateProjectPresence === "function"
        ? projectService.updateProjectPresence({
            projectId,
            presenceInput: body,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/review-threads")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.upsertProjectReviewThread === "function"
        ? projectService.upsertProjectReviewThread({
            projectId,
            threadInput: body,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/privacy-rights-requests")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.executePrivacyRightsRequest === "function"
        ? projectService.executePrivacyRightsRequest({
            projectId,
            privacyRequest: body.privacyRequest,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/projects") {
      sendJson(response, 200, { projects: projectService.listProjects() });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/projects/")) {
      const [, , , projectId, suffix] = url.pathname.split("/");

      if (!suffix) {
        const project = projectService.getProject(projectId);
        sendJson(response, project ? 200 : 404, project ?? { error: "Project not found" });
        return;
      }

      if (suffix === "events") {
        const project = projectService.getProject(projectId);
        sendJson(
          response,
          project ? 200 : 404,
          project ? { events: projectService.getProjectEvents(projectId) } : { error: "Project not found" },
        );
        return;
      }

      if (suffix === "live-state") {
        const liveState = getProjectLiveState(projectService, projectId);
        sendJson(
          response,
          liveState ? 200 : 404,
          liveState ?? { error: "Project not found" },
        );
        return;
      }

      if (suffix === "live-events") {
        const liveState = getProjectLiveState(projectService, projectId);
        if (!liveState) {
          sendJson(response, 404, { error: "Project not found" });
          return;
        }

        response.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        });

        let lastSnapshot = JSON.stringify(liveState);
        writeSseEvent(response, "live-state", liveState);

        const heartbeatInterval = setInterval(() => {
          const nextLiveState = getProjectLiveState(projectService, projectId);
          if (!nextLiveState) {
            return;
          }

          const nextSnapshot = JSON.stringify(nextLiveState);
          if (nextSnapshot !== lastSnapshot) {
            lastSnapshot = nextSnapshot;
            writeSseEvent(response, "live-state", nextLiveState);
            return;
          }

          response.write(": keep-alive\n\n");
        }, 1000);

        const cleanup = () => {
          clearInterval(heartbeatInterval);
          observabilityTransport?.finishHttpRequest({
            traceId: requestTrace?.traceId ?? requestId,
            route: url.pathname,
            method: request.method,
            statusCode: response.statusCode ?? 200,
            durationMs: Date.now() - requestStartedAt,
            service: runtimeStatus.runtimeId ?? "http-server",
          });
        };

        request.on?.("close", cleanup);
        response.on?.("close", cleanup);
        response.on?.("finish", cleanup);
        return;
      }

      if (suffix === "audit") {
        const projectAuditPayload = typeof projectService.getProjectAuditPayload === "function"
          ? projectService.getProjectAuditPayload(projectId, {
              actorId: url.searchParams.get("actorId") ?? null,
              actionType: url.searchParams.get("actionType") ?? null,
              sensitivity: url.searchParams.get("sensitivity") ?? null,
            })
          : null;
        sendJson(
          response,
          projectAuditPayload ? 200 : 404,
          projectAuditPayload ?? { error: "Project audit payload not found" },
        );
        return;
      }

      if (suffix === "business-continuity") {
        const continuityPayload = typeof projectService.getBusinessContinuityState === "function"
          ? projectService.getBusinessContinuityState({
              projectId,
              refresh: ["1", "true", "yes"].includes((url.searchParams.get("refresh") ?? "").toLowerCase()),
            })
          : null;
        sendJson(
          response,
          continuityPayload ? 200 : 404,
          continuityPayload ?? { error: "Project business continuity state not found" },
        );
        return;
      }

      if (suffix === "continuity-plan") {
        const continuityPlanPayload = typeof projectService.getContinuityPlan === "function"
          ? projectService.getContinuityPlan({
              projectId,
              refresh: ["1", "true", "yes"].includes((url.searchParams.get("refresh") ?? "").toLowerCase()),
            })
          : null;
        sendJson(
          response,
          continuityPlanPayload ? 200 : 404,
          continuityPlanPayload ?? { error: "Project continuity plan not found" },
        );
        return;
      }

      if (suffix === "disaster-recovery-checklist") {
        const checklistPayload = typeof projectService.getDisasterRecoveryChecklist === "function"
          ? projectService.getDisasterRecoveryChecklist({
              projectId,
              refresh: ["1", "true", "yes"].includes((url.searchParams.get("refresh") ?? "").toLowerCase()),
            })
          : null;
        sendJson(
          response,
          checklistPayload ? 200 : 404,
          checklistPayload ?? { error: "Project disaster recovery checklist not found" },
        );
        return;
      }

      if (suffix === "review-threads") {
        const reviewThreadState = typeof projectService.getProjectReviewThreadState === "function"
          ? projectService.getProjectReviewThreadState(projectId, {
              resourceType: url.searchParams.get("resourceType") ?? null,
              status: url.searchParams.get("status") ?? null,
              workspaceArea: url.searchParams.get("workspaceArea") ?? null,
            })
          : null;
        sendJson(
          response,
          reviewThreadState ? 200 : 404,
          reviewThreadState ? { reviewThreadState } : { error: "Project review threads not found" },
        );
        return;
      }

      if (suffix === "scan") {
        const project = projectService.getProject(projectId);
        sendJson(response, project ? 200 : 404, project ? { scan: project.scan } : { error: "Project not found" });
        return;
      }

      if (suffix === "analysis") {
        const project = projectService.getProject(projectId);
        sendJson(
          response,
          project ? 200 : 404,
          project ? { analysis: project.analysis } : { error: "Project not found" },
        );
        return;
      }

      if (suffix === "external") {
        const project = projectService.getProject(projectId);
        sendJson(
          response,
          project ? 200 : 404,
          project ? { externalSnapshot: project.externalSnapshot } : { error: "Project not found" },
        );
        return;
      }

      if (suffix === "git") {
        const project = projectService.getProject(projectId);
        sendJson(
          response,
          project ? 200 : 404,
          project ? { gitSnapshot: project.gitSnapshot, gitSource: project.gitSource } : { error: "Project not found" },
        );
        return;
      }

      if (suffix === "runtime") {
        const project = projectService.getProject(projectId);
        sendJson(
          response,
          project ? 200 : 404,
          project ? { runtimeSnapshot: project.runtimeSnapshot, runtimeSource: project.runtimeSource } : { error: "Project not found" },
        );
        return;
      }

      if (suffix === "notion") {
        const project = projectService.getProject(projectId);
        sendJson(
          response,
          project ? 200 : 404,
          project ? { notionSnapshot: project.notionSnapshot, notionSource: project.notionSource } : { error: "Project not found" },
        );
        return;
      }

      if (suffix === "release-tracking") {
        const releaseRunId = url.searchParams.get("releaseRunId");
        const result = projectService.getReleaseTracking(projectId, releaseRunId);
        if (!result) {
          sendJson(response, 404, { error: "Project not found" });
          return;
        }

        sendJson(
          response,
          result.error ? 404 : 200,
          result.error ? { error: result.error } : { releaseTrackingPayload: result },
        );
        return;
      }

      if (suffix === "diff-preview") {
        const executionRequestId = url.searchParams.get("executionRequestId");
        const result = projectService.getDiffPreview(projectId, executionRequestId);
        if (!result) {
          sendJson(response, 404, { error: "Project not found" });
          return;
        }

        sendJson(
          response,
          result.error ? 404 : 200,
          result.error ? { error: result.error } : { diffPreviewPayload: result },
        );
        return;
      }

      if (suffix === "policy") {
        const actionType = url.searchParams.get("actionType");
        const result = projectService.getPolicyPayload(projectId, actionType);
        if (!result) {
          sendJson(response, 404, { error: "Project not found" });
          return;
        }

        sendJson(
          response,
          result.error ? 404 : 200,
          result.error ? { error: result.error } : { policyPayload: result },
        );
        return;
      }
    }

    if (request.method === "POST" && url.pathname.endsWith("/run-cycle")) {
      const [, , , projectId] = url.pathname.split("/");
      const project = projectService.runCycle(projectId);
      sendJson(response, project ? 200 : 404, project ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/scan")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const scan = projectService.scanProject(projectId, body.path);
      const project = projectService.getProject(projectId);
      sendJson(response, scan && project ? 200 : 404, project ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/analyze")) {
      const [, , , projectId] = url.pathname.split("/");
      const project = await projectService.analyzeProject(projectId);
      sendJson(response, project ? 200 : 404, project ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/sync-casino")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const project = await projectService.syncCasinoProject(projectId, {
        baseUrl: body.baseUrl,
        apiKey: body.apiKey,
      });
      sendJson(response, project ? 200 : 404, project ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/connect-git")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const project = await projectService.connectGitProject(projectId, {
        provider: body.provider,
        owner: body.owner,
        repo: body.repo,
        apiKey: body.apiKey,
        host: body.host,
      });
      sendJson(response, project ? 200 : 404, project ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/sync-runtime")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const project = await projectService.syncRuntimeSources(projectId, {
        baseUrl: body.baseUrl,
        apiKey: body.apiKey,
      });
      sendJson(response, project ? 200 : 404, project ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/sync-notion")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const project = await projectService.syncNotionKnowledge(projectId, {
        apiKey: body.apiKey,
        pageIds: body.pageIds,
        host: body.host,
      });
      sendJson(response, project ? 200 : 404, project ?? { error: "Project not found" });
      return;
    }

    if (request.method === "GET" && url.pathname.endsWith("/accounts")) {
      const [, , , projectId] = url.pathname.split("/");
      const result = projectService.listExternalAccounts(projectId);
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/accounts/link")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.linkExternalAccount(projectId, {
        providerType: body.providerType,
        userInput: body.userInput,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/accounts/verify")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.verifyExternalAccount(projectId, {
        accountId: body.accountId,
        providerType: body.providerType,
      });
      if (!result) {
        sendJson(response, 404, { error: "Project not found" });
        return;
      }
      sendJson(response, result.verificationResult ? 200 : 404, result.verificationResult ? result : { error: result.error });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/accounts/rotate")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.rotateCredential(projectId, {
        credentialReference: body.credentialReference,
        rotationRequest: body.rotationRequest,
      });
      if (!result) {
        sendJson(response, 404, { error: "Project not found" });
        return;
      }
      sendJson(response, result.rotationResult?.status === "failed" ? 422 : 200, result);
      return;
    }

    if (request.method === "DELETE" && url.pathname.includes("/accounts/")) {
      const [, , , projectId, , accountId] = url.pathname.split("/");
      const result = projectService.unlinkExternalAccount(projectId, accountId);
      if (!result) {
        sendJson(response, 404, { error: "Project not found" });
        return;
      }
      sendJson(response, result.removed ? 200 : 404, result.removed ? result : { error: "Linked account not found" });
      return;
    }

    if (request.method === "GET" && url.pathname.endsWith("/approvals")) {
      const [, , , projectId] = url.pathname.split("/");
      const result = projectService.listApprovals(projectId);
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/approvals/approve")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.captureApproval(projectId, {
        approvalRequestId: body.approvalRequestId,
        userInput: {
          ...(body.userInput ?? {}),
          decision: "approved",
          actorRole: body.userInput?.actorRole ?? null,
          actorName: body.userInput?.actorName ?? null,
        },
      });
      if (!result) {
        sendJson(response, 404, { error: "Project not found" });
        return;
      }
      sendJson(response, result.error ? 404 : 200, result.error ? { error: result.error } : result);
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/approvals/reject")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.captureApproval(projectId, {
        approvalRequestId: body.approvalRequestId,
        userInput: {
          ...(body.userInput ?? {}),
          decision: "rejected",
          actorRole: body.userInput?.actorRole ?? null,
          actorName: body.userInput?.actorName ?? null,
        },
      });
      if (!result) {
        sendJson(response, 404, { error: "Project not found" });
        return;
      }
      sendJson(response, result.error ? 404 : 200, result.error ? { error: result.error } : result);
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/approvals/revoke")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.revokeApproval(projectId, {
        approvalRequestId: body.approvalRequestId,
        userInput: body.userInput,
      });
      if (!result) {
        sendJson(response, 404, { error: "Project not found" });
        return;
      }
      sendJson(response, result.error ? 404 : 200, result.error ? { error: result.error } : result);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/projects") {
      const body = await parseBody(request).catch(() => null);
      if (!body?.id || !body?.name || !body?.goal) {
        sendJson(response, 400, { error: "id, name, and goal are required" });
        return;
      }

      projectService.createProject({
        id: body.id,
        name: body.name,
        goal: body.goal,
        path: body.path,
        stack: body.stack,
        state: body.state,
        agents: body.agents,
        approvals: body.approvals,
        approvalRecords: body.approvalRecords,
        gitSource: body.gitSource,
        runtimeSource: body.runtimeSource,
        notionSource: body.notionSource,
        source: body.source,
      });

      sendJson(response, 201, projectService.runCycle(body.id));
      return;
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      sendFile(response, path.join(publicDir, "index.html"));
      return;
    }

    if (request.method === "GET" && url.pathname === "/app.js") {
      sendFile(response, path.join(publicDir, "app.js"));
      return;
    }

    if (request.method === "GET" && url.pathname === "/styles.css") {
      sendFile(response, path.join(publicDir, "styles.css"));
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { applicationRuntime } = createApplicationServerBootstrap({
    runtimeConfig: {
      rootDir: path.resolve(__dirname, ".."),
    },
    createServer,
  });
  const { server, port, host } = applicationRuntime;
  server.listen(port, host, () => {
    console.log(`The Nexus cockpit is running at http://${host}:${port}`);
  });
}
