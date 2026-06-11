import test from "node:test";
import assert from "node:assert/strict";

import { buildRuntimeSkeletonTruthEnvelope } from "../web/shared/runtime-skeleton-truth.js";
import { applyProductOwnedBackendMutation } from "../web/shared/product-owned-backend-skeleton.js";
import { applyProductDomainOperation } from "../web/shared/product-domain-skeleton.js";

function createLeadProject() {
  return {
    id: "product-owned-backend-leads",
    name: "ניהול לידים לעסק קטן",
    ownerId: "owner-1",
    classification: { projectType: "internal-tool" },
    productSkeletonAgentOutput: {
      productType: "כלי פנימי לניהול לידים",
      primaryUser: "בעל עסק קטן",
      primaryProblem: "לידים נופלים כי אין אחראי ותזכורת",
      dataObjects: [{ name: "Lead", fields: ["name", "status", "owner", "reminder", "nextStep"] }],
      initialActions: ["הוסף ליד", "עדכן סטטוס", "שייך אחראי"],
      firstWorkflow: { title: "ניהול לידים יומי", whyThisFirst: "כל ליד צריך אחראי וצעד הבא" },
      versionOneBoundary: { buildNow: ["רשימת לידים", "אחראי", "תזכורת"], doNotBuildNow: ["וואטסאפ אמיתי"] },
    },
  };
}

test("PRODUCT-BACKEND-SKEL-002 — first runtime skeleton includes a product-owned backend skeleton", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({ project: createLeadProject() });
  const backend = runtime.productOwnedBackendSkeleton;

  assert.equal(backend.taskId, "PRODUCT-BACKEND-SKEL-002");
  assert.equal(backend.projectId, "product-owned-backend-leads");
  assert.equal(backend.productOwnedBackendSkeletonId, "product-owned-backend:product-owned-backend-leads:internal-tool");
  assert.equal(backend.productDomainSkeletonId, runtime.productDomainSkeleton.productDomainSkeletonId);
  assert.equal(backend.frontendBackendPairing.status, "paired-from-first-skeleton");
  assert.equal(backend.growthPolicy.frontendAndBackendMustGrowTogether, true);
  assert.equal(backend.productionBackend, false);
  assert.match(backend.files.backendEntry, /nexus-projects\/owner-1\/product-owned-backend-leads\/product\/backend\/server\.js/);
  assert.equal(backend.apiBoundary.endpoints.some((endpoint) => endpoint.operationId === "record.create"), true);
  assert.equal(runtime.productOwnedBackendSkeletonId, backend.productOwnedBackendSkeletonId);
});

test("PRODUCT-BACKEND-SKEL-002 — product-owned backend grows when domain schema mutates", () => {
  const runtime = buildRuntimeSkeletonTruthEnvelope({ project: createLeadProject() });
  const domainResult = applyProductDomainOperation(
    runtime.productDomainSkeleton,
    "record.addField",
    { fieldName: "מקור ליד", defaultValue: "לא סומן" },
  );

  const backend = applyProductOwnedBackendMutation({
    productOwnedBackendSkeleton: runtime.productOwnedBackendSkeleton,
    productDomainSkeleton: domainResult.domainSkeleton,
    intent: { mutationId: "mutation-1", operationId: "record.addField" },
    operationId: "record.addField",
    payload: { fieldName: "מקור ליד", defaultValue: "לא סומן" },
    status: "applied",
    now: "2026-06-08T00:00:00.000Z",
  });

  const recordModel = backend.models.find((model) => model.name === "Record");
  assert.equal(recordModel.fields.some((field) => field.name === "מקור ליד"), true);
  assert.equal(backend.persistence.state.records[0]["מקור ליד"], "לא סומן");
  assert.equal(backend.lastMutationId, "mutation-1");
  assert.equal(backend.mutationHistory.at(-1).operationId, "record.addField");
  assert.equal(backend.apiBoundary.endpoints.some((endpoint) => endpoint.operationId === "record.addField"), true);
});
