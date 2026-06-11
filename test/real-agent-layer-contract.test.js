import test from "node:test";
import assert from "node:assert/strict";

import {
  createRealAgentLayerContract,
  validateRealAgentLayerContract,
} from "../src/core/real-agent-layer-contract.js";

test("real agent layer contract defines the Nexus-owned agent chain", () => {
  const contract = createRealAgentLayerContract();

  assert.deepEqual(contract.chain, [
    "project-discovery-agent",
    "product-skeleton-agent",
    "build-loop-agent",
  ]);
  assert.equal(contract.agents.projectDiscoveryAgent.role.includes("product idea"), true);
  assert.equal(contract.agents.productSkeletonAgent.output.includes("canonical-product-skeleton"), true);
  assert.equal(contract.agents.buildLoopAgent.output.includes("first-build-slice"), true);
});

test("real agent layer contract keeps the old intake engine out of agent authority", () => {
  const contract = createRealAgentLayerContract();
  const validation = validateRealAgentLayerContract(contract);

  assert.equal(validation.isValid, true);
  assert.equal(validation.intakeEngineIsAgentBrain, false);
  assert.equal(contract.intakeBoundary.allowedUse.includes("persistence"), true);
  assert.equal(contract.intakeBoundary.allowedUse.includes("sessions"), true);
  assert.equal(contract.intakeBoundary.prohibitedUse.includes("agent-brain"), true);
  assert.equal(contract.intakeBoundary.prohibitedUse.includes("trueGreen-proof-by-gate-fixes-only"), true);
});

test("real agent layer contract requires each agent to own decisions", () => {
  const contract = createRealAgentLayerContract();

  assert.equal(contract.agents.projectDiscoveryAgent.decides.includes("whether-enough-product-truth-exists"), true);
  assert.equal(contract.agents.productSkeletonAgent.decides.includes("main-surface-candidate"), true);
  assert.equal(contract.agents.buildLoopAgent.decides.includes("first-task"), true);
});

test("real agent layer contract separates behavior policy from scripted agent copy", () => {
  const contract = createRealAgentLayerContract();
  const validation = validateRealAgentLayerContract(contract);

  assert.equal(validation.isValid, true);
  assert.equal(validation.scriptedMainResponseIsAllowed, false);
  assert.equal(contract.discoveryResponsePolicy.agentComposes.includes("user-facing-response"), true);
  assert.equal(
    contract.discoveryResponsePolicy.prohibitedResponseBehavior.includes("main-discovery-response-from-hardcoded-sentence-template"),
    true,
  );
  assert.match(contract.discoveryResponsePolicy.canonicalRule, /agent composes the user-facing response/);
});
