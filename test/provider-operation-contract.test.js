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
