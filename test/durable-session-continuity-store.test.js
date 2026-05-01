import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createDurableSessionContinuityStore } from "../src/core/durable-session-continuity-store.js";

test("durable session continuity store survives restart and returns latest session truth", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-session-continuity-"));
  const filePath = path.join(directory, "session-continuity.ndjson");

  const firstStore = createDurableSessionContinuityStore({ filePath });
  firstStore.upsert({
    userId: "user-1",
    sessionState: {
      sessionId: "session-1",
      userId: "user-1",
      status: "active",
    },
    tokenBundle: {
      accessToken: "access-1",
      refreshToken: "refresh-1",
      tokenType: "bearer",
    },
    postAuthRedirect: {
      destination: "workbench",
    },
  });

  const restartedStore = createDurableSessionContinuityStore({ filePath });
  const restored = restartedStore.getByUserId("user-1");

  assert.equal(restored.sessionState.sessionId, "session-1");
  assert.equal(restored.sessionState.status, "active");
  assert.equal(restored.tokenBundle.accessToken, "access-1");
  assert.equal(restored.postAuthRedirect.destination, "workbench");
});
