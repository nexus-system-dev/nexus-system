function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function resolveTarget(projectDraft, projectCreationExperience) {
  if (projectDraft.onboardingReadiness?.canStartOnboarding === true) {
    if (projectCreationExperience.redirect?.shouldAutoRedirect === true) {
      return {
        target: "resume-flow",
        reason: "auto-resume-enabled",
      };
    }

    return {
      target: "onboarding",
      reason: "draft-ready-for-onboarding",
    };
  }

  return {
    target: "later",
    reason: "draft-needs-more-input",
  };
}

export function createPostProjectCreationRedirectResolver({
  projectDraft = null,
  projectCreationExperience = null,
} = {}) {
  const normalizedProjectDraft = normalizeObject(projectDraft);
  const normalizedProjectCreationExperience = normalizeObject(projectCreationExperience);
  const resolvedTarget = resolveTarget(
    normalizedProjectDraft,
    normalizedProjectCreationExperience,
  );

  return {
    projectCreationRedirect: {
      redirectId: `project-creation-redirect:${normalizedProjectDraft.id ?? "unknown"}`,
      target: resolvedTarget.target,
      reason: resolvedTarget.reason,
      shouldCreateOnboardingSession: resolvedTarget.target === "onboarding" || resolvedTarget.target === "resume-flow",
      summary: {
        continuesImmediately: resolvedTarget.target === "onboarding",
        resumesExistingFlow: resolvedTarget.target === "resume-flow",
        canReturnLater: resolvedTarget.target === "later",
      },
    },
  };
}
