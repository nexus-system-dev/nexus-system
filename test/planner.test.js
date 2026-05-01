import test from "node:test";
import assert from "node:assert/strict";

import { StrategicPlanner } from "../src/core/planner.js";

test("planner ignores low-confidence casino gaps when building casino-specific roadmap", () => {
  const planner = new StrategicPlanner();

  const roadmap = planner.generateInitialRoadmap({
    businessGoal: "להשלים את מערכת הקזינו",
    stack: {},
    knowledge: {},
    analytics: {},
    product: {},
    context: {
      domain: "casino",
      gaps: [
        {
          id: "weak-wallet",
          text: "Wallet and treasury implementation",
          metadata: {
            source: "unknown",
            confidence: 0.2,
            status: "unknown",
            derivedFrom: "manual",
          },
        },
      ],
      flows: [],
    },
  });

  assert.equal(roadmap.some((task) => task.id === "casino-wallet"), false);
});

test("planner uses reliable casino gaps to build domain-specific roadmap", () => {
  const planner = new StrategicPlanner();

  const roadmap = planner.generateInitialRoadmap({
    businessGoal: "להשלים את מערכת הקזינו",
    stack: {},
    knowledge: {},
    analytics: {},
    product: {},
    context: {
      domain: "casino",
      gaps: [
        {
          id: "db",
          text: "Database migrations implementation",
          metadata: {
            source: "casino-api",
            confidence: 0.9,
            status: "verified",
            derivedFrom: "roadmapContext.knownMissingParts",
          },
        },
      ],
      flows: [],
    },
  });

  assert.equal(roadmap[0].id, "casino-db-migrations");
  assert.equal(roadmap[0].taskType, "backend");
});

test("planner builds saas roadmap for saas domain", () => {
  const planner = new StrategicPlanner();

  const roadmap = planner.generateInitialRoadmap({
    businessGoal: "להשיק מוצר SaaS בתשלום",
    stack: {},
    analytics: {
      hasBaselineCampaign: false,
    },
    product: {
      hasAuth: false,
      hasPaymentIntegration: false,
    },
    context: {
      domain: "saas",
      gaps: [
        {
          id: "billing",
          text: "Subscription billing",
          metadata: {
            source: "manual",
            confidence: 0.9,
            status: "verified",
            derivedFrom: "manual",
          },
        },
        {
          id: "onboarding",
          text: "User onboarding flow",
          metadata: {
            source: "manual",
            confidence: 0.9,
            status: "verified",
            derivedFrom: "manual",
          },
        },
      ],
      flows: [],
    },
  });

  assert.equal(roadmap.some((task) => task.id === "saas-auth"), true);
  assert.equal(roadmap.some((task) => task.id === "saas-billing"), true);
  assert.equal(roadmap.some((task) => task.id === "saas-onboarding"), true);
  assert.equal(roadmap.some((task) => task.id === "saas-acquisition"), true);
  assert.equal(roadmap.every((task) => typeof task.taskType === "string" && task.taskType.length > 0), true);
});

test("planner builds mobile roadmap for mobile app domain", () => {
  const planner = new StrategicPlanner();

  const roadmap = planner.generateInitialRoadmap({
    businessGoal: "להשיק אפליקציית מובייל",
    stack: {},
    product: {},
    analytics: {},
    context: {
      domain: "mobile-app",
      gaps: [
        {
          id: "api",
          text: "API integration",
          metadata: {
            source: "manual",
            confidence: 0.9,
            status: "verified",
            derivedFrom: "manual",
          },
        },
        {
          id: "release",
          text: "Release pipeline",
          metadata: {
            source: "manual",
            confidence: 0.9,
            status: "verified",
            derivedFrom: "manual",
          },
        },
      ],
      flows: [],
    },
  });

  assert.equal(roadmap.some((task) => task.id === "mobile-api-integration"), true);
  assert.equal(roadmap.some((task) => task.id === "mobile-release"), true);
  assert.equal(roadmap.find((task) => task.id === "mobile-release")?.taskType, "release");
});

test("planner builds agency roadmap for agency system domain", () => {
  const planner = new StrategicPlanner();

  const roadmap = planner.generateInitialRoadmap({
    businessGoal: "לנהל סוכנות עם הרבה לקוחות",
    stack: {},
    product: {},
    analytics: {},
    context: {
      domain: "agency-system",
      gaps: [
        {
          id: "intake",
          text: "Client intake",
          metadata: {
            source: "manual",
            confidence: 0.9,
            status: "verified",
            derivedFrom: "manual",
          },
        },
        {
          id: "reporting",
          text: "Client reporting",
          metadata: {
            source: "manual",
            confidence: 0.9,
            status: "verified",
            derivedFrom: "manual",
          },
        },
      ],
      flows: [],
    },
  });

  assert.equal(roadmap.some((task) => task.id === "agency-intake"), true);
  assert.equal(roadmap.some((task) => task.id === "agency-reporting"), true);
  assert.equal(roadmap.every((task) => typeof task.taskType === "string" && task.taskType.length > 0), true);
});
