import assert from "node:assert/strict";
import test from "node:test";

import { getHomeIdeaHandoffContract } from "../src/core/home-idea-handoff-contract.js";
import { buildHomeSupportViewModel } from "../web/nexus-ui/adapters/home-adapter.js";

test("SLICE-002 contract preserves Home as a gateway and delegates idea understanding to Project Discovery Agent", () => {
  const contract = getHomeIdeaHandoffContract();

  assert.equal(contract.taskId, "SLICE-002");
  assert.equal(contract.classification, "new shell task");
  assert.equal(contract.sourceSurface, "home");
  assert.equal(contract.targetSurface, "create");
  assert.equal(contract.responsibleAgent, "project-discovery-agent");
  assert.equal(contract.hiddenEngine, "onboarding-intake-engine");
  assert.equal(contract.boundaries.proofBoundary, "handoff-only-not-agent-response");
  assert.ok(contract.preserves.includes("Home remains a momentum gateway"));
  assert.ok(contract.removes.includes("Home must not claim a skeleton or build result before the discovery agent runs"));
  assert.ok(contract.boundaries.doesNotClose.includes("SKEL-001"));
});

test("Home view model exposes the same idea handoff contract used by the visible surface", () => {
  const viewModel = buildHomeSupportViewModel();

  assert.equal(viewModel.ideaHandoff.sliceContract, "SLICE-002");
  assert.equal(viewModel.ideaHandoff.sourceSurface, "home");
  assert.equal(viewModel.ideaHandoff.targetSurface, "create");
  assert.equal(viewModel.ideaHandoff.responsibleAgent, "project-discovery-agent");
  assert.equal(viewModel.ideaHandoff.hiddenEngine, "onboarding-intake-engine");
  assert.equal(viewModel.ideaHandoff.boundary, "handoff-only-not-agent-response");
  assert.equal(viewModel.ideaHandoff.intent, "new-product-idea");
});
