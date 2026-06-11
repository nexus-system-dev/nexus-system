import test from "node:test";
import assert from "node:assert/strict";

import { buildRuntimeSkeletonTruthEnvelope } from "../web/shared/runtime-skeleton-truth.js";
import { buildProfessionalSkeletonQualityEnvelope } from "../web/shared/professional-skeleton-quality.js";

test("PRO-SKEL-001 — mobile skeleton passes only with simulator screens, state, navigation, and domain operations", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({
    project: {
      id: "pro-mobile-daily-done",
      name: "Daily Done",
      artifactExpectation: { projectType: "mobile app", title: "Daily Done" },
      productSkeletonAgentOutput: {
        productType: "mobile app",
        primaryUser: "משתמש יומי",
        primaryProblem: "צריך לסמן משימות שבוצעו",
        firstWorkflow: { title: "Daily Done", steps: ["פתח", "הוסף", "סמן"] },
        initialScreens: [{ name: "בית" }, { name: "היום" }, { name: "סיכום" }],
        initialActions: ["הוסף משימה", "סמן בוצע", "מחק"],
        dataObjects: [{ name: "Task", fields: ["title", "status", "owner"] }],
        versionOneBoundary: { buildNow: ["מסכים", "מצב"], doNotBuildNow: ["App Store"] },
      },
    },
  });

  assert.equal(runtime.professionalSkeletonQuality.taskId, "PRO-SKEL-001");
  assert.equal(runtime.professionalSkeletonQuality.status, "pass");
  assert.equal(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.taskId, "PRO-SKEL-002");
  assert.equal(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.status, "pass");
  assert.equal(runtime.professionalSkeletonQuality.productRealisticSkeletonQuality.taskId, "PRO-SKEL-003");
  assert.equal(runtime.professionalSkeletonQuality.productRealisticSkeletonQuality.status, "pass");
  assert.equal(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.level, "market-calibrated-nexus-standard");
  assert.equal(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.buildContinuationAllowed, true);
  assert.equal(runtime.professionalSkeletonQuality.buildContinuationAllowed, true);
  assert.equal(runtime.screens.length, 3);
  assert.equal(runtime.appTabs.length, 3);
  assert.ok(runtime.professionalSkeletonQuality.criteria.every((criterion) => criterion.ok));
  assert.ok(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.criteria.every((criterion) => criterion.ok));
});

test("PRO-SKEL-001 — landing page skeleton passes with professional page depth, proof, trust, and lead capture", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({
    project: {
      id: "pro-landing-leads",
      name: "Lead Rescue",
      artifactExpectation: { projectType: "landing page", title: "Lead Rescue" },
      productSkeletonAgentOutput: {
        productType: "landing page",
        primaryUser: "בעל עסק קטן",
        primaryProblem: "לידים נופלים בלי אחראי",
        firstWorkflow: { title: "Lead Rescue", steps: ["הסבר", "הוכחה", "השאר פרטים"] },
        initialActions: ["השאר פרטים"],
        versionOneBoundary: { buildNow: ["דף", "טופס"], doNotBuildNow: ["פרסום"] },
      },
    },
  });

  const sectionKinds = runtime.sections.map((section) => section.kind);
  assert.equal(runtime.professionalSkeletonQuality.status, "pass");
  assert.equal(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.status, "pass");
  assert.equal(runtime.professionalSkeletonQuality.productRealisticSkeletonQuality.status, "pass");
  assert.ok(sectionKinds.includes("hero"));
  assert.ok(sectionKinds.includes("form"));
  assert.ok(sectionKinds.includes("trust"));
  assert.ok(sectionKinds.includes("proof"));
  assert.ok(runtime.productDomainSkeleton.operations.some((operation) => operation.id === "lead.submit"));
});

test("PRO-SKEL-001 — internal tool skeleton passes with workspace density, records, actions, and domain state", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({
    project: {
      id: "pro-internal-leads",
      name: "לוח לידים",
      artifactExpectation: { projectType: "internal tool", title: "לוח לידים" },
      productSkeletonAgentOutput: {
        productType: "internal tool",
        primaryUser: "בעל עסק קטן",
        primaryProblem: "לידים נופלים בלי אחראי ותזכורת",
        firstWorkflow: { title: "לוח לידים", steps: ["הוסף ליד", "שייך אחראי", "קבע תזכורת"] },
        initialActions: ["הוסף ליד", "עדכן סטטוס", "שנה אחראי"],
        dataObjects: [{ name: "Lead", fields: ["name", "status", "owner", "reminder", "nextStep"] }],
        versionOneBoundary: { buildNow: ["טבלה", "טופס", "סטטוס"], doNotBuildNow: ["וואטסאפ"] },
      },
    },
  });

  assert.equal(runtime.professionalSkeletonQuality.status, "pass");
  assert.equal(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.status, "pass");
  assert.equal(runtime.professionalSkeletonQuality.productRealisticSkeletonQuality.status, "pass");
  assert.ok(runtime.professionalSkeletonQuality.marketCalibratedSkeletonQuality.criteria.some((criterion) => criterion.id === "learning-uplift-ready" && criterion.ok));
  assert.equal(runtime.metrics.length, 3);
  assert.equal(runtime.tableRows.length, 3);
  assert.equal(runtime.workflowActions.length, 4);
  assert.equal(runtime.filters.length, 4);
  assert.ok(runtime.productDomainSkeleton.operations.some((operation) => operation.id === "record.updateStatus"));
});

test("PRO-SKEL-001 — generic skeletons are blocked even if a simple tool frame could render", () => {
  const quality = buildProfessionalSkeletonQualityEnvelope({
    productClass: "generic",
    shellFamily: "tool-control-shell",
    controls: ["הפעל"],
    panels: [{ title: "קלט" }],
    productDomainSkeleton: { operations: [] },
  });

  assert.equal(quality.status, "blocked");
  assert.equal(quality.buildContinuationAllowed, false);
  assert.equal(quality.marketCalibratedSkeletonQuality.taskId, "PRO-SKEL-002");
  assert.equal(quality.marketCalibratedSkeletonQuality.status, "blocked");
  assert.equal(quality.productRealisticSkeletonQuality.status, "blocked");
  assert.equal(quality.marketCalibratedSkeletonQuality.buildContinuationAllowed, false);
  assert.ok(quality.failedCriteria.length > 0);
  assert.ok(quality.marketCalibratedSkeletonQuality.failedCriteria.length > 0);
});
