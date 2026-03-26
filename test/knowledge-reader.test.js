import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readProjectKnowledge } from "../src/core/knowledge-reader.js";

function createFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

test("knowledge reader collects readme and docs with missing signals", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-knowledge-"));
  createFile(
    path.join(root, "README.md"),
    "# Product\n## Scope\nTODO: add auth flow\nLater: payments integration\n",
  );
  createFile(
    path.join(root, "docs/architecture.md"),
    "# Architecture\n## Decisions\nחסר: queue worker\nצריך: CI pipeline\n",
  );

  const result = readProjectKnowledge(root);

  assert.equal(result.readme.path, "README.md");
  assert.equal(result.docs.length, 1);
  assert.equal(result.knownMissingParts.includes("add auth flow"), true);
  assert.equal(result.knownMissingParts.includes("queue worker"), true);
  assert.equal(result.integrations.prDiscussions.status, "not-connected");
});

test("knowledge reader includes pr discussions and notion pages", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-knowledge-"));
  createFile(path.join(root, "README.md"), "# Product\n");

  const result = readProjectKnowledge(root, {
    gitSnapshot: {
      prDiscussions: [
        {
          id: "pr-1-discussion-1",
          pullRequestTitle: "Add auth",
          body: "TODO: connect frontend auth flow",
        },
      ],
    },
    notionSnapshot: {
      pages: [
        {
          id: "page-1",
          title: "Launch plan",
          url: "https://notion.so/page-1",
          excerpt: "חסר: onboarding emails",
        },
      ],
    },
  });

  assert.equal(result.prDiscussions.length, 1);
  assert.equal(result.notionPages.length, 1);
  assert.equal(result.integrations.prDiscussions.status, "connected");
  assert.equal(result.integrations.notion.status, "connected");
  assert.equal(result.knownMissingParts.includes("connect frontend auth flow"), true);
});
