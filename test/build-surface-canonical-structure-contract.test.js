import test from "node:test";
import assert from "node:assert/strict";

import {
  createBuildSurfaceCanonicalStructureContract,
} from "../src/core/build-surface-canonical-structure-contract.js";
import { buildLoopCoreViewModel } from "../web/nexus-ui/adapters/loop-adapter.js";
import { renderLoopCoreScreen } from "../web/nexus-ui/screens/LoopCoreScreen.js";

test("SURF-003 defines Build as the concrete live creation workspace", () => {
  const contract = createBuildSurfaceCanonicalStructureContract();

  assert.equal(contract.contractId, "SURF-003");
  assert.equal(contract.surfaceId, "build");
  assert.equal(contract.purpose, "live-creation-workspace");
  assert.equal(contract.workspaceLaw, "persistent-agent-rail-plus-live-build-canvas");
  assert.deepEqual(contract.primaryRegions, [
    "agent-conversation-rail",
    "live-artifact-build-canvas",
  ]);
  assert.equal(contract.requiredRegions.includes("human-progress-state"), true);
  assert.equal(contract.requiredRegions.includes("change-direction-affordance"), true);
  assert.equal(contract.requiredRegions.includes("release-readiness-affordance"), true);
  assert.equal(contract.requiredRegions.includes("continuity-restore-anchor"), true);
  assert.equal(contract.forbiddenShapes.includes("loop-as-visible-product-label"), true);
  assert.equal(contract.forbiddenShapes.includes("canvas-without-writable-agent-rail"), true);
});

test("Loop compatibility route renders the SURF-003 Build surface contract", () => {
  const viewModel = buildLoopCoreViewModel({
    project: {
      id: "surf-003-proof",
      name: "Build surface proof",
      artifactExpectation: {
        projectType: "saas",
        title: "מערכת מעקב לידים",
        summary: "לוח עבודה עם בעלות, סטטוס וצעד הבא.",
      },
      cycle: {
        roadmap: [
          { summary: "לבנות את שלד הלידים הראשון", status: "assigned" },
        ],
      },
      projectBrainWorkspace: {
        overview: { currentPhase: "understanding-complete" },
      },
    },
    companionConversation: {
      projectName: "Build surface proof",
      transcript: [
        { speaker: "user", text: "אני רוצה מערכת לצוות מכירות" },
        { speaker: "ai", text: "הבנתי. אני פותח סביבת בנייה עם שלד ראשון." },
      ],
    },
  });
  const html = renderLoopCoreScreen(viewModel);

  assert.equal(viewModel.buildSurfaceContract.contractId, "SURF-003");
  assert.match(html, /data-build-surface-contract="SURF-003"/);
  assert.match(html, /data-surface-id="build"/);
  assert.match(html, /data-surface-purpose="live-creation-workspace"/);
  assert.match(html, /data-legacy-route-boundary="loop-route-renders-build-surface"/);
  assert.match(html, /data-surface-contract="SURF-001"/);
  assert.match(html, /data-build-region="agent-conversation-rail"/);
  assert.match(html, /data-agent-rail-writable="true"/);
  assert.match(html, /data-build-region="live-artifact-build-canvas"/);
  assert.match(html, /data-build-canvas-primary="true"/);
  assert.match(html, /data-build-region="human-progress-state"/);
  assert.match(html, /data-build-region="change-direction-affordance"/);
  assert.match(html, /data-build-region="release-readiness-affordance"/);
  assert.match(html, /data-build-region="continuity-restore-anchor"/);
  assert.doesNotMatch(html, /Nexus Loop/);
  assert.doesNotMatch(html, /data-build-region="timeline"/);
  assert.doesNotMatch(html, /nexus-stepper/);
  assert.doesNotMatch(html, /nexus-qa-nav/);
});
