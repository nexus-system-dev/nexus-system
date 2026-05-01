import fs from "node:fs";
import path from "node:path";
import { readProjectKnowledge } from "./knowledge-reader.js";

const TEXT_FILE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".prisma",
  ".sql",
  ".env",
  ".yml",
  ".yaml",
]);

const FRONTEND_DEPENDENCIES = {
  react: "React",
  next: "Next.js",
  vue: "Vue",
  svelte: "Svelte",
  "react-native": "React Native",
  expo: "Expo",
};

const BACKEND_DEPENDENCIES = {
  express: "Express",
  fastify: "Fastify",
  koa: "Koa",
  hono: "Hono",
  nestjs: "NestJS",
  "@nestjs/core": "NestJS",
  "@nestjs/common": "NestJS",
};

const DATABASE_DEPENDENCIES = {
  pg: "PostgreSQL",
  prisma: "Prisma",
  "drizzle-orm": "Drizzle ORM",
  mongoose: "Mongoose",
  mysql2: "MySQL",
  sqlite3: "SQLite",
  redis: "Redis",
  ioredis: "Redis",
};

const TEST_DEPENDENCIES = {
  jest: "Jest",
  vitest: "Vitest",
  mocha: "Mocha",
  playwright: "Playwright",
  cypress: "Cypress",
  supertest: "Supertest",
};

const AUTH_KEYWORDS = [
  "login",
  "logout",
  "authentication",
  "oauth",
  "passport",
  "nextauth",
  "next-auth",
  "auth0",
  "clerk",
  "supabase.auth",
  "jwt",
  "signin",
  "signup",
  "magic link",
  "session",
  "authenticate",
  "bcrypt",
];

const MESSAGING_KEYWORDS = {
  Kafka: ["kafka", "kafkajs"],
  RabbitMQ: ["amqplib", "rabbitmq"],
  BullMQ: ["bullmq", "bull"],
  NATS: ["nats"],
  RedisPubSub: ["pubsub", "publish(", "subscribe("],
};

const QUEUE_KEYWORDS = {
  BullMQ: ["bullmq"],
  Bull: ["bull"],
  Agenda: ["agenda"],
  Bree: ["bree"],
};

const ARCHITECTURE_PATTERNS = [
  { label: "Monorepo", match: ({ files }) => files.some((file) => /(pnpm-workspace\.yaml|turbo\.json|nx\.json)$/i.test(file)) },
  {
    label: "Layered architecture",
    match: ({ files }) =>
      ["controllers", "services", "repositories"].every((segment) =>
        files.some((file) => file.toLowerCase().includes(`/${segment}/`) || file.toLowerCase().includes(`\\${segment}\\`)),
      ),
  },
  {
    label: "MVC-style routing",
    match: ({ files }) =>
      files.some((file) => /controllers/i.test(file)) && files.some((file) => /routes/i.test(file)),
  },
  {
    label: "Event-driven messaging",
    match: ({ textEvidence }) => hasKeyword(textEvidence, ["emit(", "on(", "publish(", "subscribe("]),
  },
  {
    label: "API-first",
    match: ({ files }) => files.some((file) => /(openapi|swagger)\.(ya?ml|json)$/i.test(file)),
  },
];

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function listFiles(rootPath, maxDepth = 5, currentDepth = 0) {
  if (currentDepth > maxDepth || !fs.existsSync(rootPath)) {
    return [];
  }

  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (["node_modules", ".git", "dist", "build", ".next", ".expo"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, maxDepth, currentDepth + 1));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function readTextEvidence(files) {
  return files
    .filter((filePath) => TEXT_FILE_EXTENSIONS.has(path.extname(filePath)))
    .slice(0, 120)
    .map((filePath) => ({
      path: filePath,
      content: fs.readFileSync(filePath, "utf8").slice(0, 8000),
    }));
}

function hasKeyword(evidence, keywords) {
  return evidence.some(({ path: filePath, content }) => {
    const haystack = `${filePath}\n${content}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
  });
}

function findMatchingLabels(registry, dependencies) {
  return Object.entries(registry)
    .filter(([key]) => Object.prototype.hasOwnProperty.call(dependencies, key))
    .map(([, label]) => label);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function relativeList(rootPath, items) {
  return items.map((item) => path.relative(rootPath, item));
}

function detectFrameworks(dependencies, files) {
  const frontend = findMatchingLabels(FRONTEND_DEPENDENCIES, dependencies);
  const backend = findMatchingLabels(BACKEND_DEPENDENCIES, dependencies);
  const database = findMatchingLabels(DATABASE_DEPENDENCIES, dependencies);
  const testing = findMatchingLabels(TEST_DEPENDENCIES, dependencies);
  const ci = unique(
    files.flatMap((file) => {
      if (file.includes(".github/workflows/")) {
        return ["GitHub Actions"];
      }
      if (file.includes(".gitlab-ci")) {
        return ["GitLab CI"];
      }
      if (file.includes("Dockerfile")) {
        return ["Docker"];
      }
      return [];
    }),
  );

  return { frontend, backend, database, testing, ci };
}

function detectDependencies(packageJson) {
  return {
    production: Object.keys(packageJson?.dependencies ?? {}),
    development: Object.keys(packageJson?.devDependencies ?? {}),
  };
}

function detectDbSchema(files, projectPath) {
  const schemaFiles = files.filter((file) => /(schema\.prisma|schema\.sql|typeorm|drizzle|migration|migrations)/i.test(file));
  const prismaSchema = schemaFiles.find((file) => /schema\.prisma$/i.test(file));
  let tables = [];

  if (prismaSchema && fs.existsSync(prismaSchema)) {
    const content = fs.readFileSync(prismaSchema, "utf8");
    tables = [...content.matchAll(/model\s+([A-Za-z0-9_]+)/g)].map((match) => match[1]);
  }

  return {
    hasSchema: schemaFiles.length > 0,
    schemaFiles: relativeList(projectPath, schemaFiles).slice(0, 10),
    entities: unique(tables).slice(0, 20),
  };
}

function detectCi(files, projectPath) {
  const ciFiles = files.filter((file) => /(\.github\/workflows\/.*\.(yml|yaml)|\.gitlab-ci\.yml|Dockerfile|docker-compose\.ya?ml)/i.test(file));
  return {
    hasCi: ciFiles.length > 0,
    files: relativeList(projectPath, ciFiles).slice(0, 10),
  };
}

function detectMessaging(textEvidence, dependencies) {
  const matches = [];

  for (const [label, keywords] of Object.entries(MESSAGING_KEYWORDS)) {
    if (keywords.some((keyword) => Object.keys(dependencies).includes(keyword)) || hasKeyword(textEvidence, keywords)) {
      matches.push(label);
    }
  }

  return unique(matches);
}

function detectQueues(textEvidence, dependencies) {
  const matches = [];

  for (const [label, keywords] of Object.entries(QUEUE_KEYWORDS)) {
    if (keywords.some((keyword) => Object.keys(dependencies).includes(keyword)) || hasKeyword(textEvidence, keywords)) {
      matches.push(label);
    }
  }

  return unique(matches);
}

function detectArchitecturePatterns(files, textEvidence) {
  return ARCHITECTURE_PATTERNS.filter((pattern) => pattern.match({ files, textEvidence })).map((pattern) => pattern.label);
}

function buildSummary({ hasBackend, frameworks, findings }) {
  const frontendSummary = frameworks.frontend.length
    ? `frontend: ${frameworks.frontend.join(", ")}`
    : "ללא frontend מזוהה";
  const backendSummary = hasBackend
    ? `backend: ${frameworks.backend.join(", ") || "מותאם אישית"}`
    : "ללא backend מזוהה";
  const dbSummary = frameworks.database.length
    ? `database/data: ${frameworks.database.join(", ")}`
    : "ללא שכבת data מזוהה";
  const qualitySummary = findings.hasTests ? "יש בדיקות" : "אין בדיקות";

  return `${backendSummary}, ${frontendSummary}, ${dbSummary}, ${qualitySummary}.`;
}

export function scanProject(projectPath, options = {}) {
  const exists = fs.existsSync(projectPath);
  if (!exists) {
    return {
      path: projectPath,
      exists: false,
      summary: "נתיב הפרויקט לא קיים.",
      stack: {
        frontend: [],
        backend: [],
        database: [],
      },
      frameworks: {
        frontend: [],
        backend: [],
        database: [],
        testing: [],
        ci: [],
      },
      findings: {
        hasBackend: false,
        hasAuth: false,
        hasMigrations: false,
        hasEnvExample: false,
        hasTests: false,
        hasCi: false,
        hasMessaging: false,
        hasQueues: false,
      },
      gaps: ["נתיב הפרויקט לא נמצא"],
      architecture: {
        patterns: [],
      },
      dependencies: {
        production: [],
        development: [],
      },
      database: {
        hasSchema: false,
        schemaFiles: [],
        entities: [],
      },
      messaging: [],
      queues: [],
      evidence: {},
    };
  }

  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = safeReadJson(packageJsonPath);
  const dependencies = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };

  const files = listFiles(projectPath);
  const textEvidence = readTextEvidence(files);
  const knowledge = readProjectKnowledge(projectPath, options);
  const frameworks = detectFrameworks(dependencies, files);
  const dependencyMap = detectDependencies(packageJson);

  const routeFiles = files.filter((filePath) =>
    /(routes|controllers|api|server|app)\.(js|ts|tsx|jsx|mjs|cjs)$/i.test(path.basename(filePath)),
  );
  const migrationFiles = files.filter((filePath) =>
    /(migration|migrations|prisma|drizzle|schema\.sql)/i.test(filePath),
  );
  const testFiles = files.filter((filePath) =>
    /(\.test\.|\.spec\.|__tests__|vitest|jest|playwright|cypress)/i.test(filePath),
  );
  const envFiles = files.filter((filePath) =>
    /^\.env(\.example|\.sample)?$/i.test(path.basename(filePath)),
  );

  const hasBackend = frameworks.backend.length > 0 || routeFiles.length > 0;
  const hasAuth = hasKeyword(textEvidence, AUTH_KEYWORDS);
  const hasMigrations = migrationFiles.length > 0;
  const hasEnvExample = envFiles.some((filePath) => /\.example|\.sample/i.test(filePath));
  const hasTests = testFiles.length > 0;

  const database = detectDbSchema(files, projectPath);
  const ci = detectCi(files, projectPath);
  const messaging = detectMessaging(textEvidence, dependencies);
  const queues = detectQueues(textEvidence, dependencies);
  const architecturePatterns = detectArchitecturePatterns(files, textEvidence);

  const findings = {
    hasBackend,
    hasAuth,
    hasMigrations,
    hasEnvExample,
    hasTests,
    hasCi: ci.hasCi,
    hasMessaging: messaging.length > 0,
    hasQueues: queues.length > 0,
  };

  const gaps = [];
  if (hasBackend && !hasAuth) {
    gaps.push("זוהה צד שרת, אבל לא נמצאה שכבת התחברות");
  }
  if (!hasMigrations) {
    gaps.push("לא זוהו קבצי migrations או ניהול סכימה");
  }
  if (!hasEnvExample) {
    gaps.push("לא זוהה קובץ .env.example או .env.sample");
  }
  if (!hasTests) {
    gaps.push("לא זוהו קבצי בדיקות");
  }
  if (!ci.hasCi) {
    gaps.push("לא זוהתה שכבת CI או workflow אוטומטי");
  }
  if (!hasBackend) {
    gaps.push("לא זוהה צד שרת או שכבת routes");
  }
  for (const missingPart of knowledge.knownMissingParts) {
    if (!gaps.includes(missingPart)) {
      gaps.push(missingPart);
    }
  }

  return {
    path: projectPath,
    exists: true,
    summary: buildSummary({ hasBackend, frameworks, findings }),
    stack: {
      frontend: frameworks.frontend,
      backend: frameworks.backend,
      database: frameworks.database,
    },
    frameworks,
    dependencies: dependencyMap,
    architecture: {
      patterns: architecturePatterns,
    },
    database,
    knowledge,
    messaging,
    queues,
    findings,
    gaps,
    evidence: {
      packageJson: fs.existsSync(packageJsonPath) ? "package.json" : null,
      routeFiles: relativeList(projectPath, routeFiles).slice(0, 10),
      migrationFiles: relativeList(projectPath, migrationFiles).slice(0, 10),
      envFiles: relativeList(projectPath, envFiles).slice(0, 10),
      testFiles: relativeList(projectPath, testFiles).slice(0, 10),
      ciFiles: ci.files,
      schemaFiles: database.schemaFiles,
    },
  };
}
