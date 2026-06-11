import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createFirstVerticalSliceExecutionLaneContract } from "../src/core/first-vertical-slice-execution-lane-contract.js";

const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");

test("SLICE-001 defines the first vertical slice lane without closing downstream agents", () => {
  const contract = createFirstVerticalSliceExecutionLaneContract();

  assert.equal(contract.taskId, "SLICE-001");
  assert.equal(contract.classification, "new shell task");
  assert.deepEqual(contract.dependsOn, ["SURF-002", "SURF-003", "SURF-009A"]);
  assert.equal(contract.canonicalSlice.includes("user-writes-idea"), true);
  assert.equal(contract.canonicalSlice.includes("first-skeleton-appears"), true);
  assert.equal(contract.canonicalSlice.includes("refresh-preserves-continuity"), true);
  assert.equal(contract.closureBoundary.closesNow.includes("canonical-first-slice-lane-defined"), true);
  assert.equal(contract.closureBoundary.doesNotCloseNow.includes("product-skeleton-agent-live-proof"), true);
  assert.equal(contract.closureBoundary.doesNotCloseNow.includes("SURF-009B-live-agent-gate"), true);
});

test("SLICE-001 preserves engines and forbids fake-green shortcuts", () => {
  const contract = createFirstVerticalSliceExecutionLaneContract();

  assert.equal(contract.preserve.includes("project-service-truth-engine"), true);
  assert.equal(contract.preserve.includes("onboarding-intake-engine"), true);
  assert.equal(contract.preserve.includes("artifact-generation-engine"), true);
  assert.equal(contract.preserve.includes("continuity-memory-refresh-engine"), true);
  assert.equal(contract.remove.includes("visible-onboarding-as-standalone-product-route"), true);
  assert.equal(contract.remove.includes("backend-completion-as-build-authority"), true);
  assert.equal(contract.forbiddenShortcuts.includes("qa-motion-proof-as-live-agent-proof"), true);
  assert.equal(contract.forbiddenShortcuts.includes("fallback-copy-as-agent-response"), true);
});

test("SLICE-001 exposes an entry proof marker on the discovery-to-build QA path", () => {
  assert.match(appSource, /dataset\.sliceContract\s*=\s*"SLICE-001"/);
  assert.match(appSource, /dataset\.sliceStage\s*=\s*"user-writes-idea"/);
  assert.match(appSource, /dataset\.sliceStage\s*=\s*"first-skeleton-appears"/);
  assert.match(appSource, /dataset\.sliceProofBoundary\s*=\s*"entry-proof-not-live-agent-closure"/);
});
