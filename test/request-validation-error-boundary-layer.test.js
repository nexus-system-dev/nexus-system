import test from "node:test";
import assert from "node:assert/strict";

import { createRequestValidationAndErrorBoundaryLayer } from "../src/core/request-validation-error-boundary-layer.js";

test("request validation and error boundary layer returns validated request for complete payload", () => {
  const { validatedRequest, errorEnvelope } = createRequestValidationAndErrorBoundaryLayer({
    requestPayload: {
      userInput: {
        email: "user@example.com",
      },
    },
    routeDefinition: {
      method: "POST",
      path: "/api/auth/login",
      handler: "loginUser",
      requiredFields: ["userInput"],
    },
  });

  assert.equal(validatedRequest.isValid, true);
  assert.equal(errorEnvelope.status, "ok");
  assert.equal(validatedRequest.handler, "loginUser");
});

test("request validation and error boundary layer returns error envelope for missing required fields", () => {
  const { validatedRequest, errorEnvelope } = createRequestValidationAndErrorBoundaryLayer({
    requestPayload: {},
    routeDefinition: {
      method: "POST",
      path: "/api/auth/login",
      handler: "loginUser",
      requiredFields: ["userInput", "credentials"],
    },
  });

  assert.equal(validatedRequest.isValid, false);
  assert.equal(errorEnvelope.status, "error");
  assert.equal(errorEnvelope.code, "INVALID_REQUEST");
  assert.equal(errorEnvelope.details.length, 2);
});
