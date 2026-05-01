import test from "node:test";
import assert from "node:assert/strict";

import { createAppEntryGateResolver } from "../src/core/app-entry-gate-resolver.js";

test("app entry gate resolver routes authenticated active sessions directly into app", () => {
  const { appEntryDecision } = createAppEntryGateResolver({
    landingAuthHandoff: {
      landingAuthHandoffId: "landing-auth-handoff:nexus",
      status: "ready",
      mode: "request-access",
      destinationRoute: "/request-access",
    },
    authenticationState: {
      status: "authenticated",
      isAuthenticated: true,
    },
    sessionState: {
      status: "active",
    },
  });

  assert.equal(appEntryDecision.status, "ready");
  assert.equal(appEntryDecision.decision, "direct-app");
  assert.equal(appEntryDecision.destination, "/app");
});
