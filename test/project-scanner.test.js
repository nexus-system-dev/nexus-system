import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { scanProject } from "../src/core/project-scanner.js";

function createFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

test("scanner detects backend gaps in a partial node project", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-scan-"));
  createFile(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        dependencies: {
          express: "^4.0.0",
          pg: "^8.0.0",
        },
        devDependencies: {
          jest: "^29.0.0",
        },
      },
      null,
      2,
    ),
  );
  createFile(path.join(root, "src/server.ts"), "import express from 'express'; const app = express();");
  createFile(path.join(root, "prisma/schema.prisma"), "model User { id String @id }");

  const result = scanProject(root);

  assert.equal(result.findings.hasBackend, true);
  assert.equal(result.findings.hasAuth, false);
  assert.equal(result.findings.hasMigrations, true);
  assert.equal(result.findings.hasEnvExample, false);
  assert.equal(result.findings.hasTests, false);
  assert.equal(result.findings.hasCi, false);
  assert.deepEqual(result.frameworks.backend, ["Express"]);
  assert.deepEqual(result.frameworks.database, ["PostgreSQL"]);
  assert.deepEqual(result.frameworks.testing, ["Jest"]);
  assert.equal(result.database.hasSchema, true);
  assert.equal(result.database.entities.includes("User"), true);
  assert.equal(result.gaps.includes("זוהה צד שרת, אבל לא נמצאה שכבת התחברות"), true);
  assert.equal(result.gaps.includes("לא זוהתה שכבת CI או workflow אוטומטי"), true);
});

test("scanner detects auth, env example, and tests when present", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-scan-full-"));
  createFile(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        dependencies: {
          fastify: "^5.0.0",
          react: "^19.0.0",
          prisma: "^5.0.0",
          bullmq: "^5.0.0",
          kafkajs: "^2.0.0",
        },
        devDependencies: {
          vitest: "^2.0.0",
        },
      },
      null,
      2,
    ),
  );
  createFile(path.join(root, ".env.example"), "DATABASE_URL=\nJWT_SECRET=\n");
  createFile(path.join(root, "src/routes.ts"), "app.post('/signin'); const jwt = 'token';");
  createFile(path.join(root, "migrations/001_init.sql"), "create table users(id text);");
  createFile(path.join(root, "test/auth.test.ts"), "describe('auth', () => {});");
  createFile(path.join(root, ".github/workflows/ci.yml"), "name: ci");
  createFile(
    path.join(root, "src/services/queue.ts"),
    "import { Queue } from 'bullmq'; import { Kafka } from 'kafkajs';",
  );
  createFile(path.join(root, "README.md"), "# Product\nTODO: onboarding flow\n");
  createFile(path.join(root, "docs/roadmap.md"), "# Roadmap\nחסר: admin dashboard\n");
  createFile(path.join(root, "src/controllers/auth.controller.ts"), "export const auth = true;");
  createFile(path.join(root, "src/repositories/user.repository.ts"), "export const repo = true;");

  const result = scanProject(root);

  assert.equal(result.findings.hasBackend, true);
  assert.equal(result.findings.hasAuth, true);
  assert.equal(result.findings.hasMigrations, true);
  assert.equal(result.findings.hasEnvExample, true);
  assert.equal(result.findings.hasTests, true);
  assert.equal(result.findings.hasCi, true);
  assert.equal(result.findings.hasMessaging, true);
  assert.equal(result.findings.hasQueues, true);
  assert.deepEqual(result.frameworks.backend, ["Fastify"]);
  assert.deepEqual(result.frameworks.frontend, ["React"]);
  assert.deepEqual(result.frameworks.database, ["Prisma"]);
  assert.deepEqual(result.frameworks.testing, ["Vitest"]);
  assert.equal(result.messaging.includes("Kafka"), true);
  assert.equal(result.queues.includes("BullMQ"), true);
  assert.equal(result.architecture.patterns.includes("Layered architecture"), true);
  assert.equal(result.architecture.patterns.includes("MVC-style routing"), true);
  assert.equal(result.knowledge.readme.path, "README.md");
  assert.equal(result.knowledge.docs[0].path, "docs/roadmap.md");
  assert.equal(result.knowledge.knownMissingParts.includes("onboarding flow"), true);
  assert.equal(result.knowledge.integrations.notion.status, "not-connected");
  assert.equal(result.evidence.ciFiles.length > 0, true);
  assert.equal(result.gaps.includes("onboarding flow"), true);
  assert.equal(result.gaps.includes("admin dashboard"), true);
});
