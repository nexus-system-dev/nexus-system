import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function extractOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  const message = response.output?.find((item) => item.type === "message");
  const textPart = message?.content?.find((part) => part.type === "output_text");
  return textPart?.text ?? "";
}

function now() {
  return Date.now();
}

function createStage(name, startedAt, details = {}) {
  const endedAt = now();
  return {
    name,
    status: "completed",
    startedAt,
    endedAt,
    durationMs: endedAt - startedAt,
    ...details,
  };
}

function countReliable(items = []) {
  return items.filter((item) => {
    const metadata = item?.metadata ?? item;
    return metadata?.status !== "unknown" && typeof metadata?.confidence === "number" && metadata.confidence >= 0.65;
  }).length;
}

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function safeReadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function hashPayload(payload) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function toFallbackModels(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return ["gpt-4.1-mini"];
}

function buildScanStage(project) {
  const startedAt = now();
  const scan = project.scan ?? null;

  return {
    stage: createStage("scan", startedAt, {
      metrics: {
        hasScan: Boolean(scan),
        gapCount: scan?.gaps?.length ?? 0,
        routeFileCount: scan?.evidence?.routeFiles?.length ?? 0,
        schemaFileCount: scan?.evidence?.schemaFiles?.length ?? 0,
        testFileCount: scan?.evidence?.testFiles?.length ?? 0,
      },
      snapshot: scan
        ? {
            summary: scan.summary,
            frameworks: scan.frameworks ?? null,
            findings: scan.findings ?? null,
            architecture: scan.architecture ?? null,
            database: scan.database ?? null,
            messaging: scan.messaging ?? [],
            queues: scan.queues ?? [],
          }
        : null,
    }),
    scan,
  };
}

function buildContextStage(project) {
  const startedAt = now();
  const context = project.context ?? project.state?.context ?? null;

  return {
    stage: createStage("context", startedAt, {
      metrics: {
        hasContext: Boolean(context),
        domain: context?.domain ?? "unknown",
        capabilityCount: context ? Object.keys(context.capabilities ?? {}).length : 0,
        gapCount: context?.gaps?.length ?? 0,
        reliableGapCount: countReliable(context?.gaps ?? []),
        flowCount: context?.flows?.length ?? 0,
        reliableFlowCount: countReliable(context?.flows ?? []),
        dependencyCount: context?.dependencies?.length ?? 0,
        riskCount: context?.risks?.length ?? 0,
      },
      snapshot: context
        ? {
            domain: context.domain,
            bottleneck: context.bottleneck ?? null,
            recommendedActions: context.recommendedActions ?? [],
            reliability: context.reliability ?? null,
          }
        : null,
    }),
    context,
  };
}

function buildPromptPayload({ project, events, scan, context }) {
  return {
    projectId: project.id ?? null,
    projectName: project.name,
    goal: project.goal,
    domain: context?.domain ?? "unknown",
    stack: project.stack,
    scan: scan
      ? {
          summary: scan.summary,
          frameworks: scan.frameworks,
          findings: scan.findings,
          architecture: scan.architecture,
          database: scan.database,
          knowledge: scan.knowledge
            ? {
                summary: scan.knowledge.summary,
                readme: scan.knowledge.readme
                  ? {
                      path: scan.knowledge.readme.path,
                      headings: scan.knowledge.readme.headings,
                      excerpt: scan.knowledge.readme.excerpt,
                    }
                  : null,
                docs: (scan.knowledge.docs ?? []).map((doc) => ({
                  path: doc.path,
                  headings: doc.headings,
                  excerpt: doc.excerpt,
                })),
                prDiscussions: (scan.knowledge.prDiscussions ?? []).map((discussion) => ({
                  path: discussion.path,
                  title: discussion.title,
                  excerpt: discussion.excerpt,
                })),
                notionPages: (scan.knowledge.notionPages ?? []).map((page) => ({
                  path: page.path,
                  title: page.title,
                  excerpt: page.excerpt,
                })),
                integrations: scan.knowledge.integrations,
              }
            : null,
          messaging: scan.messaging,
          queues: scan.queues,
          gaps: scan.gaps,
        }
      : null,
    context: context
      ? {
          bottleneck: context.bottleneck,
          gaps: context.gaps,
          flows: context.flows,
          dependencies: context.dependencies,
          risks: context.risks,
          recommendedActions: context.recommendedActions,
        }
      : null,
    git: project.gitSnapshot
      ? {
          provider: project.gitSnapshot.provider,
          repo: project.gitSnapshot.repo,
          branches: project.gitSnapshot.branches,
          commits: project.gitSnapshot.commits,
          pullRequests: project.gitSnapshot.pullRequests,
          diffs: project.gitSnapshot.diffs,
          prDiscussions: project.gitSnapshot.prDiscussions ?? [],
        }
      : null,
    runtime: project.runtimeSnapshot
      ? {
          ci: project.runtimeSnapshot.ci,
          testResults: project.runtimeSnapshot.testResults,
          deployments: project.runtimeSnapshot.deployments,
          errorLogs: project.runtimeSnapshot.errorLogs,
          monitoring: project.runtimeSnapshot.monitoring,
          analytics: project.runtimeSnapshot.analytics,
          productMetrics: project.runtimeSnapshot.productMetrics,
        }
      : null,
    roadmap: project.cycle?.roadmap?.map((task) => ({
      summary: task.summary,
      status: task.status,
      dependencies: task.dependencies,
      successCriteria: task.successCriteria,
      lane: task.lane,
    })),
    approvals: project.approvals,
    recentEvents: events.slice(-8).map((event) => ({
      type: event.type,
      taskId: event.payload.taskId ?? event.payload.task?.id ?? null,
      timestamp: event.timestamp ?? null,
    })),
  };
}

function buildPromptStage(payload) {
  const startedAt = now();
  const serialized = JSON.stringify(payload, null, 2);

  return {
    stage: createStage("prompt", startedAt, {
      metrics: {
        payloadBytes: serialized.length,
        roadmapTaskCount: payload.roadmap?.length ?? 0,
        approvalCount: payload.approvals?.length ?? 0,
        eventCount: payload.recentEvents?.length ?? 0,
      },
      prompt: {
        system:
          "אתה אנליסט טכני של The Nexus. תחזיר תשובה בעברית בלבד. אל תציע לבצע שינויים בפועל. נתח את מצב הפרויקט, מה חסר, מה מסוכן, ומה כדאי לעשות עכשיו.",
        user: `נתוני הפרויקט:\n${serialized}`,
      },
    }),
    promptPayload: serialized,
  };
}

function unavailableResult() {
  return {
    status: "unavailable",
    summary: "שכבת ה-AI עדיין לא הופעלה כי חסר OPENAI_API_KEY.",
    architecture: [],
    risks: [],
    nextActions: [],
    notes: ["כדי להפעיל את הניתוח, צריך להגדיר OPENAI_API_KEY."],
  };
}

export class AiProjectAnalyst {
  constructor({
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL || "gpt-5",
    fallbackModels = process.env.OPENAI_FALLBACK_MODELS,
    fetchImpl = globalThis.fetch,
    timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 15000),
    maxRetries = Number(process.env.OPENAI_MAX_RETRIES || 2),
    cacheTtlMs = Number(process.env.OPENAI_ANALYSIS_CACHE_TTL_MS || 15 * 60 * 1000),
    cachePath = path.join(process.cwd(), "data", "analysis-cache.json"),
  } = {}) {
    this.apiKey = apiKey;
    this.model = model;
    this.fallbackModels = toFallbackModels(fallbackModels);
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
    this.maxRetries = maxRetries;
    this.cacheTtlMs = cacheTtlMs;
    this.cachePath = cachePath;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.fetchImpl);
  }

  loadCache() {
    return safeReadJson(this.cachePath, {});
  }

  writeCache(cache) {
    ensureParentDirectory(this.cachePath);
    fs.writeFileSync(this.cachePath, JSON.stringify(cache, null, 2));
  }

  readCachedAnalysis(cacheKey) {
    const cache = this.loadCache();
    const entry = cache[cacheKey];
    if (!entry) {
      return null;
    }

    const ageMs = now() - entry.cachedAt;
    return {
      ...entry,
      isFresh: ageMs <= this.cacheTtlMs,
      ageMs,
    };
  }

  persistCachedAnalysis(cacheKey, result, meta = {}) {
    const cache = this.loadCache();
    cache[cacheKey] = {
      cachedAt: now(),
      result,
      meta,
    };
    this.writeCache(cache);
  }

  createAbortSignal() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error("analysis_timeout")), this.timeoutMs);
    return {
      signal: controller.signal,
      cleanup: () => clearTimeout(timer),
    };
  }

  async requestAnalysis({ model, promptStage }) {
    const { signal, cleanup } = this.createAbortSignal();
    try {
      const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "system",
              content: promptStage.stage.prompt.system,
            },
            {
              role: "user",
              content: promptStage.stage.prompt.user,
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "project_analysis",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  status: { type: "string" },
                  summary: { type: "string" },
                  architecture: {
                    type: "array",
                    items: { type: "string" },
                  },
                  risks: {
                    type: "array",
                    items: { type: "string" },
                  },
                  nextActions: {
                    type: "array",
                    items: { type: "string" },
                  },
                  notes: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["status", "summary", "architecture", "risks", "nextActions", "notes"],
              },
            },
          },
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const outputText = extractOutputText(payload);
      return {
        parsed: JSON.parse(outputText),
        outputText,
      };
    } finally {
      cleanup();
    }
  }

  async executeWithResilience({ promptStage, cacheKey }) {
    const models = [this.model, ...this.fallbackModels.filter((model) => model !== this.model)];
    const attempts = [];
    let lastError = null;

    for (const model of models) {
      for (let retryIndex = 0; retryIndex <= this.maxRetries; retryIndex += 1) {
        const attemptStartedAt = now();
        try {
          const result = await this.requestAnalysis({ model, promptStage });
          attempts.push({
            model,
            retryIndex,
            status: "completed",
            startedAt: attemptStartedAt,
            endedAt: now(),
            durationMs: now() - attemptStartedAt,
          });
          return {
            ...result,
            modelUsed: model,
            attempts,
          };
        } catch (error) {
          lastError = error;
          attempts.push({
            model,
            retryIndex,
            status: "failed",
            startedAt: attemptStartedAt,
            endedAt: now(),
            durationMs: now() - attemptStartedAt,
            error: error?.name === "AbortError" ? "timeout" : error.message,
          });
        }
      }
    }

    const staleCache = this.readCachedAnalysis(cacheKey);
    if (staleCache?.result) {
      return {
        parsed: {
          ...staleCache.result,
          notes: [...(staleCache.result.notes ?? []), "הוחזר ניתוח שמור כי קריאת ה-AI נכשלה."],
        },
        outputText: JSON.stringify(staleCache.result),
        modelUsed: "cache-fallback",
        attempts,
        fromStaleCache: true,
      };
    }

    throw Object.assign(lastError ?? new Error("OpenAI request failed"), {
      attempts,
    });
  }

  async analyzeProjectContext({ project, events = [] }) {
    const pipelineStartedAt = now();
    const scanStage = buildScanStage(project);
    const contextStage = buildContextStage(project);
    const promptStage = buildPromptStage(
      buildPromptPayload({
        project,
        events,
        scan: scanStage.scan,
        context: contextStage.context,
      }),
    );
    const cacheKey = hashPayload(
      JSON.stringify({
        model: this.model,
        prompt: promptStage.promptPayload,
      }),
    );
    const cached = this.readCachedAnalysis(cacheKey);

    if (!this.isConfigured()) {
      const result = unavailableResult();
      return {
        ...result,
        pipeline: {
          version: "1.1.0",
          status: "unavailable",
          startedAt: pipelineStartedAt,
          endedAt: now(),
          durationMs: now() - pipelineStartedAt,
          stages: [
            scanStage.stage,
            contextStage.stage,
            promptStage.stage,
            {
              name: "analysis",
              status: "skipped",
              reason: "missing_api_key",
            },
          ],
          debug: {
            model: this.model,
            configured: false,
            cacheKey,
          },
        },
      };
    }

    if (cached?.isFresh && cached.result) {
      return {
        ...cached.result,
        pipeline: {
          ...(cached.result.pipeline ?? {}),
          version: "1.1.0",
          status: "cached",
          startedAt: pipelineStartedAt,
          endedAt: now(),
          durationMs: now() - pipelineStartedAt,
          stages: [
            scanStage.stage,
            contextStage.stage,
            promptStage.stage,
            {
              name: "analysis",
              status: "completed",
              source: "cache",
              metrics: {
                cacheAgeMs: cached.ageMs,
              },
            },
          ],
          debug: {
            ...(cached.result.pipeline?.debug ?? {}),
            model: cached.meta?.modelUsed ?? this.model,
            configured: true,
            cacheKey,
            cacheHit: true,
          },
        },
      };
    }

    const analysisStartedAt = now();
    const resilientResult = await this.executeWithResilience({
      promptStage,
      cacheKey,
    });
    const analysisEndedAt = now();

    const result = {
      ...resilientResult.parsed,
      pipeline: {
        version: "1.1.0",
        status: resilientResult.fromStaleCache ? "degraded" : "ready",
        startedAt: pipelineStartedAt,
        endedAt: analysisEndedAt,
        durationMs: analysisEndedAt - pipelineStartedAt,
        stages: [
          scanStage.stage,
          contextStage.stage,
          promptStage.stage,
          {
            name: "analysis",
            status: resilientResult.fromStaleCache ? "completed_from_cache" : "completed",
            startedAt: analysisStartedAt,
            endedAt: analysisEndedAt,
            durationMs: analysisEndedAt - analysisStartedAt,
            metrics: {
              responseBytes: resilientResult.outputText.length,
              attempts: resilientResult.attempts.length,
            },
          },
        ],
        debug: {
          model: resilientResult.modelUsed,
          configured: true,
          cacheKey,
          cacheHit: false,
          attempts: resilientResult.attempts,
          outputPreview: resilientResult.outputText.slice(0, 500),
        },
      },
    };

    if (!resilientResult.fromStaleCache) {
      this.persistCachedAnalysis(cacheKey, result, {
        modelUsed: resilientResult.modelUsed,
      });
    }

    return result;
  }
}
