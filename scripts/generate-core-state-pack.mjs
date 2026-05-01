#!/usr/bin/env node
/**
 * generate-core-state-pack.mjs
 *
 * Generates docs/runtime/generated/core-state-pack.json — a compact,
 * machine-readable snapshot of the current Wave 2 execution reality.
 *
 * Usage: node scripts/generate-core-state-pack.mjs
 *
 * Fails loudly with a structured error if canonical state is missing or malformed.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  REPO_ROOT,
  CANONICAL_STATE_FILE,
  EXECUTION_PLAN_FILE,
  BACKLOG_FILE,
  HIGH_RISK_CORE_FILES,
  HIGH_RISK_CORE_FILES_REL,
  CORE_STATE_PACK_OUTPUT,
} from './lib/paths.mjs';

import {
  readCanonicalState,
  countTaskStates,
  findActiveTask,
  findPreviousTask,
} from './lib/canonical.mjs';

import {
  fileMetadata,
  getGitState,
  isReadable,
  writeJsonArtifact,
} from './lib/fs-utils.mjs';

// ─── Canonical state ──────────────────────────────────────────────────────────

const canonicalData = readCanonicalState(); // throws loudly on failure
const tasks = canonicalData.wave2OrderedExecutionMap;

const stateCounts = countTaskStates(tasks);
const activeTask = findActiveTask(tasks);
const previousTask = findPreviousTask(tasks, activeTask);

if (!activeTask) {
  // All tasks are trueGreen — unusual but valid
  console.warn('[generate-core-state-pack] WARNING: All tasks are trueGreen. No active task found.');
}

// ─── Core file metadata ───────────────────────────────────────────────────────

const coreFiles = HIGH_RISK_CORE_FILES.map((fullPath, i) =>
  fileMetadata(fullPath, HIGH_RISK_CORE_FILES_REL[i])
);

// ─── Git state ────────────────────────────────────────────────────────────────

const recentRepoState = getGitState(REPO_ROOT);

// ─── API surface hints ────────────────────────────────────────────────────────

/**
 * Scans server.js for route-like patterns (heuristic, best-effort).
 * Returns an array of detected route strings.
 */
function detectServerRoutes() {
  const serverPath = path.join(REPO_ROOT, 'src', 'server.js');
  if (!fs.existsSync(serverPath)) return [];

  const content = fs.readFileSync(serverPath, 'utf8');
  const routePattern = /['"`](\/[a-zA-Z0-9/_:.-]+)['"`]/g;
  const matches = new Set();
  let m;
  while ((m = routePattern.exec(content)) !== null) {
    // Only include plausible API routes (not relative paths like './foo')
    if (m[1].startsWith('/') && !m[1].includes('..')) {
      matches.add(m[1]);
    }
  }
  return [...matches].slice(0, 30); // cap at 30 to stay compact
}

/**
 * Lists key runtime module imports from context-builder.js and project-service.js (heuristic).
 */
function detectKeyRuntimeModules() {
  const files = [
    path.join(REPO_ROOT, 'src', 'core', 'context-builder.js'),
    path.join(REPO_ROOT, 'src', 'core', 'project-service.js'),
  ];
  const modules = new Set();
  const importPattern = /from\s+['"`]\.\/([a-zA-Z0-9_-]+)['"`]/g;

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    let m;
    while ((m = importPattern.exec(content)) !== null) {
      modules.add(m[1]);
    }
  }
  return [...modules].slice(0, 30);
}

const apiSurfaceHints = {
  serverRoutesDetected: detectServerRoutes(),
  keyRuntimeModules: detectKeyRuntimeModules(),
};

// ─── Test surface hints ───────────────────────────────────────────────────────

/**
 * Lists test files that correspond to core runtime files (heuristic).
 */
function detectRelevantTests() {
  const testDir = path.join(REPO_ROOT, 'test');
  if (!fs.existsSync(testDir)) return [];

  const coreModuleNames = [
    'context-builder',
    'project-service',
    'application-server-bootstrap',
  ];

  return coreModuleNames
    .map(name => `${name}.test.js`)
    .filter(f => fs.existsSync(path.join(testDir, f)));
}

const testSurfaceHints = {
  relevantTestsDetected: detectRelevantTests(),
};

// ─── Doc sync summary ─────────────────────────────────────────────────────────

const docSyncSummary = {
  canonicalStateReadable: isReadable(CANONICAL_STATE_FILE),
  executionPlanReadable: isReadable(EXECUTION_PLAN_FILE),
  backlogReadable: isReadable(BACKLOG_FILE),
  // Best-effort: checks that at least 1 task name from canonical state appears in the execution plan
  taskNameExecutionOrderConsistent: (() => {
    try {
      if (!isReadable(EXECUTION_PLAN_FILE)) return false;
      const planContent = fs.readFileSync(EXECUTION_PLAN_FILE, 'utf8');
      // Check that the first task name from canonical state appears in the execution plan
      const firstTask = tasks[0];
      if (!firstTask) return false;
      return planContent.includes(firstTask.taskName);
    } catch {
      return false;
    }
  })(),
};

// ─── Assemble state pack ─────────────────────────────────────────────────────

const statePack = {
  generatedAt: new Date().toISOString(),
  repoRoot: REPO_ROOT,
  canonicalStateFile: path.relative(REPO_ROOT, CANONICAL_STATE_FILE),
  executionPlanFile: path.relative(REPO_ROOT, EXECUTION_PLAN_FILE),
  backlogFile: path.relative(REPO_ROOT, BACKLOG_FILE),
  wave2: {
    totalTasks: tasks.length,
    currentScanPoint: activeTask?.execution_order ?? null,
    activeTask: activeTask
      ? {
          execution_order: activeTask.execution_order,
          taskName: activeTask.taskName,
          recordedState: activeTask.state,
        }
      : { execution_order: null, taskName: null, recordedState: null },
    previousTask: previousTask
      ? {
          execution_order: previousTask.execution_order,
          taskName: previousTask.taskName,
          recordedState: previousTask.state,
        }
      : { execution_order: null, taskName: null, recordedState: null },
    stateCounts,
  },
  coreFiles,
  recentRepoState,
  apiSurfaceHints,
  testSurfaceHints,
  docSyncSummary,
};

// ─── Write output ─────────────────────────────────────────────────────────────

writeJsonArtifact(CORE_STATE_PACK_OUTPUT, statePack);

console.log(`[generate-core-state-pack] Written: ${path.relative(REPO_ROOT, CORE_STATE_PACK_OUTPUT)}`);
console.log(`  Active task: #${statePack.wave2.currentScanPoint} "${statePack.wave2.activeTask.taskName}" (${statePack.wave2.activeTask.recordedState})`);
console.log(`  State counts: trueGreen=${stateCounts.trueGreen} in-progress=${stateCounts['in-progress']} blocked=${stateCounts.blocked} bridge-deferred=${stateCounts['bridge-deferred']}`);
