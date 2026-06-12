import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-sem-action-"));
  return new ProjectService({
    eventLogPath: path.join(root, "events.ndjson"),
  });
}

function createProject(service) {
  return service.createProject({
    id: `sem-action-${Date.now()}`,
    name: "SEM Action Project",
    goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
    state: {
      artifactExpectation: { projectType: "internal-tool" },
      runtimeSkeletonTruth: {
        runtimeSkeletonId: "runtime-sem-action-service",
        title: "ניהול לידים",
        productClass: "internal-tool",
      },
      productDomainSkeleton: {
        productDomainSkeletonId: "domain-sem-action-service",
      },
      productOwnedBackendSkeleton: {
        productOwnedBackendSkeletonId: "backend-sem-action-service",
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

test("ProjectService stores GROW-SEM-001 truth through growth and explicit SEM runs", () => {
  const service = createService();
  const created = createProject(service);

  const afterGrowth = service.runGrowthAgent({
    projectId: created.id,
    userInput: "תכין Google Ads בתקציב קטן",
  });

  assert.equal(afterGrowth.semActionPath.taskId, "GROW-SEM-001");
  assert.equal(afterGrowth.semActionPath.status, "draft-only-provider-missing");
  assert.equal(afterGrowth.context.semActionPath.status, "draft-only-provider-missing");
  assert.equal(afterGrowth.state.semActionPath.status, "draft-only-provider-missing");

  const providerOnly = service.runSemActionPath({
    projectId: created.id,
    userInput: "תפעיל את הקמפיין",
    providerConnection: {
      provider: "google-ads",
      connected: true,
      scopes: ["ad-draft"],
    },
  });
  assert.equal(providerOnly.semActionPath.status, "needs-provider-scope");
  assert.equal(providerOnly.semActionPath.externalSpendPerformed, false);

  const ready = service.runSemActionPath({
    projectId: created.id,
    userInput: "תפעיל את הקמפיין",
    providerConnection: {
      provider: "google-ads",
      connected: true,
      scopes: ["ad-draft", "spend-approval"],
    },
    approvalDecisions: {
      approvals: [
        { action: "campaign", approved: true },
        { action: "ad", approved: true },
        { action: "budget", approved: true },
        { action: "activation", approved: true },
      ],
    },
  });

  assert.equal(ready.semActionPath.status, "ready-for-provider-activation");
  assert.equal(ready.semActionPath.activationPrepared, true);
  assert.equal(ready.semActionPath.externalSpendPerformed, false);

  const restored = service.getProject(created.id);
  assert.equal(restored.semActionPath.status, "ready-for-provider-activation");
  assert.equal(restored.context.semActionPath.status, "ready-for-provider-activation");
  assert.equal(restored.state.semActionPath.status, "ready-for-provider-activation");
});
