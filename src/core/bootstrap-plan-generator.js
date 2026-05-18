import {
  createBootstrapTaskTemplates,
  createTemplateParameterResolver,
} from "./bootstrap-task-templates.js";
import { createAutomaticProductSkeletonContract } from "./automatic-product-skeleton-contract.js";
import { createClassSpecificSkeletonQualityBaseline } from "./class-specific-skeleton-quality-baseline.js";
import { resolveProjectStageAndRuntimeDirection } from "./project-stage-runtime-direction-resolver.js";

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function buildArtifactManifest({ domain, recommendedDefaults, skeletonContract = null }) {
  return {
    structure: unique([
      "project-root",
      "readme",
      "config",
      ...(skeletonContract?.initialStructure ?? []),
    ]),
    stack: [
      recommendedDefaults?.stack?.frontend ?? null,
      recommendedDefaults?.stack?.backend ?? null,
      recommendedDefaults?.stack?.database ?? null,
    ].filter(Boolean),
    hostingTarget: recommendedDefaults?.hosting?.target ?? null,
    visibleMilestones: unique(skeletonContract?.visibleMilestones ?? []),
    initialFiles: unique(skeletonContract?.initialFiles ?? []),
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
  productClass = null,
  recommendedDefaults = null,
  domainProfile = null,
  projectState = {},
} = {}) {
  const { projectStage, runtimeDirection } = resolveProjectStageAndRuntimeDirection({
    productClass,
    domainProfile,
    projectIntake,
    projectState: {
      ...(projectState ?? {}),
      recommendedDefaults,
    },
    recommendedDefaults,
  });
  const targetPlatform = runtimeDirection.targetPlatform === "generic" ? null : runtimeDirection.targetPlatform;
  const skeletonContract = createAutomaticProductSkeletonContract({
    productClass: runtimeDirection.productClass,
    runtimeDirection,
    domainProfile,
  });
  const skeletonQualityBaseline = createClassSpecificSkeletonQualityBaseline({
    productClass: runtimeDirection.productClass,
    skeletonContract,
  });
  const bootstrapTemplate = createBootstrapTaskTemplates({
    domain,
    productClass: runtimeDirection.productClass,
    targetPlatform,
  });
  const parameterizedTemplate = createTemplateParameterResolver({
    template: bootstrapTemplate,
    recommendedDefaults,
    projectIntake,
  });
  const bootstrapRules = unique(domainProfile?.bootstrapRules ?? bootstrapTemplate.rules ?? []);
  const artifactManifest = buildArtifactManifest({ domain, recommendedDefaults, skeletonContract });
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
      productClass: runtimeDirection.productClass,
      projectStage,
      runtimeDirection,
      skeletonContract,
      skeletonQualityBaseline,
      artifactManifest,
    },
    bootstrapTasks,
  };
}
