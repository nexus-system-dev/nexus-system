import test from "node:test";
import assert from "node:assert/strict";

import { createProviderOperationContract } from "../src/core/provider-operation-contract.js";

test("provider operation contract returns canonical operations", () => {
  const { providerOperations } = createProviderOperationContract({
    providerSession: {
      providerType: "hosting",
      operationTypes: ["validate", "deploy", "poll", "revoke"],
    },
  });

  assert.equal(Array.isArray(providerOperations), true);
  assert.equal(providerOperations.some((operation) => operation.operationType === "deploy"), true);
  assert.equal(
    providerOperations.find((operation) => operation.operationType === "revoke")?.requiresApproval,
    true,
  );
});

test("provider operation contract falls back to empty operations", () => {
  const { providerOperations } = createProviderOperationContract();

  assert.deepEqual(providerOperations, []);
});

test("provider operation contract requires approval for side-effect operations", () => {
  const { providerOperations } = createProviderOperationContract({
    providerSession: {
      providerType: "stripe",
      operationTypes: ["validate", "draft", "charge", "refund", "revoke"],
    },
  });

  assert.equal(providerOperations.find((operation) => operation.operationType === "validate")?.requiresApproval, false);
  assert.equal(providerOperations.find((operation) => operation.operationType === "charge")?.requiresApproval, true);
  assert.equal(providerOperations.find((operation) => operation.operationType === "charge")?.externalSideEffect, true);
  assert.equal(providerOperations.find((operation) => operation.operationType === "refund")?.scopeFamily, "refund");
});
