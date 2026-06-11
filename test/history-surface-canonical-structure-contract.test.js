import test from "node:test";
import assert from "node:assert/strict";

import {
  createHistorySurfaceCanonicalStructureContract,
  HISTORY_SURFACE_REQUIRED_REGIONS,
} from "../src/core/history-surface-canonical-structure-contract.js";
import { buildTimelineViewModel } from "../web/nexus-ui/adapters/timeline-adapter.js";
import { renderTimelineHistoryScreen } from "../web/nexus-ui/screens/TimelineHistoryScreen.js";

function visibleTextFromHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

test("SURF-006 defines History as product continuity memory, not a debug timeline", () => {
  const contract = createHistorySurfaceCanonicalStructureContract();

  assert.equal(contract.contractId, "SURF-006");
  assert.equal(contract.surfaceId, "timeline");
  assert.equal(contract.purpose, "product-continuity-and-change-memory-workspace");
  assert.equal(contract.historyLaw, "product-memory-and-restore-truth-not-debug-timeline");
  assert.equal(contract.dependsOn.includes("SURF-001"), true);
  assert.deepEqual(contract.requiredRegions, HISTORY_SURFACE_REQUIRED_REGIONS);
  assert.equal(contract.forbiddenShapes.includes("technical-timeline-route"), true);
  assert.equal(contract.forbiddenShapes.includes("proof-dashboard-history"), true);
  assert.equal(contract.forbiddenShapes.includes("wide-legacy-sidebar"), true);
});

test("History surface renders SURF-006 regions with canonical right rail", () => {
  const viewModel = buildTimelineViewModel({
    project: {
      id: "surf-006-proof",
      name: "זיכרון מוצר",
      goal: "מערכת לצוות מכירות שמאבד לידים אחרי שיחות",
      status: "working",
      events: [
        {
          type: "task.completed",
          timestamp: "עכשיו",
          payload: {
            task: {
              summary: "השלד הראשון נשמר",
            },
          },
        },
      ],
      snapshots: [
        {
          id: "snapshot-1",
          title: "לפני שינוי השיחה",
          description: "נקודת חזרה בטוחה לפני שינוי גדול.",
          status: "saved",
        },
      ],
    },
  });
  const html = renderTimelineHistoryScreen(viewModel);

  assert.equal(viewModel.contract.contractId, "SURF-006");
  assert.match(html, /data-history-surface-contract="SURF-006"/);
  assert.match(html, /data-history-workspace-shell="canonical-right-rail"/);
  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-rail-active-route="timeline"/);
  assert.match(html, /data-surface-purpose="product-continuity-and-change-memory-workspace"/);
  assert.match(html, /data-history-law="product-memory-and-restore-truth-not-debug-timeline"/);

  for (const region of HISTORY_SURFACE_REQUIRED_REGIONS) {
    assert.match(html, new RegExp(`data-history-region="${region}"`));
  }

  assert.match(html, /data-nexus-ui-target="growth"/);
  assert.match(html, /data-nexus-ui-target="release"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /מה נשמר מהדרך עד עכשיו/);
  assert.match(html, /מה באמת השתנה/);
  assert.match(html, /לאן אפשר לחזור בבטחה/);
  assert.match(html, /חזור לבנייה/);
  const visibleText = visibleTextFromHtml(html);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
  assert.doesNotMatch(html, /nexus-qa-nav/);
  assert.doesNotMatch(html, /nexus-stepper/);
  assert.doesNotMatch(visibleText, /Proof/i);
  assert.doesNotMatch(visibleText, /Timeline/i);
  assert.doesNotMatch(visibleText, /runtime/i);
});
