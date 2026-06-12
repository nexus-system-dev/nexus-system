import test from "node:test";
import assert from "node:assert/strict";

import { buildLandingActionPathEnvelope } from "../src/core/landing-action-path.js";
import { buildLandingBackendSyncEnvelope, summarizeLandingBackendSync } from "../src/core/landing-backend-sync.js";

const project = {
  id: "land-backend-leads",
  ownerId: "owner-1",
  name: "ניהול לידים",
  goal: "כלי פנימי לניהול לידים מוואטסאפ ושיחות עם אחראי, תזכורת וצעד הבא.",
  targetAudience: "בעלי עסקים שמאבדים לידים בגלל חוסר מעקב",
  problem: "אין בעלות ברורה על ליד ואין תזכורת לצעד הבא.",
  coreValue: "לראות מי אחראי, מתי חוזרים ומה הצעד הבא.",
  productDirection: "internal-tool",
  runtimeSkeletonTruth: {
    runtimeSkeletonId: "runtime-land-backend-leads",
    title: "ניהול לידים",
    productClass: "internal-tool",
  },
  productOwnedBackendSkeleton: {
    productOwnedBackendSkeletonId: "product-owned-backend:land-backend-leads:internal-tool",
    artifactRoot: "nexus-projects/owner-1/land-backend-leads/product",
    productionBackend: false,
    models: [
      {
        name: "Record",
        fields: [
          { name: "שם", type: "string", required: true },
          { name: "סטטוס", type: "string", required: true },
          { name: "אחראי", type: "string", required: false },
        ],
      },
    ],
    persistence: {
      state: {
        records: [],
      },
    },
    apiBoundary: {
      endpoints: [],
    },
  },
};

const measurementTruth = {
  taskId: "GROW-MEASURE-001",
  status: "has-initial-signal",
};

test("GROW-LAND-BACKEND-001 creates packageable landing backend and sync contract", () => {
  const landingActionPath = buildLandingActionPathEnvelope({
    project,
    userInput: "תכין דף נחיתה לבדיקה",
    measurementTruth,
  });
  const backend = buildLandingBackendSyncEnvelope({
    project,
    landingActionPath,
    leadCapture: landingActionPath.leadCapture,
  });

  assert.equal(backend.taskId, "GROW-LAND-BACKEND-001");
  assert.equal(backend.status, "package-contract-ready");
  assert.equal(backend.storageStatus, "product-owned-local-mock");
  assert.equal(backend.packageContract.status, "package-contract-ready");
  assert.equal(backend.packageContract.environment.productionHosting, false);
  assert.equal(backend.packageContract.environment.consumedBy.includes("PRODUCT-RUNTIME-PACKAGE-001"), true);
  assert.equal(backend.packageContract.environment.consumedBy.includes("STANDALONE-ARTIFACT-001"), true);
  assert.equal(backend.syncContract.direction, "landing-to-product");
  assert.equal(backend.externalCaptureAllowed, false);
  assert.equal(backend.releaseGate.externalCaptureBlocked, true);
  assert.equal(backend.productTruthOwner, "source-product-not-landing");
});

test("GROW-LAND-BACKEND-001 writes submitted lead into landing backend and product backend mirror", () => {
  const landingActionPath = buildLandingActionPathEnvelope({
    project,
    userInput: "תכין דף נחיתה לבדיקה",
    measurementTruth,
  });
  const backend = buildLandingBackendSyncEnvelope({
    project,
    landingActionPath,
    leadCapture: landingActionPath.leadCapture,
    leadSubmission: {
      leadId: "lead-1",
      name: "נועה",
      email: "noa@example.test",
      need: "מעקב אחרי לידים",
      consent: true,
      source: "landing-page",
    },
    now: "2026-06-12T10:00:00.000Z",
  });

  assert.equal(backend.status, "synced");
  assert.equal(backend.leads.length, 1);
  assert.equal(backend.productBackendLeadMirror.length, 1);
  assert.equal(backend.leads[0].consent, true);
  assert.equal(backend.leads[0].landingDraftId, "landing-draft:land-backend-leads");
  assert.equal(backend.leads[0].productId, "land-backend-leads");
  assert.equal(backend.leads[0].measurementEventId, "measurement:landing.form.submitted:lead-1");
  assert.equal(backend.productOwnedBackendSkeletonAfterSync.persistence.state.landingLeads.length, 1);
  assert.equal(
    backend.productOwnedBackendSkeletonAfterSync.apiBoundary.endpoints.some((endpoint) => endpoint.operationId === "landing.lead.create"),
    true,
  );
  assert.equal(backend.measurementEvents.some((event) => event.eventName === "lead.created"), true);

  const summary = summarizeLandingBackendSync(backend);
  assert.equal(summary.leadCount, 1);
  assert.equal(summary.productBackendLeadCount, 1);
  assert.equal(summary.externalCaptureBlocked, true);
});

test("GROW-LAND-BACKEND-001 rejects missing consent and duplicate sync without fake success", () => {
  const landingActionPath = buildLandingActionPathEnvelope({
    project,
    userInput: "תכין דף נחיתה לבדיקה",
    measurementTruth,
  });
  const accepted = buildLandingBackendSyncEnvelope({
    project,
    landingActionPath,
    leadCapture: landingActionPath.leadCapture,
    leadSubmission: { leadId: "lead-1", name: "נועה", email: "noa@example.test", consent: true },
  });
  const duplicate = buildLandingBackendSyncEnvelope({
    project,
    landingActionPath,
    leadCapture: landingActionPath.leadCapture,
    previousEnvelope: accepted,
    leadSubmission: { leadId: "lead-1", name: "נועה", email: "noa@example.test", consent: true },
  });
  const rejected = buildLandingBackendSyncEnvelope({
    project,
    landingActionPath,
    leadCapture: landingActionPath.leadCapture,
    previousEnvelope: accepted,
    leadSubmission: { leadId: "lead-2", name: "דנה", email: "dana@example.test", consent: false },
  });

  assert.equal(duplicate.status, "sync-failed");
  assert.equal(duplicate.leads.length, 1);
  assert.equal(duplicate.productBackendLeadMirror.length, 1);
  assert.equal(rejected.status, "lead-rejected");
  assert.equal(rejected.leads.length, 1);
  assert.equal(rejected.lastLead.status, "rejected");
});

test("GROW-LAND-BACKEND-001 uses Nexus experiment fallback only without product backend", () => {
  const landingActionPath = buildLandingActionPathEnvelope({
    project: { ...project, productOwnedBackendSkeleton: null },
    userInput: "תכין דף נחיתה לבדיקה",
    measurementTruth,
  });
  const backend = buildLandingBackendSyncEnvelope({
    project: { ...project, productOwnedBackendSkeleton: null },
    landingActionPath,
  });

  assert.equal(backend.status, "fallback-only");
  assert.equal(backend.storageStatus, "nexus-experiment-leads");
  assert.equal(backend.nexusExperimentFallbackUsed, true);
  assert.equal(backend.productBackendId, "");
});
