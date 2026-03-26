function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function collectArtifactNames(executionResult) {
  const artifacts = normalizeArray(executionResult.artifacts);
  return artifacts.map((artifact) => {
    if (typeof artifact === "string") {
      return artifact;
    }

    if (artifact && typeof artifact === "object") {
      return artifact.name ?? artifact.path ?? artifact.id ?? null;
    }

    return null;
  }).filter(Boolean);
}

function inferStateAdvances(bootstrapStateUpdate, releaseStateUpdate) {
  const advances = [];

  if (bootstrapStateUpdate.bootstrap?.status) {
    advances.push(`bootstrap:${bootstrapStateUpdate.bootstrap.status}`);
  }

  if (releaseStateUpdate.release?.status) {
    advances.push(`release:${releaseStateUpdate.release.status}`);
  }

  if (normalizeArray(releaseStateUpdate.transitionEvents).length > 0) {
    advances.push("release-transitions-recorded");
  }

  return advances;
}

function humanizeStateAdvances(stateAdvances) {
  return stateAdvances.map((advance) => {
    if (advance === "release-transitions-recorded") {
      return "נרשמו צעדי שחרור חדשים לפרויקט.";
    }

    if (advance === "bootstrap:blocked") {
      return "הבסיס הראשוני נוצר, אבל יש עוד שלב שדורש טיפול.";
    }

    if (advance === "release:blocked") {
      return "השחרור עוד לא מוכן, ולכן צריך לפתור את מה שחוסם אותו.";
    }

    if (advance === "bootstrap:completed") {
      return "שלב ההקמה הראשוני הושלם.";
    }

    if (advance === "release:published") {
      return "הגרסה שוחררה בהצלחה.";
    }

    return advance;
  });
}

export function createExecutionChangeExplanationBuilder({
  executionResult = null,
  bootstrapStateUpdate = null,
  releaseStateUpdate = null,
} = {}) {
  const normalizedExecutionResult = normalizeObject(executionResult);
  const normalizedBootstrapStateUpdate = normalizeObject(bootstrapStateUpdate);
  const normalizedReleaseStateUpdate = normalizeObject(releaseStateUpdate);
  const updatedArtifacts = collectArtifactNames(normalizedExecutionResult);
  const stateAdvances = inferStateAdvances(
    normalizedBootstrapStateUpdate,
    normalizedReleaseStateUpdate,
  );

  return {
    changeExplanation: {
      explanationId: `change-explanation:${normalizedExecutionResult.requestId ?? normalizedExecutionResult.taskId ?? "unknown"}`,
      executionStatus: normalizedExecutionResult.status ?? "unknown",
      changedWhat: normalizedExecutionResult.status === "completed"
        ? "בוצעו שינויים חדשים והפרויקט התקדם צעד נוסף."
        : "המערכת התחילה לקדם את הפרויקט, אבל נשאר שלב שצריך לסגור.",
      updatedArtifacts,
      stateAdvances: humanizeStateAdvances(stateAdvances),
      summary: {
        artifactCount: updatedArtifacts.length,
        stateAdvanceCount: stateAdvances.length,
        hasReleaseImpact: Boolean(normalizedReleaseStateUpdate.release),
      },
    },
  };
}
