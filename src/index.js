import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadEnvFile } from "./core/load-env.js";
import { NexusOrchestrator } from "./core/orchestrator.js";
import { AgentRuntime } from "./core/agent-runtime.js";
import { EventBus } from "./core/event-bus.js";
import { FileEventLog } from "./core/file-event-log.js";
import { DevAgentWorker } from "./agents/dev-agent/worker.js";
import { MarketingAgentWorker } from "./agents/marketing-agent/worker.js";
import { QaAgentWorker } from "./agents/qa-agent/worker.js";

loadEnvFile();

const demoDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-demo-"));
const eventBus = new EventBus({
  eventLog: new FileEventLog({
    filePath: path.join(demoDirectory, "events.ndjson"),
  }),
});
const orchestrator = new NexusOrchestrator({ eventBus });
const runtime = new AgentRuntime({
  eventBus,
  workers: [new DevAgentWorker(), new MarketingAgentWorker(), new QaAgentWorker()],
});

const result = orchestrator.runCycle({
  projectId: "nexus-demo",
  projectState: {
    businessGoal: "Reach 1,000 paying users with lean infrastructure cost.",
    product: {
      hasAuth: false,
      hasStagingEnvironment: false,
      hasLandingPage: false,
      hasPaymentIntegration: false,
    },
    analytics: {
      hasBaselineCampaign: false,
    },
    knowledge: {
      knownGaps: ["No onboarding flow", "No acquisition funnel"],
    },
    stack: {
      frontend: "React",
      backend: "Node.js",
      database: "PostgreSQL",
    },
  },
  agents: [
    { id: "dev-agent", capabilities: ["devops", "backend", "security", "payments"] },
    { id: "marketing-agent", capabilities: ["frontend", "copywriting", "marketing", "analytics"] },
    { id: "qa-agent", capabilities: ["qa"] },
  ],
});

const executionResults = runtime.processPendingAssignments({ projectId: "nexus-demo" });

console.log(
  JSON.stringify(
    {
      ...result,
      runtimeResults: executionResults,
    },
    null,
    2,
  ),
);
