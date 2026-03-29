function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function resolvePrimaryAction(postLoginDestination) {
  if (postLoginDestination === "project-creation") {
    return {
      actionId: "create-first-project",
      label: "צור פרויקט ראשון",
      intent: "primary",
    };
  }

  if (postLoginDestination === "onboarding-resume") {
    return {
      actionId: "resume-onboarding",
      label: "המשך onboarding",
      intent: "progress",
    };
  }

  return {
    actionId: "open-workbench",
    label: "פתח workbench",
    intent: "primary",
  };
}

function buildValidation(workspaceModel, postLoginDestination) {
  const hasWorkspace = typeof workspaceModel.workspaceId === "string" && workspaceModel.workspaceId.length > 0;
  const requiresProjectCreation = postLoginDestination === "project-creation";

  return {
    status: requiresProjectCreation || hasWorkspace ? "ready" : "blocked",
    canCreateDraft: requiresProjectCreation || hasWorkspace,
    blockingIssues: requiresProjectCreation || hasWorkspace ? [] : ["workspace-missing"],
  };
}

function buildEmptyWorkspaceState(workspaceModel, postLoginDestination) {
  const isEmpty = postLoginDestination === "project-creation" || workspaceModel.status === "draft";

  return {
    isEmpty,
    headline: isEmpty ? "עדיין אין פרויקט פעיל" : "ה־workspace מוכן לפרויקט הבא",
    body: isEmpty
      ? "צור פרויקט ראשון כדי להתחיל onboarding ולקבל משימה ראשונה."
      : "אפשר להמשיך ל־onboarding או להיכנס ל־workbench בהתאם למצב הפרויקט.",
  };
}

function buildDraftCreationState(postLoginDestination) {
  return {
    status: postLoginDestination === "project-creation" ? "ready" : "idle",
    nextAction: postLoginDestination === "project-creation" ? "create-project-draft" : "review-workspace",
    createsDraftBeforeOnboarding: true,
  };
}

export function createProjectCreationExperienceModel({
  workspaceModel = null,
  postLoginDestination = null,
} = {}) {
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const destination = typeof postLoginDestination === "string" ? postLoginDestination : "workbench";
  const validation = buildValidation(normalizedWorkspaceModel, destination);
  const emptyWorkspaceState = buildEmptyWorkspaceState(normalizedWorkspaceModel, destination);

  return {
    projectCreationExperience: {
      experienceId: `project-creation-experience:${normalizedWorkspaceModel.workspaceId ?? "anonymous"}`,
      postLoginDestination: destination,
      primaryAction: resolvePrimaryAction(destination),
      draftCreation: buildDraftCreationState(destination),
      validation,
      emptyWorkspaceState,
      redirect: {
        target: destination === "project-creation" ? "onboarding" : destination,
        shouldAutoRedirect: destination === "onboarding-resume" || destination === "workbench",
      },
      summary: {
        showsCreationCta: destination === "project-creation",
        canCreateFirstProject: validation.canCreateDraft,
        hasEmptyWorkspaceState: emptyWorkspaceState.isEmpty,
      },
    },
  };
}
