import test from "node:test";
import assert from "node:assert/strict";

import { createFileTreeAndEditorContract } from "../src/core/file-tree-editor-contract.js";

test("file tree and editor contract returns canonical file navigation and tabs", () => {
  const { fileEditorContract } = createFileTreeAndEditorContract({
    developerWorkspace: {
      workspaceId: "developer-workspace:nexus-app",
      fileTree: {
        rootLabel: "Nexus App",
        items: [
          {
            fileId: "workspace-file-1",
            path: "src/app.js",
            name: "app.js",
            source: "diff-preview",
          },
          {
            fileId: "workspace-file-2",
            path: "attachments/spec.pdf",
            name: "spec.pdf",
            source: "attachment-storage",
          },
        ],
      },
      editor: {
        activeFilePath: "src/app.js",
        diffAware: true,
        openFiles: [
          { tabId: "editor-tab-1", path: "src/app.js", hasDiff: true },
        ],
      },
      diffPanel: {
        sections: {
          code: [{ diffEntryId: "diff-1", path: "src/app.js", summary: "update auth flow" }],
          migrations: [],
        },
      },
    },
    storageRecord: {
      storageRecordId: "storage:nexus-app:project",
      summary: {
        artifactCount: 2,
        attachmentCount: 1,
      },
      artifacts: [{ storageItemId: "artifact-1", path: "dist/app.js" }],
      attachments: [{ storageItemId: "attachment-1", path: "attachments/spec.pdf" }],
    },
  });

  assert.equal(fileEditorContract.workspaceId, "developer-workspace:nexus-app");
  assert.equal(fileEditorContract.fileTree.items[0].isOpen, true);
  assert.equal(fileEditorContract.fileTree.items[0].hasInlineDiff, true);
  assert.equal(fileEditorContract.editor.tabs[0].isActive, true);
  assert.equal(fileEditorContract.storageBinding.totalAttachments, 1);
  assert.equal(fileEditorContract.inlineDiffMap[0].path, "src/app.js");
});

test("file tree and editor contract falls back to canonical defaults", () => {
  const { fileEditorContract } = createFileTreeAndEditorContract();

  assert.equal(fileEditorContract.workspaceId, null);
  assert.equal(Array.isArray(fileEditorContract.fileTree.items), true);
  assert.equal(Array.isArray(fileEditorContract.editor.tabs), true);
  assert.equal(Array.isArray(fileEditorContract.inlineDiffMap), true);
});
