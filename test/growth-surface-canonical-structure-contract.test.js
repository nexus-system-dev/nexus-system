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
      socialCampaignExecutionAgent: {
        taskId: "GROW-AGT-002",
        agentId: "social-campaign-execution-agent",
        status: "ready-for-approval",
        campaignType: "launch-sequence",
        selectedProvider: "instagram",
        requestedAction: "draft",
        sequence: [
          { postId: "post-1", purpose: "problem" },
          { postId: "post-2", purpose: "solution" },
          { postId: "post-3", purpose: "demo" },
        ],
        permissions: {
          providerConnected: false,
          scopes: [],
          firstReleaseRealProviders: ["instagram", "facebook"],
          draftOnlyProviders: ["tiktok", "linkedin", "youtube", "x"],
        },
        approval: {
          perPostApprovalRequired: true,
          campaignApprovalCannotPublishPosts: true,
        },
        fallback: {
          manualCopyAvailable: true,
          draftOnlyBecauseProviderMissing: true,
        },
        blockedActions: ["reply", "moderate", "direct-message", "ad-spend", "account-edit"],
        resultIntake: {
          fabricatedMetricsBlocked: true,
          commentsSummary: {
            summary: "אין תגובות אמיתיות זמינות לקריאה.",
            sensitiveExamplesHidden: true,
          },
        },
        externalExecutionPerformed: false,
        userMessage: "הקמפיין הוכן כטיוטה קטנה.",
      },
      seoActionPath: {
        taskId: "GROW-SEO-001",
        agentId: "seo-action-path",
        status: "draft-ready",
        requestedAction: "draft",
        productBasis: {
          language: "he",
          direction: "rtl",
        },
        recommendations: {
          title: "ניהול לידים | טיפול ברור בלידים",
          metaDescription: "ניהול לידים עוזר להבין מי אחראי ומה הצעד הבא.",
          headings: ["למי זה עוזר", "איזו בעיה זה פותר"],
          faq: [{ question: "האם זה מבטיח דירוג?", answer: "לא." }],
          keywordHypotheses: ["ניהול לידים", "מעקב אחרי לידים"],
        },
        approval: {
          approvalRequiredBeforeApply: true,
          applyApproved: false,
        },
        handoffs: {
          mutationRequired: false,
          visualBuildRequired: true,
          shareOrReleaseRequiredForPublicVisibility: true,
        },
        providerTruth: {
          searchConsoleConnected: false,
          realProviderDataAvailable: false,
          searchVolumeIsHypothesis: true,
          rankingsAreHypothesis: true,
        },
        blockedClaims: ["guarantee-ranking", "fabricate-search-volume", "publish-without-approval"],
        externalPublicationPerformed: false,
        visiblePageUpdated: false,
        userMessage: "נוצרה טיוטת שיפור חיפוש שמחוברת לתוצר.",
      },
      semActionPath: {
        taskId: "GROW-SEM-001",
        agentId: "sem-action-path",
        status: "draft-only-provider-missing",
        requestedAction: "draft",
        budget: {
          currency: "USD",
          suggestedAmount: 50,
          hardCapUsd: 50,
          capEnforced: true,
        },
        approval: {
          separateApprovalRequired: true,
          campaignApproved: false,
          adApproved: false,
          budgetApproved: false,
          activationApproved: false,
          providerConnectionIsNotSpendPermission: true,
        },
        readiness: {
          productReady: true,
          landingOrDemoReady: true,
          measurementPlanReady: true,
          canPrepareActivation: false,
        },
        providerTruth: {
          selectedProvider: "google-ads",
          firstReleaseRealProviders: ["google-ads"],
          draftOnlyProviders: ["meta-ads", "facebook-ads", "instagram-ads", "tiktok-ads", "linkedin-ads"],
          providerConnected: false,
          providerSupportedForRealExecution: true,
          draftOnlyProvider: false,
          hasAdDraftScope: false,
          hasSpendPermissionScope: false,
          providerConnectionIsNotSpendPermission: true,
        },
        handoffs: {
          visualBuildRequiredForLandingChanges: true,
          mutationRequiredForMessageChanges: true,
          measurementOwner: "GROW-MEASURE-001",
        },
        resultTruth: {
          providerResultsAvailable: false,
          fabricatedResultsBlocked: true,
        },
        safeStop: {
          allowedWithoutChangingAdsOrBudget: true,
          stopped: false,
          adsModified: false,
          budgetModified: false,
        },
        forbiddenPromises: ["guarantee-traffic", "guarantee-leads", "spend-without-approval"],
        externalSpendPerformed: false,
        activationPrepared: false,
        userMessage: "הטיוטה מוכנה, אבל אין ספק מחובר ולכן אין הפעלה או הוצאה.",
      },
      emailActionPath: {
        taskId: "GROW-EMAIL-001",
        agentId: "email-action-path",
        status: "sequence-draft-ready",
        requestedAction: "prepare-sequence",
        draft: {
          sequence: [{
            subjectVariants: ["מערכת לידים: בדיקה קצרה", "שאלה קצרה על לידים"],
            bodyVariants: ["טיוטה אחת", "טיוטה שתיים"],
          }],
        },
        providerTruth: {
          selectedProvider: "mailchimp",
          providerConnected: false,
          providerSupportedForRealSend: true,
          gmailLimited: false,
          hasEmailDraftScope: false,
          hasTestSendScope: false,
          hasSendScope: false,
          providerConnectionIsNotSendPermission: true,
          preferredProviders: ["mailchimp", "sendgrid"],
          limitedProviders: ["gmail"],
        },
        audienceTruth: {
          audienceSourceConfirmed: false,
          lawfulBasisConfirmed: false,
          coldListRejected: false,
          cleanedCount: 0,
          duplicateCount: 0,
          invalidCount: 0,
          fieldsSeparated: true,
        },
        approval: {
          campaignApproved: false,
          contentApproved: false,
          audienceSourceApproved: false,
          testSendApproved: false,
          sendApproved: false,
          campaignApprovalDoesNotSendSequence: true,
          perEmailApprovalRequired: true,
        },
        sendTruth: {
          draftOnlyByDefault: true,
          fullAudienceSendDefault: false,
          testSendPrepared: false,
          oneEmailSendPrepared: false,
          sequenceDraftPrepared: true,
          sequenceSendReadyCount: 0,
          externalSendPerformed: false,
        },
        resultTruth: {
          providerResultsAvailable: false,
          fabricatedResultsBlocked: true,
          metricsFabricated: false,
          measurementOwner: "GROW-MEASURE-001",
        },
        forbiddenPromises: ["guarantee-opens", "guarantee-replies", "send-without-approval"],
        userMessage: "הכנתי רצף אימיילים כטיוטה. אישור קמפיין לא שולח את כל הרצף.",
      },
      landingActionPath: {
        taskId: "GROW-LAND-001",
        agentId: "landing-action-path",
        status: "preview-ready",
        requestedAction: "preview",
        productBasis: {
          language: "he",
          direction: "rtl",
          audience: "צוות מכירות",
          problem: "לידים הולכים לאיבוד בלי מעקב.",
          coreValue: "לראות מי אחראי ומה הצעד הבא.",
          productDirection: "internal-tool",
        },
        readiness: {
          ready: true,
          missing: [],
        },
        draft: {
          hypothesis: "אם צוות מכירות רואה דף קצר, הוא מבין את הערך.",
          maxVersions: 2,
          versions: [
            { cta: "בדקו אם זה מתאים" },
            { cta: "שלחו לי דמו קצר" },
          ],
          sections: ["למי זה מיועד", "הבעיה", "איך זה עובד"],
        },
        visibility: {
          draftInternal: true,
          previewInspectableNotPublic: true,
          publicVisible: false,
          externalApprovalGranted: false,
          shareDemoReady: false,
          releaseReady: false,
          shareOrReleaseGateRequired: true,
          releaseImpersonationBlocked: true,
        },
        handoffs: {
          mutationRequiredForProductTruthChanges: false,
          visualBuildRequiredForVisibleChanges: true,
          measurementOwner: "GROW-MEASURE-001",
        },
        leadCapture: {
          enabled: true,
          consentConfigured: true,
          storage: "nexus-experiment-leads",
          fallbackStorage: true,
        },
        measurement: {
          landingEvents: ["landing.opened", "landing.cta.clicked", "landing.form.submitted"],
          resultTruthAvailable: false,
          fabricatedConversionDataBlocked: true,
          successClaimAllowed: false,
        },
        forbiddenClaims: ["fake-testimonials", "fake-conversions", "publish-without-approval"],
        successClaimBlockedWithoutMeasurement: true,
        externalPublicationPerformed: false,
        productTruthOwner: "source-product-not-landing",
        userMessage: "התצוגה המקדימה מוכנה לבדיקה פנימית, אבל עדיין לא ציבורית.",
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
  assert.match(html, /data-social-campaign-agent-task="GROW-AGT-002"/);
  assert.match(html, /data-social-campaign-agent-status="ready-for-approval"/);
  assert.match(html, /data-social-campaign-provider="instagram"/);
  assert.match(html, /data-social-campaign-provider-connected="false"/);
  assert.match(html, /data-social-campaign-external-executed="false"/);
  assert.match(html, /data-social-campaign-per-post-approval="true"/);
  assert.match(html, /data-social-campaign-fabricated-metrics-blocked="true"/);
  assert.match(html, /טיוטת קמפיין לפני פעולה חיצונית/);
  assert.match(html, /data-seo-action-task="GROW-SEO-001"/);
  assert.match(html, /data-seo-action-status="draft-ready"/);
  assert.match(html, /data-seo-action-language="he"/);
  assert.match(html, /data-seo-action-direction="rtl"/);
  assert.match(html, /data-seo-action-approval-required="true"/);
  assert.match(html, /data-seo-action-visual-build-required="true"/);
  assert.match(html, /data-seo-action-real-provider-data="false"/);
  assert.match(html, /data-seo-action-search-volume-hypothesis="true"/);
  assert.match(html, /טיוטת SEO לפני החלה/);
  assert.match(html, /data-sem-action-task="GROW-SEM-001"/);
  assert.match(html, /data-sem-action-status="draft-only-provider-missing"/);
  assert.match(html, /data-sem-action-provider="google-ads"/);
  assert.match(html, /data-sem-action-provider-connected="false"/);
  assert.match(html, /data-sem-action-provider-not-spend-permission="true"/);
  assert.match(html, /data-sem-action-separate-approvals="true"/);
  assert.match(html, /data-sem-action-budget-cap-enforced="true"/);
  assert.match(html, /data-sem-action-hard-cap-usd="50"/);
  assert.match(html, /data-sem-action-measurement-ready="true"/);
  assert.match(html, /data-sem-action-external-spend="false"/);
  assert.match(html, /טיוטת ניסוי ממומן לפני הוצאה/);
  assert.match(html, /data-email-action-task="GROW-EMAIL-001"/);
  assert.match(html, /data-email-action-status="sequence-draft-ready"/);
  assert.match(html, /data-email-action-provider="mailchimp"/);
  assert.match(html, /data-email-action-provider-connected="false"/);
  assert.match(html, /data-email-action-source-confirmed="false"/);
  assert.match(html, /data-email-action-draft-only="true"/);
  assert.match(html, /data-email-action-full-audience-default="false"/);
  assert.match(html, /data-email-action-external-send="false"/);
  assert.match(html, /data-email-action-per-email-approval="true"/);
  assert.match(html, /data-email-action-fabricated-metrics-blocked="true"/);
  assert.match(html, /טיוטת אימייל לפני שליחה/);
  assert.match(html, /data-landing-action-task="GROW-LAND-001"/);
  assert.match(html, /data-landing-action-status="preview-ready"/);
  assert.match(html, /data-landing-action-language="he"/);
  assert.match(html, /data-landing-action-direction="rtl"/);
  assert.match(html, /data-landing-action-draft-internal="true"/);
  assert.match(html, /data-landing-action-preview-not-public="true"/);
  assert.match(html, /data-landing-action-public-visible="false"/);
  assert.match(html, /data-landing-action-share-gate-required="true"/);
  assert.match(html, /data-landing-action-external-published="false"/);
  assert.match(html, /data-landing-action-product-truth-owner="source-product-not-landing"/);
  assert.match(html, /data-landing-action-lead-consent="true"/);
  assert.match(html, /data-landing-action-rtl="true"/);
  assert.match(html, /data-landing-action-fabricated-results-blocked="true"/);
  assert.match(html, /תצוגה פנימית מוכנה/);
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
  assert.doesNotMatch(html, /conversion|revenue|virality/i);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
});
