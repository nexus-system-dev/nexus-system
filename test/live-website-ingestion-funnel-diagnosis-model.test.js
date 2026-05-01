import test from "node:test";
import assert from "node:assert/strict";

import { createLiveWebsiteIngestionFunnelDiagnosisModel } from "../src/core/live-website-ingestion-funnel-diagnosis-model.js";

test("live website ingestion diagnosis turns imported website evidence into a canonical funnel diagnosis surface", () => {
  const { liveWebsiteIngestionAndFunnelDiagnosis } = createLiveWebsiteIngestionFunnelDiagnosisModel({
    projectId: "imported-growth-app",
    existingBusinessAssets: {
      importAndContinueSeed: {
        scanRoot: "/tmp/imported-growth-app",
        nextCapabilities: ["repository-diagnosis", "website-diagnosis", "document-diagnosis"],
      },
      assets: [
        {
          assetType: "link",
          url: "https://app.example.com",
          metadata: {
            hostname: "app.example.com",
          },
        },
      ],
    },
    externalSnapshot: {
      source: "casino-api",
      syncedAt: "2026-04-01T10:00:00.000Z",
      health: {
        status: "degraded",
      },
      features: {
        hasAuth: true,
        hasPayments: false,
        hasAnalytics: false,
      },
      flows: {
        registration: {
          status: "partial",
        },
      },
      technical: {
        stack: {
          frontend: "React",
          backend: "Express",
          database: "PostgreSQL",
        },
      },
      roadmapContext: {
        knownMissingParts: ["checkout recovery"],
        criticalDependencies: ["analytics instrumentation"],
      },
      blockedFlows: ["registration: missing onboarding CTA"],
    },
    scan: {
      gaps: ["missing analytics import"],
    },
  });

  assert.equal(liveWebsiteIngestionAndFunnelDiagnosis.status, "ready");
  assert.equal(liveWebsiteIngestionAndFunnelDiagnosis.website.hostname, "app.example.com");
  assert.equal(liveWebsiteIngestionAndFunnelDiagnosis.summary.canDiagnoseWebsite, true);
  assert.equal(
    liveWebsiteIngestionAndFunnelDiagnosis.funnelDiagnosis.blockedFlows[0],
    "registration: missing onboarding CTA",
  );
  assert.equal(
    liveWebsiteIngestionAndFunnelDiagnosis.siteSignals.capabilityReadiness[0].capability,
    "auth",
  );
  assert.equal(
    liveWebsiteIngestionAndFunnelDiagnosis.importContinuation.nextCapabilities.includes("imported-asset-task-extraction"),
    true,
  );
});
