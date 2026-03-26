function trimSlash(value) {
  return typeof value === "string" ? value.replace(/\/+$/, "") : value;
}

function encodeProjectPath(owner, repo) {
  return encodeURIComponent(`${owner}/${repo}`);
}

function normalizeGitHubRepo(repo) {
  return {
    provider: "github",
    name: repo.name,
    fullName: repo.full_name,
    defaultBranch: repo.default_branch,
    visibility: repo.private ? "private" : "public",
    url: repo.html_url,
    description: repo.description,
  };
}

function normalizeGitLabRepo(repo) {
  return {
    provider: "gitlab",
    name: repo.name,
    fullName: repo.path_with_namespace,
    defaultBranch: repo.default_branch,
    visibility: repo.visibility,
    url: repo.web_url,
    description: repo.description,
  };
}

function normalizeDiscussionEntry(entry, fallbackType = "comment") {
  return {
    author: entry.user?.login ?? entry.author?.username ?? entry.author?.name ?? null,
    body: entry.body ?? entry.note ?? "",
    createdAt: entry.created_at ?? entry.submitted_at ?? null,
    type: entry.state ? "review" : fallbackType,
  };
}

export class GitHostingConnector {
  constructor({ fetchImpl = globalThis.fetch } = {}) {
    this.fetchImpl = fetchImpl;
  }

  async fetchJson(url, options = {}) {
    const response = await this.fetchImpl(url, options);
    if (!response.ok) {
      throw new Error(`Git hosting request failed: ${response.status}`);
    }

    return response.json();
  }

  buildGitHubHeaders(apiKey) {
    return {
      Accept: "application/vnd.github+json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    };
  }

  buildGitLabHeaders(apiKey) {
    return apiKey ? { "PRIVATE-TOKEN": apiKey } : {};
  }

  async fetchGitHubSnapshot({ owner, repo, apiKey, host }) {
    const baseUrl = trimSlash(host || "https://api.github.com");
    const headers = this.buildGitHubHeaders(apiKey);
    const repoPath = `${owner}/${repo}`;

    const [repoPayload, branchesPayload, commitsPayload, pullsPayload] = await Promise.all([
      this.fetchJson(`${baseUrl}/repos/${repoPath}`, { headers }),
      this.fetchJson(`${baseUrl}/repos/${repoPath}/branches?per_page=10`, { headers }),
      this.fetchJson(`${baseUrl}/repos/${repoPath}/commits?per_page=10`, { headers }),
      this.fetchJson(`${baseUrl}/repos/${repoPath}/pulls?state=all&per_page=10`, { headers }),
    ]);

    const pullRequests = await Promise.all(
      pullsPayload.slice(0, 3).map(async (pull) => {
        const [files, comments, reviews] = await Promise.all([
          this.fetchJson(`${baseUrl}/repos/${repoPath}/pulls/${pull.number}/files?per_page=20`, {
            headers,
          }),
          this.fetchJson(`${baseUrl}/repos/${repoPath}/issues/${pull.number}/comments?per_page=20`, {
            headers,
          }),
          this.fetchJson(`${baseUrl}/repos/${repoPath}/pulls/${pull.number}/reviews?per_page=20`, {
            headers,
          }),
        ]);
        return {
          id: pull.number,
          title: pull.title,
          state: pull.state,
          sourceBranch: pull.head?.ref ?? null,
          targetBranch: pull.base?.ref ?? null,
          url: pull.html_url ?? null,
          files: files.slice(0, 20).map((file) => ({
            path: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
          })),
          discussions: [
            ...comments.map((entry) => normalizeDiscussionEntry(entry, "comment")),
            ...reviews.map((entry) => normalizeDiscussionEntry(entry, "review")),
          ].filter((entry) => entry.body),
        };
      }),
    );

    const diffs = pullRequests.slice(0, 3).map((pull) => ({
      id: `pr-${pull.id}`,
      title: pull.title,
      source: "pull-request",
      files: pull.files,
    }));

    return {
      provider: "github",
      repo: normalizeGitHubRepo(repoPayload),
      branches: branchesPayload.map((branch) => ({
        name: branch.name,
        protected: Boolean(branch.protected),
        lastCommitSha: branch.commit?.sha ?? null,
      })),
      commits: commitsPayload.map((commit) => ({
        sha: commit.sha,
        title: commit.commit?.message?.split("\n")[0] ?? commit.sha,
        author: commit.commit?.author?.name ?? null,
        committedAt: commit.commit?.author?.date ?? null,
        url: commit.html_url ?? null,
      })),
      pullRequests,
      prDiscussions: pullRequests.flatMap((pull) =>
        (pull.discussions ?? []).map((discussion, index) => ({
          id: `pr-${pull.id}-discussion-${index + 1}`,
          pullRequestId: pull.id,
          pullRequestTitle: pull.title,
          ...discussion,
        })),
      ),
      diffs,
      syncedAt: new Date().toISOString(),
    };
  }

  async fetchGitLabSnapshot({ owner, repo, apiKey, host }) {
    const baseUrl = trimSlash(host || "https://gitlab.com/api/v4");
    const headers = this.buildGitLabHeaders(apiKey);
    const projectPath = encodeProjectPath(owner, repo);

    const [repoPayload, branchesPayload, commitsPayload, mergeRequestsPayload] = await Promise.all([
      this.fetchJson(`${baseUrl}/projects/${projectPath}`, { headers }),
      this.fetchJson(`${baseUrl}/projects/${projectPath}/repository/branches?per_page=10`, { headers }),
      this.fetchJson(`${baseUrl}/projects/${projectPath}/repository/commits?per_page=10`, { headers }),
      this.fetchJson(`${baseUrl}/projects/${projectPath}/merge_requests?state=all&per_page=10`, { headers }),
    ]);

    const pullRequests = await Promise.all(
      mergeRequestsPayload.slice(0, 3).map(async (mergeRequest) => {
        const [changesPayload, notesPayload] = await Promise.all([
          this.fetchJson(`${baseUrl}/projects/${projectPath}/merge_requests/${mergeRequest.iid}/changes`, {
            headers,
          }),
          this.fetchJson(`${baseUrl}/projects/${projectPath}/merge_requests/${mergeRequest.iid}/notes?per_page=20`, {
            headers,
          }),
        ]);
        return {
          id: mergeRequest.iid,
          title: mergeRequest.title,
          state: mergeRequest.state,
          sourceBranch: mergeRequest.source_branch ?? null,
          targetBranch: mergeRequest.target_branch ?? null,
          url: mergeRequest.web_url ?? null,
          files: (changesPayload.changes ?? []).slice(0, 20).map((change) => ({
            path: change.new_path ?? change.old_path,
            status: change.deleted_file ? "removed" : change.new_file ? "added" : "modified",
            additions: null,
            deletions: null,
            changes: null,
          })),
          discussions: (notesPayload ?? [])
            .map((entry) => normalizeDiscussionEntry(entry, "comment"))
            .filter((entry) => entry.body),
        };
      }),
    );

    const diffs = pullRequests.slice(0, 3).map((mergeRequest) => ({
      id: `mr-${mergeRequest.id}`,
      title: mergeRequest.title,
      source: "merge-request",
      files: mergeRequest.files,
    }));

    return {
      provider: "gitlab",
      repo: normalizeGitLabRepo(repoPayload),
      branches: branchesPayload.map((branch) => ({
        name: branch.name,
        protected: Boolean(branch.protected),
        lastCommitSha: branch.commit?.id ?? null,
      })),
      commits: commitsPayload.map((commit) => ({
        sha: commit.id,
        title: commit.title ?? commit.short_id,
        author: commit.author_name ?? null,
        committedAt: commit.committed_date ?? null,
        url: commit.web_url ?? null,
      })),
      pullRequests,
      prDiscussions: pullRequests.flatMap((mergeRequest) =>
        (mergeRequest.discussions ?? []).map((discussion, index) => ({
          id: `mr-${mergeRequest.id}-discussion-${index + 1}`,
          pullRequestId: mergeRequest.id,
          pullRequestTitle: mergeRequest.title,
          ...discussion,
        })),
      ),
      diffs,
      syncedAt: new Date().toISOString(),
    };
  }

  async fetchSnapshot(source) {
    if (source.provider === "github") {
      return this.fetchGitHubSnapshot(source);
    }

    if (source.provider === "gitlab") {
      return this.fetchGitLabSnapshot(source);
    }

    throw new Error(`Unsupported git provider: ${source.provider ?? "unknown"}`);
  }
}
