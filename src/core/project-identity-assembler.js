function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function collectCompletenessFlags(projectIdentity, projectDraft, onboardingSession) {
  return {
    hasName: Boolean(projectIdentity.name || projectDraft.name),
    hasVision: Boolean(projectIdentity.vision || projectDraft.goal),
    hasAudience: Boolean(projectIdentity.audience),
    hasSuccessDefinition: Boolean(projectIdentity.successDefinition),
    hasDifferentiation: Boolean(projectIdentity.differentiation),
    hasTone: Boolean(projectIdentity.tone),
    hasOnboardingSession: Boolean(onboardingSession.sessionId),
  };
}

function calculateCompletenessScore(flags) {
  const values = Object.values(flags);
  const completed = values.filter(Boolean).length;
  return values.length === 0 ? 0 : Number((completed / values.length).toFixed(2));
}

export function createProjectIdentityAssembler({
  projectIdentity = null,
  projectDraft = null,
  onboardingSession = null,
} = {}) {
  const normalizedProjectIdentity = normalizeObject(projectIdentity);
  const normalizedProjectDraft = normalizeObject(projectDraft);
  const normalizedOnboardingSession = normalizeObject(onboardingSession);
  const completenessFlags = collectCompletenessFlags(
    normalizedProjectIdentity,
    normalizedProjectDraft,
    normalizedOnboardingSession,
  );
  const completenessScore = calculateCompletenessScore(completenessFlags);

  return {
    projectIdentityProfile: {
      profileId: `project-identity-profile:${normalizedOnboardingSession.projectDraftId ?? normalizedProjectDraft.id ?? normalizedProjectIdentity.identityId ?? "unknown"}`,
      projectId: normalizedProjectDraft.id ?? normalizedOnboardingSession.projectDraftId ?? null,
      projectName: normalizedProjectIdentity.name ?? normalizedProjectDraft.name ?? "Unnamed project",
      vision: normalizedProjectIdentity.vision ?? normalizedProjectDraft.goal ?? null,
      audience: normalizedProjectIdentity.audience ?? null,
      successDefinition: normalizedProjectIdentity.successDefinition ?? null,
      differentiation: normalizedProjectIdentity.differentiation ?? null,
      tone: normalizedProjectIdentity.tone ?? null,
      currentStep: normalizedOnboardingSession.currentStep ?? null,
      nextStep: normalizedOnboardingSession.nextStep ?? null,
      summary: {
        completionBand:
          completenessScore >= 0.85
            ? "high"
            : completenessScore >= 0.55
              ? "medium"
              : "low",
        canShowIdentityCard: Boolean(completenessFlags.hasName && completenessFlags.hasVision),
      },
    },
    identityCompleteness: {
      completenessId: `identity-completeness:${normalizedProjectDraft.id ?? normalizedOnboardingSession.projectDraftId ?? "unknown"}`,
      score: completenessScore,
      flags: completenessFlags,
      missingFields: Object.entries(completenessFlags)
        .filter(([, value]) => !value)
        .map(([key]) => key),
    },
  };
}
