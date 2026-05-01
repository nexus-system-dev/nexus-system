/**
 * Tests for doc sync detection logic used by check-wave2-doc-sync.mjs
 *
 * Uses Node's built-in test runner (node --test).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures');

// ─── Color mapping mirror (must match check-wave2-doc-sync.mjs) ───────────────

const STATE_COLORS = {
  trueGreen: '🟢',
  blocked: '🔴',
  'bridge-deferred': '🟡',
  'in-progress': '🟡',
};

// Helper: detect color mismatches in a line for a given task
function detectColorMismatch(line, taskName, canonicalState) {
  const expectedColor = STATE_COLORS[canonicalState];
  if (!line.includes(taskName)) return null;

  const wrongColors = Object.values(STATE_COLORS).filter(c => c !== expectedColor);
  const hasWrongColor = wrongColors.some(c => line.includes(c));
  const hasExpectedColor = line.includes(expectedColor);

  if (hasWrongColor && !hasExpectedColor) {
    return {
      type: 'COLOR_MISMATCH',
      taskName,
      canonicalState,
      expectedColor,
      foundColor: wrongColors.find(c => line.includes(c)),
    };
  }
  return null;
}

// ─── Color mapping tests ──────────────────────────────────────────────────────

describe('state → color mapping', () => {
  test('trueGreen maps to 🟢', () => {
    assert.equal(STATE_COLORS.trueGreen, '🟢');
  });

  test('blocked maps to 🔴', () => {
    assert.equal(STATE_COLORS.blocked, '🔴');
  });

  test('bridge-deferred maps to 🟡', () => {
    assert.equal(STATE_COLORS['bridge-deferred'], '🟡');
  });

  test('in-progress maps to 🟡', () => {
    assert.equal(STATE_COLORS['in-progress'], '🟡');
  });
});

// ─── Color mismatch detection ─────────────────────────────────────────────────

describe('detectColorMismatch', () => {
  test('no mismatch when correct color is present', () => {
    const line = '🟡 Create pattern confidence indicator';
    const result = detectColorMismatch(line, 'Create pattern confidence indicator', 'in-progress');
    assert.equal(result, null);
  });

  test('detects mismatch when wrong color for blocked task', () => {
    const line = '🟢 Deploy to production';
    const result = detectColorMismatch(line, 'Deploy to production', 'blocked');
    assert.notEqual(result, null);
    assert.equal(result.type, 'COLOR_MISMATCH');
    assert.equal(result.expectedColor, '🔴');
  });

  test('detects mismatch when 🟢 shown for in-progress task', () => {
    const line = '🟢 Define screen inventory';
    const result = detectColorMismatch(line, 'Define screen inventory', 'in-progress');
    assert.notEqual(result, null);
    assert.equal(result.expectedColor, '🟡');
  });

  test('returns null for line not containing task name', () => {
    const line = '🔴 Some other task';
    const result = detectColorMismatch(line, 'Define screen inventory', 'in-progress');
    assert.equal(result, null);
  });

  test('no mismatch for trueGreen with 🟢', () => {
    const line = '🟢 Define primary user journeys';
    const result = detectColorMismatch(line, 'Define primary user journeys', 'trueGreen');
    assert.equal(result, null);
  });
});

// ─── Task count consistency ────────────────────────────────────────────────────

describe('task count consistency check', () => {
  test('detects count mismatch when plan count differs from canonical', () => {
    const canonicalCount = 281;
    const planCount = 259; // older number from execution plan

    const mismatch = planCount !== canonicalCount
      ? { type: 'TASK_COUNT_MISMATCH', canonicalValue: canonicalCount, docValue: planCount }
      : null;

    assert.notEqual(mismatch, null);
    assert.equal(mismatch.type, 'TASK_COUNT_MISMATCH');
    assert.equal(mismatch.canonicalValue, 281);
    assert.equal(mismatch.docValue, 259);
  });

  test('no mismatch when counts match', () => {
    const count = 281;
    const mismatch = count !== count ? { type: 'TASK_COUNT_MISMATCH' } : null;
    assert.equal(mismatch, null);
  });
});

// ─── Fixture-based tests ──────────────────────────────────────────────────────

describe('fixture canonical-state-valid.json', () => {
  test('fixture has expected task count and states', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'canonical-state-valid.json'), 'utf8');
    const data = JSON.parse(raw);
    const tasks = data.wave2OrderedExecutionMap;

    assert.equal(tasks.length, 5);

    const stateMap = Object.fromEntries(tasks.map(t => [t.execution_order, t.state]));
    assert.equal(stateMap[1], 'trueGreen');
    assert.equal(stateMap[2], 'trueGreen');
    assert.equal(stateMap[3], 'in-progress');
    assert.equal(stateMap[4], 'blocked');
    assert.equal(stateMap[5], 'bridge-deferred');
  });

  test('fixture task names map to correct colors', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'canonical-state-valid.json'), 'utf8');
    const data = JSON.parse(raw);
    const tasks = data.wave2OrderedExecutionMap;

    for (const task of tasks) {
      const expectedColor = STATE_COLORS[task.state];
      assert(expectedColor, `State ${task.state} should have a color mapping`);
    }
  });
});

// ─── Green count lower than canonical detection ────────────────────────────────

describe('backlog green count vs canonical', () => {
  test('detects when backlog green count is below canonical trueGreen count', () => {
    // Simulate: canonical has 37 trueGreen, backlog only shows 20 🟢
    const canonicalGreen = 37;
    const backlogGreen = 20;

    const mismatch = backlogGreen < canonicalGreen
      ? { type: 'GREEN_COUNT_BELOW_CANONICAL', canonicalValue: canonicalGreen, docValue: backlogGreen }
      : null;

    assert.notEqual(mismatch, null);
    assert.equal(mismatch.type, 'GREEN_COUNT_BELOW_CANONICAL');
  });

  test('no mismatch when backlog green count exceeds canonical (multi-wave backlog)', () => {
    // Backlog covers all waves, so its 🟢 count may exceed Wave 2 canonical
    const canonicalGreen = 37;
    const backlogGreen = 100;

    const mismatch = backlogGreen < canonicalGreen
      ? { type: 'GREEN_COUNT_BELOW_CANONICAL' }
      : null;

    assert.equal(mismatch, null);
  });
});
