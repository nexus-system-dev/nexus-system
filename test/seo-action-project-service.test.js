import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-seo-action-"));
  return new ProjectService({
    eventLogPath: path.join(root, "events.ndjson"),
  });
}

function createProject(service) {
  return service.createProject({
    id: `seo-action-${Date.now()}`,
    name: "SEO Action Project",
    goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
    state: {
      artifactExpectation: { projectType: "internal-tool" },
      runtimeSkeletonTruth: {
        runtimeSkeletonId: "runtime-seo-action-service",
        title: "ניהול לידים",
        productClass: "internal-tool",
      },
      productDomainSkeleton: {
        productDomainSkeletonId: "domain-seo-action-service",
      },
      productOwnedBackendSkeleton: {
        productOwnedBackendSkeletonId: "backend-seo-action-service",
        productionBackend: false,
      },
    },
  });
}

test("ProjectService stores GROW-SEO-001 truth through growth and explicit SEO runs", () => {
  const service = createService();
  const created = createProject(service);

  const afterGrowth = service.runGrowthAgent({
    projectId: created.id,
    userInput: "תכין SEO לעמוד הזה",
  });

  assert.equal(afterGrowth.seoActionPath.taskId, "GROW-SEO-001");
  assert.equal(afterGrowth.seoActionPath.status, "draft-ready");
  assert.equal(afterGrowth.context.seoActionPath.status, "draft-ready");
  assert.equal(afterGrowth.state.seoActionPath.status, "draft-ready");

  const needsApproval = service.runSeoActionPath({
    projectId: created.id,
    userInput: "apply SEO updates",
  });
  assert.equal(needsApproval.seoActionPath.status, "needs-approval");
  assert.equal(needsApproval.seoActionPath.visiblePageUpdated, false);

  const applied = service.runSeoActionPath({
    projectId: created.id,
    userInput: "apply SEO updates",
    approvalDecisions: {
      approvals: [
        { action: "apply-seo", approved: true },
      ],
    },
  });
  assert.equal(applied.seoActionPath.status, "applied-to-visual-build");
  assert.equal(applied.seoActionPath.visiblePageUpdated, true);

  const restored = service.getProject(created.id);
  assert.equal(restored.seoActionPath.status, "applied-to-visual-build");
  assert.equal(restored.context.seoActionPath.status, "applied-to-visual-build");
  assert.equal(restored.state.seoActionPath.status, "applied-to-visual-build");
});
