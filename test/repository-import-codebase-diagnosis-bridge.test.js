import test from "node:test";
import assert from "node:assert/strict";

import { createRepositoryImportAndCodebaseDiagnosisBridge } from "../src/core/repository-import-codebase-diagnosis-bridge.js";

test("repository import and codebase diagnosis bridge turns repository evidence into a canonical diagnosis surface", () => {
  const { repositoryImportAndCodebaseDiagnosis } = createRepositoryImportAndCodebaseDiagnosisBridge({
    projectId: "imported-growth-app",
    existingBusinessAssets: {
      importAndContinueSeed: {
        scanRoot: "/tmp/imported-growth-app",
        nextCapabilities: ["repository-diagnosis", "website-diagnosis", "document-diagnosis"],
      },
      assets: [
        {
          assetType: "repository",
          url: "https://github.com/example/imported-growth-app",
          repository: {
            provider: "github",
            fullName: "example/imported-growth-app",
            defaultBranch: "main",
          },
        },
      ],
    },
    scan: {
      summary: "backend: Express, frontend: React, database/data: PostgreSQL, יש בדיקות.",
      stack: {
        frontend: ["React"],
        backend: ["Express"],
        database: ["PostgreSQL"],
      },
      findings: {
        hasAuth: true,
        hasTests: true,
        hasMigrations: true,
        hasCi: false,
      },
      architecture: {
        patterns: ["Layered architecture", "MVC-style routing"],
      },
      database: {
        hasSchema: true,
        schemaFiles: ["prisma/schema.prisma"],
        entities: ["User", "Invoice"],
      },
      messaging: ["Kafka"],
      queues: ["BullMQ"],
      gaps: ["לא זוהתה שכבת CI או workflow אוטומטי"],
      knowledge: {
        summary: "README + docs + PR discussions",
      },
      evidence: {
        routeFiles: ["src/routes.ts"],
        schemaFiles: ["prisma/schema.prisma"],
        migrationFiles: ["migrations/001_init.sql"],
        envFiles: [".env.example"],
        testFiles: ["test/auth.test.ts"],
        ciFiles: [],
      },
    },
    gitSnapshot: {
      provider: "github",
      repo: {
        fullName: "example/imported-growth-app",
        defaultBranch: "main",
      },
      branches: [{ name: "main" }, { name: "feature/import" }],
      commits: [{ sha: "abc123" }, { sha: "def456" }],
      pullRequests: [{ id: 14, state: "open" }, { id: 15, state: "closed" }],
    },
  });

  assert.equal(repositoryImportAndCodebaseDiagnosis.status, "ready");
  assert.equal(repositoryImportAndCodebaseDiagnosis.repository.fullName, "example/imported-growth-app");
  assert.equal(repositoryImportAndCodebaseDiagnosis.repoStatus.branchCount, 2);
  assert.equal(repositoryImportAndCodebaseDiagnosis.repoStatus.openReviewCount, 1);
  assert.equal(repositoryImportAndCodebaseDiagnosis.codebaseSignals.stack.backend[0], "Express");
  assert.equal(repositoryImportAndCodebaseDiagnosis.codebaseSignals.database.entities.includes("User"), true);
  assert.equal(repositoryImportAndCodebaseDiagnosis.diagnosisReadout.blockingGaps[0], "לא זוהתה שכבת CI או workflow אוטומטי");
  assert.equal(
    repositoryImportAndCodebaseDiagnosis.importContinuation.nextCapabilities.includes("imported-asset-task-extraction"),
    true,
  );
  assert.equal(
    repositoryImportAndCodebaseDiagnosis.diagnosisReadout.recommendedActions[0],
    "Verify CI workflow ownership and import pipeline readiness.",
  );
});
