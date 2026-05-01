/**
 * Tests for canonical state parsing utilities used by generate-core-state-pack.mjs
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

// ─── Import lib functions directly ───────────────────────────────────────────
// We test the library functions, not the script's side effects

const libPath = path.join(__dirname, '..', '..', 'scripts', 'lib', 'canonical.mjs');

// Dynamic import to handle ES modules
const {
  countTaskStates,
  findActiveTask,
  findPreviousTask,
  validateTaskStates,
  validateExecutionOrderSequence,
} = await import(libPath);

// ─── countTaskStates ─────────────────────────────────────────────────────────

describe('countTaskStates', () => {
  test('counts all four state types correctly', () => {
    const tasks = [
      { state: 'trueGreen' },
      { state: 'trueGreen' },
      { state: 'in-progress' },
      { state: 'blocked' },
      { state: 'bridge-deferred' },
    ];
    const counts = countTaskStates(tasks);
    assert.equal(counts.trueGreen, 2);
    assert.equal(counts['in-progress'], 1);
    assert.equal(counts.blocked, 1);
    assert.equal(counts['bridge-deferred'], 1);
  });

  test('returns zeros for empty task list', () => {
    const counts = countTaskStates([]);
    assert.equal(counts.trueGreen, 0);
    assert.equal(counts['in-progress'], 0);
    assert.equal(counts.blocked, 0);
    assert.equal(counts['bridge-deferred'], 0);
  });

  test('ignores unknown states in count (does not throw)', () => {
    const tasks = [
      { state: 'trueGreen' },
      { state: 'unknown-invalid' },
    ];
    // Should not throw; invalid states are not counted
    const counts = countTaskStates(tasks);
    assert.equal(counts.trueGreen, 1);
    assert.equal(counts['in-progress'], 0);
  });
});

// ─── findActiveTask ───────────────────────────────────────────────────────────

describe('findActiveTask', () => {
  test('returns lowest non-trueGreen task', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'trueGreen' },
      { execution_order: 3, taskName: 'C', state: 'in-progress' },
      { execution_order: 4, taskName: 'D', state: 'blocked' },
    ];
    const active = findActiveTask(tasks);
    assert.equal(active.execution_order, 3);
    assert.equal(active.taskName, 'C');
  });

  test('returns null when all tasks are trueGreen', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'trueGreen' },
    ];
    const active = findActiveTask(tasks);
    assert.equal(active, null);
  });

  test('handles unsorted input — finds lowest execution_order', () => {
    const tasks = [
      { execution_order: 5, taskName: 'E', state: 'in-progress' },
      { execution_order: 3, taskName: 'C', state: 'blocked' },
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'trueGreen' },
    ];
    const active = findActiveTask(tasks);
    assert.equal(active.execution_order, 3);
  });

  test('includes blocked tasks as non-trueGreen', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'blocked' },
    ];
    const active = findActiveTask(tasks);
    assert.equal(active.execution_order, 2);
    assert.equal(active.state, 'blocked');
  });

  test('includes bridge-deferred tasks as non-trueGreen', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'bridge-deferred' },
    ];
    const active = findActiveTask(tasks);
    assert.equal(active.execution_order, 2);
    assert.equal(active.state, 'bridge-deferred');
  });
});

// ─── findPreviousTask ────────────────────────────────────────────────────────

describe('findPreviousTask', () => {
  test('returns task immediately before active task', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'trueGreen' },
      { execution_order: 3, taskName: 'C', state: 'in-progress' },
    ];
    const activeTask = { execution_order: 3, taskName: 'C', state: 'in-progress' };
    const prev = findPreviousTask(tasks, activeTask);
    assert.equal(prev.execution_order, 2);
    assert.equal(prev.taskName, 'B');
  });

  test('returns null if active task is first', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'in-progress' },
    ];
    const activeTask = { execution_order: 1, taskName: 'A', state: 'in-progress' };
    const prev = findPreviousTask(tasks, activeTask);
    assert.equal(prev, null);
  });

  test('returns null if activeTask is null', () => {
    const tasks = [{ execution_order: 1, taskName: 'A', state: 'trueGreen' }];
    const prev = findPreviousTask(tasks, null);
    assert.equal(prev, null);
  });
});

// ─── Real fixture parsing ────────────────────────────────────────────────────

describe('fixture: canonical-state-valid.json', () => {
  test('parses valid fixture correctly', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'canonical-state-valid.json'), 'utf8');
    const data = JSON.parse(raw);
    const tasks = data.wave2OrderedExecutionMap;

    assert.equal(tasks.length, 5);

    const counts = countTaskStates(tasks);
    assert.equal(counts.trueGreen, 2);
    assert.equal(counts['in-progress'], 1);
    assert.equal(counts.blocked, 1);
    assert.equal(counts['bridge-deferred'], 1);

    const active = findActiveTask(tasks);
    assert.equal(active.execution_order, 3);
    assert.equal(active.taskName, 'Define screen inventory');
  });
});

describe('fixture: all-truegreen.json', () => {
  test('returns null active task when all are trueGreen', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'all-truegreen.json'), 'utf8');
    const data = JSON.parse(raw);
    const active = findActiveTask(data.wave2OrderedExecutionMap);
    assert.equal(active, null);
  });
});
