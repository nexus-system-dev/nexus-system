import test from "node:test";
import assert from "node:assert/strict";

import { GitHostingConnector } from "../src/core/git-connector.js";

test("git connector fetches github repo snapshot", async () => {
  const responses = {
    "https://api.github.com/repos/openai/nexus": {
      ok: true,
      json: async () => ({
        name: "nexus",
        full_name: "openai/nexus",
        default_branch: "main",
        private: false,
        html_url: "https://github.com/openai/nexus",
        description: "repo",
      }),
    },
    "https://api.github.com/repos/openai/nexus/branches?per_page=10": {
      ok: true,
      json: async () => [{ name: "main", protected: true, commit: { sha: "abc123" } }],
    },
    "https://api.github.com/repos/openai/nexus/commits?per_page=10": {
      ok: true,
      json: async () => [
        {
          sha: "abc123",
          commit: { message: "feat: add scanner\n\nbody", author: { name: "Yogev", date: "2026-01-01" } },
          html_url: "https://github.com/openai/nexus/commit/abc123",
        },
      ],
    },
    "https://api.github.com/repos/openai/nexus/pulls?state=all&per_page=10": {
      ok: true,
      json: async () => [
        {
          number: 12,
          title: "Improve planner",
          state: "open",
          head: { ref: "feat/planner" },
          base: { ref: "main" },
          html_url: "https://github.com/openai/nexus/pull/12",
        },
      ],
    },
    "https://api.github.com/repos/openai/nexus/pulls/12/files?per_page=20": {
      ok: true,
      json: async () => [
        { filename: "src/core/planner.js", status: "modified", additions: 10, deletions: 2, changes: 12 },
      ],
    },
    "https://api.github.com/repos/openai/nexus/issues/12/comments?per_page=20": {
      ok: true,
      json: async () => [{ user: { login: "reviewer" }, body: "TODO: add tests", created_at: "2026-01-01" }],
    },
    "https://api.github.com/repos/openai/nexus/pulls/12/reviews?per_page=20": {
      ok: true,
      json: async () => [{ user: { login: "maintainer" }, body: "Looks good", submitted_at: "2026-01-02", state: "APPROVED" }],
    },
  };

  const connector = new GitHostingConnector({
    fetchImpl: async (url) => responses[url],
  });

  const snapshot = await connector.fetchSnapshot({
    provider: "github",
    owner: "openai",
    repo: "nexus",
  });

  assert.equal(snapshot.repo.fullName, "openai/nexus");
  assert.equal(snapshot.branches[0].name, "main");
  assert.equal(snapshot.commits[0].sha, "abc123");
  assert.equal(snapshot.pullRequests[0].id, 12);
  assert.equal(snapshot.diffs[0].files[0].path, "src/core/planner.js");
  assert.equal(snapshot.prDiscussions.length, 2);
});

test("git connector fetches gitlab repo snapshot", async () => {
  const projectPath = encodeURIComponent("team/nexus");
  const responses = {
    [`https://gitlab.com/api/v4/projects/${projectPath}`]: {
      ok: true,
      json: async () => ({
        name: "nexus",
        path_with_namespace: "team/nexus",
        default_branch: "main",
        visibility: "private",
        web_url: "https://gitlab.com/team/nexus",
        description: "repo",
      }),
    },
    [`https://gitlab.com/api/v4/projects/${projectPath}/repository/branches?per_page=10`]: {
      ok: true,
      json: async () => [{ name: "main", protected: true, commit: { id: "def456" } }],
    },
    [`https://gitlab.com/api/v4/projects/${projectPath}/repository/commits?per_page=10`]: {
      ok: true,
      json: async () => [
        {
          id: "def456",
          title: "feat: add git sync",
          author_name: "Yogev",
          committed_date: "2026-01-01",
          web_url: "https://gitlab.com/team/nexus/-/commit/def456",
        },
      ],
    },
    [`https://gitlab.com/api/v4/projects/${projectPath}/merge_requests?state=all&per_page=10`]: {
      ok: true,
      json: async () => [
        {
          iid: 7,
          title: "Add git integration",
          state: "opened",
          source_branch: "feat/git",
          target_branch: "main",
          web_url: "https://gitlab.com/team/nexus/-/merge_requests/7",
        },
      ],
    },
    [`https://gitlab.com/api/v4/projects/${projectPath}/merge_requests/7/changes`]: {
      ok: true,
      json: async () => ({
        changes: [{ new_path: "src/core/git-connector.js", old_path: "src/core/git-connector.js", new_file: true }],
      }),
    },
    [`https://gitlab.com/api/v4/projects/${projectPath}/merge_requests/7/notes?per_page=20`]: {
      ok: true,
      json: async () => [{ author: { username: "reviewer" }, body: "חסר: release notes", created_at: "2026-01-01" }],
    },
  };

  const connector = new GitHostingConnector({
    fetchImpl: async (url) => responses[url],
  });

  const snapshot = await connector.fetchSnapshot({
    provider: "gitlab",
    owner: "team",
    repo: "nexus",
  });

  assert.equal(snapshot.repo.fullName, "team/nexus");
  assert.equal(snapshot.pullRequests[0].id, 7);
  assert.equal(snapshot.diffs[0].files[0].path, "src/core/git-connector.js");
  assert.equal(snapshot.prDiscussions.length, 1);
});
