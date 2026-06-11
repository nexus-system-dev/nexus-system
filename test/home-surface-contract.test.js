import assert from "node:assert/strict";
import test from "node:test";

import { getCanonicalSurface } from "../src/core/canonical-surface-pass-contract.js";
import { buildHomeSupportViewModel } from "../web/nexus-ui/adapters/home-adapter.js";
import { renderHomeSupportScreen } from "../web/nexus-ui/screens/HomeSupportScreen.js";

test("SURF-002 Home is defined as a momentum gateway in the canonical surface contract", () => {
  const homeSurface = getCanonicalSurface("home");

  assert.equal(homeSurface.surfaceId, "home");
  assert.equal(homeSurface.purpose, "momentum-gateway");
  assert.deepEqual(homeSurface.requiredRegions, [
    "create-or-continue-entry",
    "recent-product-continuation",
    "last-meaningful-action",
  ]);
  assert.deepEqual(homeSurface.forbiddenShapes, [
    "dashboard-first",
    "workspace-manager",
    "onboarding-ritual",
  ]);
});

test("Home surface renders only canonical momentum regions, not dashboard stats", () => {
  const viewModel = buildHomeSupportViewModel({
    currentProjectId: "project-1",
    projects: [
      {
        id: "project-1",
        name: "Sales follow-up workspace",
        goal: "Help a sales team stop losing leads after calls",
        updatedAt: "2026-05-30T10:00:00.000Z",
        progressState: { status: "active" },
        cycle: {
          roadmap: [
            { status: "assigned", summary: "Build first lead list with owner, status, and next step" },
          ],
        },
      },
      {
        id: "project-2",
        name: "Support triage",
        goal: "Prioritize support tickets",
        updatedAt: "2026-05-29T10:00:00.000Z",
        progressState: { status: "active" },
      },
    ],
  });

  const html = renderHomeSupportScreen(viewModel);

  assert.match(html, /data-surface-contract="SURF-002"/);
  assert.match(html, /data-surface-purpose="momentum-gateway"/);
  assert.match(html, /data-home-region="create-or-continue-entry"/);
  assert.match(html, /data-home-region="recent-product-continuation"/);
  assert.match(html, /data-home-region="last-meaningful-action"/);
  assert.match(html, /Build first lead list with owner, status, and next step/);
  assert.doesNotMatch(html, /סה&quot;כ פרויקטים/);
  assert.doesNotMatch(html, /פעילים עכשיו/);
  assert.doesNotMatch(html, /אושרו/);
});

test("Home renders the SLICE-002 idea handoff to the Project Discovery Agent without claiming build closure", () => {
  const viewModel = buildHomeSupportViewModel();
  const html = renderHomeSupportScreen(viewModel);

  assert.match(html, /data-home-region="create-or-continue-entry"/);
  assert.match(html, /data-slice-contract="SLICE-002"/);
  assert.match(html, /data-home-handoff-source="home"/);
  assert.match(html, /data-home-handoff-target="create"/);
  assert.match(html, /data-home-handoff-agent="project-discovery-agent"/);
  assert.match(html, /data-home-handoff-engine="onboarding-intake-engine"/);
  assert.match(html, /data-home-handoff-boundary="handoff-only-not-agent-response"/);
  assert.match(html, /data-home-handoff-action="start-idea-conversation"/);
  assert.doesNotMatch(html, /first-skeleton-appears/);
});
