#!/usr/bin/env node
/**
 * analyze-impact.mjs
 *
 * Classifies the current turn's risk level (light / medium / heavy) based on
 * changed files. Uses git diff by default; accepts --files CLI arg override.
 *
 * Usage:
 *   node scripts/analyze-impact.mjs
 *   node scripts/analyze-impact.mjs --files "src/core/foo.js,test/foo.test.js"
 *
 * Output: docs/runtime/generated/impact-report.json
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  REPO_ROOT,
  IMPACT_REPORT_OUTPUT,
  HIGH_RISK_CORE_FILES_REL,
  CORE_RUNTIME_FILES_REL,
} from './lib/paths.mjs';

import {
  getGitState,
  writeJsonArtifact,
} from './lib/fs-utils.mjs';

// ─── Parse CLI args ───────────────────────────────────────────────────────────

function parseArgs(args) {
  const result = { files: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--files' && args[i + 1]) {
      result.files = args[i + 1].split(',').map(f => f.trim()).filter(Boolean);
      i++;
    }
  }
  return result;
}

const { files: cliFiles } = parseArgs(process.argv.slice(2));

// ─── Determine changed files ──────────────────────────────────────────────────

let changedFiles;
let gitAvailable = false;

if (cliFiles) {
  changedFiles = cliFiles;
  console.log(`[analyze-impact] Using ${changedFiles.length} files from --files arg`);
} else {
  const gitState = getGitState(REPO_ROOT);
  gitAvailable = gitState.gitAvailable;
  changedFiles = [...gitState.changedFiles, ...gitState.untrackedFiles.filter(f =>
    // Include untracked files in src/ and scripts/ as relevant for impact
    f.startsWith('src/') || f.startsWith('scripts/')
  )];
  console.log(`[analyze-impact] Detected ${changedFiles.length} changed file(s) from git`);
}

// ─── Classification helpers ───────────────────────────────────────────────────

const HEAVY_PATTERNS = [
  ...HIGH_RISK_CORE_FILES_REL,
  ...CORE_RUNTIME_FILES_REL,
];

// Integration edge patterns (medium risk triggers)
const MEDIUM_PATTERNS = [
  /^src\/core\/api-routing/,
  /^src\/core\/application-server-bootstrap/,
  /^src\/core\/agent-runtime/,
  /^src\/server\.js$/,
  /^src\/index\.js$/,
];

// Doc file patterns
const DOC_PATTERNS = [/^docs\//];

// Test file patterns
const TEST_PATTERNS = [/^test\//];

function matchesAny(file, patterns) {
  return patterns.some(p =>
    typeof p === 'string' ? file === p || file.endsWith(p) : p.test(file)
  );
}

// ─── Classify files ───────────────────────────────────────────────────────────

const touchedCoreFiles = changedFiles.filter(f => matchesAny(f, HIGH_RISK_CORE_FILES_REL));
const touchedRuntimeFiles = changedFiles.filter(f => matchesAny(f, CORE_RUNTIME_FILES_REL));
const touchedDocs = changedFiles.filter(f => matchesAny(f, DOC_PATTERNS));
const touchedTests = changedFiles.filter(f => matchesAny(f, TEST_PATTERNS));
const touchedIntegrationEdges = changedFiles.filter(f =>
  !matchesAny(f, HIGH_RISK_CORE_FILES_REL) && matchesAny(f, MEDIUM_PATTERNS)
);

// ─── Determine risk level ─────────────────────────────────────────────────────

const reasons = [];
let riskLevel = 'light';
let requiresFullRepoRescan = false;
let requiresPreviousTaskRevalidation = false;

if (touchedCoreFiles.length > 0 || touchedRuntimeFiles.length > 0) {
  riskLevel = 'heavy';
  requiresFullRepoRescan = true;
  requiresPreviousTaskRevalidation = true;
  if (touchedCoreFiles.length > 0) {
    reasons.push(`High-risk core file(s) modified: ${touchedCoreFiles.join(', ')}`);
  }
  if (touchedRuntimeFiles.length > 0) {
    reasons.push(`Core runtime orchestration file(s) modified: ${touchedRuntimeFiles.join(', ')}`);
  }
} else if (touchedIntegrationEdges.length > 0) {
  riskLevel = 'medium';
  requiresPreviousTaskRevalidation = true;
  reasons.push(`Integration edge file(s) modified: ${touchedIntegrationEdges.join(', ')}`);
} else if (changedFiles.length === 0) {
  riskLevel = 'light';
  reasons.push('No changed files detected');
} else {
  riskLevel = 'light';
  reasons.push('Only task-local files changed, no core invariant triggers fired');
}

// ─── Probable dependent files (heuristic) ─────────────────────────────────────

/**
 * Best-effort heuristic: scan src/core/ for files that import any of the changed files.
 * This is NOT a complete dependency graph — it is explicitly marked as heuristic.
 * Only run if riskLevel is medium or heavy (for light turns, skip the scan).
 */
function findProbableDependents(changed) {
  if (riskLevel === 'light') return [];

  const coreDir = path.join(REPO_ROOT, 'src', 'core');
  if (!fs.existsSync(coreDir)) return [];

  const changedModuleNames = changed
    .map(f => path.basename(f, '.js'))
    .filter(Boolean);

  if (changedModuleNames.length === 0) return [];

  const dependents = new Set();

  try {
    const entries = fs.readdirSync(coreDir);
    for (const entry of entries) {
      if (!entry.endsWith('.js')) continue;
      const fullPath = path.join(coreDir, entry);
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const modName of changedModuleNames) {
        if (content.includes(`'${modName}'`) || content.includes(`"${modName}"`)) {
          dependents.add(`src/core/${entry}`);
          break;
        }
      }
    }
  } catch {
    // Heuristic scan failure is non-fatal
  }

  return [...dependents];
}

const probableDependentFiles = findProbableDependents(changedFiles);

// ─── Assemble report ─────────────────────────────────────────────────────────

const report = {
  generatedAt: new Date().toISOString(),
  heuristicNote: 'Dependency analysis is best-effort from import patterns. Not a complete static dependency graph.',
  changedFiles,
  riskLevel,
  touchedCoreFiles,
  touchedDocs,
  touchedTests,
  probableDependentFiles,
  requiresFullRepoRescan,
  requiresPreviousTaskRevalidation,
  reasons,
  gitAvailable,
  sourceMode: cliFiles ? 'cli-args' : 'git-diff',
};

// ─── Write output ─────────────────────────────────────────────────────────────

writeJsonArtifact(IMPACT_REPORT_OUTPUT, report);

console.log(`[analyze-impact] riskLevel=${riskLevel} changedFiles=${changedFiles.length} requiresFullRepoRescan=${requiresFullRepoRescan}`);
console.log(`  Written: ${path.relative(REPO_ROOT, IMPACT_REPORT_OUTPUT)}`);
for (const r of reasons) {
  console.log(`  Reason: ${r}`);
}
