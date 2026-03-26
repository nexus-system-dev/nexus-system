import test from "node:test";
import assert from "node:assert/strict";

import {
  createCanonicalProject,
  createCanonicalState,
  createDependency,
  createEvidence,
  createFlow,
  createGap,
  createRecommendedAction,
  createRisk,
  createSignal,
} from "../src/core/canonical-schema.js";

test("canonical schema builders create stable normalized shapes", () => {
  const evidence = createEvidence({
    value: true,
    source: "casino-api",
    confidence: 1.4,
    status: "verified",
    derivedFrom: "features.hasAuth",
  });
  const gap = createGap({
    text: "Missing wallet",
    source: "casino-api",
    confidence: 0.9,
    derivedFrom: "roadmap",
  });
  const flow = createFlow({
    name: "registration",
    status: "partial",
    blockedBy: ["frontend"],
    source: "casino-api",
    confidence: 0.9,
    derivedFrom: "flows.registration",
    reliabilityStatus: "verified",
  });
  const dependency = createDependency({
    title: "Database Schema",
    source: "casino-api",
    confidence: 0.9,
    derivedFrom: "criticalDependencies",
  });
  const risk = createRisk({
    title: "No migrations",
    source: "project-scan",
    confidence: 0.75,
    status: "verified",
    derivedFrom: "scan.gaps",
  });
  const signal = createSignal({
    title: "Database Schema",
    source: "casino-api",
    confidence: 0.9,
    status: "verified",
    derivedFrom: "roadmapContext.criticalDependencies",
  });
  const action = createRecommendedAction({
    title: "לטפל ב-Database Schema",
    source: "casino-api",
    confidence: 0.9,
    status: "verified",
    derivedFrom: "roadmapContext.criticalDependencies",
  });
  const state = createCanonicalState({
    goal: "Goal",
    stack: {
      frontend: evidence,
      backend: evidence,
      database: evidence,
    },
    capabilities: {
      auth: evidence,
    },
    gaps: [gap],
    flows: [flow],
    dependencies: [dependency],
    risks: [risk],
  });
  const project = createCanonicalProject({
    projectId: "project-1",
    domain: "casino",
    state,
    bottleneck: signal,
    recommendedActions: [action],
    sources: {
      scan: true,
      external: true,
      manual: false,
    },
  });

  assert.equal(evidence.confidence, 1);
  assert.equal(evidence.metadata.status, "verified");
  assert.equal(gap.text, "Missing wallet");
  assert.equal(gap.metadata.derivedFrom, "roadmap");
  assert.equal(flow.blockedBy[0], "frontend");
  assert.equal(flow.metadata.status, "verified");
  assert.equal(dependency.title, "Database Schema");
  assert.equal(risk.title, "No migrations");
  assert.equal(risk.metadata.status, "verified");
  assert.equal(signal.metadata.status, "verified");
  assert.equal(action.metadata.confidence, 0.9);
  assert.equal(project.state.dependencies.length, 1);
  assert.equal(project.domain, "casino");
  assert.equal(project.bottleneck.title, "Database Schema");
  assert.equal(project.recommendedActions.length, 1);
});
