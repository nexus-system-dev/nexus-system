import test from "node:test";
import assert from "node:assert/strict";

import { createImportedAnalyticsNormalizationLayer } from "../src/core/imported-analytics-normalization-layer.js";

test("imported analytics normalization turns imported analytics evidence into a canonical normalization surface", () => {
  const { importedAnalyticsNormalization } = createImportedAnalyticsNormalizationLayer({
    projectId: "imported-growth-app",
    existingBusinessAssets: {
      importAndContinueSeed: {
        scanRoot: "/tmp/imported-growth-app",
        nextCapabilities: ["website-diagnosis", "document-diagnosis"],
      },
      assets: [
        {
          assetId: "existing-asset:analytics",
          assetType: "file",
          fileType: "data",
          label: "ga-export.csv",
          path: "docs/ga-export.csv",
          sourceStages: ["uploaded-intake"],
        },
      ],
    },
    externalSnapshot: {
      features: {
        hasAnalytics: true,
      },
    },
    runtimeSnapshot: {
      analytics: {
        activeUsers: 120,
      },
      productMetrics: {
        activationRate: 0.42,
      },
    },
  });

  assert.equal(importedAnalyticsNormalization.status, "ready");
  assert.equal(importedAnalyticsNormalization.summary.canNormalizeImportedAnalytics, true);
  assert.equal(importedAnalyticsNormalization.summary.importedAssetCount, 1);
  assert.equal(importedAnalyticsNormalization.evidenceSources.providers.includes("google-analytics"), true);
  assert.equal(importedAnalyticsNormalization.evidenceSources.runtimeSignalsAvailable, true);
  assert.equal(
    importedAnalyticsNormalization.importContinuation.nextCapabilities.includes("imported-asset-task-extraction"),
    true,
  );
});
