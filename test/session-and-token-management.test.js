import test from "node:test";
import assert from "node:assert/strict";

import { createSessionAndTokenManagement } from "../src/core/session-and-token-management.js";

test("session and token management returns active session for authenticated user", () => {
  const { sessionState, tokenBundle } = createSessionAndTokenManagement({
    userIdentity: {
      userId: "user-1",
    },
    authenticationState: {
      isAuthenticated: true,
    },
  });

  assert.equal(typeof sessionState.sessionId, "string");
  assert.equal(sessionState.status, "active");
  assert.equal(typeof tokenBundle.accessToken, "string");
  assert.equal(typeof tokenBundle.refreshToken, "string");
});

test("session and token management returns inactive session for anonymous user", () => {
  const { sessionState, tokenBundle } = createSessionAndTokenManagement();

  assert.equal(sessionState.sessionId, null);
  assert.equal(sessionState.status, "inactive");
  assert.equal(tokenBundle.accessToken, null);
});
