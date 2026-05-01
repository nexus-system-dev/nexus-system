#!/usr/bin/env node
/**
 * check-wave2-doc-sync.mjs
 *
 * Read-only checker that compares the three Wave 2 tracking documents for consistency:
 *   1. docs/wave2-canonical-state.json (authoritative)
 *   2. docs/v2-wave2-execution-plan.md
 *   3. docs/backlog-unified-status-and-order.md
 *
 * Reports exact mismatches in task counts, task names, and color indicators.
 * Does NOT auto-fix anything.
 *
 * Usage: node scripts/check-wave2-doc-sync.mjs
 *
 * Output: docs/runtime/generated/doc-sync-report.json
 * Exit code: 0 = all synced, 1 = mismatches found
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  REPO_ROOT,
  CANONICAL_STATE_FILE,
  EXECUTION_PLAN_FILE,
  BACKLOG_FILE,
  DOC_SYNC_REPORT_OUTPUT,
} from './lib/paths.mjs';

import { readCanonicalState } from './lib/canonical.mjs';
import { isReadable, writeJsonArtifact } from './lib/fs-utils.mjs';

// Color mapping: canonical state → markdown color emoji
const STATE_COLORS = {
  trueGreen: '🟢',
  blocked: '🔴',
  'bridge-deferred': '🟡',
  'in-progress': '🟡',
};

const mismatches = [];
const warnings = [];
const notes = [];

// ─── Load canonical state ─────────────────────────────────────────────────────

const canonicalData = readCanonicalState(); // throws loudly on failure
const tasks = canonicalData.wave2OrderedExecutionMap;

// ─── Check execution plan readability ────────────────────────────────────────

const executionPlanReadable = isReadable(EXECUTION_PLAN_FILE);
const backlogReadable = isReadable(BACKLOG_FILE);

if (!executionPlanReadable) {
  mismatches.push({
    file: path.relative(REPO_ROOT, EXECUTION_PLAN_FILE),
    type: 'FILE_UNREADABLE',
    message: 'v2-wave2-execution-plan.md is not readable',
  });
}

if (!backlogReadable) {
  mismatches.push({
    file: path.relative(REPO_ROOT, BACKLOG_FILE),
    type: 'FILE_UNREADABLE',
    message: 'backlog-unified-status-and-order.md is not readable',
  });
}

// ─── Parse execution plan for task name presence ──────────────────────────────

/**
 * Checks whether a task name appears in a document.
 * Returns true if the exact task name (or a close variant) is present.
 */
function taskNameInDoc(taskName, docContent) {
  return docContent.includes(taskName);
}

/**
 * Extracts the execution_order count mentioned in the execution plan snapshot section.
 * The plan has a "Current Snapshot" section with total task count.
 * Returns null if not found.
 */
function extractExecutionPlanTaskCount(content) {
  // Pattern: "סך הכל משימות ב־`Wave 2`: `259`" or similar
  const match = content.match(/סך הכל משימות.*?`(\d+)`/);
  if (match) return parseInt(match[1], 10);

  // English fallback
  const matchEn = content.match(/Total.*?tasks.*?(\d+)/i);
  if (matchEn) return parseInt(matchEn[1], 10);

  return null;
}

// ─── Analyze execution plan ───────────────────────────────────────────────────

if (executionPlanReadable) {
  const planContent = fs.readFileSync(EXECUTION_PLAN_FILE, 'utf8');

  // Check stated task count in execution plan vs canonical
  const planTaskCount = extractExecutionPlanTaskCount(planContent);
  if (planTaskCount !== null && planTaskCount !== tasks.length) {
    mismatches.push({
      file: path.relative(REPO_ROOT, EXECUTION_PLAN_FILE),
      type: 'TASK_COUNT_MISMATCH',
      message: `Execution plan states ${planTaskCount} total tasks but canonical state has ${tasks.length}`,
      canonicalValue: tasks.length,
      docValue: planTaskCount,
    });
  } else if (planTaskCount === null) {
    notes.push({
      file: path.relative(REPO_ROOT, EXECUTION_PLAN_FILE),
      type: 'TASK_COUNT_NOT_FOUND',
      message: 'Could not extract task count from execution plan Current Snapshot section',
    });
  }

  // Check that the execution plan notes wave2-canonical-state.json as authoritative
  if (!planContent.includes('wave2-canonical-state.json')) {
    warnings.push({
      file: path.relative(REPO_ROOT, EXECUTION_PLAN_FILE),
      type: 'AUTHORITY_NOTE_MISSING',
      message: 'Execution plan does not reference wave2-canonical-state.json as authoritative',
    });
  }

  // Check first 10 task names: they should appear in the execution plan
  // (The execution plan has full task specifications)
  let foundInPlan = 0;
  let checkedInPlan = 0;
  const sampleSize = Math.min(10, tasks.length);

  for (let i = 0; i < sampleSize; i++) {
    const task = tasks[i];
    checkedInPlan++;
    if (taskNameInDoc(task.taskName, planContent)) foundInPlan++;
  }

  if (foundInPlan < sampleSize) {
    warnings.push({
      file: path.relative(REPO_ROOT, EXECUTION_PLAN_FILE),
      type: 'TASK_NAME_COVERAGE_LOW',
      message: `Only ${foundInPlan}/${checkedInPlan} sampled canonical task names found in execution plan. The plan may use different task name wording than canonical state.`,
      foundCount: foundInPlan,
      checkedCount: checkedInPlan,
    });
  }
}

// ─── Analyze backlog ──────────────────────────────────────────────────────────

if (backlogReadable) {
  const backlogContent = fs.readFileSync(BACKLOG_FILE, 'utf8');

  // Count green emoji in backlog (🟢) vs trueGreen count in canonical
  const greenCount = (backlogContent.match(/🟢/g) ?? []).length;
  const canonicalGreen = tasks.filter(t => t.state === 'trueGreen').length;

  // The backlog may have more 🟢 than just Wave 2 trueGreen tasks (it covers all waves).
  // We just note the discrepancy if backlog green count is dramatically lower than canonical.
  if (greenCount < canonicalGreen) {
    mismatches.push({
      file: path.relative(REPO_ROOT, BACKLOG_FILE),
      type: 'GREEN_COUNT_BELOW_CANONICAL',
      message: `Backlog has ${greenCount} 🟢 indicators but canonical Wave 2 has ${canonicalGreen} trueGreen tasks. The backlog may be behind canonical state.`,
      canonicalValue: canonicalGreen,
      docValue: greenCount,
    });
  } else {
    notes.push({
      file: path.relative(REPO_ROOT, BACKLOG_FILE),
      type: 'GREEN_COUNT_OK',
      message: `Backlog has ${greenCount} 🟢 indicators vs canonical ${canonicalGreen} trueGreen tasks (backlog may cover multiple waves).`,
    });
  }

  // Check that blocked tasks have 🔴 in backlog (sample first 5 blocked tasks)
  const blockedTasks = tasks.filter(t => t.state === 'blocked').slice(0, 5);
  for (const task of blockedTasks) {
    if (!taskNameInDoc(task.taskName, backlogContent)) {
      notes.push({
        file: path.relative(REPO_ROOT, BACKLOG_FILE),
        type: 'BLOCKED_TASK_NOT_FOUND',
        message: `Blocked task "${task.taskName}" (order ${task.execution_order}) not found by name in backlog document`,
        execution_order: task.execution_order,
        taskName: task.taskName,
      });
    }
  }
}

// ─── Cross-document state color consistency check ─────────────────────────────

// Check a sample of tasks: their canonical state should map to the correct
// color emoji if they appear in markdown documents.
// We check the first 5 non-trueGreen tasks in each tracked markdown file.

function checkColorConsistency(docContent, docPath) {
  const localMismatches = [];
  const nonGreenTasks = tasks.filter(t => t.state !== 'trueGreen').slice(0, 10);

  for (const task of nonGreenTasks) {
    if (!taskNameInDoc(task.taskName, docContent)) continue;

    const expectedColor = STATE_COLORS[task.state];
    if (!expectedColor) continue;

    // Find the line(s) containing this task name
    const lines = docContent.split('\n');
    const taskLines = lines.filter(l => l.includes(task.taskName));

    for (const line of taskLines) {
      // Check if the correct color appears near this task name
      const hasExpectedColor = line.includes(expectedColor);
      // Check if a wrong color appears (e.g., 🟢 for an in-progress task)
      const wrongColors = Object.values(STATE_COLORS).filter(c => c !== expectedColor);
      const hasWrongColor = wrongColors.some(c => line.includes(c));

      if (hasWrongColor && !hasExpectedColor) {
        const foundColor = wrongColors.find(c => line.includes(c));
        localMismatches.push({
          file: docPath,
          type: 'COLOR_MISMATCH',
          execution_order: task.execution_order,
          taskName: task.taskName,
          canonicalState: task.state,
          expectedColor,
          foundColor,
          message: `Task "${task.taskName}" (order ${task.execution_order}) has canonical state "${task.state}" (expected ${expectedColor}) but line shows ${foundColor}`,
          lineContent: line.trim().slice(0, 120),
        });
      }
    }
  }
  return localMismatches;
}

if (executionPlanReadable) {
  const planContent = fs.readFileSync(EXECUTION_PLAN_FILE, 'utf8');
  const colorMismatches = checkColorConsistency(
    planContent,
    path.relative(REPO_ROOT, EXECUTION_PLAN_FILE)
  );
  mismatches.push(...colorMismatches);
}

if (backlogReadable) {
  const backlogContent = fs.readFileSync(BACKLOG_FILE, 'utf8');
  const colorMismatches = checkColorConsistency(
    backlogContent,
    path.relative(REPO_ROOT, BACKLOG_FILE)
  );
  mismatches.push(...colorMismatches);
}

// ─── Assemble report ─────────────────────────────────────────────────────────

const passed = mismatches.length === 0;

const report = {
  generatedAt: new Date().toISOString(),
  passed,
  mismatchCount: mismatches.length,
  warningCount: warnings.length,
  noteCount: notes.length,
  mismatches,
  warnings,
  notes,
  canonicalTaskCount: tasks.length,
  files: {
    canonicalState: path.relative(REPO_ROOT, CANONICAL_STATE_FILE),
    executionPlan: {
      path: path.relative(REPO_ROOT, EXECUTION_PLAN_FILE),
      readable: executionPlanReadable,
    },
    backlog: {
      path: path.relative(REPO_ROOT, BACKLOG_FILE),
      readable: backlogReadable,
    },
  },
};

// ─── Write output ─────────────────────────────────────────────────────────────

writeJsonArtifact(DOC_SYNC_REPORT_OUTPUT, report);

console.log(`[check-wave2-doc-sync] ${passed ? 'PASSED' : 'FAILED'} — ${mismatches.length} mismatch(es), ${warnings.length} warning(s), ${notes.length} note(s)`);
console.log(`  Written: ${path.relative(REPO_ROOT, DOC_SYNC_REPORT_OUTPUT)}`);

if (!passed) {
  for (const m of mismatches) {
    console.error(`  [MISMATCH] ${m.type}: ${m.message}`);
  }
  process.exit(1);
}
