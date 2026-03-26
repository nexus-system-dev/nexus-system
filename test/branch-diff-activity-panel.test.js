import test from "node:test";
import assert from "node:assert/strict";

import { createBranchAndDiffActivityPanel } from "../src/core/branch-diff-activity-panel.js";

test("branch and diff activity panel returns canonical branch, diff and approval activity", () => {
  const { branchDiffActivityPanel } = createBranchAndDiffActivityPanel({
    diffPreviewPayload: {
      projectId: "nexus-app",
      executionRequestId: "exec-1",
      diffPreview: {
        headline: "לפני הביצוע יוחלו שינויי קוד",
        summary: { totalChanges: 3 },
      },
      riskFlags: ["approval-required"],
    },
    projectState: {
      projectId: "nexus-app",
      gitSnapshot: {
        repo: { fullName: "openai/nexus", defaultBranch: "main" },
        branches: [{ name: "main", protected: true, lastCommitSha: "abc123" }],
        commits: [{ sha: "abc123", title: "feat: add workbench", author: "Yogev" }],
        pullRequests: [{ id: 14, title: "Workbench", state: "open", sourceBranch: "feat/workbench", targetBranch: "main" }],
      },
      approvalRecords: [{ approvalRecordId: "approval-1", status: "pending", approvalType: "deploy", actionType: "deploy" }],
      approvalAuditTrail: {
        entries: [{ auditEntryId: "audit-1", eventType: "approval.requested", summary: "Deploy approval requested" }],
      },
      auditLogRecord: {
        auditLogId: "sys-1",
        category: "system",
        summary: "Branch sync complete",
      },
    },
  });

  assert.equal(branchDiffActivityPanel.branchState.repoName, "openai/nexus");
  assert.equal(branchDiffActivityPanel.diffs.totalChanges, 3);
  assert.equal(branchDiffActivityPanel.commits[0].sha, "abc123");
  assert.equal(branchDiffActivityPanel.pendingApprovals[0].status, "pending");
  assert.equal(branchDiffActivityPanel.changeHistory.length, 2);
  assert.equal(branchDiffActivityPanel.summary.openReviewCount, 1);
});

test("branch and diff activity panel falls back to empty canonical state", () => {
  const { branchDiffActivityPanel } = createBranchAndDiffActivityPanel();

  assert.equal(branchDiffActivityPanel.panelId, "branch-diff-activity:unknown-project");
  assert.equal(Array.isArray(branchDiffActivityPanel.branchState.branches), true);
  assert.equal(Array.isArray(branchDiffActivityPanel.commits), true);
  assert.equal(Array.isArray(branchDiffActivityPanel.pendingApprovals), true);
});
