import test from "node:test";
import assert from "node:assert/strict";

import { createEntryLoadingAndRecoveryStates } from "../src/core/entry-loading-recovery-states.js";

test("entry loading and recovery states derive expired session recovery", () => {
  const { entryRecoveryState } = createEntryLoadingAndRecoveryStates({
    appEntryDecision: { appEntryDecisionId: "entry-1", status: "ready" },
    sessionState: { status: "expired" },
    entryStateVariants: { status: "ready", defaultVariant: "session-expired" },
  });

  assert.equal(entryRecoveryState.status, "ready");
  assert.equal(entryRecoveryState.recoveryState, "resume-authentication");
});
