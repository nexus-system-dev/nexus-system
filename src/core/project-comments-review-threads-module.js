function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function dedupeParticipants(participants) {
  const seen = new Set();
  return normalizeArray(participants).filter((participant) => {
    const normalizedParticipant = normalizeObject(participant);
    const participantId = normalizedParticipant.participantId ?? normalizedParticipant.displayName ?? null;
    if (!participantId || seen.has(participantId)) {
      return false;
    }

    seen.add(participantId);
    return true;
  });
}

function buildBaseContext(collaborationEvent, branchDiffActivityPanel) {
  const eventTarget = normalizeObject(collaborationEvent.target);
  const diffs = normalizeObject(branchDiffActivityPanel.diffs);

  return {
    workspaceArea: eventTarget.workspaceArea ?? "developer-workspace",
    diffHeadline: diffs.headline ?? "No pending diff",
    executionRequestId: diffs.executionRequestId ?? null,
  };
}

function resolveThreadType(collaborationEvent) {
  const eventType = collaborationEvent.eventType ?? "comment";

  if (eventType === "shared-approval") {
    return "approval-thread";
  }

  if (eventType === "shared-review") {
    return "review-thread";
  }

  if (eventType === "mention") {
    return "mention-thread";
  }

  return "comment-thread";
}

function buildMessages(collaborationEvent, statusOverride = null) {
  const actor = normalizeObject(collaborationEvent.actor);
  const payload = normalizeObject(collaborationEvent.payload);

  return [
    {
      messageId: `${collaborationEvent.eventId ?? "collaboration-event"}:message-1`,
      authorId: actor.actorId ?? null,
      authorName: actor.displayName ?? "Unknown collaborator",
      body: payload.message ?? "Collaboration update",
      mentions: normalizeArray(payload.mentions),
      status: statusOverride ?? payload.reviewStatus ?? payload.approvalStatus ?? "open",
    },
  ];
}

function buildEventThread(collaborationEvent, baseContext) {
  if (!collaborationEvent.eventId) {
    return null;
  }

  const eventType = collaborationEvent.eventType ?? "comment";
  const isDiscussionEvent = ["comment", "mention", "shared-review", "shared-approval"].includes(eventType);

  if (!isDiscussionEvent) {
    return null;
  }

  const payload = normalizeObject(collaborationEvent.payload);
  const resourceId = collaborationEvent.target?.resourceId ?? baseContext.executionRequestId ?? null;
  const messages = buildMessages(collaborationEvent);

  return {
    threadId: `thread:${collaborationEvent.eventId}`,
    threadType: resolveThreadType(collaborationEvent),
    title: payload.message ?? "Collaboration discussion",
    contextTarget: {
      ...baseContext,
      resourceType:
        eventType === "shared-approval"
          ? "approval"
          : eventType === "shared-review"
            ? "diff-review"
            : "comment",
      resourceId,
      approvalRecordId: eventType === "shared-approval" ? resourceId : null,
      filePath: null,
      pullRequestId: null,
    },
    messages,
    participants: messages.map((message) => ({
      participantId: message.authorId ?? "unknown-collaborator",
      displayName: message.authorName,
    })),
    status: messages[0]?.status ?? "open",
    source: "collaboration-event",
  };
}

function buildDiffThread(branchDiffActivityPanel, baseContext) {
  const diffs = normalizeObject(branchDiffActivityPanel.diffs);
  const totalChanges = diffs.totalChanges ?? 0;

  if (!diffs.executionRequestId && totalChanges <= 0) {
    return null;
  }

  return {
    threadId: `thread:diff:${diffs.executionRequestId ?? "current"}`,
    threadType: "review-thread",
    title: diffs.headline ?? "Review pending changes",
    contextTarget: {
      ...baseContext,
      resourceType: "diff",
      resourceId: diffs.executionRequestId ?? null,
      approvalRecordId: null,
      filePath: totalChanges > 0 ? "workspace/diff-preview" : null,
      pullRequestId: null,
    },
    messages: [
      {
        messageId: `diff-message:${diffs.executionRequestId ?? "current"}`,
        authorId: null,
        authorName: "Nexus",
        body: `${totalChanges} changes are ready for contextual review.`,
        mentions: [],
        status: totalChanges > 0 ? "open" : "idle",
      },
    ],
    participants: [],
    status: totalChanges > 0 ? "open" : "idle",
    source: "branch-diff-activity",
  };
}

function buildApprovalThreads(branchDiffActivityPanel, baseContext) {
  return normalizeArray(branchDiffActivityPanel.pendingApprovals).map((approval, index) => {
    const normalizedApproval = normalizeObject(approval);
    return {
      threadId: `thread:approval:${normalizedApproval.approvalRecordId ?? index + 1}`,
      threadType: "approval-thread",
      title: `Approval review for ${normalizedApproval.actionType ?? normalizedApproval.approvalType ?? "project change"}`,
      contextTarget: {
        ...baseContext,
        resourceType: "approval",
        resourceId: normalizedApproval.approvalRecordId ?? null,
        approvalRecordId: normalizedApproval.approvalRecordId ?? null,
        filePath: null,
        pullRequestId: null,
      },
      messages: [
        {
          messageId: `approval-message:${normalizedApproval.approvalRecordId ?? index + 1}`,
          authorId: null,
          authorName: "Nexus",
          body: `Approval is ${normalizedApproval.status ?? "pending"} and waiting for coordinated review.`,
          mentions: [],
          status: normalizedApproval.status ?? "pending",
        },
      ],
      participants: [],
      status: normalizedApproval.status ?? "pending",
      source: "approval-record",
    };
  });
}

function buildReleaseThreads(branchDiffActivityPanel, baseContext) {
  return normalizeArray(branchDiffActivityPanel.pullRequests).map((pullRequest, index) => {
    const normalizedPullRequest = normalizeObject(pullRequest);
    return {
      threadId: `thread:release:${normalizedPullRequest.id ?? index + 1}`,
      threadType: "release-thread",
      title: normalizedPullRequest.title ?? "Release review",
      contextTarget: {
        ...baseContext,
        resourceType: "release-step",
        resourceId: normalizedPullRequest.id ?? null,
        approvalRecordId: null,
        filePath: null,
        pullRequestId: normalizedPullRequest.id ?? null,
      },
      messages: [
        {
          messageId: `release-message:${normalizedPullRequest.id ?? index + 1}`,
          authorId: null,
          authorName: "Nexus",
          body: `Release review is ${normalizedPullRequest.state ?? "open"} on ${normalizedPullRequest.targetBranch ?? "main"}.`,
          mentions: [],
          status: normalizedPullRequest.state ?? "open",
        },
      ],
      participants: [],
      status: normalizedPullRequest.state ?? "open",
      source: "pull-request",
    };
  });
}

function mergeThreadRecords(baseThread, persistedThread) {
  const normalizedBaseThread = normalizeObject(baseThread);
  const normalizedPersistedThread = normalizeObject(persistedThread);
  if (!normalizedPersistedThread.threadId) {
    return normalizedBaseThread;
  }

  return {
    ...normalizedBaseThread,
    ...normalizedPersistedThread,
    contextTarget: {
      ...normalizeObject(normalizedBaseThread.contextTarget),
      ...normalizeObject(normalizedPersistedThread.contextTarget),
    },
    messages: [
      ...normalizeArray(normalizedBaseThread.messages),
      ...normalizeArray(normalizedPersistedThread.messages),
    ],
    participants: dedupeParticipants([
      ...normalizeArray(normalizedBaseThread.participants),
      ...normalizeArray(normalizedPersistedThread.participants),
    ]),
  };
}

function compareThreads(left = {}, right = {}) {
  const leftTime = Date.parse(left.updatedAt ?? left.createdAt ?? 0) || 0;
  const rightTime = Date.parse(right.updatedAt ?? right.createdAt ?? 0) || 0;
  return leftTime - rightTime;
}

export function createProjectCommentsAndReviewThreadsModule({
  collaborationEvent = null,
  branchDiffActivityPanel = null,
  persistedThreads = [],
} = {}) {
  const normalizedCollaborationEvent = normalizeObject(collaborationEvent);
  const normalizedBranchDiffActivityPanel = normalizeObject(branchDiffActivityPanel);
  const baseContext = buildBaseContext(normalizedCollaborationEvent, normalizedBranchDiffActivityPanel);
  const contextualThreads = [
    buildEventThread(normalizedCollaborationEvent, baseContext),
    buildDiffThread(normalizedBranchDiffActivityPanel, baseContext),
    ...buildApprovalThreads(normalizedBranchDiffActivityPanel, baseContext),
    ...buildReleaseThreads(normalizedBranchDiffActivityPanel, baseContext),
  ].filter(Boolean);
  const threadsById = new Map(contextualThreads.map((thread) => [thread.threadId, thread]));

  for (const persistedThread of normalizeArray(persistedThreads)) {
    const normalizedPersistedThread = normalizeObject(persistedThread);
    if (!normalizedPersistedThread.threadId) {
      continue;
    }

    const mergedThread = mergeThreadRecords(
      threadsById.get(normalizedPersistedThread.threadId),
      normalizedPersistedThread,
    );
    threadsById.set(normalizedPersistedThread.threadId, mergedThread);
  }

  const threads = [...threadsById.values()].sort(compareThreads);
  const openThreads = threads.filter((thread) => !["resolved", "closed", "merged"].includes(thread.status)).length;

  return {
    reviewThreadState: {
      threadStateId: `review-thread-state:${normalizedCollaborationEvent.target?.projectId ?? "project"}`,
      threads,
      summary: {
        totalThreads: threads.length,
        openThreads,
        linkedToDiff: threads.some((thread) => thread.contextTarget?.resourceType === "diff"),
        linkedToApproval: threads.some((thread) => thread.contextTarget?.resourceType === "approval"),
        linkedToReleaseStep: threads.some((thread) => thread.contextTarget?.resourceType === "release-step"),
        hasContextualDiscussion: threads.some((thread) => thread.messages.length > 0),
      },
    },
  };
}
