import test from "node:test";
import assert from "node:assert/strict";

import { buildFilesSupportViewModel } from "../web/nexus-ui/adapters/files-adapter.js";

test("buildFilesSupportViewModel merges project, proof, and draft files without inventing runtime actions", () => {
  const viewModel = buildFilesSupportViewModel({
    project: {
      id: "giftwallet",
      name: "GiftWallet",
      updatedAt: "2026-05-11T10:00:00.000Z",
      files: [
        "docs/vision.md",
        { path: "src/app.js", status: "modified", type: "javascript" },
      ],
      generatedFiles: [
        "dist/app.zip",
      ],
      generatedSurfaceProofSchema: {
        files: [
          { name: "proof.png", validationStatus: "passed", type: "image/png" },
        ],
      },
    },
    draftInputs: {
      fileName: "notes.txt",
      fileContent: "Launch notes for onboarding context",
    },
  });

  assert.equal(viewModel.files.length, 5);
  assert.equal(viewModel.files[0].source, "draft");
  assert.equal(viewModel.stats[0].value, "5");
  assert.equal(viewModel.stats[1].value, "1");
  assert.equal(viewModel.stats[2].value, "1");
  assert.equal(viewModel.primaryAction.target, "loop");
  assert.match(viewModel.runtimeCard.body, /project payload/i);
  assert.equal(viewModel.limitsCard.bullets.some((item) => item.includes("upload")), true);
});

test("buildFilesSupportViewModel falls back to a safe placeholder when no project runtime exists", () => {
  const viewModel = buildFilesSupportViewModel();

  assert.equal(viewModel.files.length, 0);
  assert.equal(viewModel.primaryAction.target, "create");
  assert.equal(viewModel.secondaryAction.target, "home");
  assert.match(viewModel.runtimeCard.body, /placeholder/i);
});
