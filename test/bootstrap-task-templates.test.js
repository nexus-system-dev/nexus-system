import test from "node:test";
import assert from "node:assert/strict";

import {
  createBaseBootstrapTemplates,
  createDomainBootstrapTemplates,
  createPlatformBootstrapTemplates,
  createBootstrapTemplateMerger,
  createBootstrapTaskTemplates,
  createTemplateParameterResolver,
  defineBootstrapTemplateSchema,
} from "../src/core/bootstrap-task-templates.js";

test("bootstrap template schema returns canonical base shape", () => {
  const schema = defineBootstrapTemplateSchema({
    domain: "saas",
    targetPlatform: "web",
  });

  assert.equal(schema.domain, "saas");
  assert.equal(schema.targetPlatform, "web");
  assert.deepEqual(schema.dependencies, []);
  assert.equal(schema.params.includes("projectName"), true);
  assert.equal(schema.artifacts.includes("project-root"), true);
});

test("base bootstrap templates return generic project foundation", () => {
  const schema = defineBootstrapTemplateSchema({
    domain: "generic",
    targetPlatform: null,
  });
  const baseTemplates = createBaseBootstrapTemplates(schema);

  assert.equal(baseTemplates.params.includes("projectName"), true);
  assert.equal(baseTemplates.params.includes("stack"), true);
  assert.equal(baseTemplates.artifacts.includes("project-root"), true);
  assert.deepEqual(baseTemplates.dependencies, []);
});

test("domain bootstrap templates return supported domain rules and artifacts", () => {
  const domainTemplates = createDomainBootstrapTemplates("saas");

  assert.equal(domainTemplates.domain, "saas");
  assert.equal(domainTemplates.rules.includes("initialize-app-shell"), true);
  assert.equal(domainTemplates.artifacts.includes("billing-module"), true);
});

test("platform bootstrap templates return target-specific params and artifacts", () => {
  const platformTemplates = createPlatformBootstrapTemplates("web");

  assert.equal(platformTemplates.targetPlatform, "web");
  assert.equal(platformTemplates.params.includes("routing"), true);
  assert.equal(platformTemplates.artifacts.includes("web-entrypoint"), true);
  assert.deepEqual(platformTemplates.dependencies, []);
});

test("bootstrap template merger combines base domain and platform templates", () => {
  const schema = defineBootstrapTemplateSchema({
    domain: "saas",
    targetPlatform: "web",
  });
  const baseTemplates = createBaseBootstrapTemplates(schema);
  const domainTemplates = createDomainBootstrapTemplates("saas");
  const platformTemplates = createPlatformBootstrapTemplates("web");
  const mergedTemplate = createBootstrapTemplateMerger({
    baseTemplates,
    domainTemplates,
    platformTemplates,
  });

  assert.equal(mergedTemplate.domain, "saas");
  assert.equal(mergedTemplate.targetPlatform, "web");
  assert.equal(mergedTemplate.params.includes("routing"), true);
  assert.equal(mergedTemplate.artifacts.includes("billing-module"), true);
  assert.equal(mergedTemplate.artifacts.includes("web-entrypoint"), true);
  assert.equal(mergedTemplate.rules.includes("initialize-app-shell"), true);
});

test("bootstrap task templates return domain and platform specific template", () => {
  const template = createBootstrapTaskTemplates({
    domain: "saas",
    targetPlatform: "web",
  });

  assert.equal(template.domain, "saas");
  assert.equal(template.targetPlatform, "web");
  assert.equal(template.rules.includes("initialize-app-shell"), true);
  assert.equal(template.artifacts.includes("web-entrypoint"), true);
  assert.equal(template.params.includes("routing"), true);
});

test("template parameter resolver injects project and defaults values", () => {
  const template = createBootstrapTaskTemplates({
    domain: "saas",
    targetPlatform: "web",
  });
  const parameterizedTemplate = createTemplateParameterResolver({
    template,
    recommendedDefaults: {
      stack: {
        frontend: "nextjs",
        backend: "node",
      },
    },
    projectIntake: {
      projectName: "Nexus SaaS",
    },
  });

  assert.equal(parameterizedTemplate.resolvedParams.projectName, "Nexus SaaS");
  assert.equal(parameterizedTemplate.resolvedParams.domain, "saas");
  assert.equal(parameterizedTemplate.resolvedParams.routing, "app-router");
  assert.deepEqual(parameterizedTemplate.resolvedParams.stack, {
    frontend: "nextjs",
    backend: "node",
  });
});
