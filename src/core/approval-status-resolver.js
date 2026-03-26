function normalizeApprovalRecords(approvalRecords) {
  if (Array.isArray(approvalRecords)) {
    return approvalRecords.filter((record) => record && typeof record === "object");
  }

  if (approvalRecords && typeof approvalRecords === "object") {
    return [approvalRecords];
  }

  return [];
}

function isExpired(record) {
  if (typeof record?.expiresAt !== "string") {
    return false;
  }

  return record.expiresAt.startsWith("expired:");
}

function resolveMatchingRecord(approvalRequest, records) {
  return records.find((record) => {
    if (approvalRequest?.approvalRequestId && record.approvalRequestId === approvalRequest.approvalRequestId) {
      return true;
    }

    return (
      record.actionType === approvalRequest?.actionType
      && record.projectId === approvalRequest?.projectId
      && record.actorType === approvalRequest?.actorType
    );
  }) ?? null;
}

export function createApprovalStatusResolver({
  approvalRequest,
  approvalRecords,
} = {}) {
  const records = normalizeApprovalRecords(approvalRecords);
  const matchingRecord = resolveMatchingRecord(approvalRequest, records);

  if (!matchingRecord) {
    return {
      approvalStatus: {
        status: "missing",
        isApproved: false,
        isRejected: false,
        isExpired: false,
        approvalRequestId: approvalRequest?.approvalRequestId ?? null,
        approvalRecordId: null,
        reason: "Approval record is missing",
      },
    };
  }

  if (matchingRecord.status === "rejected" || matchingRecord.decision === "rejected") {
    return {
      approvalStatus: {
        status: "rejected",
        isApproved: false,
        isRejected: true,
        isExpired: false,
        approvalRequestId: matchingRecord.approvalRequestId ?? approvalRequest?.approvalRequestId ?? null,
        approvalRecordId: matchingRecord.approvalRecordId ?? null,
        reason: matchingRecord.reason ?? "Approval was rejected",
      },
    };
  }

  if (isExpired(matchingRecord)) {
    return {
      approvalStatus: {
        status: "expired",
        isApproved: false,
        isRejected: false,
        isExpired: true,
        approvalRequestId: matchingRecord.approvalRequestId ?? approvalRequest?.approvalRequestId ?? null,
        approvalRecordId: matchingRecord.approvalRecordId ?? null,
        reason: matchingRecord.reason ?? "Approval has expired",
      },
    };
  }

  if (matchingRecord.status === "approved" || matchingRecord.decision === "approved") {
    return {
      approvalStatus: {
        status: "approved",
        isApproved: true,
        isRejected: false,
        isExpired: false,
        approvalRequestId: matchingRecord.approvalRequestId ?? approvalRequest?.approvalRequestId ?? null,
        approvalRecordId: matchingRecord.approvalRecordId ?? null,
        reason: matchingRecord.reason ?? null,
      },
    };
  }

  return {
    approvalStatus: {
      status: "missing",
      isApproved: false,
      isRejected: false,
      isExpired: false,
      approvalRequestId: approvalRequest?.approvalRequestId ?? null,
      approvalRecordId: matchingRecord.approvalRecordId ?? null,
      reason: "Approval status is unresolved",
    },
  };
}
