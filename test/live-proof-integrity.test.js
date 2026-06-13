import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  LIVE_PROOF_INTEGRITY_TASK_ID,
  createClaimToVisibleProofMatrix,
  resolveChangedFileRoutes,
  validateClaimToVisibleProof,
} from "../web/shared/live-proof-integrity.js";

function validLoopProof(overrides = {}) {
  return {
    url: "http://127.0.0.1:4011/loop?projectId=proof-project",
    port: "4011",
    surfaceOwnerTask: "SURFACE-OWNER-RUNTIME-001",
    surfaceOwnerRoute: "loop",
    surfaceOwnerHost: "#screen-loop",
    surfaceOwnerScreen: "LoopCoreScreen",
    surfaceOwnerAdapter: "loop-adapter",
    surfaceOwnerState: "project-service-project-truth",
    surfaceOwnerRestore: "projectId-backend-restore",
    surfaceOwnerRuntimeMode: "project-backed",
    surfaceOwnerProofValid: "true",
    surfaceOwnerInvalidators: "",
    visibleHostId: "screen-loop",
    loadedAppScript: "./app.js?v=proof",
    loadedStylesheet: "./styles.css?v=proof",
    hasQaState: false,
    hasNexusState: false,
    hasQaScreen: false,
    hasProjectId: true,
    ...overrides,
  };
}

function validInput(overrides = {}) {
  return {
    taskId: "EXAMPLE-001",
    statusClaim: "trueGreen",
    behaviorClaim: "Loop screen renders the changed build surface from project truth.",
    changedFiles: [
      "web/nexus-ui/screens/LoopCoreScreen.js",
      "web/nexus-ui/adapters/loop-adapter.js",
    ],
    surfaceProof: validLoopProof(),
    browserProof: true,
    refreshProof: true,
    restoreProof: true,
    behaviorProof: true,
    artifactPaths: ["/private/tmp/example-loop-proof.png"],
    verificationCommands: ["node --test test/example.test.js"],
    ...overrides,
  };
}

test("LIVE-PROOF-INTEGRITY-001 passes only when claim, route, assets, diff, behavior, refresh, and artifacts agree", () => {
  const result = validateClaimToVisibleProof(validInput());

  assert.equal(result.taskId, LIVE_PROOF_INTEGRITY_TASK_ID);
  assert.equal(result.canClaimTrueGreen, true);
  assert.equal(result.status, "pass");
  assert.deepEqual(result.blockers, []);
});

test("LIVE-PROOF-INTEGRITY-001 blocks regular closure when QA state contaminates the visible proof", () => {
  const result = validateClaimToVisibleProof(validInput({
    surfaceProof: validLoopProof({
      url: "http://127.0.0.1:4011/loop?qa=1&projectId=proof-project&qaState=%7B%7D&qaScreen=loop",
      hasQaState: true,
      hasQaScreen: true,
    }),
  }));

  assert.equal(result.canClaimTrueGreen, false);
  assert.ok(result.blockers.includes("qa-state-contaminates-regular-claim"));
  assert.ok(result.blockers.includes("qa-route-contaminates-regular-claim"));
});

test("LIVE-PROOF-INTEGRITY-001 blocks closure when app.js or styles.css are not proven loaded", () => {
  const result = validateClaimToVisibleProof(validInput({
    surfaceProof: validLoopProof({
      loadedAppScript: "",
      loadedStylesheet: "",
    }),
  }));

  assert.equal(result.canClaimTrueGreen, false);
  assert.ok(result.blockers.includes("loaded-assets-not-proven"));
});

test("LIVE-PROOF-INTEGRITY-001 blocks route-mismatched frontend edits", () => {
  const result = validateClaimToVisibleProof(validInput({
    changedFiles: ["web/nexus-ui/screens/ReleaseSurfaceScreen.js"],
  }));

  assert.equal(result.canClaimTrueGreen, false);
  assert.ok(result.blockers.includes("changed-file-not-reachable-from-tested-route"));
});

test("LIVE-PROOF-INTEGRITY-001 blocks unmapped changed files before trueGreen claims", () => {
  const result = validateClaimToVisibleProof(validInput({
    changedFiles: ["web/unknown-surface.js"],
  }));

  assert.equal(result.canClaimTrueGreen, false);
  assert.ok(result.blockers.includes("changed-file-route-unmapped"));
});

test("LIVE-PROOF-INTEGRITY-001 blocks missing refresh, restore, behavior, artifact, and command proof", () => {
  const result = validateClaimToVisibleProof(validInput({
    refreshProof: false,
    restoreProof: false,
    behaviorProof: false,
    artifactPaths: [],
    verificationCommands: [],
  }));

  assert.equal(result.canClaimTrueGreen, false);
  assert.ok(result.blockers.includes("missing-refresh-proof"));
  assert.ok(result.blockers.includes("missing-restore-proof"));
  assert.ok(result.blockers.includes("missing-behavior-proof"));
  assert.ok(result.blockers.includes("missing-proof-artifact-paths"));
  assert.ok(result.blockers.includes("missing-verification-commands"));
});

test("LIVE-PROOF-INTEGRITY-001 maps source files to visible routes", () => {
  const [loopFile, releaseFile, sharedFile, testFile, proofScript, canonicalDoc] = resolveChangedFileRoutes([
    "web/nexus-ui/screens/LoopCoreScreen.js",
    "web/nexus-ui/screens/ReleaseSurfaceScreen.js",
    "web/app.js",
    "test/live-proof-integrity.test.js",
    "scripts/verify-live-proof-integrity-001-live-proof.mjs",
    "docs/wave3-canonical-state.json",
  ]);

  assert.deepEqual(loopFile.routes, ["loop"]);
  assert.deepEqual(releaseFile.routes, ["release"]);
  assert.deepEqual(sharedFile.routes, ["all"]);
  assert.deepEqual(testFile.routes, ["all"]);
  assert.deepEqual(proofScript.routes, ["all"]);
  assert.deepEqual(canonicalDoc.routes, ["all"]);
});

test("LIVE-PROOF-INTEGRITY-001 matrix preserves closure fields for canonical write-back", () => {
  const matrix = createClaimToVisibleProofMatrix(validInput());

  assert.equal(matrix.taskId, LIVE_PROOF_INTEGRITY_TASK_ID);
  assert.equal(matrix.claim.statusClaim, "trueGreen");
  assert.equal(matrix.route.surfaceOwnerTask, "SURFACE-OWNER-RUNTIME-001");
  assert.equal(matrix.route.surfaceOwnerState, "project-service-project-truth");
  assert.equal(matrix.assets.loaded, true);
  assert.equal(matrix.proof.browserProof, true);
});

test("LIVE-PROOF-INTEGRITY-001 validates raw closure input when the claimed task is the gate itself", () => {
  const result = validateClaimToVisibleProof(validInput({
    taskId: LIVE_PROOF_INTEGRITY_TASK_ID,
    changedFiles: [
      "web/shared/live-proof-integrity.js",
      "web/app.js",
      "test/live-proof-integrity.test.js",
    ],
  }));

  assert.equal(result.canClaimTrueGreen, true);
  assert.equal(result.matrix.claim.taskId, LIVE_PROOF_INTEGRITY_TASK_ID);
});

test("web app exposes live proof integrity markers on body, root, and visible host", () => {
  const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");

  assert.match(appSource, /LIVE_PROOF_INTEGRITY_TASK_ID/);
  assert.match(appSource, /body\.dataset\.liveProofIntegrityTask/);
  assert.match(appSource, /root\.dataset\.liveProofIntegrityTask/);
  assert.match(appSource, /host\.dataset\.liveProofIntegrityTask/);
});
