function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function classifyFunction(task) {
  const capabilities = task.requiredCapabilities ?? [];
  const lane = task.lane ?? "unknown";

  if (capabilities.some((capability) => ["marketing", "analytics", "copywriting", "growth"].includes(capability))) {
    return "growth";
  }

  if (capabilities.some((capability) => ["operations", "ops", "reporting"].includes(capability))) {
    return "ops";
  }

  if (capabilities.some((capability) => ["product"].includes(capability))) {
    return "product";
  }

  if (["marketing", "growth"].includes(lane)) {
    return "growth";
  }

  if (["maintenance", "ops"].includes(lane)) {
    return "ops";
  }

  return "technical";
}

function collectFunctions(tasks = []) {
  return unique(tasks.map((task) => classifyFunction(task)));
}

export function buildCrossFunctionalTaskGraph({
  roadmap = [],
  businessContext = null,
  businessBottleneck = null,
} = {}) {
  const tasks = Array.isArray(roadmap) ? roadmap : [];
  const nodes = tasks.map((task) => ({
    id: task.id,
    summary: task.summary,
    function: classifyFunction(task),
    lane: task.lane,
    status: task.status ?? null,
    requiredCapabilities: task.requiredCapabilities ?? [],
    dependencies: task.dependencies ?? [],
  }));

  const edges = tasks.flatMap((task) =>
    (task.dependencies ?? []).map((dependency) => ({
      from: dependency,
      to: task.id,
      type: "dependency",
    })),
  );

  const functions = collectFunctions(tasks);

  return {
    nodes,
    edges,
    summary: {
      functions,
      hasTechnical: functions.includes("technical"),
      hasProduct: functions.includes("product"),
      hasGrowth: functions.includes("growth"),
      hasOps: functions.includes("ops"),
      businessBottleneck: businessBottleneck?.title ?? null,
      gtmStage: businessContext?.gtmStage ?? null,
    },
  };
}
