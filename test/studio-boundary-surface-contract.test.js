import test from "node:test";
import assert from "node:assert/strict";

import {
  createStudioBoundarySurfaceContract,
} from "../src/core/studio-boundary-surface-contract.js";
import { buildStudioBoundaryViewModel } from "../web/nexus-ui/adapters/studio-boundary-adapter.js";
import { renderStudioBoundaryScreen } from "../web/nexus-ui/screens/StudioBoundaryScreen.js";

test("SURF-008 defines Studio as a desktop boundary, not a web workspace", () => {
  const contract = createStudioBoundarySurfaceContract();

  assert.equal(contract.contractId, "SURF-008");
  assert.equal(contract.surfaceId, "studio");
  assert.equal(contract.purpose, "desktop-local-workspace-boundary");
  assert.equal(contract.studioLaw, "nexus-web-identifies-explains-and-hands-off-to-nexus-studio-desktop");
  assert.equal(contract.dependsOn.includes("SURF-001"), true);
  assert.equal(contract.requiredRegions.includes("studio-web-boundary-explanation"), true);
  assert.equal(contract.requiredRegions.includes("studio-desktop-connection-status"), true);
  assert.equal(contract.requiredRegions.includes("studio-open-desktop-action"), true);
  assert.equal(contract.requiredRegions.includes("studio-install-fallback"), true);
  assert.equal(contract.requiredRegions.includes("studio-web-vs-desktop-split"), true);
  assert.equal(contract.requiredRegions.includes("studio-return-to-web-product-truth"), true);
  assert.equal(contract.forbiddenShapes.includes("studio-as-web-workspace"), true);
  assert.equal(contract.forbiddenShapes.includes("full-file-editor-in-web"), true);
  assert.equal(contract.forbiddenShapes.includes("fake-local-runtime-control"), true);
});

test("Studio boundary renders handoff regions with canonical right rail and no fake web Studio", () => {
  const viewModel = buildStudioBoundaryViewModel({
    project: {
      id: "surf-008-proof",
      name: "Studio proof",
      goal: "להעביר עבודה כבדה ל־Nexus Studio",
      artifactExpectation: {
        projectType: "saas",
      },
      studioWorkspace: {
        connectionStatus: "not-installed",
        requiredReason: "צריך גישה לקבצים מקומיים והרצה על המחשב.",
      },
    },
  });
  const html = renderStudioBoundaryScreen(viewModel);

  assert.equal(viewModel.contract.contractId, "SURF-008");
  assert.equal(viewModel.studio.connection.isConnected, false);
  assert.match(html, /data-studio-boundary-contract="SURF-008"/);
  assert.match(html, /data-studio-workspace-shell="canonical-right-rail"/);
  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-rail-active-route="studio"/);
  assert.match(html, /data-nexus-ui-target="studio"/);
  assert.match(html, /data-nexus-ui-target="loop"/);
  assert.match(html, /data-nexus-ui-target="release"/);
  assert.match(html, /data-nexus-ui-target="timeline"/);
  assert.match(html, /data-studio-region="studio-web-boundary-explanation"/);
  assert.match(html, /data-studio-region="studio-desktop-connection-status"/);
  assert.match(html, /data-studio-region="studio-open-desktop-action"/);
  assert.match(html, /data-studio-region="studio-install-fallback"/);
  assert.match(html, /data-studio-region="studio-web-vs-desktop-split"/);
  assert.match(html, /data-studio-region="studio-return-to-web-product-truth"/);
  assert.match(html, /data-studio-handoff-agent-task="STD-HANDOFF-AGT-001"/);
  assert.match(html, /data-studio-handoff-agent-status="unavailable-fallback"/);
  assert.match(html, /data-studio-handoff-decision="prepare-with-fallback"/);
  assert.match(html, /data-studio-handoff-protocol="studio-handoff-v1"/);
  assert.match(html, /data-studio-handoff-required-capability="local-workspace"/);
  assert.match(html, /nexus-studio:\/\/open\?handoffId=studio-handoff%3Asurf-008-proof%3A/);
  assert.doesNotMatch(html, /nexus-studio:\/\/open\?project=surf-008-proof/);
  assert.match(html, /לא יטען שהאפליקציה המקומית נפתחה או התחברה עד שתחזור הוכחה/);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
  assert.doesNotMatch(html, /Developer Workspace/);
  assert.doesNotMatch(html, /Project Brain/);
  assert.doesNotMatch(html, /QA זמני/);
});

test("Studio boundary does not claim local desktop connection when no desktop app is connected", () => {
  const viewModel = buildStudioBoundaryViewModel({
    project: {
      id: "surf-008-no-desktop",
      name: "No Desktop",
      studioWorkspace: {
        connectionStatus: "not-installed",
      },
    },
  });
  const html = renderStudioBoundaryScreen(viewModel);

  assert.equal(viewModel.studio.connection.isConnected, false);
  assert.equal(viewModel.studio.connection.status, "not-installed");
  assert.equal(viewModel.studio.handoffAgent.status, "unavailable-fallback");
  assert.equal(viewModel.studio.handoffAgent.connection.isConnected, false);
  assert.match(html, /Studio עדיין לא מחובר/);
  assert.match(html, /האתר לא מזייף יכולות מקומיות/);
  assert.match(html, /לא מבטיח גישה לקבצים/);
  assert.doesNotMatch(html, /is-connected/);
});
