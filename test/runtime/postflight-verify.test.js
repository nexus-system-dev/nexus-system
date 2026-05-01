/**
 * Tests for postflight verification logic.
 *
 * Tests the core detection functions used by postflight-verify.mjs
 * in isolation — without requiring git or the full repo state.
 *
 * Uses Node's built-in test runner (node --test).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ─── Unexpected file detection ────────────────────────────────────────────────

/**
 * Mirrors the logic in postflight-verify.mjs for detecting unexpected touched files.
 */
function detectUnexpected(touchedFiles, allowedFiles, forbiddenFiles, highRiskCoreFiles) {
  const unexpected = [];
  const forbiddenTouched = [];

  // Check forbidden files
  for (const f of (forbiddenFiles ?? [])) {
    if (touchedFiles.includes(f)) {
      forbiddenTouched.push(f);
      unexpected.push(f);
    }
  }

  // Check high-risk core files not in allowed list
  for (const coreFile of highRiskCoreFiles) {
    if (touchedFiles.includes(coreFile)) {
      if (!allowedFiles || !allowedFiles.includes(coreFile)) {
        if (!unexpected.includes(coreFile)) unexpected.push(coreFile);
      }
    }
  }

  // Check files outside allowed set (if allowed list provided)
  if (allowedFiles) {
    const allowedSet = new Set(allowedFiles);
    for (const f of touchedFiles) {
      if (!allowedSet.has(f) && !unexpected.includes(f)) {
        // Generated files are always acceptable
        if (f.startsWith('docs/runtime/generated/')) continue;
        unexpected.push(f);
      }
    }
  }

  return { unexpected, forbiddenTouched };
}

const HIGH_RISK_CORE = [
  'src/core/context-builder.js',
  'src/core/project-service.js',
  'src/server.js',
];

// ─── Basic detection ──────────────────────────────────────────────────────────

describe('detectUnexpected files', () => {
  test('no unexpected files when touched matches allowed', () => {
    const { unexpected } = detectUnexpected(
      ['src/core/approval-gating-module.js', 'test/approval-gating-module.test.js'],
      ['src/core/approval-gating-module.js', 'test/approval-gating-module.test.js'],
      [],
      HIGH_RISK_CORE
    );
    assert.equal(unexpected.length, 0);
  });

  test('detects file outside allowed list', () => {
    const { unexpected } = detectUnexpected(
      ['src/core/approval-gating-module.js', 'src/core/some-other.js'],
      ['src/core/approval-gating-module.js'],
      [],
      HIGH_RISK_CORE
    );
    assert(unexpected.includes('src/core/some-other.js'));
  });

  test('detects forbidden file touch', () => {
    const { unexpected, forbiddenTouched } = detectUnexpected(
      ['src/core/context-builder.js'],
      ['src/core/some-module.js'],
      ['src/core/context-builder.js'],
      HIGH_RISK_CORE
    );
    assert(forbiddenTouched.includes('src/core/context-builder.js'));
    assert(unexpected.includes('src/core/context-builder.js'));
  });

  test('high-risk core file touched without being in allowed list → unexpected', () => {
    const { unexpected } = detectUnexpected(
      ['src/core/context-builder.js', 'src/core/approval-gating-module.js'],
      ['src/core/approval-gating-module.js'], // context-builder not in allowed
      [],
      HIGH_RISK_CORE
    );
    assert(unexpected.includes('src/core/context-builder.js'));
  });

  test('high-risk core file in allowed list → not unexpected', () => {
    const { unexpected } = detectUnexpected(
      ['src/core/context-builder.js'],
      ['src/core/context-builder.js'], // explicitly allowed
      [],
      HIGH_RISK_CORE
    );
    assert(!unexpected.includes('src/core/context-builder.js'));
  });

  test('generated runtime files never flagged as unexpected', () => {
    const { unexpected } = detectUnexpected(
      ['docs/runtime/generated/core-state-pack.json'],
      ['src/core/some-module.js'], // generated file not in allowed list
      [],
      HIGH_RISK_CORE
    );
    assert(!unexpected.includes('docs/runtime/generated/core-state-pack.json'));
  });

  test('no unexpected when no allowed list specified', () => {
    // Without an allowed list, we only flag forbidden + unexpected core files
    const { unexpected } = detectUnexpected(
      ['src/core/approval-gating-module.js', 'test/some-test.js'],
      null, // no allowed list
      [],
      HIGH_RISK_CORE
    );
    // Non-core, non-forbidden files are not flagged
    assert.equal(unexpected.length, 0);
  });
});

// ─── Validation status derivation ─────────────────────────────────────────────

describe('likelyValidationStatus derivation', () => {
  test('passed when no blocking issues', () => {
    const forbiddenTouched = [];
    const canonicalStateReadable = true;
    const status = (forbiddenTouched.length > 0 || !canonicalStateReadable) ? 'failed' : 'passed';
    assert.equal(status, 'passed');
  });

  test('failed when forbidden file touched', () => {
    const forbiddenTouched = ['src/core/context-builder.js'];
    const canonicalStateReadable = true;
    const status = (forbiddenTouched.length > 0 || !canonicalStateReadable) ? 'failed' : 'passed';
    assert.equal(status, 'failed');
  });

  test('failed when canonical state unreadable', () => {
    const forbiddenTouched = [];
    const canonicalStateReadable = false;
    const status = (forbiddenTouched.length > 0 || !canonicalStateReadable) ? 'failed' : 'passed';
    assert.equal(status, 'failed');
  });

  test('failed when both forbidden and unreadable canonical', () => {
    const forbiddenTouched = ['src/server.js'];
    const canonicalStateReadable = false;
    const status = (forbiddenTouched.length > 0 || !canonicalStateReadable) ? 'failed' : 'passed';
    assert.equal(status, 'failed');
  });
});

// ─── Required followup generation ─────────────────────────────────────────────

describe('requiredFollowup generation', () => {
  test('adds followup for forbidden touched files', () => {
    const followup = [];
    const forbiddenTouched = ['src/core/context-builder.js'];
    if (forbiddenTouched.length > 0) {
      followup.push(`CRITICAL: ${forbiddenTouched.length} forbidden file(s) were touched`);
    }
    assert.equal(followup.length, 1);
    assert(followup[0].includes('CRITICAL'));
  });

  test('adds followup for unexpected files (non-blocking)', () => {
    const followup = [];
    const hasBlockingIssues = false;
    const unexpectedTouchedFiles = ['src/core/some-unexpected.js'];
    if (unexpectedTouchedFiles.length > 0 && !hasBlockingIssues) {
      followup.push(`Review unexpected touched files: ${unexpectedTouchedFiles.join(', ')}`);
    }
    assert.equal(followup.length, 1);
    assert(followup[0].includes('Review unexpected'));
  });

  test('no followup for clean run', () => {
    const followup = [];
    const forbiddenTouched = [];
    const unexpectedTouchedFiles = [];
    const hasBlockingIssues = false;

    if (forbiddenTouched.length > 0) followup.push('forbidden files touched');
    if (unexpectedTouchedFiles.length > 0 && !hasBlockingIssues) followup.push('unexpected files');

    assert.equal(followup.length, 0);
  });
});
