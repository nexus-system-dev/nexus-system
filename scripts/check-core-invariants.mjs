#!/usr/bin/env node
/**
 * check-core-invariants.mjs
 *
 * Validates the canonical state and generated state pack against the
 * invariant rules defined in docs/runtime/core-invariants.json.
 *
 * Usage: node scripts/check-core-invariants.mjs
 *
 * Output: docs/runtime/generated/core-invariants-report.json
 * Exit code: 0 = all passed, 1 = violations found
 */

import path from 'node:path';

import {
  REPO_ROOT,
  CANONICAL_STATE_FILE,
  CORE_INVARIANTS_FILE,
  CORE_STATE_PACK_OUTPUT,
  INVARIANTS_REPORT_OUTPUT,
  VALID_TASK_STATES,
  HIGH_RISK_CORE_FILES_REL,
} from './lib/paths.mjs';

import {
  readCanonicalState,
  validateTaskStates,
  validateExecutionOrderSequence,
} from './lib/canonical.mjs';

import {
  readJsonFile,
  isReadable,
  writeJsonArtifact,
} from './lib/fs-utils.mjs';

const violations = [];
const warnings = [];

// ─── Load invariants manifest ─────────────────────────────────────────────────

const invariants = readJsonFile(CORE_INVARIANTS_FILE); // throws if missing

// ─── Load canonical state ─────────────────────────────────────────────────────

let tasks = [];
let canonicalStateReadable = false;

try {
  const canonicalData = readCanonicalState();
  tasks = canonicalData.wave2OrderedExecutionMap;
  canonicalStateReadable = true;
} catch (e) {
  violations.push({
    rule: 'canonical-state-source-of-truth',
    severity: 'CRITICAL',
    message: `Cannot read canonical state: ${e.message}`,
  });
}

// ─── Validate task states ────────────────────────────────────────────────────

if (canonicalStateReadable) {
  const stateViolations = validateTaskStates(tasks);
  for (const v of stateViolations) {
    violations.push({ rule: v.rule, severity: 'ERROR', message: v.message });
  }
}

// ─── Validate execution_order sequence ────────────────────────────────────────

if (canonicalStateReadable) {
  const seqViolations = validateExecutionOrderSequence(tasks);
  for (const v of seqViolations) {
    violations.push({ rule: v.rule, severity: 'ERROR', message: v.message });
  }
}

// ─── Validate total task count is nonzero ─────────────────────────────────────

if (canonicalStateReadable && tasks.length === 0) {
  violations.push({
    rule: 'canonical-state-source-of-truth',
    severity: 'CRITICAL',
    message: 'wave2OrderedExecutionMap is empty — no tasks found',
  });
}

// ─── Check core-state-pack exists (warning, not error) ───────────────────────

if (!isReadable(CORE_STATE_PACK_OUTPUT)) {
  warnings.push({
    rule: 'state-pack-stale',
    message: `core-state-pack.json not found at ${path.relative(REPO_ROOT, CORE_STATE_PACK_OUTPUT)}. Run generate-core-state-pack.mjs first.`,
  });
} else {
  // Validate state pack consistency with canonical state
  try {
    const statePack = readJsonFile(CORE_STATE_PACK_OUTPUT);

    if (statePack.wave2?.totalTasks !== tasks.length) {
      violations.push({
        rule: 'canonical-ordering-immutable',
        severity: 'ERROR',
        message: `State pack totalTasks (${statePack.wave2?.totalTasks}) does not match canonical task count (${tasks.length})`,
      });
    }

    // Verify active task state pack matches canonical
    if (statePack.wave2?.activeTask?.execution_order) {
      const canonicalActive = tasks.find(t =>
        t.execution_order === statePack.wave2.activeTask.execution_order
      );
      if (!canonicalActive) {
        violations.push({
          rule: 'execution-order-taskname-aligned',
          severity: 'ERROR',
          message: `State pack activeTask execution_order ${statePack.wave2.activeTask.execution_order} not found in canonical state`,
        });
      } else if (canonicalActive.state !== statePack.wave2.activeTask.recordedState) {
        violations.push({
          rule: 'execution-order-taskname-aligned',
          severity: 'ERROR',
          message: `State pack activeTask state "${statePack.wave2.activeTask.recordedState}" does not match canonical "${canonicalActive.state}" for task ${canonicalActive.execution_order}`,
        });
      }
    }
  } catch (e) {
    warnings.push({
      rule: 'state-pack-stale',
      message: `Could not validate state pack: ${e.message}`,
    });
  }
}

// ─── Verify high-risk files are listed in invariants ─────────────────────────

const invariantHighRisk = invariants.highRiskCoreFiles?.files ?? [];
for (const coreFile of HIGH_RISK_CORE_FILES_REL) {
  if (!invariantHighRisk.includes(coreFile)) {
    warnings.push({
      rule: 'high-risk-core-files',
      message: `Core file "${coreFile}" is listed as high-risk in paths.mjs but not in core-invariants.json`,
    });
  }
}

// ─── Verify valid states in invariants match code constants ──────────────────

const invariantStates = invariants.validTaskStates?.allowedValues ?? [];
for (const state of VALID_TASK_STATES) {
  if (!invariantStates.includes(state)) {
    violations.push({
      rule: 'valid-task-states',
      severity: 'ERROR',
      message: `State "${state}" is in VALID_TASK_STATES constant but not in core-invariants.json allowedValues`,
    });
  }
}

// ─── Assemble report ─────────────────────────────────────────────────────────

const passed = violations.length === 0;

const report = {
  generatedAt: new Date().toISOString(),
  passed,
  violationCount: violations.length,
  warningCount: warnings.length,
  violations,
  warnings,
  canonicalStateReadable,
  canonicalStateFile: path.relative(REPO_ROOT, CANONICAL_STATE_FILE),
  invariantsManifestFile: path.relative(REPO_ROOT, CORE_INVARIANTS_FILE),
};

// ─── Write output ─────────────────────────────────────────────────────────────

writeJsonArtifact(INVARIANTS_REPORT_OUTPUT, report);

console.log(`[check-core-invariants] ${passed ? 'PASSED' : 'FAILED'} — ${violations.length} violation(s), ${warnings.length} warning(s)`);
console.log(`  Written: ${path.relative(REPO_ROOT, INVARIANTS_REPORT_OUTPUT)}`);

if (!passed) {
  for (const v of violations) {
    console.error(`  [${v.severity}] ${v.rule}: ${v.message}`);
  }
  process.exit(1);
}
