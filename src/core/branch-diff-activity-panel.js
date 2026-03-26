function normalizeDiffPreviewPayload(diffPreviewPayload = null) {
  return diffPreviewPayload && typeof diffPreviewPayload === "object" && !Array.isArray(diffPreviewPayload)
    ? diffPreviewPayload
    : {};
}

function normalizeProjectState(projectState = null) {
  return projectState && typeof projectState === "object" && !Array.isArray(projectState)
    ? projectState
    : {};
}

function buildBranchState(gitSnapshot) {
  const branches = Array.isArray(gitSnapshot?.branches) ? gitSnapshot.branches : [];
  const repo = gitSnapshot?.repo ?? null;

  return {
    repoName: repo?.fullName ?? repo?.name ?? null,
    defaultBranch: repo?.defaultBranch ?? branches[0]?.name ?? null,
    branches: branches.map((branch) => ({
      name: branch.name,
      protected: branch.protected === true,
      lastCommitSha: branch.lastCommitSha ?? null,
      isDefault: branch.name === (repo?.defaultBranch ?? branches[0]?.name ?? null),
    })),
  };
}

function buildCommitFeed(gitSnapshot) {
  const commits = Array.isArray(gitSnapshot?.commits) ? gitSnapshot.commits : [];

  return commits.slice(0, 10).map((commit) => ({
    sha: commit.sha ?? null,
    title: commit.title ?? commit.sha ?? "unknown-commit",
    author: commit.author ?? null,
    committedAt: commit.committedAt ?? null,
    url: commit.url ?? null,
  }));
}

function buildPendingApprovals(projectState) {
  const approvalRecords = Array.isArray(projectState.approvalRecords) ? projectState.approvalRecords : [];

  return approvalRecords
    .filter((record) => ["pending", "requested", "missing"].includes(record.status))
    .map((record) => ({
      approvalRecordId: record.approvalRecordId ?? null,
      approvalType: record.approvalType ?? null,
      status: record.status ?? "pending",
      actionType: record.actionType ?? null,
      expiresAt: record.expiresAt ?? null,
    }));
}

function buildChangeHistory(projectState) {
  const auditTrail = Array.isArray(projectState.approvalAuditTrail?.entries)
    ? projectState.approvalAuditTrail.entries
    : [];
  const auditLogRecord = projectState.auditLogRecord ? [projectState.auditLogRecord] : [];

  return [
    ...auditTrail.map((entry) => ({
      eventId: entry.auditEntryId ?? null,
      type: entry.eventType ?? "approval-event",
      summary: entry.summary ?? entry.eventType ?? "Approval activity",
      timestamp: entry.timestamp ?? null,
      source: "approval-audit",
    })),
    ...auditLogRecord.map((entry) => ({
      eventId: entry.auditLogId ?? null,
      type: entry.category ?? "system",
      summary: entry.summary ?? "System activity",
      timestamp: entry.recordedAt ?? null,
      source: "system-audit",
    })),
  ].slice(0, 10);
}

export function createBranchAndDiffActivityPanel({
  diffPreviewPayload = null,
  projectState = null,
} = {}) {
  const normalizedDiffPreviewPayload = normalizeDiffPreviewPayload(diffPreviewPayload);
  const normalizedProjectState = normalizeProjectState(projectState);
  const gitSnapshot = normalizedProjectState.gitSnapshot ?? null;
  const pullRequests = Array.isArray(gitSnapshot?.pullRequests) ? gitSnapshot.pullRequests : [];

  return {
    branchDiffActivityPanel: {
      panelId: `branch-diff-activity:${normalizedProjectState.projectId ?? "unknown-project"}`,
      branchState: buildBranchState(gitSnapshot),
      diffs: {
        executionRequestId: normalizedDiffPreviewPayload.executionRequestId ?? null,
        headline: normalizedDiffPreviewPayload.diffPreview?.headline ?? "No pending diff",
        totalChanges: normalizedDiffPreviewPayload.diffPreview?.summary?.totalChanges ?? 0,
        riskFlags: Array.isArray(normalizedDiffPreviewPayload.riskFlags) ? normalizedDiffPreviewPayload.riskFlags : [],
      },
      commits: buildCommitFeed(gitSnapshot),
      pullRequests: pullRequests.slice(0, 5).map((pullRequest) => ({
        id: pullRequest.id ?? null,
        title: pullRequest.title ?? null,
        state: pullRequest.state ?? null,
        sourceBranch: pullRequest.sourceBranch ?? null,
        targetBranch: pullRequest.targetBranch ?? null,
        url: pullRequest.url ?? null,
      })),
      pendingApprovals: buildPendingApprovals(normalizedProjectState),
      changeHistory: buildChangeHistory(normalizedProjectState),
      summary: {
        branchCount: Array.isArray(gitSnapshot?.branches) ? gitSnapshot.branches.length : 0,
        commitCount: Array.isArray(gitSnapshot?.commits) ? gitSnapshot.commits.length : 0,
        pendingApprovalCount: buildPendingApprovals(normalizedProjectState).length,
        openReviewCount: pullRequests.filter((pullRequest) => pullRequest.state === "open").length,
      },
    },
  };
}
