/**
 * Tests for invariant validation logic used by check-core-invariants.mjs
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

const libPath = path.join(__dirname, '..', '..', 'scripts', 'lib', 'canonical.mjs');
const { validateTaskStates, validateExecutionOrderSequence } = await import(libPath);

// ─── validateTaskStates ───────────────────────────────────────────────────────

describe('validateTaskStates', () => {
  test('returns empty array for all valid states', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'in-progress' },
      { execution_order: 3, taskName: 'C', state: 'blocked' },
      { execution_order: 4, taskName: 'D', state: 'bridge-deferred' },
    ];
    const violations = validateTaskStates(tasks);
    assert.equal(violations.length, 0);
  });

  test('detects invalid state "completed"', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'completed' },
    ];
    const violations = validateTaskStates(tasks);
    assert.equal(violations.length, 1);
    assert.equal(violations[0].execution_order, 2);
    assert.equal(violations[0].invalidState, 'completed');
  });

  test('detects multiple invalid states', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'completed' },
      { execution_order: 2, taskName: 'B', state: 'pending' },
      { execution_order: 3, taskName: 'C', state: 'trueGreen' },
    ];
    const violations = validateTaskStates(tasks);
    assert.equal(violations.length, 2);
  });

  test('all four valid states pass', () => {
    const validStates = ['trueGreen', 'blocked', 'bridge-deferred', 'in-progress'];
    for (const state of validStates) {
      const tasks = [{ execution_order: 1, taskName: 'T', state }];
      const violations = validateTaskStates(tasks);
      assert.equal(violations.length, 0, `Expected no violations for state "${state}"`);
    }
  });

  test('violation has correct rule name', () => {
    const tasks = [{ execution_order: 1, taskName: 'X', state: 'done' }];
    const violations = validateTaskStates(tasks);
    assert.equal(violations[0].rule, 'valid-task-states');
    assert(violations[0].message.includes('invalid state'));
  });

  test('fixture: invalid state file has 2 violations', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'canonical-state-invalid-state.json'), 'utf8');
    const data = JSON.parse(raw);
    const violations = validateTaskStates(data.wave2OrderedExecutionMap);
    assert.equal(violations.length, 2);
    const invalidStates = violations.map(v => v.invalidState).sort();
    assert.deepEqual(invalidStates, ['completed', 'pending']);
  });
});

// ─── validateExecutionOrderSequence ──────────────────────────────────────────

describe('validateExecutionOrderSequence', () => {
  test('returns empty array for sequential orders starting at 1', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'in-progress' },
      { execution_order: 3, taskName: 'C', state: 'blocked' },
    ];
    const violations = validateExecutionOrderSequence(tasks);
    assert.equal(violations.length, 0);
  });

  test('detects gap in sequence', () => {
    const tasks = [
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 3, taskName: 'C', state: 'in-progress' },
    ];
    const violations = validateExecutionOrderSequence(tasks);
    assert.equal(violations.length, 1);
    assert(violations[0].message.includes('Gap'));
  });

  test('detects sequence not starting at 1', () => {
    const tasks = [
      { execution_order: 2, taskName: 'B', state: 'trueGreen' },
      { execution_order: 3, taskName: 'C', state: 'in-progress' },
    ];
    const violations = validateExecutionOrderSequence(tasks);
    assert.equal(violations.length, 1);
    assert(violations[0].message.includes('does not start at 1'));
  });

  test('handles unsorted input — still validates sequence', () => {
    // Valid but unsorted input
    const tasks = [
      { execution_order: 3, taskName: 'C', state: 'blocked' },
      { execution_order: 1, taskName: 'A', state: 'trueGreen' },
      { execution_order: 2, taskName: 'B', state: 'in-progress' },
    ];
    const violations = validateExecutionOrderSequence(tasks);
    assert.equal(violations.length, 0);
  });

  test('returns empty for empty task list', () => {
    const violations = validateExecutionOrderSequence([]);
    assert.equal(violations.length, 0);
  });

  test('fixture: canonical-state-gap.json has 1 sequence violation', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'canonical-state-gap.json'), 'utf8');
    const data = JSON.parse(raw);
    const violations = validateExecutionOrderSequence(data.wave2OrderedExecutionMap);
    assert.equal(violations.length, 1);
    assert.equal(violations[0].rule, 'canonical-ordering-immutable');
  });
});

// ─── Core invariants JSON ─────────────────────────────────────────────────────

describe('core-invariants.json manifest', () => {
  const manifestPath = path.join(__dirname, '..', '..', 'docs', 'runtime', 'core-invariants.json');

  test('manifest file exists', () => {
    assert(fs.existsSync(manifestPath), `Expected ${manifestPath} to exist`);
  });

  test('manifest has validTaskStates with 4 allowed values', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(Array.isArray(manifest.validTaskStates.allowedValues));
    assert.equal(manifest.validTaskStates.allowedValues.length, 4);
  });

  test('manifest allowed states match expected values', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const allowed = manifest.validTaskStates.allowedValues.sort();
    assert.deepEqual(allowed, ['blocked', 'bridge-deferred', 'in-progress', 'trueGreen']);
  });

  test('manifest has highRiskCoreFiles with 3 entries', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(Array.isArray(manifest.highRiskCoreFiles.files));
    assert.equal(manifest.highRiskCoreFiles.files.length, 3);
  });

  test('manifest color mapping covers all 4 states', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const mapping = manifest.colorMapping.mapping;
    assert.equal(mapping.trueGreen, '🟢');
    assert.equal(mapping.blocked, '🔴');
    assert.equal(mapping['bridge-deferred'], '🟡');
    assert.equal(mapping['in-progress'], '🟡');
  });
});
