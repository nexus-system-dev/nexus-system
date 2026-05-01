import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineApprovalOutcomeSchema } from "../src/core/baseline-approval-outcome-schema.js";

function buildApprovalRequest() {
  return {
    approvalRequestId: "approval:giftwallet:proposal",
    actionPayload: {
      sections: [
        { sectionId: "section-1", status: "pending" },
        { sectionId: "section-2", status: "pending" },
      ],
      components: [
        { componentId: "component-1", status: "pending" },
      ],
      copy: [
        { copyId: "copy-1", status: "pending" },
      ],
    },
  };
}

test("baseline approval outcome schema derives approved outcome deterministically", () => {
  const { approvalOutcome } = createBaselineApprovalOutcomeSchema({
    approvalRequest: buildApprovalRequest(),
    approvalRecords: [{ decision: "approved" }],
    approvalStatus: { status: "approved" },
    partialAcceptanceSelection: {
      sectionOutcomes: [{ sectionId: "section-1", decision: "approved", note: "ready" }],
      componentOutcomes: [{ componentId: "component-1", decision: "approved" }],
      copyOutcomes: [{ copyId: "copy-1", decision: "approved" }],
    },
  });

  assert.equal(approvalOutcome.status, "approved");
  assert.equal(approvalOutcome.sectionOutcomes[0].decision, "approved");
  assert.equal(approvalOutcome.componentOutcomes[0].decision, "approved");
  assert.equal(approvalOutcome.copyOutcomes[0].decision, "approved");
});

test("baseline approval outcome schema derives rejected outcome deterministically", () => {
  const { approvalOutcome } = createBaselineApprovalOutcomeSchema({
    approvalRequest: buildApprovalRequest(),
    approvalRecords: [{ decision: "rejected" }],
    approvalStatus: { status: "rejected" },
    partialAcceptanceSelection: {
      sectionOutcomes: [{ sectionId: "section-1", decision: "rejected", note: "drop it" }],
    },
  });

  assert.equal(approvalOutcome.status, "rejected");
  assert.equal(approvalOutcome.sectionOutcomes[0].decision, "rejected");
  assert.equal(approvalOutcome.sectionOutcomes[1].decision, "pending");
});

test("baseline approval outcome schema keeps pending status for remaining selections", () => {
  const { approvalOutcome } = createBaselineApprovalOutcomeSchema({
    approvalRequest: buildApprovalRequest(),
    approvalRecords: [],
    approvalStatus: { status: "pending" },
    partialAcceptanceSelection: {
      sectionOutcomes: [{ sectionId: "section-1", decision: "approved" }],
      componentOutcomes: [{ componentId: "component-1", decision: "rejected", note: "redo" }],
    },
  });

  assert.equal(approvalOutcome.status, "pending");
  assert.equal(approvalOutcome.sectionOutcomes[0].decision, "approved");
  assert.equal(approvalOutcome.sectionOutcomes[1].decision, "pending");
  assert.equal(approvalOutcome.componentOutcomes[0].decision, "rejected");
  assert.equal(approvalOutcome.copyOutcomes[0].decision, "pending");
});
