import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionConsistencyValidator } from "../src/core/execution-consistency-validator.js";

test("execution consistency validator reports consistent when envelope, dispatch result, and evidence align", () => {
  const { executionConsistencyReport } = createExecutionConsistencyValidator({
    atomicExecutionEnvelope: {
      atomicExecutionEnvelopeId: "atomic-envelope:req-1",
      executionRequestId: "req-1",
      status: "ready",
      action: {
        actionType: "deploy",
        requestedOperation: "deploy",
      },
      target: {
        providerType: "hosting",
      },
    },
    externalExecutionResult: {
      externalExecutionResultId: "external-execution:req-1",
      executionRequestId: "req-1",
      providerType: "hosting",
      status: "dispatched",
      dispatchedOperation: "deploy",
      stateUpdateProposal: {
        status: "pending-reconcile",
      },
      storedEvidence: [
        { evidenceType: "idempotency-key", reference: "idempotency" },
        { evidenceType: "provider-receipt", reference: "receipt" },
      ],
    },
    projectState: {
      projectAuditRecord: { projectAuditRecordId: "audit-record-1" },
      auditLogRecord: { auditLogId: "system-audit-1" },
    },
  });

  assert.equal(executionConsistencyReport.status, "consistent");
  assert.equal(executionConsistencyReport.summary.isConsistent, true);
  assert.equal(executionConsistencyReport.failedChecks.length, 0);
  assert.equal(executionConsistencyReport.stateUpdateDecision.canAdvance, true);
});

test("execution consistency validator reports drift when provider and evidence do not align", () => {
  const { executionConsistencyReport } = createExecutionConsistencyValidator({
    atomicExecutionEnvelope: {
      atomicExecutionEnvelopeId: "atomic-envelope:req-2",
      executionRequestId: "req-2",
      status: "ready",
      action: {
        actionType: "deploy",
        requestedOperation: "deploy",
      },
      target: {
        providerType: "hosting",
      },
    },
    externalExecutionResult: {
      externalExecutionResultId: "external-execution:req-2",
      executionRequestId: "req-2",
      providerType: "analytics",
      status: "dispatched",
      dispatchedOperation: "validate",
      stateUpdateProposal: {
        status: "blocked",
      },
      storedEvidence: [],
    },
    projectState: {},
  });

  assert.equal(executionConsistencyReport.status, "inconsistent");
  assert.equal(executionConsistencyReport.summary.isConsistent, false);
  assert.equal(executionConsistencyReport.failedChecks.includes("provider-alignment"), true);
  assert.equal(executionConsistencyReport.failedChecks.includes("evidence-coverage"), true);
});
