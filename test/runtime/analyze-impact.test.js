/**
 * Tests for risk classification logic (light / medium / heavy).
 *
 * We test the classification rules in isolation by defining the matcher logic
 * directly, mirroring what analyze-impact.mjs does.
 *
 * Uses Node's built-in test runner (node --test).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Mirror the classification rules from analyze-impact.mjs
const HIGH_RISK_FILES = [
  'src/core/context-builder.js',
  'src/core/project-service.js',
  'src/server.js',
];

const CORE_RUNTIME_FILES = [
  'docs/runtime/core-invariants.json',
  'docs/runtime/core-state-pack.schema.json',
  'docs/wave2-canonical-state.json',
];

const MEDIUM_PATTERNS = [
  /^src\/core\/api-routing/,
  /^src\/core\/application-server-bootstrap/,
  /^src\/core\/agent-runtime/,
  /^src\/server\.js$/,
  /^src\/index\.js$/,
];

function classifyFiles(changedFiles) {
  const touchedCoreFiles = changedFiles.filter(f => HIGH_RISK_FILES.includes(f));
  const touchedRuntimeFiles = changedFiles.filter(f => CORE_RUNTIME_FILES.includes(f));
  const touchedIntegrationEdges = changedFiles.filter(f =>
    !HIGH_RISK_FILES.includes(f) && MEDIUM_PATTERNS.some(p => p.test(f))
  );

  let riskLevel;
  let requiresFullRepoRescan = false;
  let requiresPreviousTaskRevalidation = false;
  const reasons = [];

  if (touchedCoreFiles.length > 0 || touchedRuntimeFiles.length > 0) {
    riskLevel = 'heavy';
    requiresFullRepoRescan = true;
    requiresPreviousTaskRevalidation = true;
    reasons.push('High-risk or runtime file modified');
  } else if (touchedIntegrationEdges.length > 0) {
    riskLevel = 'medium';
    requiresPreviousTaskRevalidation = true;
    reasons.push('Integration edge file modified');
  } else if (changedFiles.length === 0) {
    riskLevel = 'light';
    reasons.push('No changed files');
  } else {
    riskLevel = 'light';
    reasons.push('Task-local files only');
  }

  return { riskLevel, requiresFullRepoRescan, requiresPreviousTaskRevalidation, reasons, touchedCoreFiles };
}

// ─── Light classification ────────────────────────────────────────────────────

describe('light risk classification', () => {
  test('no changed files → light', () => {
    const result = classifyFiles([]);
    assert.equal(result.riskLevel, 'light');
    assert.equal(result.requiresFullRepoRescan, false);
  });

  test('task-local files only → light', () => {
    const result = classifyFiles([
      'src/core/approval-gating-module.js',
      'test/approval-gating-module.test.js',
    ]);
    assert.equal(result.riskLevel, 'light');
    assert.equal(result.requiresFullRepoRescan, false);
    assert.equal(result.requiresPreviousTaskRevalidation, false);
  });

  test('only doc files (non-canonical) → light', () => {
    const result = classifyFiles(['docs/v2-wave2-execution-plan.md']);
    assert.equal(result.riskLevel, 'light');
  });

  test('test files only → light', () => {
    const result = classifyFiles(['test/some-module.test.js']);
    assert.equal(result.riskLevel, 'light');
  });
});

// ─── Medium classification ────────────────────────────────────────────────────

describe('medium risk classification', () => {
  test('api-routing file → medium', () => {
    const result = classifyFiles(['src/core/api-routing-middleware-layer.js']);
    assert.equal(result.riskLevel, 'medium');
    assert.equal(result.requiresFullRepoRescan, false);
    assert.equal(result.requiresPreviousTaskRevalidation, true);
  });

  test('application-server-bootstrap → medium', () => {
    const result = classifyFiles(['src/core/application-server-bootstrap.js']);
    assert.equal(result.riskLevel, 'medium');
  });

  test('agent-runtime → medium', () => {
    const result = classifyFiles(['src/core/agent-runtime.js']);
    assert.equal(result.riskLevel, 'medium');
  });

  test('src/index.js → medium', () => {
    const result = classifyFiles(['src/index.js']);
    assert.equal(result.riskLevel, 'medium');
  });
});

// ─── Heavy classification ────────────────────────────────────────────────────

describe('heavy risk classification', () => {
  test('context-builder.js → heavy', () => {
    const result = classifyFiles(['src/core/context-builder.js']);
    assert.equal(result.riskLevel, 'heavy');
    assert.equal(result.requiresFullRepoRescan, true);
    assert.equal(result.requiresPreviousTaskRevalidation, true);
    assert(result.touchedCoreFiles.includes('src/core/context-builder.js'));
  });

  test('project-service.js → heavy', () => {
    const result = classifyFiles(['src/core/project-service.js']);
    assert.equal(result.riskLevel, 'heavy');
    assert.equal(result.requiresFullRepoRescan, true);
  });

  test('src/server.js → heavy', () => {
    const result = classifyFiles(['src/server.js']);
    assert.equal(result.riskLevel, 'heavy');
    assert.equal(result.requiresFullRepoRescan, true);
  });

  test('core-invariants.json → heavy (runtime orchestration)', () => {
    const result = classifyFiles(['docs/runtime/core-invariants.json']);
    assert.equal(result.riskLevel, 'heavy');
    assert.equal(result.requiresFullRepoRescan, true);
  });

  test('wave2-canonical-state.json → heavy', () => {
    const result = classifyFiles(['docs/wave2-canonical-state.json']);
    assert.equal(result.riskLevel, 'heavy');
    assert.equal(result.requiresFullRepoRescan, true);
  });

  test('mix of core and light files → heavy', () => {
    const result = classifyFiles([
      'src/core/context-builder.js',
      'test/some-module.test.js',
    ]);
    assert.equal(result.riskLevel, 'heavy');
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('edge cases', () => {
  test('medium file + light file → medium (medium wins)', () => {
    const result = classifyFiles([
      'src/core/api-routing-middleware-layer.js',
      'src/core/approval-gating-module.js',
    ]);
    assert.equal(result.riskLevel, 'medium');
  });

  test('heavy file takes priority over medium file', () => {
    const result = classifyFiles([
      'src/core/context-builder.js',
      'src/core/api-routing-middleware-layer.js',
    ]);
    assert.equal(result.riskLevel, 'heavy');
  });
});
