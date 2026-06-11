import test from "node:test";
import assert from "node:assert/strict";

import {
  createShellToEngineIntegrationContract,
  getShellToEngineSurfaceBridge,
} from "../src/core/shell-to-engine-integration-contract.js";
import { renderNexusWorkspaceRail } from "../web/nexus-ui/components/NexusWorkspaceRail.js";
import { renderWorkspaceLayout } from "../web/nexus-ui/layouts/WorkspaceLayout.js";

test("SURF-009 defines the shell-to-engine bridge boundaries", () => {
  const contract = createShellToEngineIntegrationContract();

  assert.equal(contract.contractId, "SURF-009");
  assert.equal(contract.classification, "bridge task");
  assert.equal(contract.bridgeMode, "new-shell-over-preserved-hidden-engines");
  assert.equal(contract.truthOwner, "project-service");
  assert.deepEqual(contract.requiredBoundaries, [
    "product-truth",
    "agent-decision",
    "mutation-flow",
    "verification",
    "continuity",
    "release-readiness",
    "history-versioning",
  ]);
  assert.equal(contract.surfaceBridges.length, 7);
  assert.equal(contract.forbiddenInheritance.includes("old-visible-route-owns-product-truth"), true);
  assert.equal(contract.forbiddenInheritance.includes("legacy-orchestration-first-ux"), true);
  assert.equal(contract.forbiddenInheritance.includes("shell-mutates-product-without-engine-envelope"), true);
  assert.equal(contract.forbiddenInheritance.includes("surface-claims-agent-action-without-live-agent-or-explicit-open-task"), true);
  assert.equal(contract.notTrueGreenWhen.includes("engine-bridge-exists-but-agent-decision-bridge-is-missing"), true);
});

test("SURF-009 preserves engines as hidden engines instead of visible route owners", () => {
  const contract = createShellToEngineIntegrationContract();
  const engineRoles = contract.preservedEngines.map((engine) => engine.role);

  assert.equal(contract.preservedEngines.every((engine) => engine.surfaceMode === "hidden-engine"), true);
  assert.equal(engineRoles.includes("bounded-intake-before-build"), true);
  assert.equal(engineRoles.includes("artifact-generation-for-new-shell"), true);
  assert.equal(engineRoles.includes("continuity-memory-refresh-for-new-shell"), true);
  assert.equal(engineRoles.includes("release-readiness-for-new-shell"), true);
});

test("SURF-009 maps each canonical surface to explicit engine and agent anchors", () => {
  const buildBridge = getShellToEngineSurfaceBridge("build");
  const releaseBridge = getShellToEngineSurfaceBridge("release");
  const studioBridge = getShellToEngineSurfaceBridge("studio");

  assert.equal(buildBridge.surfaceContract, "SURF-003");
  assert.equal(buildBridge.engineAnchors.includes("onboarding-intake-engine"), true);
  assert.equal(buildBridge.engineAnchors.includes("artifact-generation-engine"), true);
  assert.equal(buildBridge.agentAnchors.some((agent) => agent.taskId === "SKEL-001"), true);
  assert.equal(buildBridge.agentAnchors.some((agent) => agent.taskId === "VBUILD-001"), true);
  assert.equal(buildBridge.agentAnchors.some((agent) => agent.taskId === "MUT-001"), true);
  assert.equal(releaseBridge.surfaceContract, "SURF-004");
  assert.equal(releaseBridge.engineAnchors.includes("release-readiness-engine"), true);
  assert.equal(releaseBridge.agentAnchors.some((agent) => agent.taskId === "REL-AGT-001"), true);
  assert.equal(studioBridge.surfaceContract, "SURF-008");
  assert.equal(studioBridge.shellRole, "web-to-desktop-boundary-over-cloud-truth");
  assert.equal(studioBridge.agentAnchors.some((agent) => agent.taskId === "STD-HANDOFF-AGT-001"), true);
  assert.equal(studioBridge.contractAnchors.some((contract) => contract.taskId === "STD-AGENT-001"), true);
  assert.equal(studioBridge.contractAnchors.some((contract) => contract.taskId === "STD-HIST-001"), true);
  assert.equal(
    studioBridge.localActionPromiseBoundary.includes("web-must-not-claim-local-run-file-write-sync-package-or-recovery-before-desktop-proof"),
    true,
  );
  assert.equal(getShellToEngineSurfaceBridge("developer"), null);
});

test("SURF-009 refuses fake green when surface agents are still open", () => {
  const contract = createShellToEngineIntegrationContract();

  assert.equal(contract.agentRealityRule.includes("live agent or explicit open release-blocker"), true);
  assert.equal(contract.openAgentRuntimeDependencies.length > 0, true);
  assert.equal(contract.openAgentRuntimeDependencies.some((agent) => agent.taskId === "GROW-AGT-001"), true);
  assert.equal(contract.openAgentRuntimeDependencies.some((agent) => agent.taskId === "HIST-AGT-001"), true);
  assert.equal(contract.openAgentRuntimeDependencies.some((agent) => agent.taskId === "SHARE-AGT-001"), true);
  assert.equal(contract.openAgentRuntimeDependencies.some((agent) => agent.taskId === "STD-HANDOFF-AGT-001"), true);
  assert.equal(contract.notTrueGreenWhen.includes("studio-web-boundary-claims-desktop-local-action-before-desktop-proof"), true);
});

test("SURF-009 keeps Studio contract anchors separate from live Desktop proof", () => {
  const studioBridge = getShellToEngineSurfaceBridge("studio");

  assert.equal(studioBridge.contractAnchors.length >= 8, true);
  assert.equal(studioBridge.contractAnchors.every((contract) => contract.closureScope === "planning-contract-only"), true);
  assert.equal(studioBridge.agentAnchors.some((agent) => agent.status === "pending-release-blocker"), true);
  assert.equal(
    studioBridge.localActionPromiseBoundary.includes("web-must-not-claim-installation-detection-before-desktop-proof"),
    true,
  );
});

test("canonical rail exposes SURF-009 on visible product surfaces", () => {
  const railHtml = renderNexusWorkspaceRail({ currentRoute: "growth" });
  const layoutHtml = renderWorkspaceLayout({
    sidebar: { currentRoute: "/home" },
    content: "<section>Home</section>",
  });

  assert.match(railHtml, /data-shell-engine-integration-contract="SURF-009"/);
  assert.match(railHtml, /data-shell-engine-bridge-mode="new-shell-over-preserved-hidden-engines"/);
  assert.match(railHtml, /data-shell-engine-truth-owner="project-service"/);
  assert.match(railHtml, /data-shell-agent-reality-rule="surface-requires-engine-anchor-and-live-agent-or-open-agent-task"/);
  assert.match(layoutHtml, /data-shell-engine-integration-contract="SURF-009"/);
  assert.doesNotMatch(railHtml, /nexus-ui-sidebar/);
});
