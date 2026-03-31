import test from "node:test";
import assert from "node:assert/strict";

import { createRolloutHashUtility } from "../src/core/rollout-hash-utility.js";

test("rollout hash utility is deterministic for user and flag", () => {
  const first = createRolloutHashUtility({
    userId: "user-1",
    flagId: "provider-runtime-execution",
  });
  const second = createRolloutHashUtility({
    userId: "user-1",
    flagId: "provider-runtime-execution",
  });

  assert.equal(first.hashBucket, second.hashBucket);
  assert.equal(first.isDeterministic, true);
});

test("rollout hash utility returns non-deterministic state for anonymous input", () => {
  const result = createRolloutHashUtility({
    flagId: "provider-runtime-execution",
  });

  assert.equal(result.hashBucket, null);
  assert.equal(result.isDeterministic, false);
});
