function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function dedupeParticipants(participants) {
  const seen = new Set();
  return normalizeArray(participants).filter((participant) => {
    const normalizedParticipant = normalizeObject(participant);
    const participantId = normalizeString(
      normalizedParticipant.participantId,
      normalizeString(normalizedParticipant.displayName, null),
    );
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
    workspaceArea: normalizeString(eventTarget.workspaceArea, "developer-workspace"),
    diffHeadline: normalizeString(diffs.headline, "No pending diff"),
    executionRequestId: normalizeString(diffs.executionRequestId, null),
  };
}

function resolveThreadType(collaborationEvent) {
  const eventType = normalizeString(collaborationEvent.eventType, "comment").toLowerCase();

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
  const eventId = normalizeString(collaborationEvent.eventId, "collaboration-event");
  const normalizedStatusOverride = normalizeString(statusOverride, null);
  const normalizedStatus = normalizeString(payload.reviewStatus, normalizeString(payload.approvalStatus, "open"));

  return [
    {
      messageId: `${eventId}:message-1`,
      authorId: normalizeString(actor.actorId, null),
      authorName: normalizeString(actor.displayName, "Unknown collaborator"),
      body: normalizeString(payload.message, "Collaboration update"),
      mentions: normalizeArray(payload.mentions).map((mention) => normalizeString(mention, null)).filter(Boolean),
      status: normalizeString(normalizedStatusOverride, normalizedStatus),
    },
  ];
}

function buildEventThread(collaborationEvent, baseContext) {
  const eventId = normalizeString(collaborationEvent.eventId, null);
  if (!eventId) {
    return null;
  }

  const eventType = normalizeString(collaborationEvent.eventType, "comment").toLowerCase();
  const isDiscussionEvent = ["comment", "mention", "shared-review", "shared-approval"].includes(eventType);

  if (!isDiscussionEvent) {
    return null;
  }

  const payload = normalizeObject(collaborationEvent.payload);
  const resourceId = normalizeString(collaborationEvent.target?.resourceId, baseContext.executionRequestId);
  const messages = buildMessages(collaborationEvent);

  return {
    threadId: `thread:${eventId}`,
    threadType: resolveThreadType(collaborationEvent),
    title: normalizeString(payload.message, "Collaboration discussion"),
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
  const executionRequestId = normalizeString(diffs.executionRequestId, null);

  if (!executionRequestId && totalChanges <= 0) {
    return null;
  }

  return {
    threadId: `thread:diff:${executionRequestId ?? "current"}`,
    threadType: "review-thread",
    title: normalizeString(diffs.headline, "Review pending changes"),
    contextTarget: {
      ...baseContext,
      resourceType: "diff",
      resourceId: executionRequestId,
      approvalRecordId: null,
      filePath: totalChanges > 0 ? "workspace/diff-preview" : null,
      pullRequestId: null,
    },
    messages: [
      {
        messageId: `diff-message:${executionRequestId ?? "current"}`,
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
    const approvalRecordId = normalizeString(normalizedApproval.approvalRecordId, null);
    const status = normalizeString(normalizedApproval.status, "pending");
    return {
      threadId: `thread:approval:${approvalRecordId ?? index + 1}`,
      threadType: "approval-thread",
      title: `Approval review for ${normalizeString(normalizedApproval.actionType, normalizeString(normalizedApproval.approvalType, "project change"))}`,
      contextTarget: {
        ...baseContext,
        resourceType: "approval",
        resourceId: approvalRecordId,
        approvalRecordId,
        filePath: null,
        pullRequestId: null,
      },
      messages: [
        {
          messageId: `approval-message:${approvalRecordId ?? index + 1}`,
          authorId: null,
          authorName: "Nexus",
          body: `Approval is ${status} and waiting for coordinated review.`,
          mentions: [],
          status,
        },
      ],
      participants: [],
      status,
      source: "approval-record",
    };
  });
}

function buildReleaseThreads(branchDiffActivityPanel, baseContext) {
  return normalizeArray(branchDiffActivityPanel.pullRequests).map((pullRequest, index) => {
    const normalizedPullRequest = normalizeObject(pullRequest);
    const pullRequestId = normalizeString(normalizedPullRequest.id, null);
    const pullRequestState = normalizeString(normalizedPullRequest.state, "open");
    return {
      threadId: `thread:release:${pullRequestId ?? index + 1}`,
      threadType: "release-thread",
      title: normalizeString(normalizedPullRequest.title, "Release review"),
      contextTarget: {
        ...baseContext,
        resourceType: "release-step",
        resourceId: pullRequestId,
        approvalRecordId: null,
        filePath: null,
        pullRequestId,
      },
      messages: [
        {
          messageId: `release-message:${pullRequestId ?? index + 1}`,
          authorId: null,
          authorName: "Nexus",
          body: `Release review is ${pullRequestState} on ${normalizeString(normalizedPullRequest.targetBranch, "main")}.`,
          mentions: [],
          status: pullRequestState,
        },
      ],
      participants: [],
      status: pullRequestState,
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
  const openThreads = threads.filter((thread) => !["resolved", "closed", "merged"].includes(normalizeString(thread.status, "").toLowerCase())).length;
  const projectId = normalizeString(normalizedCollaborationEvent.target?.projectId, "project");

  return {
    reviewThreadState: {
      threadStateId: `review-thread-state:${projectId}`,
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
