import test from "node:test";
import assert from "node:assert/strict";

import { createImportedAssetTaskExtractionModule } from "../src/core/imported-asset-task-extraction-module.js";

test("imported asset task extraction converts imported diagnosis surfaces into executable extracted tasks", () => {
  const { importedAssetTaskExtraction } = createImportedAssetTaskExtractionModule({
    projectId: "imported-growth-app",
    existingBusinessAssets: {
      assets: [
        {
          assetType: "file",
          fileType: "document",
          path: "docs/architecture.md",
          label: "docs/architecture.md",
        },
      ],
    },
    repositoryImportAndCodebaseDiagnosis: {
      status: "ready",
      repository: {
        fullName: "example/imported-growth-app",
      },
      summary: {
        architectureSummary: "Layered architecture",
      },
      diagnosisReadout: {
        blockingGaps: ["CI workflow missing"],
        recommendedActions: ["Audit test coverage before import continuation."],
      },
    },
    liveWebsiteIngestionAndFunnelDiagnosis: {
      status: "ready",
      website: {
        hostname: "app.example.com",
        url: "https://app.example.com",
      },
      summary: {
        funnelSummary: "registration blocked",
      },
      funnelDiagnosis: {
        blockedFlows: ["registration: onboarding CTA missing"],
        criticalDependencies: ["analytics instrumentation"],
        recommendedActions: ["Unblock registration CTA"],
      },
    },
    importedAnalyticsNormalization: {
      status: "ready",
      summary: {
        nextAction: "Map imported analytics export ga-export.csv into canonical growth signals.",
      },
      evidenceSources: {
        importedFiles: [{ path: "docs/ga-export.csv", label: "ga-export.csv" }],
      },
      normalizedSignals: {
        metrics: [{ metric: "activeUsers", value: 120, source: "runtimeSnapshot.analytics" }],
      },
    },
  });

  assert.equal(importedAssetTaskExtraction.status, "ready");
  assert.equal(importedAssetTaskExtraction.summary.totalExtractedTasks >= 5, true);
  assert.equal(importedAssetTaskExtraction.summary.sourceCoverage.includes("repository"), true);
  assert.equal(importedAssetTaskExtraction.summary.sourceCoverage.includes("website"), true);
  assert.equal(importedAssetTaskExtraction.summary.sourceCoverage.includes("analytics"), true);
  assert.equal(importedAssetTaskExtraction.extractedTasks[0].title.includes("repository"), true);
});
