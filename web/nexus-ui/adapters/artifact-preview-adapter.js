import { formatArtifactStatus, resolveCanonicalArtifact } from "./shared-proof-artifact.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function escapeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function resolveArtifactExpectation(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.proofArtifact?.artifactExpectation,
  );
}

export function buildArtifactPreviewViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifact = resolveCanonicalArtifact(safeProject);
  const artifactExpectation = resolveArtifactExpectation(safeProject);
  const payload = normalizeObject(artifact.previewPayload);

  return {
    title: artifact.title,
    subtitle: qaMode
      ? "זה מסלול QA זמני, אבל הוא משתמש באותו תוצר קנוני שנשמר במסך הראשי."
      : escapeText(
          artifactExpectation.continuityLine || payload.subtitle,
          "זה התוצר שנשמר מהלולאה ונפתח כאן כמשטח עצמאי.",
        ),
    projectName: escapeText(safeProject.name, "תצוגת התוצר"),
    badge: qaMode ? "תצוגת QA" : "תצוגת התוצר",
    status: formatArtifactStatus(artifact.status),
    proofId: escapeText(artifact.provenance?.proofId, artifact.artifactId),
    artifact,
    downloadAction: {
      label: artifact.actions?.download?.label ?? "הורד את התוצר",
      target: "artifact-download",
      supported: artifact.actions?.download?.supported === true,
    },
    backAction: { label: "חזרה לתצוגה", target: "proof" },
    continueAction: { label: "המשך לאישור", target: "confirmation" },
  };
}
