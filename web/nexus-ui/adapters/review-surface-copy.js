function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function resolveUserFacingApprovalState(project) {
  const normalizedProject = normalizeObject(project);
  const approvalRecords = Array.isArray(
    normalizedProject.context?.approvalRecords ?? normalizedProject.approvalRecords,
  )
    ? (normalizedProject.context?.approvalRecords ?? normalizedProject.approvalRecords)
    : [];
  const latestArtifactApproval = approvalRecords.find((record) => {
    const actionType = normalizeString(record?.actionType, "");
    const status = normalizeString(record?.status ?? record?.decision, "").toLowerCase();
    return actionType === "artifact-proof-confirmation" && status;
  });

  if (latestArtifactApproval) {
    return {
      status: normalizeString(latestArtifactApproval.status ?? latestArtifactApproval.decision, ""),
      reason: normalizeString(latestArtifactApproval.reason, ""),
      source: "artifact-proof-confirmation",
    };
  }

  const approvalStatus = normalizeObject(normalizedProject.context?.approvalStatus ?? normalizedProject.approvalStatus);
  const proposalApplyDecision = normalizeObject(normalizedProject.proposalApplyDecision);
  return {
    status: normalizeString(approvalStatus.status ?? proposalApplyDecision.status, ""),
    reason: normalizeString(approvalStatus.reason ?? proposalApplyDecision.reason, ""),
    source: approvalStatus.status ? "approval-status" : (proposalApplyDecision.status ? "proposal-apply" : ""),
  };
}

export function humanizeValidationSummary(project) {
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema);
  const raw = normalizeString(generatedSurfaceProofSchema.summary?.validationStatus, "").toLowerCase();
  if (!raw) {
    return "יש כבר הוכחה גלויה שמחזיקה את השלב הזה.";
  }
  if (raw === "passed") {
    return "ההוכחה עברה את בדיקות האיכות המרכזיות ומוכנה להמשך.";
  }
  if (raw === "invalid" || raw === "failed") {
    return "ההוכחה כבר נשמרה, אבל עדיין מסומנת לסבב שיפור נוסף לפני שחרור רחב.";
  }
  if (raw === "needs-attention") {
    return "יש תוצאה טובה שאפשר להמשיך ממנה, עם כמה נקודות שכדאי לחדד בסבב הבא.";
  }
  return `ההוכחה נשמרה עם סטטוס ${raw}, ואפשר להמשיך ממנה בזהירות.`;
}

export function humanizeApprovalSummary(project) {
  const approvalState = resolveUserFacingApprovalState(project);
  const raw = normalizeString(approvalState.status, "").toLowerCase();
  if (!raw) {
    return "עדיין אין החלטה שסותרת את המשך הלולאה.";
  }
  if (raw === "approved") {
    return "ההחלטה נשמרה כאישור, ולכן אפשר להתקדם בלי להישאר בשלב review.";
  }
  if (raw === "rejected") {
    return "ההחלטה כרגע היא לחזור לשיפור לפני שמקדמים את המסלול.";
  }
  if (raw === "pending") {
    return "החלטת האישור עדיין פתוחה, אבל כל התוצר כבר זמין לבדיקה.";
  }
  return `החלטת האישור כרגע היא ${raw}.`;
}

export function humanizeReleaseSummary(project) {
  const releaseValidation = normalizeObject(normalizeObject(project.releaseWorkspace).validation);
  const raw = normalizeString(releaseValidation.status, "").toLowerCase();
  if (!raw) {
    return "המערכת כבר יודעת מה המסלול הבא אחרי ההחלטה הנוכחית.";
  }
  if (raw === "ready" || raw === "passed") {
    return "המסלול כבר בשל לפתוח את ההמשך בלי עבודת תיווך נוספת.";
  }
  if (raw === "blocked") {
    return "יש עדיין שער אחד שחוסם את ההמשך, ולכן כדאי לטפל בו מיד אחרי ההחלטה.";
  }
  return `ההמשך כרגע מסומן כ-${raw}, אבל כבר ברור מה לפתוח אחר כך.`;
}

export function humanizeMissionStatus(status) {
  const raw = normalizeString(status, "pending").toLowerCase();
  if (raw === "assigned") {
    return "מוכן להתחלה";
  }
  if (raw === "blocked") {
    return "דורש פתיחת חסם";
  }
  if (raw === "done") {
    return "הושלם";
  }
  return "בהמתנה";
}
