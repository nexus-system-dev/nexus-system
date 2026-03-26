function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function inferProjectIdentity(projectIdentityProfile, firstValueOutput) {
  if (projectIdentityProfile.projectId || projectIdentityProfile.projectName || projectIdentityProfile.vision) {
    return projectIdentityProfile;
  }

  return {
    projectId: firstValueOutput.outputId?.split(":")[1] ?? "unknown",
    projectName: "this project",
    vision: null,
  };
}

function buildReasonsToContinue(firstValueOutput, realityProgress, explanationPayload) {
  const reasons = [];

  if (firstValueOutput.summary?.feelsReal) {
    reasons.push("you already have a visible first result");
  }

  if (realityProgress.summary?.hasVisibleResult) {
    reasons.push("progress already maps to a real-world result");
  }

  if (explanationPayload.nextAction?.summary) {
    reasons.push("the next action is already clear");
  }

  if (explanationPayload.change?.summary) {
    reasons.push("the system can explain what changed");
  }

  return reasons;
}

function buildValueMessage(projectIdentity, firstValueOutput, realityProgress) {
  const projectName = projectIdentity.projectName ?? "This project";
  const headline = firstValueOutput.preview?.headline ?? "Your first result is ready";
  const detail = firstValueOutput.preview?.detail ?? null;
  const firstMilestone = normalizeArray(realityProgress.userFacingMilestones)[0] ?? null;
  const compactHeadline = headline.endsWith(".") ? headline.slice(0, -1) : headline;

  if (detail && firstMilestone) {
    return `${projectName}: ${compactHeadline}. ${detail} ${firstMilestone}.`;
  }

  if (detail) {
    return `${projectName}: ${compactHeadline}. ${detail}`;
  }

  if (firstMilestone) {
    return `${projectName}: ${compactHeadline}. ${firstMilestone}.`;
  }

  return `${projectName} already has a concrete first result you can build on now.`;
}

export function createFirstValueSummaryAssembler({
  projectIdentityProfile = null,
  firstValueOutput = null,
  realityProgress = null,
  explanationPayload = null,
} = {}) {
  const normalizedProjectIdentityProfile = normalizeObject(projectIdentityProfile);
  const normalizedFirstValueOutput = normalizeObject(firstValueOutput);
  const normalizedRealityProgress = normalizeObject(realityProgress);
  const normalizedExplanationPayload = normalizeObject(explanationPayload);
  const resolvedProjectIdentity = inferProjectIdentity(
    normalizedProjectIdentityProfile,
    normalizedFirstValueOutput,
  );
  const realitySignals = normalizeArray(normalizedRealityProgress.signals);
  const reasonsToContinue = buildReasonsToContinue(
    normalizedFirstValueOutput,
    normalizedRealityProgress,
    normalizedExplanationPayload,
  );

  return {
    firstValueSummary: {
      summaryId: `first-value-summary:${resolvedProjectIdentity.projectId ?? "unknown"}`,
      projectIdentity: resolvedProjectIdentity,
      firstValueOutput: normalizedFirstValueOutput,
      realityProgress: normalizedRealityProgress,
      explanationPayload: normalizedExplanationPayload,
      message: buildValueMessage(
        resolvedProjectIdentity,
        normalizedFirstValueOutput,
        normalizedRealityProgress,
      ),
      reasonsToContinue,
      summary: {
        realitySignalCount: realitySignals.length,
        hasVisibleOutcome: Boolean(normalizedFirstValueOutput.summary?.feelsReal),
        hasMomentum: realitySignals.length > 0 || reasonsToContinue.length > 0,
      },
    },
  };
}
