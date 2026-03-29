import { defineProjectDraftSchema } from "./project-draft-schema.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function createProjectDraftCreationService({
  userIdentity = null,
  projectCreationInput = null,
  existingProjectDraft = null,
} = {}) {
  const normalizedInput = normalizeObject(projectCreationInput);
  const { projectDraft } = defineProjectDraftSchema({
    userIdentity,
    initialInput: {
      ...normalizedInput,
      creationSource: normalizedInput.creationSource ?? "project-creation",
    },
    existingProjectDraft,
  });

  return {
    projectDraft,
    projectDraftId: projectDraft.id,
  };
}
