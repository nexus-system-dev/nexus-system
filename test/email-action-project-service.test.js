import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-email-action-"));
  return new ProjectService({
    eventLogPath: path.join(root, "events.ndjson"),
  });
}

function createProject(service) {
  return service.createProject({
    id: `email-action-${Date.now()}`,
    name: "Email Action Project",
    goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
    state: {
      artifactExpectation: { projectType: "internal-tool" },
      runtimeSkeletonTruth: {
        runtimeSkeletonId: "runtime-email-action-service",
        title: "ניהול לידים",
        productClass: "internal-tool",
      },
      productDomainSkeleton: {
        productDomainSkeletonId: "domain-email-action-service",
      },
      productOwnedBackendSkeleton: {
        productOwnedBackendSkeletonId: "backend-email-action-service",
        productionBackend: false,
      },
      growthMeasurementTruth: {
        taskId: "GROW-MEASURE-001",
        status: "has-initial-signal",
        records: [{ sourceType: "manual", accepted: true }],
        measurementAvailability: "available",
      },
    },
  });
}

test("ProjectService stores GROW-EMAIL-001 truth through growth and explicit email runs", () => {
  const service = createService();
  const created = createProject(service);

  const afterGrowth = service.runGrowthAgent({
    projectId: created.id,
    userInput: "תכין רצף מיילים קצר",
  });

  assert.equal(afterGrowth.emailActionPath.taskId, "GROW-EMAIL-001");
  assert.equal(afterGrowth.emailActionPath.status, "sequence-draft-ready");
  assert.equal(afterGrowth.context.emailActionPath.status, "sequence-draft-ready");
  assert.equal(afterGrowth.state.emailActionPath.status, "sequence-draft-ready");
  assert.equal(afterGrowth.growthAgent.emailActionPath.status, "sequence-draft-ready");

  const blocked = service.runEmailActionPath({
    projectId: created.id,
    userInput: "שלח את המייל לרשימה",
    providerConnection: {
      provider: "mailchimp",
      connected: true,
      scopes: ["email-draft"],
    },
    audienceInput: {
      source: "waitlist",
      lawfulBasis: "explicit signup",
      ownershipConfirmed: true,
      permissionConfirmed: true,
      addresses: ["a@example.com"],
    },
  });
  assert.equal(blocked.emailActionPath.status, "needs-provider-scope");
  assert.equal(blocked.emailActionPath.sendTruth.externalSendPerformed, false);

  const ready = service.runEmailActionPath({
    projectId: created.id,
    userInput: "שלח את המייל לרשימה",
    providerConnection: {
      provider: "sendgrid",
      connected: true,
      scopes: ["email-draft", "test-send", "send"],
    },
    audienceInput: {
      source: "provider-list",
      lawfulBasis: "customers opted in",
      ownershipConfirmed: true,
      permissionConfirmed: true,
      addresses: ["a@example.com", "b@example.com"],
    },
    approvalDecisions: {
      approvals: [
        { action: "campaign", approved: true },
        { action: "content", approved: true },
        { action: "audience-source", approved: true },
        { action: "send", approved: true },
      ],
    },
  });

  assert.equal(ready.emailActionPath.status, "one-email-send-ready");
  assert.equal(ready.emailActionPath.sendTruth.sequenceSendReadyCount, 1);
  assert.equal(ready.emailActionPath.sendTruth.externalSendPerformed, false);

  const restored = service.getProject(created.id);
  assert.equal(restored.emailActionPath.status, "one-email-send-ready");
  assert.equal(restored.context.emailActionPath.status, "one-email-send-ready");
  assert.equal(restored.state.emailActionPath.status, "one-email-send-ready");
});
