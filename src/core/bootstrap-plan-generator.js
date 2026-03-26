import {
  createBootstrapTaskTemplates,
  createTemplateParameterResolver,
} from "./bootstrap-task-templates.js";

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function buildArtifactManifest({ domain, recommendedDefaults }) {
  return {
    structure: ["project-root", "readme", "config"],
    stack: [
      recommendedDefaults?.stack?.frontend ?? null,
      recommendedDefaults?.stack?.backend ?? null,
      recommendedDefaults?.stack?.database ?? null,
    ].filter(Boolean),
    hostingTarget: recommendedDefaults?.hosting?.target ?? null,
    domain,
  };
}

function buildBootstrapTask({ rule, index, domain, recommendedDefaults, projectIntake, artifactManifest }) {
  return {
    id: `bootstrap-${domain}-${index + 1}`,
    rule,
    summary: `Bootstrap: ${rule}`,
    order: index + 1,
    status: "planned",
    inputs: {
      domain,
      projectIntake,
      recommendedDefaults,
    },
    expectedArtifacts: artifactManifest,
  };
}

export function createBootstrapPlanGenerator({
  projectIntake = null,
  domain = "generic",
  recommendedDefaults = null,
  domainProfile = null,
} = {}) {
  const targetPlatform = recommendedDefaults?.hosting?.target === "web-deployment"
    ? "web"
    : domain === "mobile-app"
      ? "ios"
      : null;
  const bootstrapTemplate = createBootstrapTaskTemplates({
    domain,
    targetPlatform,
  });
  const parameterizedTemplate = createTemplateParameterResolver({
    template: bootstrapTemplate,
    recommendedDefaults,
    projectIntake,
  });
  const bootstrapRules = unique(domainProfile?.bootstrapRules ?? bootstrapTemplate.rules ?? []);
  const artifactManifest = buildArtifactManifest({ domain, recommendedDefaults });
  const bootstrapTasks = bootstrapRules.map((rule, index) =>
    buildBootstrapTask({
      rule,
      index,
      domain,
      recommendedDefaults,
      projectIntake,
      artifactManifest,
    }),
  );

  return {
    bootstrapPlan: {
      domain,
      targetPlatform,
      taskCount: bootstrapTasks.length,
      bootstrapRules,
      bootstrapTemplate,
      parameterizedTemplate,
      recommendedStack: recommendedDefaults?.stack ?? null,
      executionMode: recommendedDefaults?.execution?.mode ?? null,
      artifactManifest,
    },
    bootstrapTasks,
  };
}
