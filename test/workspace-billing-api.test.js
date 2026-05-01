import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createServer } from "../src/server.js";
import { ProjectService } from "../src/core/project-service.js";
import { buildWorkspaceBillingIdempotencyEnvelope } from "../src/core/workspace-billing-action-service.js";

function requestJsonWithBody(server, method, pathname, payload, options = {}) {
  return new Promise((resolve, reject) => {
    const request = new EventEmitter();
    request.method = method;
    request.url = pathname;
    request.headers = {
      "content-type": "application/json",
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

function createProjectService() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-billing-api-"));
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

function getDemoWorkspace(service) {
  service.seedDemoProject();
  const project = service.findProjectRecordByWorkspaceId("workspace-demo-user");
  return {
    service,
    workspaceId: project.state.workspaceModel.workspaceId,
    ownerUserId: project.userId,
  };
}

test("all six workspace billing routes exist and enforce authentication", async () => {
  const server = createServer({
    performWorkspaceBillingAction: () => ({ httpStatus: 200, billingPayload: {} }),
  });
  const routes = [
    "/api/workspaces/workspace-1/billing/create-checkout",
    "/api/workspaces/workspace-1/billing/change-plan",
    "/api/workspaces/workspace-1/billing/cancel-subscription",
    "/api/workspaces/workspace-1/billing/retry-payment",
    "/api/workspaces/workspace-1/billing/update-payment-method",
    "/api/workspaces/workspace-1/billing/update-billing-details",
  ];

  for (const route of routes) {
    const response = await requestJsonWithBody(server, "POST", route, {});
    assert.equal(response.statusCode, 401);
    assert.equal(response.body.error, "Authentication required");
  }
});

test("workspace billing routes enforce workspace-scoped authorization", async () => {
  const { service, workspaceId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);

  const response = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/retry-payment`,
    {},
    {
      headers: {
        "x-user-id": "not-the-owner",
      },
    },
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Forbidden");
});

test("workspace billing routes validate exact input contracts", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);

  const invalidCheckout = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/create-checkout`,
    { planId: "pro" },
    { headers: { "x-user-id": ownerUserId } },
  );
  const invalidBillingDetails = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/update-billing-details`,
    {},
    { headers: { "x-user-id": ownerUserId } },
  );

  assert.equal(invalidCheckout.statusCode, 400);
  assert.equal(invalidCheckout.body.status, "rejected");
  assert.equal(invalidCheckout.body.emittedEventType, null);
  assert.equal(invalidCheckout.body.stateRefreshRequired, false);
  assert.equal(invalidBillingDetails.statusCode, 400);
  assert.equal(invalidBillingDetails.body.status, "rejected");
});

test("accepted create-checkout emits checkout and returns canonical result", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);

  const response = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/create-checkout`,
    {
      planId: "pro",
      billingCycle: "monthly",
    },
    { headers: { "x-user-id": ownerUserId } },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.actionType, "create-checkout");
  assert.equal(response.body.status, "accepted");
  assert.equal(response.body.emittedEventType, "checkout");
  assert.equal(response.body.stateRefreshRequired, true);
  assert.deepEqual(response.body.result, {
    selectedPlanId: "pro",
    selectedBillingCycle: "monthly",
  });
});

test("accepted change-plan emits plan-change and returns canonical result", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);
  const response = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/change-plan`,
    {
      targetPlanId: "enterprise",
    },
    { headers: { "x-user-id": ownerUserId } },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.emittedEventType, "plan-change");
  assert.deepEqual(response.body.result, {
    targetPlanId: "enterprise",
  });
});

test("accepted cancel-subscription emits cancel and returns canonical result", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);
  const response = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/cancel-subscription`,
    {
      cancelMode: "end-of-cycle",
    },
    { headers: { "x-user-id": ownerUserId } },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.emittedEventType, "cancel");
  assert.deepEqual(response.body.result, {
    cancelMode: "end-of-cycle",
  });
});

test("accepted retry-payment emits retry and returns canonical result", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);
  const response = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/retry-payment`,
    {},
    { headers: { "x-user-id": ownerUserId } },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.emittedEventType, "retry");
  assert.deepEqual(response.body.result, {});
});

test("accepted update-payment-method emits payment-method-update and returns canonical result", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);
  const response = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/update-payment-method`,
    {
      paymentMethodRef: "pm_123",
    },
    { headers: { "x-user-id": ownerUserId } },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.emittedEventType, "payment-method-update");
  assert.deepEqual(response.body.result, {
    updatedPaymentMethodRef: "pm_123",
  });
});

test("accepted update-billing-details emits billing-details-update and returns only accepted fields", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);
  const response = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/update-billing-details`,
    {
      billingEmail: "billing@example.com",
      countryCode: "IL",
    },
    { headers: { "x-user-id": ownerUserId } },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.emittedEventType, "billing-details-update");
  assert.deepEqual(response.body.result, {
    updatedBillingDetails: {
      billingEmail: "billing@example.com",
      countryCode: "IL",
    },
  });
});

test("idempotent repeat keeps the canonical payload stable", async () => {
  const { service, workspaceId, ownerUserId } = getDemoWorkspace(createProjectService());
  const server = createServer(service);
  const payload = {
    planId: "pro",
    billingCycle: "monthly",
  };

  const firstResponse = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/create-checkout`,
    payload,
    { headers: { "x-user-id": ownerUserId } },
  );
  const secondResponse = await requestJsonWithBody(
    server,
    "POST",
    `/api/workspaces/${workspaceId}/billing/create-checkout`,
    payload,
    { headers: { "x-user-id": ownerUserId } },
  );
  const project = service.findProjectRecordByWorkspaceId(workspaceId);

  assert.deepEqual(firstResponse.body, secondResponse.body);
  assert.equal(project.manualContext.normalizedBillingEvents.length, 1);
  assert.equal(
    buildWorkspaceBillingIdempotencyEnvelope({
      workspaceId,
      actionType: "create-checkout",
      normalizedInput: payload,
    }),
    `billing-action::${workspaceId}::create-checkout::create-checkout::pro::monthly`,
  );
});

test("accepted workspace billing action triggers canonical event storage and state refresh path", () => {
  const service = createProjectService();
  const { workspaceId, ownerUserId } = getDemoWorkspace(service);
  const project = service.findProjectRecordByWorkspaceId(workspaceId);
  const originalRebuildContext = service.rebuildContext.bind(service);
  let rebuildCount = 0;

  service.rebuildContext = (...args) => {
    rebuildCount += 1;
    return originalRebuildContext(...args);
  };

  const beforeEvents = project.manualContext?.normalizedBillingEvents?.length ?? 0;
  const result = service.performWorkspaceBillingAction({
    workspaceId,
    actionType: "retry-payment",
    billingInput: {},
    userId: ownerUserId,
  });
  const afterProject = service.findProjectRecordByWorkspaceId(workspaceId);

  assert.equal(result.httpStatus, 200);
  assert.equal(result.billingPayload.status, "accepted");
  assert.equal(result.billingPayload.emittedEventType, "retry");
  assert.equal(rebuildCount >= 1, true);
  assert.equal((afterProject.manualContext?.normalizedBillingEvents?.length ?? 0), beforeEvents + 1);
  assert.equal(afterProject.state?.normalizedBillingEvents?.length, afterProject.manualContext?.normalizedBillingEvents?.length ?? 0);
  assert.equal(afterProject.state?.normalizedBillingEvents?.at(-1)?.eventType, "retry");
});

test("failed action emits no canonical billing event and does not request refresh", async () => {
  const server = createServer({
    performWorkspaceBillingAction: () => ({
      httpStatus: 500,
      billingPayload: {
        billingActionId: "billing-action-result::workspace-1::retry-payment::failed",
        workspaceId: "workspace-1",
        actionType: "retry-payment",
        status: "failed",
        source: "billing-action-api",
        emittedEventType: null,
        stateRefreshRequired: false,
        result: {},
      },
    }),
    getProjectByWorkspaceId: () => ({ state: {} }),
  });

  const response = await requestJsonWithBody(
    server,
    "POST",
    "/api/workspaces/workspace-1/billing/retry-payment",
    {},
    {
      headers: {
        "x-user-id": "owner-user",
      },
    },
  );

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.status, "failed");
  assert.equal(response.body.emittedEventType, null);
  assert.equal(response.body.stateRefreshRequired, false);
});
