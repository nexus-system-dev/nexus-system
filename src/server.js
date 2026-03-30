import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createApplicationServerBootstrap } from "./core/application-server-bootstrap.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../web");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
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
  return segments[1] === "api" && segments[2] === "projects" ? segments[3] ?? null : null;
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
    events: project.events ?? [],
  };
}

function writeSseEvent(response, eventName, payload) {
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function createServer(projectService, runtimeStatus = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const segments = url.pathname.split("/");
    const observabilityTransport = getObservabilityTransport(projectService);
    const requestId = request.headers?.["x-request-id"] ?? `${request.method ?? "GET"}:${url.pathname}:${Date.now()}`;
    const requestStartedAt = Date.now();
    const requestTrace = observabilityTransport?.startHttpRequest({
      requestId,
      route: url.pathname,
      method: request.method,
      workspaceId: resolveWorkspaceId(url.pathname),
      service: runtimeStatus.runtimeId ?? "http-server",
    });
    const originalEnd = response.end.bind(response);
    response.end = (body) => {
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
