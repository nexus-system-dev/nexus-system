/**
 * Canonical path constants for the Nexus runtime tooling.
 * All scripts must import paths from here to stay consistent.
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Repository root: scripts/lib/../../  => repo root
export const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Canonical source files (authoritative)
export const CANONICAL_STATE_FILE = path.join(REPO_ROOT, 'docs', 'wave2-canonical-state.json');
export const EXECUTION_PLAN_FILE = path.join(REPO_ROOT, 'docs', 'v2-wave2-execution-plan.md');
export const BACKLOG_FILE = path.join(REPO_ROOT, 'docs', 'backlog-unified-status-and-order.md');

// Runtime manifest files
export const CORE_INVARIANTS_FILE = path.join(REPO_ROOT, 'docs', 'runtime', 'core-invariants.json');
export const STATE_PACK_SCHEMA_FILE = path.join(REPO_ROOT, 'docs', 'runtime', 'core-state-pack.schema.json');

// Generated output directory
export const GENERATED_DIR = path.join(REPO_ROOT, 'docs', 'runtime', 'generated');

// Generated artifact paths
export const CORE_STATE_PACK_OUTPUT = path.join(GENERATED_DIR, 'core-state-pack.json');
export const INVARIANTS_REPORT_OUTPUT = path.join(GENERATED_DIR, 'core-invariants-report.json');
export const IMPACT_REPORT_OUTPUT = path.join(GENERATED_DIR, 'impact-report.json');
export const DOC_SYNC_REPORT_OUTPUT = path.join(GENERATED_DIR, 'doc-sync-report.json');
export const PREFLIGHT_SUMMARY_OUTPUT = path.join(GENERATED_DIR, 'preflight-summary.json');
export const POSTFLIGHT_REPORT_OUTPUT = path.join(GENERATED_DIR, 'postflight-report.json');

// High-risk core files (relative to repo root)
export const HIGH_RISK_CORE_FILES_REL = [
  'src/core/context-builder.js',
  'src/core/project-service.js',
  'src/server.js',
];

export const HIGH_RISK_CORE_FILES = HIGH_RISK_CORE_FILES_REL.map(f => path.join(REPO_ROOT, f));

// Core runtime orchestration files (relative to repo root)
export const CORE_RUNTIME_FILES_REL = [
  'docs/runtime/core-invariants.json',
  'docs/runtime/core-state-pack.schema.json',
  'docs/wave2-canonical-state.json',
];

export const CORE_RUNTIME_FILES = CORE_RUNTIME_FILES_REL.map(f => path.join(REPO_ROOT, f));

// Valid task state values
export const VALID_TASK_STATES = ['trueGreen', 'blocked', 'bridge-deferred', 'in-progress'];
