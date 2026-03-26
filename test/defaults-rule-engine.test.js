import test from "node:test";
import assert from "node:assert/strict";

import {
  createDefaultsConflictResolver,
  createDefaultsScoringModule,
  createDefaultsTraceBuilder,
  createRecommendedDefaultsAssembler,
  createStackRecommendationModule,
  createDefaultsRuleRegistry,
  createRecommendedDefaults,
  defineDefaultsInputSchema,
} from "../src/core/defaults-rule-engine.js";

test("defaults input schema normalizes domain intake and constraints", () => {
  const normalized = defineDefaultsInputSchema({
    domain: "saas",
    projectIntake: {
      requestedDeliverables: ["auth", "growth"],
      uploadedFiles: [{ name: "spec.md" }],
      externalLinks: [],
    },
    constraints: {
      budget: "lean",
      maturity: "growth",
    },
  });

  assert.equal(normalized.domain, "saas");
  assert.equal(normalized.constraints.budget, "lean");
  assert.equal(normalized.constraints.maturity, "growth");
  assert.equal(normalized.constraints.scope, "expanded");
  assert.equal(Array.isArray(normalized.projectIntake.requestedDeliverables), true);
});

test("defaults rule engine returns provisional defaults and trace for saas", () => {
  const result = createRecommendedDefaults({
    domain: "saas",
    projectIntake: {
      requestedDeliverables: ["auth", "payments", "growth"],
      uploadedFiles: [{ name: "spec.md" }],
      externalLinks: [],
    },
    constraints: {
      budget: "lean",
      maturity: "growth",
    },
  });

  assert.equal(result.normalizedDefaultsInput.domain, "saas");
  assert.equal(result.normalizedDefaultsInput.constraints.scope, "expanded");
  assert.equal(result.recommendedDefaults.stack.frontend, "nextjs");
  assert.equal(result.recommendedDefaults.execution.mode, "temp-branch");
  assert.equal(result.recommendedDefaults.hosting.target, "web-deployment");
  assert.equal(result.recommendedDefaults.hosting.costProfile, "low-cost");
  assert.equal(result.recommendedDefaults.provisional, true);
  assert.equal(Array.isArray(result.defaultsTrace), true);
  assert.equal(result.defaultsTrace.some((item) => item.ruleId === "domain-baseline"), true);
});

test("defaults rule registry returns domain and constraint-aware rules", () => {
  const normalized = defineDefaultsInputSchema({
    domain: "saas",
    projectIntake: {
      requestedDeliverables: ["payments", "growth"],
      uploadedFiles: [{ name: "spec.md" }],
      externalLinks: [],
    },
    constraints: {
      budget: "lean",
      maturity: "growth",
    },
  });

  const rules = createDefaultsRuleRegistry(normalized);

  assert.equal(Array.isArray(rules), true);
  assert.equal(rules.some((rule) => rule.id === "domain-baseline"), true);
  assert.equal(rules.some((rule) => rule.id === "budget-lean"), true);
  assert.equal(rules.some((rule) => rule.id === "maturity-growth"), true);
});

test("defaults scoring module computes scores for applicable rules", () => {
  const normalized = defineDefaultsInputSchema({
    domain: "saas",
    projectIntake: {
      requestedDeliverables: ["payments", "growth"],
      uploadedFiles: [{ name: "spec.md" }],
      externalLinks: [],
    },
    constraints: {
      budget: "lean",
      maturity: "growth",
    },
  });

  const applicableRules = createDefaultsRuleRegistry(normalized).filter((rule) => rule.condition(normalized));
  const scoredDefaults = createDefaultsScoringModule(applicableRules, normalized);

  assert.equal(Array.isArray(scoredDefaults), true);
  assert.equal(scoredDefaults.every((rule) => typeof rule.score === "number"), true);
  assert.equal(scoredDefaults.some((rule) => rule.id === "domain-baseline"), true);
  assert.equal(scoredDefaults.some((rule) => rule.id === "budget-lean"), true);
});

test("defaults conflict resolver applies higher-priority overrides", () => {
  const resolvedDefaults = createDefaultsConflictResolver([
    {
      id: "domain-baseline",
      score: 0.7,
      defaults: {
        execution: {
          mode: "agent",
        },
        hosting: {
          target: "private-deployment",
        },
      },
    },
    {
      id: "budget-lean",
      score: 0.9,
      defaults: {
        execution: {
          mode: "temp-branch",
        },
      },
    },
  ]);

  assert.equal(resolvedDefaults.execution.mode, "temp-branch");
  assert.equal(resolvedDefaults.hosting.target, "private-deployment");
});

test("defaults trace builder explains why defaults were selected", () => {
  const resolvedDefaults = {
    execution: {
      mode: "temp-branch",
    },
    hosting: {
      target: "web-deployment",
    },
  };
  const applicableRules = [
    {
      id: "domain-baseline",
      score: 0.7,
      reason: "Domain baseline for saas",
      defaults: {
        execution: {
          mode: "agent",
        },
        hosting: {
          target: "web-deployment",
        },
      },
    },
    {
      id: "budget-lean",
      score: 0.9,
      reason: "Lean budget should prefer low-cost defaults",
      defaults: {
        execution: {
          mode: "temp-branch",
        },
      },
    },
  ];

  const defaultsTrace = createDefaultsTraceBuilder(resolvedDefaults, applicableRules);

  assert.equal(Array.isArray(defaultsTrace), true);
  assert.equal(defaultsTrace[0].ruleId, "domain-baseline");
  assert.equal(defaultsTrace[1].ruleId, "budget-lean");
  assert.equal(defaultsTrace[1].affectsResolvedDefaults, true);
  assert.deepEqual(defaultsTrace[0].resolvedKeys, ["execution", "hosting"]);
});

test("recommended defaults assembler returns canonical recommended defaults payload", () => {
  const recommendedDefaults = createRecommendedDefaultsAssembler(
    {
      stack: {
        frontend: "nextjs",
      },
      hosting: {
        target: "web-deployment",
      },
    },
    [
      {
        ruleId: "domain-baseline",
        score: 0.7,
        reason: "Domain baseline for saas",
      },
    ],
  );

  assert.equal(recommendedDefaults.stack.frontend, "nextjs");
  assert.equal(recommendedDefaults.hosting.target, "web-deployment");
  assert.equal(recommendedDefaults.provisional, true);
  assert.equal(Array.isArray(recommendedDefaults.defaultsTrace), true);
  assert.equal(recommendedDefaults.defaultsTrace[0].ruleId, "domain-baseline");
});

test("stack recommendation module returns initial stack recommendation for project setup", () => {
  const stackRecommendation = createStackRecommendationModule({
    domain: "mobile-app",
    platformTargets: ["ios", "android"],
    constraints: {
      budget: "lean",
    },
    projectIntake: {
      requestedDeliverables: ["auth"],
      uploadedFiles: [{ name: "spec.md" }],
      externalLinks: [],
    },
  });

  assert.equal(stackRecommendation.domain, "mobile-app");
  assert.equal(stackRecommendation.frontend, "react-native");
  assert.equal(stackRecommendation.backend, "node");
  assert.equal(stackRecommendation.database, "postgres");
  assert.equal(stackRecommendation.provisional, true);
});
