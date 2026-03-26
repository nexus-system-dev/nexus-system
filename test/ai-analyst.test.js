import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { AiProjectAnalyst } from "../src/core/ai-analyst.js";

function createCachePath() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-ai-"));
  return path.join(directory, "analysis-cache.json");
}

test("ai analyst returns unavailable analysis when api key is missing", async () => {
  const analyst = new AiProjectAnalyst({
    apiKey: "",
    cachePath: createCachePath(),
    fetchImpl: async () => {
      throw new Error("should not be called");
    },
  });

  const result = await analyst.analyzeProjectContext({
    project: {
      name: "Test",
      goal: "Goal",
      stack: "",
      scan: null,
      overview: { bottleneck: "" },
      cycle: { roadmap: [] },
      approvals: [],
    },
    events: [],
  });

  assert.equal(result.status, "unavailable");
  assert.equal(result.summary.includes("OPENAI_API_KEY"), true);
  assert.equal(result.pipeline.status, "unavailable");
  assert.equal(result.pipeline.stages[0].name, "scan");
  assert.equal(result.pipeline.stages[3].name, "analysis");
  assert.equal(result.pipeline.stages[3].status, "skipped");
});

test("ai analyst parses structured response output", async () => {
  const analyst = new AiProjectAnalyst({
    apiKey: "test-key",
    cachePath: createCachePath(),
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        output_text: JSON.stringify({
          status: "ready",
          summary: "יש להבין קודם את שכבת ההתחברות.",
          architecture: ["שרת Node", "מסלולי API"],
          risks: ["אין migrations"],
          nextActions: ["להגדיר בסיס נתונים", "להוסיף auth"],
          notes: ["ה-AI רק מנתח"],
        }),
      }),
    }),
  });

  const result = await analyst.analyzeProjectContext({
    project: {
      name: "Test",
      goal: "Goal",
      stack: "",
      scan: {
        summary: "scan summary",
        frameworks: {
          frontend: ["React"],
          backend: ["Express"],
          database: ["PostgreSQL"],
        },
        findings: {
          hasAuth: false,
        },
        architecture: {
          patterns: ["MVC-style routing"],
        },
        database: {
          hasSchema: false,
        },
        messaging: [],
        queues: [],
        gaps: ["אין auth"],
      },
      context: {
        domain: "saas",
        bottleneck: {
          title: "auth",
        },
        gaps: [],
        flows: [],
        dependencies: [],
        risks: [],
        recommendedActions: [],
        reliability: {
          decisionConfidenceThreshold: 0.65,
        },
      },
      overview: { bottleneck: "auth" },
      cycle: { roadmap: [] },
      approvals: [],
    },
    events: [],
  });

  assert.equal(result.status, "ready");
  assert.equal(result.nextActions[0], "להגדיר בסיס נתונים");
  assert.equal(result.pipeline.status, "ready");
  assert.equal(result.pipeline.stages[0].name, "scan");
  assert.equal(result.pipeline.stages[1].name, "context");
  assert.equal(result.pipeline.stages[2].name, "prompt");
  assert.equal(result.pipeline.stages[3].name, "analysis");
  assert.equal(result.pipeline.debug.model, "gpt-5");
  assert.equal(typeof result.pipeline.stages[2].metrics.payloadBytes, "number");
});

test("ai analyst retries and falls back to another model", async () => {
  const calls = [];
  const analyst = new AiProjectAnalyst({
    apiKey: "test-key",
    model: "gpt-5",
    fallbackModels: ["gpt-4.1-mini"],
    maxRetries: 1,
    cachePath: createCachePath(),
    fetchImpl: async (_url, options) => {
      const payload = JSON.parse(options.body);
      calls.push(payload.model);

      if (payload.model === "gpt-5") {
        return {
          ok: false,
          status: 500,
          json: async () => ({}),
        };
      }

      return {
        ok: true,
        json: async () => ({
          output_text: JSON.stringify({
            status: "ready",
            summary: "נפל למודל fallback.",
            architecture: [],
            risks: [],
            nextActions: ["להמשיך"],
            notes: [],
          }),
        }),
      };
    },
  });

  const result = await analyst.analyzeProjectContext({
    project: {
      id: "project-1",
      name: "Test",
      goal: "Goal",
      stack: "",
      scan: null,
      context: null,
      overview: { bottleneck: "" },
      cycle: { roadmap: [] },
      approvals: [],
    },
    events: [],
  });

  assert.deepEqual(calls, ["gpt-5", "gpt-5", "gpt-4.1-mini"]);
  assert.equal(result.pipeline.debug.model, "gpt-4.1-mini");
  assert.equal(result.pipeline.debug.attempts.length, 3);
});

test("ai analyst returns cached analysis for identical context", async () => {
  let callCount = 0;
  const cachePath = createCachePath();
  const analyst = new AiProjectAnalyst({
    apiKey: "test-key",
    cachePath,
    fetchImpl: async () => {
      callCount += 1;
      return {
        ok: true,
        json: async () => ({
          output_text: JSON.stringify({
            status: "ready",
            summary: "תוצאה שמורה.",
            architecture: [],
            risks: [],
            nextActions: ["להמשיך"],
            notes: [],
          }),
        }),
      };
    },
  });

  const payload = {
    project: {
      id: "project-1",
      name: "Test",
      goal: "Goal",
      stack: "",
      scan: null,
      context: null,
      overview: { bottleneck: "" },
      cycle: { roadmap: [] },
      approvals: [],
    },
    events: [],
  };

  const first = await analyst.analyzeProjectContext(payload);
  const second = await analyst.analyzeProjectContext(payload);

  assert.equal(first.pipeline.status, "ready");
  assert.equal(second.pipeline.status, "cached");
  assert.equal(second.pipeline.debug.cacheHit, true);
  assert.equal(callCount, 1);
});
