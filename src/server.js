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

export function createServer(projectService, runtimeStatus = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const segments = url.pathname.split("/");

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { healthStatus: runtimeStatus.healthStatus ?? null });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/readiness") {
      sendJson(response, 200, { readinessStatus: runtimeStatus.readinessStatus ?? null });
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
