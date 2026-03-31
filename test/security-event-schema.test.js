import test from "node:test";
import assert from "node:assert/strict";

import { createSecurityEventSchema } from "../src/core/security-event-schema.js";

test("security event schema normalizes known event types and actor context", () => {
  const result = createSecurityEventSchema({
    securityEvent: {
      eventType: "failed_login",
      summary: "Failed login attempt",
      affectedResource: {
        resourceId: "auth-service",
        resourceType: "service",
      },
    },
    actorContext: {
      actorId: "user-1",
      actorType: "user",
      actorRole: "owner",
      sessionId: "session-1",
      ipAddress: "127.0.0.1",
      deviceId: "device-1",
    },
  });

  assert.equal(result.securityEvent.eventType, "failed_login");
  assert.equal(result.actorContext.actorId, "user-1");
  assert.equal(result.actorContext.deviceId, "device-1");
});

test("security event schema normalizes unknown event types", () => {
  const result = createSecurityEventSchema({
    securityEvent: {
      eventType: "weird_intrusion",
    },
  });

  assert.equal(result.securityEvent.eventType, "unknown-security-event");
});
