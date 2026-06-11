import test from "node:test";
import assert from "node:assert/strict";

import {
  applyProductDomainOperation,
  buildProductDomainSkeletonEnvelope,
} from "../web/shared/product-domain-skeleton.js";

test("PRODUCT-BACKEND-SKEL-001 — mobile app task creation and update use domain operations", () => {
  const skeleton = buildProductDomainSkeletonEnvelope({
    projectId: "mobile-domain-proof",
    productClass: "mobile-app",
    runtimeSkeletonId: "runtime-skeleton:mobile-domain-proof:mobile-app",
  });

  const created = applyProductDomainOperation(skeleton, "task.create", { title: "בדיקת בוקר" });
  assert.equal(created.ok, true);
  assert.equal(created.domainSkeleton.state.tasks.at(-1).title, "בדיקת בוקר");

  const updated = applyProductDomainOperation(created.domainSkeleton, "task.updateStatus", {
    taskId: created.domainSkeleton.state.tasks.at(-1).id,
    status: "done",
  });
  assert.equal(updated.ok, true);
  assert.equal(updated.domainSkeleton.state.tasks.at(-1).status, "done");
  assert.equal(updated.domainSkeleton.domainTaskId, "PRODUCT-BACKEND-SKEL-001");
});

test("PRODUCT-BACKEND-SKEL-001 — landing page lead submit validates and stores mock lead record", () => {
  const skeleton = buildProductDomainSkeletonEnvelope({
    projectId: "landing-domain-proof",
    productClass: "landing-page",
    runtimeSkeletonId: "runtime-skeleton:landing-domain-proof:landing-page",
  });

  const rejected = applyProductDomainOperation(skeleton, "lead.submit", { name: "", phone: "" });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error, "lead-validation-failed");

  const submitted = applyProductDomainOperation(skeleton, "lead.submit", {
    name: "דנה",
    phone: "0500000000",
    message: "אני רוצה פרטים",
  });
  assert.equal(submitted.ok, true);
  assert.equal(submitted.domainSkeleton.state.leads.length, 1);
  assert.equal(submitted.domainSkeleton.state.lastSubmissionStatus, "saved");
});

test("PRODUCT-BACKEND-SKEL-001 — internal tool status update uses record domain operation", () => {
  const skeleton = buildProductDomainSkeletonEnvelope({
    projectId: "internal-domain-proof",
    productClass: "internal-tool",
    runtimeSkeletonId: "runtime-skeleton:internal-domain-proof:internal-tool",
  });

  const updated = applyProductDomainOperation(skeleton, "record.updateStatus", {
    recordId: "rec-1",
    status: "נסגר",
  });
  assert.equal(updated.ok, true);
  assert.equal(updated.domainSkeleton.state.records[0].status, "נסגר");
});

test("EXP-001 — internal tool supports direct record selection and reminder editing", () => {
  const skeleton = buildProductDomainSkeletonEnvelope({
    projectId: "internal-direct-edit-proof",
    productClass: "internal-tool",
    runtimeSkeletonId: "runtime-skeleton:internal-direct-edit-proof:internal-tool",
  });

  const selected = applyProductDomainOperation(skeleton, "record.select", {
    recordId: "rec-2",
  });
  const reminderUpdated = applyProductDomainOperation(selected.domainSkeleton, "record.updateReminder", {
    recordId: "rec-2",
    reminder: "מחר 09:00",
  });

  assert.equal(selected.ok, true);
  assert.equal(selected.domainSkeleton.state.selectedRecordId, "rec-2");
  assert.equal(reminderUpdated.ok, true);
  assert.equal(reminderUpdated.domainSkeleton.state.selectedRecordId, "rec-2");
  assert.equal(reminderUpdated.domainSkeleton.state.records[1].reminder, "מחר 09:00");
});

test("PRODUCT-BACKEND-SKEL-001 — commerce cart operation updates cart and preserves payment boundary", () => {
  const skeleton = buildProductDomainSkeletonEnvelope({
    projectId: "commerce-domain-proof",
    productClass: "commerce-ops",
    runtimeSkeletonId: "runtime-skeleton:commerce-domain-proof:commerce-ops",
  });

  const added = applyProductDomainOperation(skeleton, "cart.addItem", {
    productId: "prod-1",
    quantity: 2,
  });
  assert.equal(added.ok, true);
  assert.equal(added.domainSkeleton.state.cart.items.length, 1);
  assert.equal(added.domainSkeleton.state.cart.total, 240);
  assert.equal(added.domainSkeleton.state.orderDraft.paymentBoundary, "blocked-real-payment");
});
