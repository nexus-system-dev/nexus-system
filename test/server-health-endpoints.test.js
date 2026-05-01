import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";

function requestJson(server, pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const request = new EventEmitter();
    request.method = options.method ?? "GET";
    request.url = pathname;
    const defaultHeaders = !options.disableDefaultProjectAuth && pathname.startsWith("/api/projects/")
      ? { "x-user-id": "demo-user" }
      : {};
    request.headers = {
      ...defaultHeaders,
      ...(options.headers ?? {}),
    };
    request.socket = {
      remoteAddress: options.ipAddress ?? "127.0.0.1",
    };

    const response = {
      statusCode: 200,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(body) {
        try {
          resolve({
            statusCode: this.statusCode,
            body: JSON.parse(body),
            headers: this.headers,
          });
        } catch (error) {
          reject(error);
        }
      },
    };

    server.emit("request", request, response);
  });
}

function requestJsonWithBody(server, method, pathname, payload, options = {}) {
  return new Promise((resolve, reject) => {
    const request = new EventEmitter();
    request.method = method;
    request.url = pathname;
    const defaultHeaders = !options.disableDefaultProjectAuth && pathname.startsWith("/api/projects/")
      ? { "x-user-id": "demo-user" }
      : {};
    request.headers = {
      "content-type": "application/json",
      ...defaultHeaders,
      ...(options.headers ?? {}),
    };
    request.socket = {
      remoteAddress: options.ipAddress ?? "127.0.0.1",
    };

    const response = {
      statusCode: 200,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(body) {
        try {
          resolve({
            statusCode: this.statusCode,
            body: JSON.parse(body),
            headers: this.headers,
          });
        } catch (error) {
          reject(error);
        }
      },
    };

    server.emit("request", request, response);
    request.emit("data", Buffer.from(JSON.stringify(payload)));
    request.emit("end");
  });
}

test("server exposes health and readiness endpoints", async () => {
  const server = createServer(
    {
      listProjects: () => [],
    },
    {
      healthStatus: {
        status: "healthy",
        isHealthy: true,
      },
      readinessStatus: {
        status: "ready",
        isReady: true,
      },
    },
  );
  const healthResponse = await requestJson(server, "/api/health");
  const readinessResponse = await requestJson(server, "/api/readiness");

  assert.equal(healthResponse.statusCode, 200);
  assert.equal(healthResponse.body.healthStatus.status, "healthy");
  assert.equal(readinessResponse.statusCode, 200);
  assert.equal(readinessResponse.body.readinessStatus.status, "ready");
});

test("server exposes observability endpoint and records request traces", async () => {
  const projectService = {
    platformObservabilityTransport: {
      traces: [],
      logs: [],
      startHttpRequest({ requestId, route, method, workspaceId, service }) {
        this.traces.push({
          traceId: requestId,
          route,
          method,
          workspaceId,
          service,
          status: "running",
        });

        return { traceId: requestId };
      },
      finishHttpRequest({ traceId, statusCode }) {
        this.logs.push({
          traceId,
          statusCode,
        });
      },
    },
    getPlatformObservability() {
      return {
        platformTraces: this.platformObservabilityTransport.traces,
        platformLogs: this.platformObservabilityTransport.logs,
        summary: {
          totalTraces: this.platformObservabilityTransport.traces.length,
          totalLogs: this.platformObservabilityTransport.logs.length,
        },
      };
    },
    listProjects: () => [],
  };
  const server = createServer(projectService, {
    runtimeId: "application-runtime-1",
  });

  const observabilityResponse = await requestJson(server, "/api/observability");

  assert.equal(observabilityResponse.statusCode, 200);
  assert.equal(observabilityResponse.body.observability.summary.totalTraces, 1);
  assert.equal(observabilityResponse.body.observability.summary.totalLogs, 0);

  const healthResponse = await requestJson(server, "/api/health");
  const finalSnapshot = projectService.getPlatformObservability();

  assert.equal(healthResponse.statusCode, 200);
  assert.equal(finalSnapshot.summary.totalTraces, 2);
  assert.equal(finalSnapshot.summary.totalLogs, 2);
  assert.equal(finalSnapshot.platformTraces[0].route, "/api/observability");
});

test("server exposes audit logs endpoint", async () => {
  const server = createServer({
    getSystemAuditLogs: ({ category }) => category === "security"
      ? [{ auditLogId: "audit-1", category: "security" }]
      : [],
  });

  const response = await requestJson(server, "/api/audit-logs?category=security");

  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.body.auditLogs), true);
  assert.equal(response.body.auditLogs[0].auditLogId, "audit-1");
});

test("server exposes dedicated security audit logs endpoint", async () => {
  const server = createServer({
    getSecurityAuditLogs: ({ eventType }) => eventType === "policy_violation"
      ? [{ securityAuditId: "security-audit-1", eventType: "policy_violation" }]
      : [],
  });

  const response = await requestJson(server, "/api/security-audit-logs?eventType=policy_violation");

  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.body.securityAuditLogs), true);
  assert.equal(response.body.securityAuditLogs[0].securityAuditId, "security-audit-1");
});

test("server exposes project data privacy classification via GET project", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-privacy-server-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  service.seedDemoProject();
  const project = service.projects.get("giftwallet");
  project.state = {
    ...(project.state ?? {}),
    featureFlagSchema: null,
    incidentAlert: null,
    context: {
      ...(project.state?.context ?? {}),
      featureFlagSchema: null,
      incidentAlert: null,
    },
  };
  project.context = {
    ...(project.context ?? {}),
    featureFlagSchema: null,
    incidentAlert: null,
  };
  const server = createServer(service);

  const response = await requestJson(server, "/api/projects/giftwallet");

  assert.equal(response.statusCode, 200);
  assert.equal(typeof response.body.context?.dataPrivacyClassification?.classificationId, "string");
  assert.equal(typeof response.body.state?.dataPrivacyClassification?.classificationId, "string");
  assert.equal(typeof response.body.context?.agentGovernancePolicy?.agentType, "string");
  assert.equal(typeof response.body.state?.agentGovernancePolicy?.agentType, "string");
  assert.equal(Array.isArray(response.body.state.agentGovernancePolicy.allowedTools), true);
  assert.equal(typeof response.body.context?.budgetDecision?.decision, "string");
  assert.equal(typeof response.body.state?.budgetDecision?.decision, "string");
  assert.equal(Array.isArray(response.body.state.budgetDecision.budgetChecks), true);
  assert.equal(typeof response.body.state?.budgetDecision?.constraintSource, "string");
  assert.equal(typeof response.body.state?.budgetDecision?.hardLimitTriggered, "boolean");
  assert.equal(typeof response.body.state?.budgetDecision?.softLimitTriggered, "boolean");
  assert.equal(typeof response.body.context?.sandboxDecision?.sandboxDecisionId, "string");
  assert.equal(typeof response.body.state?.sandboxDecision?.sandboxDecisionId, "string");
  assert.equal(typeof response.body.state?.sandboxDecision?.decision, "string");
  assert.equal(typeof response.body.context?.agentLimitDecision?.agentLimitDecisionId, "string");
  assert.equal(typeof response.body.state?.agentLimitDecision?.agentLimitDecisionId, "string");
  assert.equal(typeof response.body.state?.agentLimitDecision?.decision, "string");
  assert.equal(Array.isArray(response.body.state?.agentLimitDecision?.providerSideEffectChecks), true);
  assert.equal(typeof response.body.context?.agentGovernanceTrace?.agentGovernanceTraceId, "string");
  assert.equal(typeof response.body.state?.agentGovernanceTrace?.agentGovernanceTraceId, "string");
  assert.equal(typeof response.body.state?.agentGovernanceTrace?.finalDecision, "string");
  assert.equal(Array.isArray(response.body.state?.agentGovernanceTrace?.allChecks), true);
  assert.equal(typeof response.body.context?.platformCostMetric?.platformCostMetricId, "string");
  assert.equal(typeof response.body.state?.platformCostMetric?.platformCostMetricId, "string");
  assert.equal(typeof response.body.state?.platformCostMetric?.currency, "string");
  assert.equal(typeof response.body.context?.billingPlanSchema?.billingPlanSchemaId, "string");
  assert.equal(typeof response.body.state?.billingPlanSchema?.billingPlanSchemaId, "string");
  assert.equal(Array.isArray(response.body.state?.billingPlanSchema?.plans), true);
  assert.equal(typeof response.body.context?.entitlementDecision?.entitlementDecisionId, "string");
  assert.equal(typeof response.body.state?.entitlementDecision?.entitlementDecisionId, "string");
  assert.equal(typeof response.body.state?.entitlementDecision?.decision, "string");
  assert.equal(typeof response.body.context?.subscriptionState?.subscriptionStateId, "string");
  assert.equal(typeof response.body.state?.subscriptionState?.subscriptionStateId, "string");
  assert.equal(typeof response.body.state?.subscriptionState?.status, "string");
  assert.equal(
    response.body.state?.subscriptionState?.source === "workspace-billing-state"
      || response.body.state?.subscriptionState?.source === "billing-plan-schema"
      || response.body.state?.subscriptionState?.source === "fallback-default",
    true,
  );
  assert.equal(typeof response.body.state?.subscriptionState?.summary, "string");
  assert.deepEqual(Object.keys(response.body.context?.workspaceMode ?? {}), ["type"]);
  assert.deepEqual(Object.keys(response.body.state?.workspaceMode ?? {}), ["type"]);
  assert.deepEqual(Object.keys(response.body.state?.workspaceModeDefinitions ?? {}), ["user-only", "hybrid", "autonomous"]);
  assert.equal(typeof response.body.context?.reasonableUsagePolicy?.policyId, "string");
  assert.equal(typeof response.body.state?.reasonableUsagePolicy?.policyId, "string");
  assert.equal(typeof response.body.state?.reasonableUsagePolicy?.summary?.summaryStatus, "string");
  assert.equal(typeof response.body.context?.workspaceBillingState?.workspaceBillingStateId, "string");
  assert.equal(typeof response.body.state?.workspaceBillingState?.workspaceBillingStateId, "string");
  assert.equal(typeof response.body.context?.payingUserMetrics?.payingUserMetricsId, "string");
  assert.equal(typeof response.body.state?.payingUserMetrics?.payingUserMetricsId, "string");
  assert.equal(typeof response.body.state?.payingUserMetrics?.payingUsers, "number");
  assert.equal(typeof response.body.context?.revenueSummary?.revenueSummaryId, "string");
  assert.equal(typeof response.body.state?.revenueSummary?.revenueSummaryId, "string");
  assert.equal(typeof response.body.state?.revenueSummary?.paymentPosture, "string");
  assert.equal(typeof response.body.context?.billingGuardDecision?.billingGuardDecisionId, "string");
  assert.equal(typeof response.body.state?.billingGuardDecision?.billingGuardDecisionId, "string");
  assert.equal(typeof response.body.state?.billingGuardDecision?.decision, "string");
  assert.equal(Array.isArray(response.body.state?.billingGuardDecision?.guardChecks), true);
  assert.equal(typeof response.body.state?.billingGuardDecision?.summary?.summaryStatus, "string");
  assert.deepEqual(Object.keys(response.body.context?.billingSettingsModel ?? {}), [
    "currentPlan",
    "subscription",
    "availableActions",
    "history",
  ]);
  assert.deepEqual(Object.keys(response.body.state?.billingSettingsModel ?? {}), [
    "currentPlan",
    "subscription",
    "availableActions",
    "history",
  ]);
  assert.equal(Array.isArray(response.body.state?.billingSettingsModel?.availableActions), true);
  assert.equal(Array.isArray(response.body.state?.billingSettingsModel?.history), true);
  assert.equal(
    response.body.state?.billingSettingsModel?.availableActions.some((action) => action.actionType === "renew"),
    false,
  );
  assert.equal(Object.hasOwn(response.body.state?.billingSettingsModel ?? {}, "usage"), false);
  assert.equal(Object.hasOwn(response.body.state?.billingSettingsModel ?? {}, "paymentMethod"), false);
  assert.equal(Object.hasOwn(response.body.state?.billingSettingsModel ?? {}, "billingDetails"), false);
  assert.equal(Object.hasOwn(response.body.state?.billingSettingsModel ?? {}, "invoices"), false);
  assert.equal(
    response.body.state?.billingApprovalRequest === null
      || typeof response.body.state?.billingApprovalRequest?.requestType === "string",
    true,
  );
  assert.equal(typeof response.body.context?.aiUsageMetric?.aiUsageMetricId, "string");
  assert.equal(typeof response.body.state?.aiUsageMetric?.aiUsageMetricId, "string");
  assert.equal(typeof response.body.state?.aiUsageMetric?.usageType, "string");
  assert.equal(typeof response.body.state?.aiUsageMetric?.unit, "string");
  assert.equal(typeof response.body.context?.workspaceComputeMetric?.workspaceComputeMetricId, "string");
  assert.equal(typeof response.body.state?.workspaceComputeMetric?.workspaceComputeMetricId, "string");
  assert.equal(response.body.state?.workspaceComputeMetric?.usageType, "workspace");
  assert.equal(response.body.state?.workspaceComputeMetric?.unit, "workspace-minute");
  assert.equal(typeof response.body.context?.storageCostMetric?.storageCostMetricId, "string");
  assert.equal(typeof response.body.state?.storageCostMetric?.storageCostMetricId, "string");
  assert.equal(response.body.state?.storageCostMetric?.usageType, "storage");
  assert.equal(response.body.state?.storageCostMetric?.unit, "gb-month");
  assert.equal(typeof response.body.context?.costSummary?.costSummaryId, "string");
  assert.equal(typeof response.body.state?.costSummary?.costSummaryId, "string");
  assert.equal(typeof response.body.state?.costSummary?.summary?.summaryStatus, "string");
  assert.equal(response.body.state?.costSummary?.breakdown?.build?.unit, "build-minute");
  assert.equal(Array.isArray(response.body.context?.normalizedBillingEvents), true);
  assert.equal(Array.isArray(response.body.state?.normalizedBillingEvents), true);
  assert.equal(response.body.state?.normalizedBillingEvents.every((event) => !Object.hasOwn(event, "providerPayload")), true);
  assert.equal(typeof response.body.context?.billableUsage?.billableUsageId, "string");
  assert.equal(typeof response.body.state?.billableUsage?.billableUsageId, "string");
  assert.equal(Array.isArray(response.body.state?.billableUsage?.items), true);
  assert.equal(typeof response.body.context?.costVisibilityPayload?.costVisibilityPayloadId, "string");
  assert.equal(typeof response.body.state?.costVisibilityPayload?.costVisibilityPayloadId, "string");
  assert.equal(Array.isArray(response.body.state?.costVisibilityPayload?.topCostDrivers), true);
  assert.equal(typeof response.body.context?.costDashboardModel?.dashboardId, "string");
  assert.equal(typeof response.body.state?.costDashboardModel?.dashboardId, "string");
  assert.equal(response.body.state?.costDashboardModel?.breakdownTable?.componentType, "table");
  assert.equal(typeof response.body.context?.costAwareActionSelection?.costAwareActionSelectionId, "string");
  assert.equal(typeof response.body.state?.costAwareActionSelection?.costAwareActionSelectionId, "string");
  assert.equal(Array.isArray(response.body.state?.costAwareActionSelection?.rankedActions), true);
  assert.equal(typeof response.body.state?.costAwareActionSelection?.selectionBasis, "string");
  assert.equal(response.body.state?.projectAuditEvent?.actionType, "project.agent-governance.decision");
  assert.equal(response.body.state.dataPrivacyClassification.exposureLevel, response.body.context.dataPrivacyClassification.exposureLevel);
  assert.equal(response.body.state.dataPrivacyClassification.storageBinding.retentionPolicy.policyId, "project-lifecycle");
  assert.equal(typeof response.body.context?.privacyPolicyDecision?.privacyPolicyDecisionId, "string");
  assert.equal(typeof response.body.state?.privacyPolicyDecision?.privacyPolicyDecisionId, "string");
  assert.equal(response.body.state.privacyPolicyDecision.retentionAction, response.body.context.privacyPolicyDecision.retentionAction);
  assert.equal(typeof response.body.context?.complianceConsentState?.complianceConsentStateId, "string");
  assert.equal(typeof response.body.state?.complianceConsentState?.complianceConsentStateId, "string");
  assert.equal(Array.isArray(response.body.state.complianceConsentState.processingScopes), true);
  assert.equal(typeof response.body.context?.complianceAuditSummary?.complianceAuditSummaryId, "string");
  assert.equal(typeof response.body.state?.complianceAuditSummary?.complianceAuditSummaryId, "string");
  assert.equal(Array.isArray(response.body.state.complianceAuditSummary.auditReferences), true);
});

test("server blocks unauthenticated project reads", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-auth-read-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  service.seedDemoProject();
  const server = createServer(service);

  const response = await requestJson(server, "/api/projects/giftwallet", {
    disableDefaultProjectAuth: true,
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.reason, "authentication-required");
});

test("server blocks unauthenticated project listing", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-list-auth-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  service.seedDemoProject();
  const server = createServer(service);

  const response = await requestJson(server, "/api/projects", {
    disableDefaultProjectAuth: true,
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.reason, "authentication-required");
});

test("server blocks project writes when action-level authorization is invalid", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-auth-write-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  service.seedDemoProject();
  const server = createServer(service);

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/projects/giftwallet/proposal-edits",
    {
      userEditInput: {
        acceptedSections: ["proposal"],
      },
    },
    {
      headers: {
        "x-user-id": "viewer-user",
      },
    },
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.reason, "project-authorization-blocked");
  assert.equal(response.body.projectAuthorizationDecision.decision, "blocked");
});

test("server blocks project reads that cross the workspace isolation boundary", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-isolation-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  service.seedDemoProject();
  const server = createServer(service);

  const response = await requestJson(server, "/api/projects/giftwallet", {
    headers: {
      "x-workspace-id": "workspace-other-tenant",
    },
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.reason, "workspace-isolation-blocked");
  assert.equal(response.body.workspaceIsolationDecision.decision, "blocked");
});

test("server blocks project creation that crosses the workspace isolation boundary", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-create-isolation-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  const signedUp = service.signupUser({
    userInput: {
      email: "owner@example.com",
      displayName: "Owner",
    },
    credentials: {
      password: "secret123",
    },
  });
  const server = createServer(service);

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/projects",
    {
      id: "owner-console",
      name: "Owner Console",
      goal: "Create a managed workspace console",
    },
    {
      headers: {
        "x-user-id": signedUp.authPayload.userIdentity.userId,
        "x-workspace-id": "workspace-other-tenant",
      },
    },
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.reason, "workspace-isolation-blocked");
  assert.equal(response.body.workspaceIsolationDecision.decision, "blocked");
});

test("server gates privileged project mutations when approval is unresolved", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-privileged-gate-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  service.seedDemoProject();
  const project = service.getProject("giftwallet");
  const server = createServer({
    getProject: () => ({
      id: "giftwallet",
      userId: "demo-user",
      state: {
        workspaceModel: project.state.workspaceModel,
        roleCapabilityMatrix: project.state.roleCapabilityMatrix,
        tenantIsolationSchema: project.state.tenantIsolationSchema,
        approvalStatus: project.state.approvalStatus,
        deployPolicyDecision: project.state.deployPolicyDecision,
        credentialPolicyDecision: project.state.credentialPolicyDecision,
      },
    }),
    rotateCredential: () => ({
      rotationResult: {
        status: "completed",
      },
    }),
  });

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/projects/giftwallet/accounts/rotate",
    {
      credentialReference: "credref_giftwallet-generic-primary",
      rotationRequest: {
        newValue: "rotated-secret",
        requestedBy: "demo-user",
      },
    },
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.reason, "privileged-action-blocked");
  assert.equal(response.body.privilegedAuthorityDecision.isBlocked, true);
});

test("server exposes credential rotation endpoint", async () => {
  const server = createServer({
    rotateCredential: (projectId, { credentialReference, rotationRequest }) => ({
      rotationResult: {
        rotationId: "credential-rotation:1",
        status: "completed",
        oldReference: {
          credentialReference,
          secretReferenceLifecycle: {
            revoked: true,
          },
        },
        newReference: {
          credentialReference: `${credentialReference}:rotated`,
        },
        requestedBy: rotationRequest.requestedBy,
      },
      linkedAccounts: [],
      project: {
        id: projectId,
      },
    }),
  });

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/projects/giftwallet/accounts/rotate",
    {
      credentialReference: "credref_hosting-primary",
      rotationRequest: {
        newValue: "next-secret",
        requestedBy: "owner-1",
      },
    },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.rotationResult.status, "completed");
  assert.equal(response.body.rotationResult.oldReference.secretReferenceLifecycle.revoked, true);
});

test("server exposes privacy rights execution endpoint", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-privacy-rights-server-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
  service.seedDemoProject();
  const project = service.projects.get("giftwallet");
  project.userId = "demo-user";
  project.manualContext = {
    ...(project.manualContext ?? {}),
    userProfile: {
      userId: "demo-user",
      email: "demo@example.com",
      displayName: "Demo User",
    },
    consentEntries: [
      {
        entryId: "consent-learning-demo",
        userId: "demo-user",
        processingScope: "learning",
        scopeType: "project",
        scopeId: "giftwallet",
        status: "granted",
        legalBasis: "consent",
      },
    ],
    learningEvent: {
      learningEventId: "learning-event-demo",
    },
  };
  project.context = {
    ...(project.context ?? {}),
    learningInsights: {
      items: [{ insightId: "insight-1" }],
    },
  };
  const server = createServer(service);

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/projects/giftwallet/privacy-rights-requests",
    {
      privacyRequest: {
        requestType: "learning-opt-out",
        subjectType: "user",
        subjectId: "demo-user",
        scopeType: "project",
        scopeId: "giftwallet",
        requestedBy: {
          actorId: "demo-user",
          actorType: "user",
        },
      },
    },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(typeof response.body.state?.privacyRightsResult?.privacyRequestId, "string");
  assert.equal(["completed", "partial"].includes(response.body.state.privacyRightsResult.status), true);
});

test("server returns 403 for routes blocked by feature flag decision", async () => {
  const server = createServer({
    getProject: () => ({
      state: {
        featureFlagSchema: {
          featureFlagSchemaId: "feature-flag-schema:giftwallet",
          environmentConfig: {
            environment: "production",
          },
          flags: [
            {
              flagId: "provider-runtime-execution",
              description: "Provider mutations",
              enabled: true,
              rolloutScope: "global",
              rolloutPercentage: 100,
              environmentTargets: ["production"],
              workspaceTargets: [],
              userTargets: [],
              riskSensitive: true,
              isKillSwitch: false,
              defaultFallback: "queue-and-review",
            },
          ],
        },
      },
    }),
    linkExternalAccount: () => ({
      linkedAccounts: [],
    }),
  });

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/projects/giftwallet/accounts/link",
    {
      providerType: "hosting",
      userInput: {
        accountId: "blocked-account",
      },
    },
    {
      headers: {
        "x-user-id": "user-1",
        "x-risk-level": "high",
      },
    },
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.reason, "feature-disabled");
  assert.equal(response.body.flagId, "provider-runtime-execution");
});

test("server returns 503 for routes blocked by kill switch decision", async () => {
  const server = createServer({
    getProject: () => ({
      state: {
        featureFlagSchema: {
          featureFlagSchemaId: "feature-flag-schema:giftwallet",
          environmentConfig: {
            environment: "production",
          },
          flags: [
            {
              flagId: "provider-runtime-execution",
              description: "Provider mutations",
              enabled: true,
              rolloutScope: "global",
              rolloutPercentage: 100,
              environmentTargets: ["production"],
              workspaceTargets: [],
              userTargets: [],
              riskSensitive: false,
              isKillSwitch: false,
              defaultFallback: "queue-and-review",
            },
          ],
        },
        incidentAlert: {
          status: "active",
          severity: "critical",
          incidentType: "connector-outage",
          affectedComponents: ["connector-service"],
        },
      },
    }),
    rotateCredential: () => ({
      rotationResult: {
        status: "completed",
      },
    }),
  });

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/projects/giftwallet/accounts/rotate",
    {
      credentialReference: "credref_hosting-primary",
      rotationRequest: {
        newValue: "next-secret",
        requestedBy: "owner-1",
      },
    },
    {
      headers: {
        "x-user-id": "user-1",
      },
    },
  );

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.reason, "kill-switch-active");
  assert.equal(Array.isArray(response.body.killedPaths), true);
  assert.equal(response.body.killedPaths.includes("provider-execution"), true);
});

test("server exposes project snapshots endpoint", async () => {
  const server = createServer({
    getProjectSnapshots: ({ projectId }) => projectId === "giftwallet"
      ? [{ snapshotRecordId: "snapshot-record:giftwallet:v3", projectId: "giftwallet" }]
      : [],
  });

  const response = await requestJson(server, "/api/project-snapshots?projectId=giftwallet");

  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.body.projectSnapshots), true);
  assert.equal(response.body.projectSnapshots[0].snapshotRecordId, "snapshot-record:giftwallet:v3");
});

test("server exposes snapshot schedule and manual backup mutation endpoints", async () => {
  const server = createServer({
    configureSnapshotBackupSchedule: ({ projectId, scheduleInput }) => ({
      id: projectId,
      snapshotSchedule: {
        projectId,
        enabled: scheduleInput.enabled,
        intervalSeconds: scheduleInput.intervalSeconds,
        preChangeTriggers: scheduleInput.preChangeTriggers,
      },
    }),
    runSnapshotBackupNow: ({ projectId, triggerType }) => ({
      id: projectId,
      snapshotRecord: {
        snapshotRecordId: `snapshot-record:${projectId}:manual`,
        triggerType,
      },
    }),
    configureSnapshotRetentionPolicy: ({ projectId, retentionInput }) => ({
      id: projectId,
      snapshotRetentionPolicy: {
        projectId,
        enabled: retentionInput.enabled,
        maxSnapshots: retentionInput.maxSnapshots,
      },
    }),
    runSnapshotRetentionCleanup: ({ projectId, triggerType }) => ({
      id: projectId,
      snapshotRetentionDecision: {
        projectId,
        triggerType,
        summary: {
          pruneCount: 2,
          totalAfterCleanup: 2,
        },
      },
    }),
    configureSnapshotBackupWorker: ({ projectId, workerInput }) => ({
      id: projectId,
      snapshotBackupWorker: {
        projectId,
        enabled: workerInput.enabled,
        status: workerInput.enabled ? "active" : "paused",
      },
    }),
    runSnapshotBackupWorkerTick: ({ projectId, triggerType }) => ({
      id: projectId,
      snapshotBackupWorker: {
        projectId,
        enabled: true,
        status: "active",
        lastExecutionStatus: "success",
      },
      snapshotRecord: {
        snapshotRecordId: `snapshot-record:${projectId}:worker`,
        triggerType,
      },
    }),
    getDisasterRecoveryChecklist: ({ projectId, refresh }) => ({
      projectId,
      summary: {
        canExecuteRecovery: true,
        readinessScore: 100,
      },
      disasterRecoveryChecklist: {
        checklistId: `disaster-recovery:${projectId}`,
        summary: {
          canExecuteRecovery: true,
          readinessScore: 100,
        },
      },
      project: {
        id: projectId,
      },
      refreshed: refresh === true,
    }),
    getContinuityPlan: ({ projectId, refresh }) => ({
      projectId,
      continuityPlan: {
        continuityPlanId: `continuity-plan:${projectId}:runtime`,
        recommendedMode: "degraded",
        summary: {
          planStatus: "partial",
        },
      },
      project: {
        id: projectId,
      },
      refreshed: refresh === true,
    }),
    getBusinessContinuityState: ({ projectId, refresh }) => ({
      projectId,
      continuityPlan: {
        continuityPlanId: `continuity-plan:${projectId}:runtime`,
        recommendedMode: "recovery",
      },
      businessContinuityState: {
        continuityStateId: `business-continuity:${projectId}`,
        lifecycleState: "recovery",
        continuityStatus: "warning",
      },
      project: {
        id: projectId,
      },
      refreshed: refresh === true,
    }),
    applyBusinessContinuityAction: ({ projectId, actionInput }) => ({
      projectId,
      actionType: actionInput.actionType,
      businessContinuityState: {
        continuityStateId: `business-continuity:${projectId}`,
        lifecycleState: actionInput.actionType === "force-failover" ? "failover" : "recovery",
      },
      project: {
        id: projectId,
      },
    }),
  });

  const scheduleResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/snapshot-backup-schedule", {
    scheduleInput: {
      enabled: true,
      intervalSeconds: 300,
      preChangeTriggers: ["deploy"],
    },
  });
  const runResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/snapshot-backups/run", {
    triggerType: "manual",
  });
  const retentionPolicyResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/snapshot-retention-policy", {
    retentionInput: {
      enabled: true,
      maxSnapshots: 5,
    },
  });
  const cleanupResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/snapshot-retention-cleanup", {
    triggerType: "manual-cleanup",
  });
  const workerToggleResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/snapshot-backup-worker", {
    workerInput: {
      enabled: false,
    },
  });
  const workerRunResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/snapshot-backup-worker/run", {
    triggerType: "manual-worker-run",
  });
  const recoveryChecklistResponse = await requestJson(server, "/api/projects/giftwallet/disaster-recovery-checklist?refresh=1");
  const continuityPlanResponse = await requestJson(server, "/api/projects/giftwallet/continuity-plan?refresh=1");
  const continuityStateResponse = await requestJson(server, "/api/projects/giftwallet/business-continuity?refresh=1");
  const continuityActionResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/business-continuity/actions", {
    actionInput: {
      actionType: "force-failover",
    },
  });

  assert.equal(scheduleResponse.statusCode, 200);
  assert.equal(scheduleResponse.body.snapshotSchedule.intervalSeconds, 300);
  assert.equal(scheduleResponse.body.snapshotSchedule.preChangeTriggers[0], "deploy");
  assert.equal(runResponse.statusCode, 200);
  assert.equal(runResponse.body.snapshotRecord.triggerType, "manual");
  assert.equal(retentionPolicyResponse.statusCode, 200);
  assert.equal(retentionPolicyResponse.body.snapshotRetentionPolicy.maxSnapshots, 5);
  assert.equal(cleanupResponse.statusCode, 200);
  assert.equal(cleanupResponse.body.snapshotRetentionDecision.summary.totalAfterCleanup, 2);
  assert.equal(workerToggleResponse.statusCode, 200);
  assert.equal(workerToggleResponse.body.snapshotBackupWorker.enabled, false);
  assert.equal(workerRunResponse.statusCode, 200);
  assert.equal(workerRunResponse.body.snapshotRecord.triggerType, "manual-worker-run");
  assert.equal(recoveryChecklistResponse.statusCode, 200);
  assert.equal(recoveryChecklistResponse.body.disasterRecoveryChecklist.checklistId, "disaster-recovery:giftwallet");
  assert.equal(recoveryChecklistResponse.body.refreshed, true);
  assert.equal(continuityPlanResponse.statusCode, 200);
  assert.equal(continuityPlanResponse.body.continuityPlan.continuityPlanId, "continuity-plan:giftwallet:runtime");
  assert.equal(continuityStateResponse.statusCode, 200);
  assert.equal(continuityStateResponse.body.businessContinuityState.continuityStateId, "business-continuity:giftwallet");
  assert.equal(continuityActionResponse.statusCode, 200);
  assert.equal(continuityActionResponse.body.businessContinuityState.lifecycleState, "failover");
});

test("server exposes project live-state endpoint", async () => {
  const server = createServer({
    listProjects: () => [],
    getProject: (projectId) => ({
      id: projectId,
      progressState: { percent: 48, status: "running" },
      reactiveWorkspaceState: { progressBar: { percent: 48 } },
      realtimeEventStream: { streamId: "realtime-stream:giftwallet", events: [], summary: { totalEvents: 0 } },
      liveUpdateChannel: {
        channelId: "live-channel:giftwallet",
        transportMode: "polling",
        serverTransport: "polling",
        deliveryEndpoint: "/api/projects/giftwallet/live-state",
      },
      liveLogStream: {
        streamId: "live-log-stream:giftwallet",
        streams: { stdout: [{ logId: "log-1", message: "build started" }], stderr: [] },
        commandOutputs: [],
        summary: { totalEntries: 1 },
      },
      collaborationFeed: { feedId: "collaboration-feed:giftwallet", items: [], summary: { totalItems: 0 } },
      continuityPlan: { continuityPlanId: "continuity-plan:giftwallet:runtime" },
      disasterRecoveryChecklist: { checklistId: "disaster-recovery:giftwallet" },
      businessContinuityState: { continuityStateId: "business-continuity:giftwallet" },
      events: [{ type: "state.updated", payload: { projectId } }],
    }),
  });

  const response = await requestJson(server, "/api/projects/giftwallet/live-state");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.projectId, "giftwallet");
  assert.equal(response.body.progressState.percent, 48);
  assert.equal(response.body.liveUpdateChannel.transportMode, "polling");
  assert.equal(response.body.liveUpdateChannel.serverTransport, "polling");
  assert.equal(response.body.liveUpdateChannel.deliveryEndpoint, "/api/projects/giftwallet/live-state");
  assert.equal(response.body.liveLogStream.summary.totalEntries, 1);
  assert.equal(response.body.continuityPlan.continuityPlanId, "continuity-plan:giftwallet:runtime");
  assert.equal(response.body.disasterRecoveryChecklist.checklistId, "disaster-recovery:giftwallet");
  assert.equal(response.body.businessContinuityState.continuityStateId, "business-continuity:giftwallet");
  assert.equal(Array.isArray(response.body.events), true);
});

test("server exposes project live events sse endpoint", async () => {
  const server = createServer({
    getProject: (projectId) => ({
      id: projectId,
      progressState: { percent: 48, status: "running" },
      reactiveWorkspaceState: { progressBar: { percent: 48 } },
      realtimeEventStream: { streamId: "realtime-stream:giftwallet", events: [{ eventId: "evt-1" }], summary: { totalEvents: 1, progressEvents: 1 } },
      liveUpdateChannel: {
        channelId: "live-channel:giftwallet",
        transportMode: "sse",
        serverTransport: "sse",
        deliveryEndpoint: "/api/projects/giftwallet/live-events",
      },
      collaborationFeed: { feedId: "collaboration-feed:giftwallet", items: [], summary: { totalItems: 0 } },
      events: [{ type: "state.updated", payload: { projectId } }],
    }),
  });

  const bodyChunks = [];
  const request = new EventEmitter();
  request.method = "GET";
  request.url = "/api/projects/giftwallet/live-events";
  request.headers = {};

  const response = new EventEmitter();
  response.statusCode = 200;
  response.headers = {};
  response.writeHead = function writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = headers;
  };
  response.write = function write(chunk) {
    bodyChunks.push(chunk);
  };
  response.end = function end(chunk) {
    if (chunk) {
      bodyChunks.push(chunk);
    }
  };

  server.emit("request", request, response);
  await new Promise((resolve) => setTimeout(resolve, 5));
  request.emit("close");

  const body = bodyChunks.join("");

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Content-Type"], "text/event-stream; charset=utf-8");
  assert.match(body, /event: live-state/);
  assert.match(body, /"projectId":"giftwallet"/);
});

test("server exposes project audit payload endpoint", async () => {
  const server = createServer({
    getProjectAuditPayload: (projectId, filters) => projectId === "giftwallet"
      ? {
          projectAuditPayloadId: "project-audit-payload:giftwallet",
          projectId,
          filters,
          entries: [{ entryId: "actor-action-trace:1" }],
          viewerModel: { supportsFiltering: true },
          summary: { totalEntries: 1 },
        }
      : null,
  });

  const response = await requestJson(server, "/api/projects/giftwallet/audit?actorId=user-1");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.projectId, "giftwallet");
  assert.equal(response.body.filters.actorId, "user-1");
  assert.equal(response.body.entries[0].entryId, "actor-action-trace:1");
});

test("server exposes project draft creation endpoint", async () => {
  const server = createServer({
    createProjectDraft: ({ userInput, projectCreationInput }) => ({
      projectDraft: {
        id: "launch-studio",
        owner: {
          email: userInput.email,
        },
      },
      projectDraftId: "launch-studio",
      projectCreationEvent: {
        projectCreationEventId: "project-creation:launch-studio:2026-04-13T10:00:00.000Z",
        userId: "user-1",
        projectId: "launch-studio",
        creationSource: "project-creation",
        timestamp: "2026-04-13T10:00:00.000Z",
      },
      projectCreationEvents: [
        {
          projectCreationEventId: "project-creation:launch-studio:2026-04-13T10:00:00.000Z",
          userId: "user-1",
          projectId: "launch-studio",
          creationSource: "project-creation",
          timestamp: "2026-04-13T10:00:00.000Z",
        },
      ],
      projectCreationMetric: {
        totalProjectsCreated: 1,
      },
      projectCreationSummary: {
        totalProjectsCreated: 1,
        byDay: {
          "2026-04-13": 1,
        },
        byUser: {
          "user-1": 1,
        },
        byCreationSource: {
          "project-creation": 1,
        },
      },
      projectCreationExperience: {
        experienceId: "project-creation:launch-studio",
      },
      projectCreationRedirect: {
        target: "onboarding",
      },
    }),
  });

  const response = await requestJsonWithBody(server, "POST", "/api/project-drafts", {
    userInput: {
      email: "draft-user@example.com",
    },
    projectCreationInput: {
      projectName: "Launch Studio",
      visionText: "מערכת עבודה ליוצרים",
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.projectDraftId, "launch-studio");
  assert.equal(response.body.projectDraft.owner.email, "draft-user@example.com");
  assert.equal(response.body.projectCreationEvent.projectId, "launch-studio");
  assert.equal(response.body.projectCreationEvent.creationSource, "project-creation");
  assert.equal(Array.isArray(response.body.projectCreationEvents), true);
  assert.equal(response.body.projectCreationEvents.length, 1);
  assert.deepEqual(response.body.projectCreationMetric, {
    totalProjectsCreated: 1,
  });
  assert.deepEqual(response.body.projectCreationSummary, {
    totalProjectsCreated: 1,
    byDay: {
      "2026-04-13": 1,
    },
    byUser: {
      "user-1": 1,
    },
    byCreationSource: {
      "project-creation": 1,
    },
  });
  assert.equal(response.body.projectCreationRedirect.target, "onboarding");
});

test("server exposes project creation events and aggregation summary through GET project payload", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-creation-server-"));
  const service = new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });

  const signedUp = service.signupUser({
    userInput: {
      email: "owner@example.com",
      displayName: "Owner",
    },
    credentials: {
      password: "secret123",
    },
  });

  const firstDraft = service.createProjectDraft({
    userInput: {
      email: "owner@example.com",
    },
    projectCreationInput: {
      projectName: "Owner Console",
      visionText: "מסך ניהול לבעלי workspace",
    },
  });

  service.createProjectDraft({
    userInput: {
      email: "owner@example.com",
    },
    projectCreationInput: {
      projectName: "Owner Console 2",
      visionText: "פרויקט שני",
    },
  });

  const session = service.createOnboardingSession({
    userId: signedUp.authPayload.userIdentity.userId,
    projectDraftId: firstDraft.projectDraftId,
    initialInput: "",
  });

  service.updateOnboardingIntake({
    sessionId: session.sessionId,
    visionText: "שם הפרויקט: Owner Console\nאפליקציה עם onboarding ופרויקט",
    uploadedFiles: [],
    externalLinks: [],
  });

  service.uploadOnboardingFiles({
    sessionId: session.sessionId,
    uploadedFiles: [{ name: "spec.md", type: "markdown", content: "# Spec" }],
  });

  service.finishOnboardingSession(session.sessionId);
  const server = createServer(service);

  const response = await requestJson(server, `/api/projects/${firstDraft.projectDraftId}`, {
    headers: {
      "x-user-id": signedUp.authPayload.userIdentity.userId,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(Array.isArray(response.body.projectCreationEvents), true);
  assert.equal(response.body.projectCreationEvents.length, 2);
  assert.equal(Array.isArray(response.body.context.projectCreationEvents), true);
  assert.equal(response.body.context.projectCreationEvents.length, 2);
  assert.equal(response.body.projectCreationSummary.totalProjectsCreated, 2);
  assert.deepEqual(response.body.projectCreationSummary.byUser, {
    [signedUp.authPayload.userIdentity.userId]: 2,
  });
  assert.deepEqual(response.body.projectCreationSummary.byCreationSource, {
    "project-creation": 2,
  });
  assert.equal(response.body.state.projectCreationSummary.totalProjectsCreated, 2);
});

test("server exposes proposal edit mutation endpoint", async () => {
  const server = createServer({
    submitProposalEdits: ({ projectId, userEditInput }) => ({
      id: projectId,
      state: {
        editedProposal: {
          revisionNumber: userEditInput.revisionNumber,
        },
      },
      context: {
        userEditInput,
      },
    }),
  });

  const response = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/proposal-edits", {
    userEditInput: {
      revisionNumber: 2,
      annotations: [{ note: "revise" }],
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.id, "giftwallet");
  assert.equal(response.body.state.editedProposal.revisionNumber, 2);
  assert.equal(response.body.context.userEditInput.annotations[0].note, "revise");
});

test("server exposes partial acceptance mutation endpoint", async () => {
  const server = createServer({
    submitPartialAcceptance: ({ projectId, approvalOutcome }) => ({
      id: projectId,
      state: {
        partialAcceptanceDecision: {
          status: "partially-accepted",
        },
      },
      context: {
        approvalOutcome,
      },
    }),
  });

  const response = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/partial-acceptance", {
    approvalOutcome: {
      sectionOutcomes: [{ sectionId: "section-1", decision: "approved" }],
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.id, "giftwallet");
  assert.equal(response.body.state.partialAcceptanceDecision.status, "partially-accepted");
  assert.equal(response.body.context.approvalOutcome.sectionOutcomes[0].decision, "approved");
});

test("server exposes rollback execution mutation endpoint", async () => {
  const server = createServer({
    executeProjectRollback: ({ projectId }) => ({
      id: projectId,
      state: {
        rollbackExecutionResult: {
          executionStatus: "executed-full",
          executed: true,
        },
      },
    }),
  });

  const response = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/rollback-executions", {});

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.id, "giftwallet");
  assert.equal(response.body.state.rollbackExecutionResult.executionStatus, "executed-full");
});

test("server exposes project presence heartbeat endpoint", async () => {
  const server = createServer({
    updateProjectPresence: ({ projectId, presenceInput }) => ({
      id: projectId,
      state: {
        projectPresenceState: {
          presenceStateId: `project-presence:${projectId}`,
          participants: [
            {
              participantId: presenceInput.participantId,
              displayName: presenceInput.displayName,
              workspaceArea: presenceInput.workspaceArea,
            },
          ],
          summary: {
            totalParticipants: 1,
          },
        },
      },
    }),
  });

  const response = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/presence", {
    participantId: "session-1",
    displayName: "Owner",
    workspaceArea: "release-workspace",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.state.projectPresenceState.participants[0].displayName, "Owner");
  assert.equal(response.body.state.projectPresenceState.participants[0].workspaceArea, "release-workspace");
});

test("server exposes project review thread endpoints", async () => {
  const server = createServer({
    upsertProjectReviewThread: ({ projectId, threadInput }) => ({
      project: {
        id: projectId,
      },
      reviewThreadRecord: {
        threadId: "review-thread:giftwallet:1",
        title: threadInput.title,
      },
      reviewThreadState: {
        threadStateId: `review-thread-state:${projectId}`,
        threads: [
          {
            threadId: "review-thread:giftwallet:1",
            title: threadInput.title,
            status: "open",
          },
        ],
        summary: {
          totalThreads: 1,
          openThreads: 1,
        },
      },
    }),
    getProjectReviewThreadState: (projectId) => ({
      threadStateId: `review-thread-state:${projectId}`,
      threads: [
        {
          threadId: "review-thread:giftwallet:1",
          title: "Review the payout copy",
          status: "open",
        },
      ],
      summary: {
        totalThreads: 1,
        openThreads: 1,
      },
    }),
  });

  const postResponse = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/review-threads", {
    title: "Review the payout copy",
  });
  const getResponse = await requestJson(server, "/api/projects/giftwallet/review-threads");

  assert.equal(postResponse.statusCode, 200);
  assert.equal(postResponse.body.reviewThreadRecord.title, "Review the payout copy");
  assert.equal(getResponse.statusCode, 200);
  assert.equal(getResponse.body.reviewThreadState.summary.totalThreads, 1);
});

test("server exposes shared approval state in approval endpoints", async () => {
  const server = createServer({
    listApprovals: (projectId) => ({
      approvalPayload: {
        projectId,
        approvalRequest: {
          approvalRequestId: `approval:${projectId}:deploy:agent-runtime`,
        },
        approvalRecords: [],
        sharedApprovalState: {
          sharedApprovalStateId: `shared-approval:approval:${projectId}:deploy:agent-runtime`,
          participantDecisions: [],
          coordinationStatus: {
            pendingRequiredRoles: ["owner"],
          },
        },
      },
    }),
    captureApproval: (projectId, { userInput }) => ({
      approvalPayload: {
        approvalRecord: {
          status: userInput.decision,
        },
        approvalStatus: {
          status: userInput.decision,
        },
        approvalRecords: [],
        sharedApprovalState: {
          sharedApprovalStateId: `shared-approval:approval:${projectId}:deploy:agent-runtime`,
          participantDecisions: [
            {
              participantRole: userInput.actorRole,
              decision: userInput.decision,
            },
          ],
          coordinationStatus: {
            pendingRequiredRoles: [],
          },
        },
      },
    }),
  });

  const listed = await requestJson(server, "/api/projects/giftwallet/approvals");
  const approved = await requestJsonWithBody(server, "POST", "/api/projects/giftwallet/approvals/approve", {
    approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
    userInput: {
      actorRole: "owner",
      actorName: "Owner",
    },
  });

  assert.equal(listed.statusCode, 200);
  assert.equal(typeof listed.body.approvalPayload.sharedApprovalState.sharedApprovalStateId, "string");
  assert.equal(approved.statusCode, 200);
  assert.equal(approved.body.approvalPayload.sharedApprovalState.participantDecisions[0].participantRole, "owner");
});

test("server rate limits critical routes by ip and returns retry-after header", async () => {
  const server = createServer({
    createProjectDraft: () => ({
      projectDraftId: "draft-1",
      projectCreationRedirect: {
        target: "onboarding",
      },
    }),
  });

  for (let index = 0; index < 5; index += 1) {
    const response = await requestJsonWithBody(server, "POST", "/api/project-drafts", {
      userInput: {
        email: "nobody@example.com",
      },
      projectCreationInput: {
        projectName: "Draft Project",
      },
    }, {
      ipAddress: "10.0.0.21",
    });

    assert.equal(response.statusCode, 201);
  }

  const blocked = await requestJsonWithBody(server, "POST", "/api/project-drafts", {
    userInput: {
      email: "nobody@example.com",
    },
    projectCreationInput: {
      projectName: "Draft Project",
    },
  }, {
    ipAddress: "10.0.0.21",
  });

  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.body.rateLimitDecision.decision, "rate-limited");
  assert.equal(Number(blocked.headers["Retry-After"]) >= 1, true);
});

test("server blocks route scanning abuse across unknown api routes", async () => {
  const server = createServer({
    listProjects: () => [],
  });

  for (let index = 0; index < 5; index += 1) {
    const response = await requestJson(server, `/api/unknown-${index}`, {
      ipAddress: "10.0.0.33",
    });

    assert.equal(response.statusCode, 404);
  }

  const blocked = await requestJson(server, "/api/unknown-next", {
    ipAddress: "10.0.0.33",
  });

  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.body.rateLimitDecision.decision, "abuse-blocked");
  assert.equal(blocked.body.rateLimitDecision.abuseSignals.routeScanning, 5);
});
