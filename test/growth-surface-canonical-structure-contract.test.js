import test from "node:test";
import assert from "node:assert/strict";

import {
  createGrowthSurfaceCanonicalStructureContract,
} from "../src/core/growth-surface-canonical-structure-contract.js";
import { buildGrowthSurfaceViewModel } from "../web/nexus-ui/adapters/growth-surface-adapter.js";
import { renderGrowthSurfaceScreen } from "../web/nexus-ui/screens/GrowthSurfaceScreen.js";

test("SURF-005 defines Growth as a bounded product evolution workspace", () => {
  const contract = createGrowthSurfaceCanonicalStructureContract();

  assert.equal(contract.contractId, "SURF-005");
  assert.equal(contract.surfaceId, "growth");
  assert.equal(contract.purpose, "bounded-product-evolution-workspace");
  assert.equal(contract.growthLaw, "product-connected-growth-insight-not-analytics-noise");
  assert.equal(contract.dependsOn.includes("SURF-001"), true);
  assert.equal(contract.requiredRegions.includes("growth-readiness-gate"), true);
  assert.equal(contract.requiredRegions.includes("product-connected-growth-insights"), true);
  assert.equal(contract.requiredRegions.includes("bounded-opportunity-list"), true);
  assert.equal(contract.requiredRegions.includes("growth-metric-baseline"), true);
  assert.equal(contract.requiredRegions.includes("experiment-next-move"), true);
  assert.equal(contract.requiredRegions.includes("post-release-continuity-anchor"), true);
  assert.equal(contract.forbiddenShapes.includes("growth-as-advanced-side-route"), true);
  assert.equal(contract.forbiddenShapes.includes("generic-marketing-dashboard"), true);
  assert.equal(contract.forbiddenShapes.includes("fake-autonomous-growth-ops"), true);
});

test("Growth surface renders SURF-005 regions with canonical right rail and no advanced fallback copy", () => {
  const viewModel = buildGrowthSurfaceViewModel({
    project: {
      id: "surf-005-proof",
      name: "Growth proof",
      goal: "Improve released product",
      artifactExpectation: {
        projectType: "saas",
      },
      growthWorkspace: {
        strategy: {
          targetAudience: "צוות מכירות",
        },
        analytics: {
          summaryCards: [
            { label: "משתמשים", value: "42" },
            { label: "Signal", value: "active" },
          ],
        },
      },
      postReleaseContinuationLoop: {
        status: "active",
        originArtifactTitle: "מערכת לידים",
        originReleaseTarget: "private-preview",
        continuationMoves: [
          "לחזק תזכורת לצעד הבא",
          "להבליט בעלות על ליד",
        ],
      },
      growthOpportunitySurfacingBoundary: {
        status: "bounded",
        statusLabel: "הצעות ההמשך נשארות bounded",
        visibleBoundaryRule: "Only product-connected growth moves are allowed.",
        allowedMoves: [
          "לחזק תזכורת לצעד הבא",
          "להבליט בעלות על ליד",
        ],
        deferredOpportunityFamilies: ["broad-autonomous-growth-ops"],
        disallowedMoves: ["opening broad experimentation programs without product-connected proof"],
        continuityRule: "Growth state survives route restore.",
      },
      growthAgent: {
        taskId: "GROW-AGT-001",
        agentId: "growth-agent",
        status: "recommended",
        opportunityType: "audience-test",
        readiness: { canRunGrowth: true },
        targetAudience: "צוות מכירות",
        recommendedAction: "להראות דמו קצר ולבדוק הבנה של הערך.",
        successMetric: "3 מתוך 5 מבינים את הערך בתוך דקה.",
        requiresAgent: "none",
        requiresApproval: false,
        userMessage: "הצעד הנכון הוא ניסוי קטן שמחובר לתוצר.",
        doNotPromise: ["לא להבטיח תוצאה עסקית לפני מדידה אמיתית."],
        campaignExecution: {
          requiresExplicitApprovalBeforeExternalAction: true,
          forbiddenWithoutApproval: ["publish", "spend"],
        },
        growthPluginLayer: {
          taskId: "GROW-PLUG-001",
          status: "selected",
          readiness: {
            canUseGrowthPlugin: true,
            audience: "צוות מכירות",
            coreValue: "טיפול מהיר בלידים",
            showableArtifact: "מערכת לידים",
            missing: [],
          },
          primaryPlugin: {
            pluginId: "audience-understanding-test",
            label: "בדיקת הבנת קהל",
            userIntentLabel: "למידה ממשתמשים",
            channelSecondaryLabel: "שיחה ידנית או דמו",
            status: "selected",
            draftOnly: true,
            providerRequired: false,
            approvalRequired: false,
            handoffRequired: "none",
            smallSuccessMetric: "3 מתוך 5 מבינים את הערך",
            whyThisPlugin: "הצעד מחובר לתוצר שאפשר להראות עכשיו.",
            allowedActions: ["prepare-demo-script"],
            blockedActions: ["publish", "claim-results"],
          },
          registry: {
            taskId: "GROW-PLUG-002",
            registryId: "first-release-growth-plugin-registry:v1",
            status: "ready",
            userFacingMode: "simple-intents-not-marketplace",
            marketplaceMode: false,
            plugins: [
              { pluginId: "social-campaign-draft", userIntentLabel: "קמפיין חברתי", status: "available-draft" },
              { pluginId: "seo-page-draft", userIntentLabel: "חיפוש אורגני", status: "available-draft" },
              { pluginId: "paid-test-draft", userIntentLabel: "פרסום ממומן", status: "available-draft" },
              { pluginId: "email-draft", userIntentLabel: "אימייל", status: "available-draft" },
              { pluginId: "landing-experiment-draft", userIntentLabel: "דף נחיתה", status: "available-draft" },
              { pluginId: "measurement-plan", userIntentLabel: "מדידה", status: "available-internal" },
            ],
          },
        },
        growthMeasurementTruth: {
          taskId: "GROW-MEASURE-001",
          status: "has-initial-signal",
          recordCount: 2,
          acceptedCount: 2,
          sourceTypes: ["internal-event", "manual"],
          measurementAvailability: "available",
          noSuccessInference: false,
          confidenceLevel: "low",
          conclusionLanguage: "initial-signal",
          hypothesis: "בודק יבין את הערך.",
          result: "2 נקודות מדידה זמינות.",
          insight: "זה סימן ראשוני בלבד, לא הוכחה.",
        },
      },
    },
  });
  const html = renderGrowthSurfaceScreen(viewModel);

  assert.equal(viewModel.contract.contractId, "SURF-005");
  assert.equal(viewModel.growth.readyForGrowth, true);
  assert.match(html, /data-growth-surface-contract="SURF-005"/);
  assert.match(html, /data-growth-agent-task="GROW-AGT-001"/);
  assert.match(html, /data-growth-agent-status="recommended"/);
  assert.match(html, /data-growth-agent-opportunity-type="audience-test"/);
  assert.match(html, /data-growth-agent-requires-agent="none"/);
  assert.match(html, /data-growth-agent-can-run="true"/);
  assert.match(html, /data-growth-plugin-task="GROW-PLUG-001"/);
  assert.match(html, /data-growth-plugin-registry-task="GROW-PLUG-002"/);
  assert.match(html, /data-growth-plugin-registry-mode="simple-intents-not-marketplace"/);
  assert.match(html, /data-growth-plugin-registry-count="6"/);
  assert.match(html, /data-growth-measurement-task="GROW-MEASURE-001"/);
  assert.match(html, /data-growth-measurement-status="has-initial-signal"/);
  assert.match(html, /data-growth-measurement-confidence="low"/);
  assert.match(html, /סימן ראשוני בלבד/);
  assert.match(html, /data-growth-plugin-primary="audience-understanding-test"/);
  assert.match(html, /data-growth-plugin-provider-required="false"/);
  assert.match(html, /בדיקת הבנת קהל/);
  assert.match(html, /יכולות השחרור הראשון/);
  assert.match(html, /קמפיין חברתי/);
  assert.match(html, /מדידה/);
  assert.match(html, /data-growth-campaign-external-action-locked="true"/);
  assert.match(html, /data-growth-workspace-shell="canonical-right-rail"/);
  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-rail-active-route="growth"/);
  assert.match(html, /data-nexus-ui-target="loop"/);
  assert.match(html, /data-nexus-ui-target="release"/);
  assert.match(html, /data-nexus-ui-target="growth"/);
  assert.match(html, /data-nexus-ui-target="home"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-surface-id="growth"/);
  assert.match(html, /data-surface-purpose="bounded-product-evolution-workspace"/);
  assert.match(html, /data-growth-law="product-connected-growth-insight-not-analytics-noise"/);
  assert.match(html, /data-growth-region="growth-readiness-gate"/);
  assert.match(html, /data-growth-region="product-connected-growth-insights"/);
  assert.match(html, /data-growth-region="bounded-opportunity-list"/);
  assert.match(html, /data-growth-region="growth-agent-decision"/);
  assert.match(html, /data-growth-region="growth-metric-baseline"/);
  assert.match(html, /data-growth-region="experiment-next-move"/);
  assert.match(html, /data-growth-region="post-release-continuity-anchor"/);
  assert.doesNotMatch(html, /Advanced lane/);
  assert.doesNotMatch(html, /Growth Workspace/);
  assert.doesNotMatch(html, /KPI ותוכניות שיווק משניות/);
  assert.doesNotMatch(html, /TikTok|SEO|conversion|revenue|virality/i);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
});
