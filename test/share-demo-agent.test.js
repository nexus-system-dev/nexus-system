import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  approveShareDemoAgentEnvelope,
  buildShareDemoAgentEnvelope,
  revokeShareDemoAgentEnvelope,
} from "../src/core/share-demo-agent.js";
import { ProjectService } from "../src/core/project-service.js";

function createProject() {
  return {
    id: "share-agent-project",
    name: "Lead Manager",
    goal: "לנהל לידים ולשלוח דמו בטוח ללקוח",
    artifactExpectation: {
      projectType: "internal-tool",
      title: "Lead Manager",
      summary: "כלי ניהול לידים לתפעול יומי.",
    },
    runtimeSkeletonTruth: {
      title: "Lead Manager",
      productKind: "internal-tool",
    },
    productDomainSkeleton: {
      domainModel: { name: "ליד" },
    },
    skeletonChoiceTruth: {
      selectedProductDirection: "operational",
      selectedCandidate: {
        userFacingLabel: "כיוון תפעולי ממוקד",
      },
    },
  };
}

function createProjectService(directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-share-agent-"))) {
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("SHARE-AGT-001 prepares a bounded proposal without fabricating a link", () => {
  const envelope = buildShareDemoAgentEnvelope({
    project: createProject(),
    input: {
      requestText: "תכין דמו ללקוח",
      viewerType: "לקוח",
    },
  });

  assert.equal(envelope.taskId, "SHARE-AGT-001");
  assert.equal(envelope.agentId, "share-demo-agent");
  assert.equal(envelope.status, "approval-required");
  assert.equal(envelope.approvalStatus, "waiting");
  assert.equal(envelope.shareLink, "");
  assert.equal(envelope.active, false);
  assert.equal(envelope.visibilityBoundary.exclude.includes("שיחה פרטית עם Nexus"), true);
  assert.equal(envelope.visibilityBoundary.exclude.includes("שמות סוכנים ומשימות פנימיות"), true);
  assert.match(envelope.providerBoundary, /אין פרסום חיצוני/);
});

test("SHARE-AGT-001 approval creates a local snapshot path and revoke deactivates it", () => {
  const project = createProject();
  const proposal = buildShareDemoAgentEnvelope({
    project,
    input: {
      requestText: "תכין קישור ציבורי",
      shareType: "public-link",
    },
  });

  const approved = approveShareDemoAgentEnvelope({ project, envelope: proposal });
  assert.equal(approved.status, "approved-snapshot");
  assert.equal(approved.active, true);
  assert.equal(approved.approvalStatus, "approved");
  assert.match(approved.shareLink, /^\/share\?projectId=share-agent-project&shareId=/);
  assert.match(approved.userReply, /לא פרסום ציבורי/);

  const revoked = revokeShareDemoAgentEnvelope({ envelope: approved });
  assert.equal(revoked.status, "revoked");
  assert.equal(revoked.active, false);
  assert.equal(revoked.approvalStatus, "revoked");
});

test("project service persists SHARE-AGT-001 prepare, approve, revoke, and rebuild restore", () => {
  const service = createProjectService();
  service.createProject({
    id: "share-service-project",
    name: "Lead Manager",
    goal: "לנהל לידים ולשלוח דמו בטוח ללקוח",
    state: {
      artifactExpectation: {
        projectType: "internal-tool",
        title: "Lead Manager",
      },
    },
  });

  const prepared = service.prepareShareDemo({
    projectId: "share-service-project",
    input: {
      requestText: "תכין דמו ללקוח",
      viewerType: "לקוח",
    },
  });
  assert.equal(prepared.shareDemoAgent.taskId, "SHARE-AGT-001");
  assert.equal(prepared.shareDemoAgent.status, "approval-required");
  assert.equal(prepared.shareDemoAgent.shareLink, "");

  const approved = service.approveShareDemo({ projectId: "share-service-project" });
  assert.equal(approved.shareDemoAgent.status, "approved-snapshot");
  assert.equal(approved.shareDemoAgent.active, true);
  assert.match(approved.shareDemoAgent.shareLink, /^\/share\?projectId=share-service-project&shareId=/);

  const restored = service.rebuildContext("share-service-project");
  assert.equal(restored.shareDemoAgent.status, "approved-snapshot");
  assert.equal(restored.shareDemoAgent.active, true);

  const revoked = service.revokeShareDemo({ projectId: "share-service-project" });
  assert.equal(revoked.shareDemoAgent.status, "revoked");
  assert.equal(revoked.shareDemoAgent.active, false);
});
