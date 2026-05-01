function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerTaskList, ownerDailyWorkflow) {
  const missingInputs = [];
  if (!ownerTaskList || normalizeString(ownerTaskList.status) !== "ready") missingInputs.push("ownerTaskList");
  if (!ownerDailyWorkflow || normalizeString(ownerDailyWorkflow.status) !== "ready") missingInputs.push("ownerDailyWorkflow");
  return missingInputs;
}

export function createOwnerRoutineAssistant({
  ownerTaskList = null,
  ownerDailyWorkflow = null,
} = {}) {
  const taskList = normalizeObject(ownerTaskList);
  const workflow = normalizeObject(ownerDailyWorkflow);
  const missingInputs = buildMissingInputs(taskList, workflow);

  if (missingInputs.length > 0) {
    return { ownerRoutinePlan: { ownerRoutinePlanId: `owner-routine:${slugify(taskList?.ownerTaskListId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    ownerRoutinePlan: {
      ownerRoutinePlanId: `owner-routine:${slugify(taskList.ownerTaskListId)}`,
      status: "ready",
      missingInputs: [],
      checklist: [...(workflow.workflowBlocks ?? []), "review-owner-task-list", "end-of-day-closure"],
    },
  };
}
