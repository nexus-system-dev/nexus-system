import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-landing-action-"));
  return new ProjectService({
    eventLogPath: path.join(root, "events.ndjson"),
  });
}

function createProject(service) {
  return service.createProject({
    id: `landing-action-${Date.now()}`,
    name: "Landing Action Project",
    goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
    targetAudience: "בעלי עסקים שמאבדים לידים בגלל חוסר מעקב",
    problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
    coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
    productDirection: "internal-tool",
    state: {
      artifactExpectation: { projectType: "internal-tool" },
      targetAudience: "בעלי עסקים שמאבדים לידים בגלל חוסר מעקב",
      problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
      coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
      productDirection: "internal-tool",
      runtimeSkeletonTruth: {
        runtimeSkeletonId: "runtime-landing-action-service",
        title: "ניהול לידים",
        productClass: "internal-tool",
      },
      productDomainSkeleton: {
        productDomainSkeletonId: "domain-landing-action-service",
      },
      productOwnedBackendSkeleton: {
        productOwnedBackendSkeletonId: "backend-landing-action-service",
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

test("ProjectService stores GROW-LAND-001 truth through growth and explicit landing runs", () => {
  const service = createService();
  const created = createProject(service);

  const afterGrowth = service.runGrowthAgent({
    projectId: created.id,
    userInput: "תכין דף נחיתה לבדיקה",
  });

  assert.equal(afterGrowth.landingActionPath.taskId, "GROW-LAND-001");
  assert.equal(afterGrowth.landingActionPath.status, "draft-ready");
  assert.equal(afterGrowth.context.landingActionPath.status, "draft-ready");
  assert.equal(afterGrowth.state.landingActionPath.status, "draft-ready");
  assert.equal(afterGrowth.growthAgent.landingActionPath.status, "draft-ready");

  const blocked = service.runLandingActionPath({
    projectId: created.id,
    userInput: "פרסם את דף הנחיתה",
  });
  assert.equal(blocked.landingActionPath.status, "needs-share-or-release-gate");
  assert.equal(blocked.landingActionPath.externalPublicationPerformed, false);

  const preview = service.runLandingActionPath({
    projectId: created.id,
    userInput: "פתח תצוגה מקדימה של דף הנחיתה",
    leadCapture: {
      storage: "nexus-experiment-leads",
      consentText: "אני מאשר/ת שיחזרו אליי לצורך בדיקת התאמה.",
    },
  });
  assert.equal(preview.landingActionPath.status, "preview-ready");
  assert.equal(preview.landingActionPath.visibility.publicVisible, false);
  assert.equal(preview.landingActionPath.leadCapture.consentConfigured, true);

  const shared = service.runLandingActionPath({
    projectId: created.id,
    userInput: "שתף דמו של דף הנחיתה",
    shareDemoAgent: { status: "ready", shareId: "share-landing" },
    approvalDecisions: {
      approvals: [{ action: "share-demo", approved: true }],
    },
  });
  assert.equal(shared.landingActionPath.status, "shared-demo-ready");
  assert.equal(shared.landingActionPath.visibility.publicVisible, true);
  assert.equal(shared.landingActionPath.externalPublicationPerformed, false);

  const restored = service.getProject(created.id);
  assert.equal(restored.landingActionPath.status, "shared-demo-ready");
  assert.equal(restored.context.landingActionPath.status, "shared-demo-ready");
  assert.equal(restored.state.landingActionPath.status, "shared-demo-ready");
});
