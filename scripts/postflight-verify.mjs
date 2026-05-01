#!/usr/bin/env node
/**
 * postflight-verify.mjs
 *
 * Verifies repo integrity after a task run. Checks:
 *   - Which files were changed (from git or CLI args)
 *   - Whether any unexpected files were touched
 *   - Whether the canonical state is still readable
 *   - Whether doc sync still passes
 *
 * Usage:
 *   node scripts/postflight-verify.mjs
 *   node scripts/postflight-verify.mjs \
 *     --allowedFiles "src/core/my-module.js,test/my-module.test.js" \
 *     --forbiddenFiles "src/core/context-builder.js" \
 *     --taskOrder 34
 *
 * Output: docs/runtime/generated/postflight-report.json
 * Exit code: 0 = passed, 1 = issues found
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  REPO_ROOT,
  CANONICAL_STATE_FILE,
  HIGH_RISK_CORE_FILES_REL,
  POSTFLIGHT_REPORT_OUTPUT,
  DOC_SYNC_REPORT_OUTPUT,
} from './lib/paths.mjs';

import { readCanonicalState, countTaskStates } from './lib/canonical.mjs';
import { getGitState, isReadable, writeJsonArtifact } from './lib/fs-utils.mjs';

// ─── Parse CLI args ───────────────────────────────────────────────────────────

function parseArgs(args) {
  const result = { allowedFiles: null, forbiddenFiles: null, taskOrder: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--allowedFiles' && args[i + 1]) {
      result.allowedFiles = args[i + 1].split(',').map(f => f.trim()).filter(Boolean);
      i++;
    } else if (args[i] === '--forbiddenFiles' && args[i + 1]) {
      result.forbiddenFiles = args[i + 1].split(',').map(f => f.trim()).filter(Boolean);
      i++;
    } else if (args[i] === '--taskOrder' && args[i + 1]) {
      result.taskOrder = parseInt(args[i + 1], 10);
      i++;
    }
  }
  return result;
}

const { allowedFiles, forbiddenFiles, taskOrder } = parseArgs(process.argv.slice(2));

// ─── Gather changed files ─────────────────────────────────────────────────────

const gitState = getGitState(REPO_ROOT);
const touchedFiles = [...gitState.changedFiles, ...gitState.untrackedFiles];

console.log(`[postflight-verify] Detected ${touchedFiles.length} touched file(s) from git`);

// ─── Check forbidden files ────────────────────────────────────────────────────

const unexpectedTouchedFiles = [];
const forbiddenTouched = [];
const requiredFollowup = [];
const notes = [];

if (forbiddenFiles && forbiddenFiles.length > 0) {
  for (const f of forbiddenFiles) {
    if (touchedFiles.includes(f)) {
      forbiddenTouched.push(f);
      unexpectedTouchedFiles.push(f);
    }
  }
}

// Check if any high-risk core files were unexpectedly touched
for (const coreFile of HIGH_RISK_CORE_FILES_REL) {
  if (touchedFiles.includes(coreFile)) {
    // If it wasn't in the allowed list (or no allowed list was given), flag it
    if (!allowedFiles || !allowedFiles.includes(coreFile)) {
      unexpectedTouchedFiles.push(coreFile);
      notes.push(`High-risk core file touched unexpectedly: ${coreFile}`);
    }
  }
}

// If allowedFiles was given, report files outside the allowed set
if (allowedFiles) {
  const allowedSet = new Set(allowedFiles);
  for (const f of touchedFiles) {
    if (!allowedSet.has(f) && !unexpectedTouchedFiles.includes(f)) {
      // Docs/runtime/generated files are always acceptable side effects
      if (f.startsWith('docs/runtime/generated/')) continue;
      unexpectedTouchedFiles.push(f);
    }
  }
}

// ─── Verify canonical state ───────────────────────────────────────────────────

let canonicalStateReadable = false;
let canonicalStateCounts = null;

try {
  const canonicalData = readCanonicalState();
  canonicalStateReadable = true;
  canonicalStateCounts = countTaskStates(canonicalData.wave2OrderedExecutionMap);
} catch (e) {
  requiredFollowup.push(`CRITICAL: Canonical state unreadable after task run: ${e.message}`);
}

// ─── Check task order metadata ────────────────────────────────────────────────

if (taskOrder !== null) {
  if (isNaN(taskOrder) || taskOrder < 1) {
    notes.push(`Invalid --taskOrder value: ${taskOrder}`);
  } else if (canonicalStateReadable) {
    // Try to read canonical state to verify the task
    try {
      const canonicalData = readCanonicalState();
      const task = canonicalData.wave2OrderedExecutionMap.find(
        t => t.execution_order === taskOrder
      );
      if (!task) {
        requiredFollowup.push(`Task with execution_order ${taskOrder} not found in canonical state`);
      } else {
        notes.push(`Verified task ${taskOrder}: "${task.taskName}" (state: ${task.state})`);
      }
    } catch {
      // Already handled above
    }
  }
}

// ─── Check doc sync report ────────────────────────────────────────────────────

let docSyncPassed = null;

if (isReadable(DOC_SYNC_REPORT_OUTPUT)) {
  try {
    const syncReport = JSON.parse(fs.readFileSync(DOC_SYNC_REPORT_OUTPUT, 'utf8'));
    docSyncPassed = syncReport.passed ?? false;
    if (!docSyncPassed) {
      requiredFollowup.push(`Doc sync failed: ${syncReport.mismatchCount} mismatch(es) detected. Re-run check-wave2-doc-sync.mjs for details.`);
    }
  } catch {
    docSyncPassed = null;
    notes.push('Could not read doc-sync-report.json. Run check-wave2-doc-sync.mjs to generate it.');
  }
} else {
  notes.push('doc-sync-report.json not found. Run check-wave2-doc-sync.mjs to verify doc sync.');
}

// ─── Determine validation status ─────────────────────────────────────────────

const hasBlockingIssues = forbiddenTouched.length > 0 || !canonicalStateReadable;
const likelyValidationStatus = hasBlockingIssues ? 'failed' : 'passed';

if (forbiddenTouched.length > 0) {
  requiredFollowup.push(`CRITICAL: ${forbiddenTouched.length} forbidden file(s) were touched: ${forbiddenTouched.join(', ')}`);
}

if (unexpectedTouchedFiles.length > 0 && !hasBlockingIssues) {
  requiredFollowup.push(`Review unexpected touched files: ${unexpectedTouchedFiles.join(', ')}`);
}

// ─── Assemble report ─────────────────────────────────────────────────────────

const report = {
  generatedAt: new Date().toISOString(),
  taskOrder: taskOrder ?? null,
  touchedFiles,
  unexpectedTouchedFiles,
  forbiddenTouched,
  allowedFiles: allowedFiles ?? [],
  forbiddenFiles: forbiddenFiles ?? [],
  docSyncPassed,
  canonicalStateReadable,
  canonicalStateCounts,
  likelyValidationStatus,
  requiredFollowup,
  notes,
  gitAvailable: gitState.gitAvailable,
};

// ─── Write output ─────────────────────────────────────────────────────────────

writeJsonArtifact(POSTFLIGHT_REPORT_OUTPUT, report);

console.log(`[postflight-verify] likelyValidationStatus=${likelyValidationStatus}`);
console.log(`  touchedFiles=${touchedFiles.length} unexpected=${unexpectedTouchedFiles.length} requiredFollowup=${requiredFollowup.length}`);
console.log(`  Written: ${path.relative(REPO_ROOT, POSTFLIGHT_REPORT_OUTPUT)}`);

if (requiredFollowup.length > 0) {
  console.warn('\n  Required followup:');
  for (const item of requiredFollowup) {
    console.warn(`    - ${item}`);
  }
}

if (likelyValidationStatus === 'failed') {
  process.exit(1);
}
