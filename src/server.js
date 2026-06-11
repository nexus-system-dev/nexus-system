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
const projectRootDir = path.resolve(__dirname, "..");

function loadLocalEnvironmentFile(filePath = path.join(projectRootDir, ".env")) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] != null) {
      continue;
    }

    if (
      (value.startsWith("\"") && value.endsWith("\""))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadLocalEnvironmentFile();

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
        : ext === ".json"
          ? "application/json; charset=utf-8"
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

function resolveRequestUserId(request, url = null) {
  const headerValue = request.headers?.["x-user-id"];
  if (typeof headerValue === "string" && headerValue.trim().length > 0) {
    return headerValue.trim();
  }

  if (url?.pathname?.endsWith?.("/live-events")) {
    const liveEventUserId = url.searchParams?.get?.("userId");
    return typeof liveEventUserId === "string" && liveEventUserId.trim().length > 0
      ? liveEventUserId.trim()
      : null;
  }

  return null;
}

function parseCookieHeader(cookieHeader) {
  if (typeof cookieHeader !== "string" || !cookieHeader.trim()) {
    return {};
  }

  return Object.fromEntries(cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex === -1) {
        return [entry, ""];
      }
      return [
        decodeURIComponent(entry.slice(0, separatorIndex).trim()),
        decodeURIComponent(entry.slice(separatorIndex + 1).trim()),
      ];
    }));
}

function resolveRequestSessionToken(request) {
  const authorization = request.headers?.authorization ?? request.headers?.Authorization;
  if (typeof authorization === "string" && authorization.trim()) {
    const match = authorization.trim().match(/^Bearer\s+(.+)$/i);
    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  const directHeader = request.headers?.["x-session-token"]
    ?? request.headers?.["X-Session-Token"]
    ?? request.headers?.["x-nexus-session-token"]
    ?? request.headers?.["X-Nexus-Session-Token"];
  if (typeof directHeader === "string" && directHeader.trim()) {
    return directHeader.trim();
  }

  const cookies = parseCookieHeader(request.headers?.cookie ?? request.headers?.Cookie);
  return typeof cookies.nexus_access_token === "string" && cookies.nexus_access_token.trim()
    ? cookies.nexus_access_token.trim()
    : null;
}

function resolveVerifiedRequestIdentity(projectService, request) {
  const token = resolveRequestSessionToken(request);
  if (!token) {
    return {
      verified: false,
      reason: "session-token-missing",
      userId: null,
      sessionId: null,
      authPayload: null,
      legacyUserId: resolveRequestUserId(request),
    };
  }

  const result = typeof projectService?.verifySessionToken === "function"
    ? projectService.verifySessionToken(token)
    : null;
  if (!result?.verified || !result.userId) {
    return {
      verified: false,
      reason: result?.reason ?? "session-token-invalid",
      userId: null,
      sessionId: result?.sessionId ?? null,
      authPayload: result?.authPayload ?? null,
      legacyUserId: resolveRequestUserId(request),
    };
  }

  return {
    verified: true,
    reason: result.reason ?? "verified-session-token",
    userId: result.userId,
    sessionId: result.sessionId ?? null,
    authPayload: result.authPayload ?? null,
    legacyUserId: resolveRequestUserId(request),
  };
}

function buildAuthCookieHeaders(authPayload) {
  const accessToken = authPayload?.tokenBundle?.accessToken;
  const expiresAt = authPayload?.tokenBundle?.expiresAt;
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    return {};
  }

  const parts = [
    `nexus_access_token=${encodeURIComponent(accessToken.trim())}`,
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (expiresAt && !Number.isNaN(Date.parse(expiresAt))) {
    parts.push(`Expires=${new Date(expiresAt).toUTCString()}`);
  }
  return { "Set-Cookie": parts.join("; ") };
}

function buildClearAuthCookieHeaders() {
  return {
    "Set-Cookie": "nexus_access_token=; Path=/; SameSite=Lax; HttpOnly; Max-Age=0",
  };
}

function resolveRequestActorType(request, project = null, userId = null) {
  if (!userId) {
    return "viewer";
  }

  const ownerUserId =
    project?.state?.workspaceModel?.ownerUserId
    ?? project?.context?.workspaceModel?.ownerUserId
    ?? project?.userId
    ?? null;

  if (ownerUserId && ownerUserId === userId) {
    return "owner";
  }

  const membershipRecords = [
    project?.state?.membershipRecord,
    project?.context?.membershipRecord,
    ...(Array.isArray(project?.state?.workspaceModel?.members) ? project.state.workspaceModel.members : []),
    ...(Array.isArray(project?.context?.workspaceModel?.members) ? project.context.workspaceModel.members : []),
  ].filter(Boolean);
  const membershipRecord = membershipRecords.find((record) => (
    record?.userId === userId
    || record?.memberUserId === userId
    || record?.actorId === userId
  ));
  const membershipRole = typeof membershipRecord?.role === "string" && membershipRecord.role.trim()
    ? membershipRecord.role.trim().toLowerCase()
    : Array.isArray(membershipRecord?.roles) && membershipRecord.roles[0]
      ? String(membershipRecord.roles[0]).trim().toLowerCase()
      : null;

  return membershipRole || "viewer";
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

  if (
    verb === "GET"
    && (
      route === "/api/projects"
      || /^\/api\/projects\/[^/]+$/.test(route)
      || /^\/api\/projects\/[^/]+\/live-state$/.test(route)
      || /^\/api\/onboarding\/sessions\/[^/]+$/.test(route)
      || /^\/api\/onboarding\/sessions\/[^/]+\/conversation$/.test(route)
      || /^\/api\/onboarding\/sessions\/[^/]+\/step$/.test(route)
    )
  ) {
    return {
      method: verb,
      path: route,
      tier: "restore",
      kind: "restore-read",
      bucketKey: route === "/api/projects"
        ? "/api/projects"
        : route.includes("/live-state")
          ? "/api/projects/*/live-state"
          : route.startsWith("/api/projects/")
            ? "/api/projects/*"
            : route.endsWith("/conversation")
              ? "/api/onboarding/sessions/*/conversation"
              : route.endsWith("/step")
                ? "/api/onboarding/sessions/*/step"
                : "/api/onboarding/sessions/*",
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

function getProjectLiveState(projectService, projectId, { userId = null } = {}) {
  const project = projectService.getProject(projectId, { userId });
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
    if (suffix === "proposal-edits" || suffix === "presence" || suffix === "review-threads" || suffix === "privacy-rights-requests" || suffix === "build-mutations" || suffix === "skeleton-choice/select" || suffix === "history-continuity/restore-decision" || suffix === "growth-agent" || suffix === "growth-measurement") {
      return "edit";
    }

    if (suffix === "run-cycle") {
      return "run";
    }

    if (suffix === "partial-acceptance" || suffix === "approvals/approve" || suffix === "approvals/reject" || suffix === "approvals/revoke" || suffix === "build-approval/decide") {
      return "approve";
    }

    if (suffix === "rollback-executions" || suffix === "snapshot-backup-schedule" || suffix === "snapshot-backups/run" || suffix === "snapshot-backup-worker" || suffix === "snapshot-backup-worker/run" || suffix === "snapshot-retention-policy" || suffix === "snapshot-retention-cleanup" || suffix === "business-continuity/actions" || suffix === "scan" || suffix === "analyze" || suffix === "sync-casino" || suffix === "connect-git" || suffix === "sync-runtime" || suffix === "sync-notion") {
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

function buildProjectAccessEnforcement({
  request,
  pathname,
  project = null,
  userId = null,
  allowScopedReviewBypass = false,
  allowViewAuthorizationBypass = false,
} = {}) {
  if (!project) {
    return {
      httpStatus: 404,
      payload: {
        error: "Project not found",
        reason: "project-not-found",
      },
    };
  }

  if (!project?.state?.roleCapabilityMatrix || !project?.state?.tenantIsolationSchema) {
    return {
      httpStatus: 403,
      payload: {
        error: "Security boundary unavailable",
        reason: "security-boundary-missing",
      },
    };
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
    projectAction === "deploy"
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

  if (
    workspaceIsolationDecision.isBlocked === true
    || (workspaceIsolationDecision.requiresScopedReview === true && allowScopedReviewBypass !== true)
  ) {
    return {
      httpStatus: 403,
      payload: {
        error: "Workspace isolation violation",
        reason: "workspace-isolation-blocked",
        workspaceIsolationDecision,
      },
    };
  }

  if (
    projectAuthorizationDecision.isBlocked === true
    && !(allowViewAuthorizationBypass === true && projectAction === "view")
  ) {
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
    const verifiedRequestIdentity = resolveVerifiedRequestIdentity(projectService, request);
    const resolvedUserId = verifiedRequestIdentity.userId;
    const baseRequestContext = {
      requestId,
      pathName: url.pathname,
      method: request.method ?? "GET",
      ipAddress: resolveIpAddress(request),
      timestamp: requestTimestamp,
      userId: resolvedUserId,
      sessionId: verifiedRequestIdentity.sessionId,
      authStatus: verifiedRequestIdentity.verified ? "verified" : "unverified",
      legacyUserId: verifiedRequestIdentity.legacyUserId,
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
    const isProjectScopedRestoreRead =
      routeDefinition.kind === "restore-read"
      && workspaceId
      && url.pathname.startsWith("/api/projects/")
      && url.pathname !== "/api/projects";
    if ((routeDefinition.kind === "project-api" || isProjectScopedRestoreRead) && workspaceId) {
      const enforcement = buildProjectAccessEnforcement({
        request,
        pathname: url.pathname,
        project: routedProject,
        userId: resolvedUserId,
        allowScopedReviewBypass: isProjectScopedRestoreRead,
        allowViewAuthorizationBypass: isProjectScopedRestoreRead,
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
      sendJson(response, 201, result, buildAuthCookieHeaders(result?.authPayload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.loginUser({
        userInput: body.userInput,
        credentials: body.credentials,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "User not found" }, buildAuthCookieHeaders(result?.authPayload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.logoutUser({
        userInput: body.userInput,
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "User not found" }, buildClearAuthCookieHeaders());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/team-invitations/accept") {
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.acceptProjectInvitation === "function"
        ? projectService.acceptProjectInvitation(body.projectId, {
            actorUserId: resolvedUserId ?? body.userId ?? null,
            email: body.email ?? null,
            invitationId: body.invitationId ?? null,
          })
        : null;
      sendJson(response, result?.httpStatus ?? 404, result ?? { error: "Invitation not found" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/settings-profile") {
      const userId = resolvedUserId;
      if (!userId) {
        sendJson(response, 401, { error: "Authentication required" });
        return;
      }

      const settingsSurface = typeof projectService.buildAccountSettingsSurface === "function"
        ? projectService.buildAccountSettingsSurface(userId)
        : null;
      if (!settingsSurface) {
        sendJson(response, 404, { error: "User not found" });
        return;
      }

      sendJson(response, 200, settingsSurface);
      return;
    }

    if (request.method === "PUT" && url.pathname === "/api/settings-profile") {
      const userId = resolvedUserId;
      if (!userId) {
        sendJson(response, 401, { error: "Authentication required" });
        return;
      }

      const body = await parseBody(request).catch(() => ({}));
      if (body.profileInput) {
        projectService.updateUserProfile({
          userInput: { userId },
          profileInput: body.profileInput,
        });
      }
      if (body.settingsInput) {
        projectService.updateWorkspaceSettings({
          userInput: { userId },
          settingsInput: body.settingsInput,
        });
      }
      if (body.notificationInput) {
        projectService.updateNotificationPreferences({
          userInput: { userId },
          preferenceInput: body.notificationInput,
        });
      }

      const settingsSurface = typeof projectService.buildAccountSettingsSurface === "function"
        ? projectService.buildAccountSettingsSurface(userId)
        : null;
      if (!settingsSurface) {
        sendJson(response, 404, { error: "User not found" });
        return;
      }

      sendJson(response, 200, settingsSurface);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/account/actions") {
      const userId = resolvedUserId;
      if (!userId) {
        sendJson(response, 401, { error: "Authentication required" });
        return;
      }

      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.applyAccountAction === "function"
        ? projectService.applyAccountAction({
            userId,
            actorUserId: userId,
            actionType: body.actionType,
            payload: body.payload,
          })
        : null;
      if (!result) {
        sendJson(response, 404, { error: "User not found" });
        return;
      }
      const statusCode = result.status === "blocked" ? 409 : 200;
      sendJson(response, statusCode, {
        status: result.status,
        accountEvent: result.accountEvent,
        settingsProfileSurface: result.settingsProfileSurface,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/project-drafts") {
      if (!resolvedUserId) {
        sendJson(response, 401, { error: "Authentication required", reason: "authentication-required" });
        return;
      }
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.createProjectDraft({
        userInput: {
          ...(body.userInput && typeof body.userInput === "object" ? body.userInput : {}),
          userId: resolvedUserId,
        },
        projectCreationInput: body.projectCreationInput,
      });
      sendJson(response, result ? 201 : 404, result ?? { error: "User not found" });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/onboarding/sessions") {
      const body = await parseBody(request).catch(() => ({}));
      const session = projectService.createOnboardingSession({
        userId: resolvedUserId ?? body.userId,
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
        projectName: body.projectName,
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

    if (request.method === "GET" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/conversation")) {
      const sessionId = segments[4];
      const conversation = projectService.getOnboardingConversationState(sessionId);
      sendJson(response, conversation ? 200 : 404, conversation ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/conversation-turn")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      const conversation = await projectService.submitOnboardingConversationTurn({
        sessionId,
        answer: body.answer,
        qaFaultMode: body.qaFaultMode,
        clientMessageId: body.clientMessageId,
      });
      sendJson(response, conversation ? 200 : 404, conversation ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/conversation-prime")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      const conversation = await projectService.primeOnboardingDiscoveryAgentResponse({
        sessionId,
        qaFaultMode: body.qaFaultMode,
      });
      sendJson(response, conversation ? 200 : 404, conversation ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/product-skeleton")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      const skeleton = typeof projectService.generateOnboardingProductSkeleton === "function"
        ? await projectService.generateOnboardingProductSkeleton({
          sessionId,
          qaFaultMode: body.qaFaultMode,
        })
        : null;
      sendJson(response, skeleton ? 200 : 404, skeleton ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/visual-product-skeleton")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      const visualSkeleton = typeof projectService.generateOnboardingVisualProductSkeleton === "function"
        ? await projectService.generateOnboardingVisualProductSkeleton({
          sessionId,
          qaFaultMode: body.qaFaultMode,
        })
        : null;
      sendJson(response, visualSkeleton ? 200 : 404, visualSkeleton ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/conversation-turn-stream")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      response.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
      response.flushHeaders?.();

      const heartbeat = setInterval(() => {
        writeSseEvent(response, "heartbeat", { sessionId, ok: true });
      }, 15000);

      try {
        const conversation = await projectService.streamOnboardingConversationTurn({
          sessionId,
          answer: body.answer,
          qaFaultMode: body.qaFaultMode,
          clientMessageId: body.clientMessageId,
          onEvent: async ({ event, data }) => {
            writeSseEvent(response, event, data);
          },
        });

        if (!conversation) {
          writeSseEvent(response, "error", {
            message: "Session not found",
            retryable: false,
          });
        }
      } catch (error) {
        writeSseEvent(response, "error", {
          message: error?.message ?? "stream_failed",
          retryable: false,
        });
      } finally {
        clearInterval(heartbeat);
        response.end();
      }
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/conversation-restart")) {
      const sessionId = segments[4];
      const conversation = projectService.restartOnboardingConversation(sessionId);
      sendJson(response, conversation ? 200 : 404, conversation ?? { error: "Session not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/onboarding/sessions/") && url.pathname.endsWith("/correction")) {
      const sessionId = segments[4];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.applyOnboardingCompanionCorrection === "function"
        ? await projectService.applyOnboardingCompanionCorrection({
          sessionId,
          message: body.message,
          currentSurface: body.currentSurface,
          projectId: body.projectId ?? null,
          qaFaultMode: body.qaFaultMode,
        })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Session not found" });
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

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/build-mutations")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.applyBuildMutation({
        projectId,
        requestText: body.requestText,
        operationId: body.operationId,
        payload: body.payload,
        requestedBy: body.requestedBy ?? "build-agent",
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/skeleton-choice/select")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.selectSkeletonChoice === "function"
        ? projectService.selectSkeletonChoice({
            projectId,
            candidateId: body.candidateId,
            selectedBy: body.selectedBy ?? "user",
            approveDirectionSwitch: body.approveDirectionSwitch === true,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/history-continuity/restore-decision")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.requestHistoryRestoreDecision === "function"
        ? projectService.requestHistoryRestoreDecision({
            projectId,
            checkpointId: body.checkpointId,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/growth-agent")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.runGrowthAgent === "function"
        ? projectService.runGrowthAgent({
            projectId,
            userInput: body.userInput ?? body.requestText ?? "",
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/growth-measurement")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.recordGrowthMeasurement === "function"
        ? projectService.recordGrowthMeasurement({
            projectId,
            record: body.record ?? body.measurementRecord ?? body,
            externalAction: body.externalAction ?? null,
            shareApproved: body.shareApproved === true,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/history-continuity/restore-execution")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.executeHistoryRestore === "function"
        ? projectService.executeHistoryRestore({
            projectId,
            checkpointId: body.checkpointId,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/share-demo/prepare")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.prepareShareDemo === "function"
        ? projectService.prepareShareDemo({
            projectId,
            input: body,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/share-demo/approve")) {
      const projectId = segments[3];
      const result = typeof projectService.approveShareDemo === "function"
        ? projectService.approveShareDemo({ projectId })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/share-demo/revoke")) {
      const projectId = segments[3];
      const result = typeof projectService.revokeShareDemo === "function"
        ? projectService.revokeShareDemo({ projectId })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/build-approval/decide")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.decideBuildApproval === "function"
        ? projectService.decideBuildApproval({
            projectId,
            action: body.action,
          })
        : null;
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/team/invitations")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.inviteProjectMember === "function"
        ? projectService.inviteProjectMember(projectId, {
            actorUserId: resolvedUserId,
            invitationRequest: body.invitationRequest ?? body,
          })
        : null;
      sendJson(response, result?.httpStatus ?? 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/team/remove-member")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.removeProjectMember === "function"
        ? projectService.removeProjectMember(projectId, {
            actorUserId: resolvedUserId,
            memberUserId: body.memberUserId ?? null,
          })
        : null;
      sendJson(response, result?.httpStatus ?? 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/team/transfer-ownership")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.transferProjectOwnership === "function"
        ? projectService.transferProjectOwnership(projectId, {
            actorUserId: resolvedUserId,
            nextOwnerUserId: body.nextOwnerUserId ?? null,
          })
        : null;
      sendJson(response, result?.httpStatus ?? 404, result ?? { error: "Project not found" });
      return;
    }

    if (
      request.method === "POST"
      && url.pathname.startsWith("/api/workspaces/")
      && url.pathname.includes("/billing/")
    ) {
      const workspaceId = segments[3];
      const actionType = segments[5];
      if (!resolvedUserId) {
        sendJson(response, 401, { error: "Authentication required" });
        return;
      }

      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.performWorkspaceBillingAction === "function"
        ? projectService.performWorkspaceBillingAction({
            workspaceId,
            actionType,
            billingInput: body,
            userId: resolvedUserId,
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

    if (request.method === "POST" && url.pathname.startsWith("/api/projects/") && url.pathname.endsWith("/companion-turn")) {
      const projectId = segments[3];
      const body = await parseBody(request).catch(() => ({}));
      const result = typeof projectService.submitProjectCompanionTurn === "function"
        ? await projectService.submitProjectCompanionTurn({
            projectId,
            sessionId: body.sessionId,
            message: body.message,
            currentSurface: body.currentSurface,
            qaFaultMode: body.qaFaultMode,
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
      sendJson(response, 200, { projects: projectService.listProjects({ userId: resolvedUserId }) });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/projects/")) {
      const [, , , projectId, suffix] = url.pathname.split("/");
      if (!resolvedUserId) {
        sendJson(response, 401, { error: "Authentication required", reason: "authentication-required" });
        return;
      }

      const scopedProject = projectService.getProject(projectId, { userId: resolvedUserId });
      if (!scopedProject) {
        sendJson(response, 404, { error: "Project not found" });
        return;
      }

      if (!suffix) {
        sendJson(response, 200, scopedProject);
        return;
      }

      if (suffix === "events") {
        sendJson(
          response,
          200,
          { events: projectService.getProjectEvents(projectId) },
        );
        return;
      }

      if (suffix === "team") {
        const result = typeof projectService.getProjectTeamBoundary === "function"
          ? projectService.getProjectTeamBoundary(projectId, { userId: resolvedUserId })
          : null;
        sendJson(response, result ? 200 : 404, result ?? { error: "Project team not found" });
        return;
      }

      if (suffix === "live-state") {
        const liveState = getProjectLiveState(projectService, projectId, { userId: resolvedUserId });
        sendJson(
          response,
          liveState ? 200 : 404,
          liveState ?? { error: "Project not found" },
        );
        return;
      }

      if (suffix === "live-events") {
        const liveState = getProjectLiveState(projectService, projectId, { userId: resolvedUserId });
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
          const nextLiveState = getProjectLiveState(projectService, projectId, { userId: resolvedUserId });
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
        sendJson(response, 200, { scan: scopedProject.scan });
        return;
      }

      if (suffix === "analysis") {
        sendJson(
          response,
          200,
          { analysis: scopedProject.analysis },
        );
        return;
      }

      if (suffix === "external") {
        sendJson(
          response,
          200,
          { externalSnapshot: scopedProject.externalSnapshot },
        );
        return;
      }

      if (suffix === "git") {
        sendJson(
          response,
          200,
          { gitSnapshot: scopedProject.gitSnapshot, gitSource: scopedProject.gitSource },
        );
        return;
      }

      if (suffix === "runtime") {
        sendJson(
          response,
          200,
          { runtimeSnapshot: scopedProject.runtimeSnapshot, runtimeSource: scopedProject.runtimeSource },
        );
        return;
      }

      if (suffix === "notion") {
        sendJson(
          response,
          200,
          { notionSnapshot: scopedProject.notionSnapshot, notionSource: scopedProject.notionSource },
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

    if (request.method === "POST" && url.pathname.endsWith("/provider-gateway/evaluate")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.evaluateProviderGateway(projectId, {
        requestText: body.requestText,
        providerType: body.providerType,
        capability: body.capability,
        approval: body.approval,
        actor: {
          actorId: resolvedUserId,
          role: resolveRequestActorType(request, routedProject, resolvedUserId),
        },
      });
      sendJson(response, result ? 200 : 404, result ?? { error: "Project not found" });
      return;
    }

    if (request.method === "POST" && url.pathname.endsWith("/provider-gateway/creative-assets")) {
      const [, , , projectId] = url.pathname.split("/");
      const body = await parseBody(request).catch(() => ({}));
      const result = projectService.normalizeCreativeProviderAsset(projectId, {
        providerType: body.providerType,
        assetType: body.assetType,
        prompt: body.prompt,
        sourceAssetId: body.sourceAssetId,
        packageId: body.packageId,
        approvalState: body.approvalState,
        usageBoundary: body.usageBoundary,
        licenseBoundary: body.licenseBoundary,
      });
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
        userId: resolvedUserId,
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

    if (request.method === "GET" && url.pathname.startsWith("/nexus-ui/")) {
      const relativeAssetPath = url.pathname.replace(/^\/+/, "");
      const resolvedAssetPath = path.resolve(publicDir, relativeAssetPath);
      if (!resolvedAssetPath.startsWith(path.resolve(publicDir, "nexus-ui"))) {
        sendJson(response, 403, { error: "Forbidden" });
        return;
      }
      if (!fs.existsSync(resolvedAssetPath) || fs.statSync(resolvedAssetPath).isDirectory()) {
        sendJson(response, 404, { error: "Not found" });
        return;
      }
      sendFile(response, resolvedAssetPath);
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/shared/")) {
      const relativeAssetPath = url.pathname.replace(/^\/+/, "");
      const resolvedAssetPath = path.resolve(publicDir, relativeAssetPath);
      if (!resolvedAssetPath.startsWith(path.resolve(publicDir, "shared"))) {
        sendJson(response, 403, { error: "Forbidden" });
        return;
      }
      if (!fs.existsSync(resolvedAssetPath) || fs.statSync(resolvedAssetPath).isDirectory()) {
        sendJson(response, 404, { error: "Not found" });
        return;
      }
      sendFile(response, resolvedAssetPath);
      return;
    }

    if (
      request.method === "GET"
      && !url.pathname.startsWith("/api/")
      && path.extname(url.pathname) === ""
    ) {
      sendFile(response, path.join(publicDir, "index.html"));
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
