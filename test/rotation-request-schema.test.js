import test from "node:test";
import assert from "node:assert/strict";

import { createRotationRequestSchema } from "../src/core/rotation-request-schema.js";

test("rotation request schema normalizes valid input", () => {
  const { rotationRequest, validationError } = createRotationRequestSchema({
    newValue: "next-secret",
    requestedBy: { userId: "user-1" },
    reason: "routine-rotation",
    mode: "manual",
  });

  assert.equal(validationError, null);
  assert.equal(rotationRequest.nextCredentialValue, "next-secret");
  assert.equal(rotationRequest.requestedBy, "user-1");
  assert.equal(rotationRequest.reason, "routine-rotation");
  assert.equal(rotationRequest.mode, "manual");
});

test("rotation request schema fails when next secret is missing", () => {
  const { validationError } = createRotationRequestSchema({
    requestedBy: "user-1",
  });

  assert.equal(validationError.code, "missing-next-secret-payload");
  assert.equal(validationError.failedAt, "re-encryption");
});
