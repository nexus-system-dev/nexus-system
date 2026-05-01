import test from "node:test";
import assert from "node:assert/strict";

import { createImportAndContinueRoadmapAssembler } from "../src/core/import-and-continue-roadmap-assembler.js";

test("import-and-continue roadmap assembler builds ordered roadmap items from extracted imported tasks", () => {
  const { importAndContinueRoadmap } = createImportAndContinueRoadmapAssembler({
    projectId: "giftwallet",
    existingBusinessAssets: {
      importAndContinueSeed: {
        canContinueFromCurrentReality: true,
        nextCapabilities: ["repository-diagnosis", "website-diagnosis", "analytics-import", "document-diagnosis"],
        scanRoot: "/tmp/giftwallet",
      },
    },
    repositoryImportAndCodebaseDiagnosis: { status: "ready" },
    liveWebsiteIngestionAndFunnelDiagnosis: { status: "ready" },
    importedAnalyticsNormalization: { status: "ready" },
    importedAssetTaskExtraction: {
      status: "ready",
      extractedTasks: [
        { sourceType: "repository", title: "Resolve repository gap: missing CI workflow", detail: "repo", priority: "high", evidence: ["repo"] },
        { sourceType: "website", title: "Unblock website flow: onboarding CTA missing", detail: "site", priority: "high", evidence: ["site"] },
        { sourceType: "analytics", title: "Validate imported metric truth: activation rate", detail: "analytics", priority: "medium", evidence: ["ga"] },
        { sourceType: "documents", title: "Review imported documentation: docs/README.md", detail: "doc", priority: "low", evidence: ["docs/README.md"] },
      ],
    },
  });

  assert.equal(importAndContinueRoadmap.status, "ready");
  assert.equal(importAndContinueRoadmap.summary.roadmapItemCount, 4);
  assert.equal(importAndContinueRoadmap.upstreamSummary.repositoryReady, true);
  assert.equal(importAndContinueRoadmap.continuityReadiness.canContinueFromCurrentReality, true);
  assert.equal(importAndContinueRoadmap.continuityReadiness.coveredSourceTypes.includes("website"), true);
  assert.equal(importAndContinueRoadmap.roadmapItems[1].dependencyIds[0], importAndContinueRoadmap.roadmapItems[0].taskId);
  assert.equal(importAndContinueRoadmap.dependencyGraph[3].dependsOn[0], importAndContinueRoadmap.roadmapItems[2].taskId);
});

test("import-and-continue roadmap assembler reports missing inputs when extraction is unavailable", () => {
  const { importAndContinueRoadmap } = createImportAndContinueRoadmapAssembler({
    projectId: "giftwallet",
    existingBusinessAssets: {},
    importedAssetTaskExtraction: {
      status: "missing-inputs",
      extractedTasks: [],
    },
  });

  assert.equal(importAndContinueRoadmap.status, "missing-inputs");
  assert.deepEqual(importAndContinueRoadmap.missingInputs, ["imported-asset-task-extraction"]);
  assert.equal(importAndContinueRoadmap.roadmapItems.length, 0);
});
