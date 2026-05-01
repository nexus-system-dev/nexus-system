import test from "node:test";
import assert from "node:assert/strict";

import { createExistingBusinessAssetNormalizationLayer } from "../src/core/existing-business-asset-normalization-layer.js";

test("existing business asset normalization layer dedupes imported evidence into one canonical asset view", () => {
  const { existingBusinessAssets } = createExistingBusinessAssetNormalizationLayer({
    projectId: "scanner-intake-app",
    projectIntake: {
      projectName: "Scanner Intake App",
      projectType: "saas",
      visionText: "אפליקציה עם login ו-growth funnel",
      requestedDeliverables: ["auth", "growth"],
      uploadedFiles: [
        {
          name: "README.md",
          type: "markdown",
          content: "# App",
        },
        {
          name: "docs/architecture.md",
          type: "markdown",
          content: "# Architecture",
        },
      ],
      externalLinks: [
        "https://github.com/example/scanner-intake-app",
        "https://scanner.example.com",
      ],
    },
    intakeScanHandoff: {
      scanRoot: "/tmp/scanner-intake-app",
      importedArtifacts: 2,
    },
    scan: {
      gaps: ["missing analytics import"],
      findings: {
        hasAuth: true,
      },
      stack: {
        frontend: ["React"],
        backend: ["Express"],
        database: ["Postgres"],
      },
      knowledge: {
        summary: "README + docs",
        readme: {
          path: "README.md",
        },
        docs: [
          {
            path: "docs/architecture.md",
          },
        ],
      },
    },
    gitSnapshot: {
      provider: "github",
      repo: {
        fullName: "example/scanner-intake-app",
        defaultBranch: "main",
      },
      branches: [{ name: "main" }],
      commits: [{ sha: "abc123" }],
      pullRequests: [{ id: 1 }],
    },
  });

  assert.equal(existingBusinessAssets.status, "ready");
  assert.equal(existingBusinessAssets.summary.totalAssets, 4);
  assert.equal(existingBusinessAssets.summary.fileAssetCount, 2);
  assert.equal(existingBusinessAssets.summary.linkAssetCount, 1);
  assert.equal(existingBusinessAssets.summary.repositoryAssetCount, 1);
  assert.equal(existingBusinessAssets.diagnosisSeed.hasAuth, true);
  assert.equal(existingBusinessAssets.importAndContinueSeed.canContinueFromCurrentReality, true);
  assert.equal(existingBusinessAssets.importAndContinueSeed.nextCapabilities.includes("repository-diagnosis"), true);
  const readmeAsset = existingBusinessAssets.assets.find((asset) => asset.path === "README.md");
  assert.deepEqual(readmeAsset.sourceStages, ["project-scan", "uploaded-intake"]);
  const repoAsset = existingBusinessAssets.assets.find((asset) => asset.assetType === "repository");
  assert.equal(repoAsset.repository.fullName, "example/scanner-intake-app");
});
