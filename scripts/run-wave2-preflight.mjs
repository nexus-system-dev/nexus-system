#!/usr/bin/env node
/**
 * run-wave2-preflight.mjs
 *
 * Main entry point for Wave 2 execution preflight.
 * Runs all sub-scripts in order and produces a single go/no-go summary.
 *
 * Order:
 *   1. generate-core-state-pack
 *   2. check-core-invariants
 *   3. analyze-impact
 *   4. check-wave2-doc-sync
 *
 * Usage: node scripts/run-wave2-preflight.mjs
 *
 * Output: docs/runtime/generated/preflight-summary.json
 * Exit code: 0 = ready, 1 = not ready
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

import {
  REPO_ROOT,
  PREFLIGHT_SUMMARY_OUTPUT,
  CORE_STATE_PACK_OUTPUT,
  INVARIANTS_REPORT_OUTPUT,
  IMPACT_REPORT_OUTPUT,
  DOC_SYNC_REPORT_OUTPUT,
} from './lib/paths.mjs';

import { writeJsonArtifact, readJsonFile, isReadable } from './lib/fs-utils.mjs';

// ─── Step runner ──────────────────────────────────────────────────────────────

/**
 * Runs a script as a subprocess. Returns { success, stdout, stderr }.
 * Never throws — captures failures as structured results.
 */
function runScript(scriptName) {
  const scriptPath = path.join(REPO_ROOT, 'scripts', scriptName);
  console.log(`\n[preflight] Running: ${scriptName}...`);

  try {
    const output = execSync(`node "${scriptPath}"`, {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      timeout: 60_000,
    });
    const stdout = output.toString();
    process.stdout.write(stdout);
    return { success: true, stdout, stderr: '' };
  } catch (e) {
    const stdout = e.stdout?.toString() ?? '';
    const stderr = e.stderr?.toString() ?? '';
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    return { success: false, stdout, stderr, exitCode: e.status };
  }
}

// ─── Run all preflight steps ──────────────────────────────────────────────────

const stepResults = {};

// Step 1: Generate state pack
stepResults.statePack = runScript('generate-core-state-pack.mjs');

// Step 2: Check invariants (runs after state pack so it can validate it)
stepResults.invariants = runScript('check-core-invariants.mjs');

// Step 3: Analyze impact
stepResults.impact = runScript('analyze-impact.mjs');

// Step 4: Check doc sync
stepResults.docSync = runScript('check-wave2-doc-sync.mjs');

// ─── Load generated artifacts ─────────────────────────────────────────────────

function tryReadJson(filePath) {
  if (!isReadable(filePath)) return null;
  try {
    return readJsonFile(filePath);
  } catch {
    return null;
  }
}

const statePackData = tryReadJson(CORE_STATE_PACK_OUTPUT);
const invariantsData = tryReadJson(INVARIANTS_REPORT_OUTPUT);
const impactData = tryReadJson(IMPACT_REPORT_OUTPUT);
const docSyncData = tryReadJson(DOC_SYNC_REPORT_OUTPUT);

// ─── Derive summary values ────────────────────────────────────────────────────

const canonicalStateHealthy = statePackData?.docSyncSummary?.canonicalStateReadable ?? false;
const invariantsPassed = invariantsData?.passed ?? false;
const docSyncPassed = docSyncData?.passed ?? false;
const riskLevel = impactData?.riskLevel ?? 'heavy'; // default heavy if unknown
const requiresFullRepoRescan = impactData?.requiresFullRepoRescan ?? false;

const blockingIssues = [];
const warnings = [];

// Blocking issues: things that prevent task execution
if (!stepResults.statePack.success) {
  blockingIssues.push('generate-core-state-pack failed — cannot determine execution state');
}
if (!canonicalStateHealthy) {
  blockingIssues.push('Canonical state (wave2-canonical-state.json) is not readable or malformed');
}
if (!invariantsPassed) {
  const violations = invariantsData?.violations ?? [];
  for (const v of violations) {
    blockingIssues.push(`Invariant violation [${v.rule}]: ${v.message}`);
  }
  if (violations.length === 0) {
    blockingIssues.push('Invariant check failed (see core-invariants-report.json for details)');
  }
}
if (requiresFullRepoRescan) {
  blockingIssues.push(`Full repo rescan required (riskLevel=${riskLevel}) before proceeding`);
}

// Warnings: things that should be noted but don't block execution
if (!docSyncPassed) {
  const count = docSyncData?.mismatchCount ?? '?';
  warnings.push(`Doc sync check failed: ${count} mismatch(es) detected in tracking documents`);
}
if (impactData?.requiresPreviousTaskRevalidation) {
  warnings.push('Previous task revalidation required before proceeding');
}

const invariantWarnings = invariantsData?.warnings ?? [];
for (const w of invariantWarnings) {
  warnings.push(`Invariant warning [${w.rule}]: ${w.message}`);
}

const docSyncWarnings = docSyncData?.warnings ?? [];
for (const w of docSyncWarnings) {
  warnings.push(`Doc sync warning [${w.type}]: ${w.message}`);
}

// ready = no blocking issues
const ready = blockingIssues.length === 0;

// ─── Assemble summary ─────────────────────────────────────────────────────────

const summary = {
  generatedAt: new Date().toISOString(),
  ready,
  riskLevel,
  canonicalStateHealthy,
  invariantsPassed,
  docSyncPassed,
  requiresFullRepoRescan,
  blockingIssues,
  warnings,
  activeTask: statePackData?.wave2?.activeTask ?? null,
  wave2StateCounts: statePackData?.wave2?.stateCounts ?? null,
  stepResults: {
    generateStatePack: stepResults.statePack.success,
    checkInvariants: stepResults.invariants.success,
    analyzeImpact: stepResults.impact.success,
    checkDocSync: stepResults.docSync.success,
  },
};

// ─── Write output ─────────────────────────────────────────────────────────────

writeJsonArtifact(PREFLIGHT_SUMMARY_OUTPUT, summary);

console.log('\n' + '='.repeat(60));
console.log(`[preflight] RESULT: ${ready ? '✅ READY' : '❌ NOT READY'}`);
console.log(`  riskLevel: ${riskLevel}`);
console.log(`  canonicalStateHealthy: ${canonicalStateHealthy}`);
console.log(`  invariantsPassed: ${invariantsPassed}`);
console.log(`  docSyncPassed: ${docSyncPassed}`);
console.log(`  requiresFullRepoRescan: ${requiresFullRepoRescan}`);

if (statePackData?.wave2?.activeTask?.execution_order) {
  const at = statePackData.wave2.activeTask;
  console.log(`  activeTask: #${at.execution_order} "${at.taskName}" (${at.recordedState})`);
}

if (blockingIssues.length > 0) {
  console.error(`\n  Blocking issues (${blockingIssues.length}):`);
  for (const issue of blockingIssues) console.error(`    ❌ ${issue}`);
}
if (warnings.length > 0) {
  console.warn(`\n  Warnings (${warnings.length}):`);
  for (const w of warnings) console.warn(`    ⚠️  ${w}`);
}

console.log(`\n  Summary written: ${path.relative(REPO_ROOT, PREFLIGHT_SUMMARY_OUTPUT)}`);
console.log('='.repeat(60));

if (!ready) process.exit(1);
