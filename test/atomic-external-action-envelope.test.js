import test from "node:test";
import assert from "node:assert/strict";

import { createAtomicExternalActionEnvelope } from "../src/core/atomic-external-action-envelope.js";

test("atomic external action envelope returns ready atomic contract when provider and policy allow dispatch", () => {
  const { atomicExecutionEnvelope } = createAtomicExternalActionEnvelope({
    executionRequest: {
      executionRequestId: "req-1",
      projectId: "proj-1",
      workspaceId: "ws-1",
      actionType: "deploy",
      workflow: "action:deploy",
      operationType: "deploy",
      targetSurface: "temp-branch",
      buildTarget: "web-build",
    },
    resolvedActionProvider: {
      providerType: "hosting",
      providerStatus: "connected",
      executionMode: "temp-branch",
      targetSurface: "sandbox",
      buildTarget: "web-build",
      capabilities: ["deploy", "validate"],
      operationTypes: ["deploy", "validate", "poll"],
      credentialReference: "cred-ref",
    },
    executionPolicy: {
      policyDecision: { decision: "allowed", isBlocked: false },
      approvalStatus: { status: "approved" },
      projectAuthorizationDecision: { decision: "allowed", isBlocked: false },
      credentialPolicyDecision: { decision: "allowed", isBlocked: false },
      deployPolicyDecision: { decision: "allowed", isBlocked: false },
      sandboxDecision: { decision: "allowed", allowed: true },
      executionModeDecision: { selectedMode: "temp-branch" },
    },
  });

  assert.equal(atomicExecutionEnvelope.status, "ready");
  assert.equal(atomicExecutionEnvelope.canDispatch, true);
  assert.deepEqual(atomicExecutionEnvelope.lifecycleStages, ["prepare", "dispatch", "commit", "reconcile", "abort"]);
  assert.equal(atomicExecutionEnvelope.action.requestedOperation, "deploy");
  assert.equal(atomicExecutionEnvelope.target.providerType, "hosting");
  assert.equal(typeof atomicExecutionEnvelope.atomicityContract.idempotencyKey, "string");
  assert.equal(Array.isArray(atomicExecutionEnvelope.blockedReasons), true);
  assert.equal(atomicExecutionEnvelope.blockedReasons.length, 0);
});

test("atomic external action envelope blocks when approval and credential policy block execution", () => {
  const { atomicExecutionEnvelope } = createAtomicExternalActionEnvelope({
    executionRequest: {
      projectId: "proj-2",
      workspaceId: "ws-2",
      actionType: "deploy",
    },
    resolvedActionProvider: {
      providerType: "hosting",
      providerStatus: "connected",
      operationTypes: ["deploy"],
    },
    executionPolicy: {
      policyDecision: { decision: "allowed", isBlocked: false },
      approvalStatus: { status: "pending" },
      projectAuthorizationDecision: { decision: "allowed", isBlocked: false },
      credentialPolicyDecision: { decision: "blocked", isBlocked: true },
      deployPolicyDecision: { decision: "allowed", isBlocked: false },
      sandboxDecision: { decision: "allowed", allowed: true },
      executionModeDecision: { selectedMode: "sandbox" },
    },
  });

  assert.equal(atomicExecutionEnvelope.status, "blocked");
  assert.equal(atomicExecutionEnvelope.canDispatch, false);
  assert.equal(atomicExecutionEnvelope.blockedReasons.includes("approval-pending"), true);
  assert.equal(atomicExecutionEnvelope.blockedReasons.includes("credential-blocked"), true);
});
