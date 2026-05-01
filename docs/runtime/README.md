# Nexus Runtime Tooling — docs/runtime/

This directory contains the **local deterministic execution support layer** for Wave 2 orchestration.

## Purpose

Wave 2 execution involves 281 tasks tracked across three canonical documents. Without a local state layer, each Codex turn must re-read the full repository, parse canonical JSON, re-derive the active task, re-check doc sync, and re-evaluate risk — repeating the same expensive scan every time.

This tooling solves that by generating **compact, machine-readable artifacts** that capture the exact execution reality at a point in time. Future Codex turns can load these artifacts instead of rescanning the repo.

---

## Directory Structure

```
docs/runtime/
├── README.md                      ← This file
├── codex-runner-guide.md          ← How Codex uses these artifacts
├── core-state-pack.schema.json    ← JSON Schema for the state pack artifact
├── core-invariants.json           ← Static invariant rules manifest
└── generated/                     ← Auto-generated artifacts (not committed)
    ├── core-state-pack.json       ← Canonical snapshot
    ├── core-invariants-report.json
    ├── impact-report.json
    ├── doc-sync-report.json
    ├── preflight-summary.json
    └── postflight-report.json
```

---

## What Each Generated File Means

### `core-state-pack.json`
A compact snapshot of the current Wave 2 execution reality. Contains:
- Active task (lowest non-trueGreen by execution_order)
- State counts (trueGreen / blocked / bridge-deferred / in-progress)
- SHA-256 hashes and mtimes of high-risk core files
- Git working-tree dirty status and changed files
- API surface and test surface hints

This is the **primary artifact** for determining execution context without re-reading the repo.

### `core-invariants-report.json`
Result of validating the canonical state against all invariant rules. Reports:
- `passed: true/false`
- Exact violation messages if any rules fail

### `impact-report.json`
Risk classification for the current turn based on changed files:
- `light` — task-local files only, no invariant triggers
- `medium` — API/integration edges touched
- `heavy` — core files changed, requires full rescan

### `doc-sync-report.json`
Comparison of the three Wave 2 tracking documents:
- `wave2-canonical-state.json` (authoritative)
- `v2-wave2-execution-plan.md`
- `backlog-unified-status-and-order.md`

Reports exact mismatches in execution_order, taskName, state, and color indicators.

### `preflight-summary.json`
The top-level go/no-go decision artifact. Aggregates all other reports into:
- `ready: true/false`
- `riskLevel: light/medium/heavy`
- `canonicalStateHealthy: true/false`
- `invariantsPassed: true/false`
- `docSyncPassed: true/false`
- `requiresFullRepoRescan: true/false`
- `blockingIssues: []`
- `warnings: []`

### `postflight-report.json`
Post-task-run integrity check. Verifies:
- Which files were actually touched
- Whether any unexpected files changed
- Whether doc sync still holds
- Whether the canonical state is still valid

---

## Which Scripts to Run

| Script | Purpose |
|--------|---------|
| `node scripts/run-wave2-preflight.mjs` | **Main entry point.** Run before every task. |
| `node scripts/generate-core-state-pack.mjs` | Generate core-state-pack.json only |
| `node scripts/check-core-invariants.mjs` | Validate invariants only |
| `node scripts/analyze-impact.mjs` | Classify risk for changed files |
| `node scripts/check-wave2-doc-sync.mjs` | Check doc sync only |
| `node scripts/postflight-verify.mjs [options]` | Verify after a task run |

---

## What "light / medium / heavy" Means

### light
Only task-local files changed. No core invariant triggers fired. No high-risk files touched. Codex can proceed using state pack artifacts only.

### medium
Integration edges or API surfaces changed. Direct dependents may be affected. Codex should load impact-report.json for the list of probable dependent files and check whether they need revalidation.

### heavy
One or more high-risk core files changed (`context-builder.js`, `project-service.js`, `server.js`) or the canonical state schema / invariant manifest was modified. Full repository rescan is required. Codex must not skip the rescan.

---

## How This Reduces Repeated Repo Scanning

Without this tooling:
1. Each Codex turn reads the full canonical state (281 entries)
2. Each turn re-reads all 3 tracking documents to check sync
3. Each turn re-reads core files to detect changes
4. Each turn re-derives the active task from scratch

With this tooling:
1. Run `node scripts/run-wave2-preflight.mjs` once
2. Read `docs/runtime/generated/preflight-summary.json` (small JSON)
3. If `ready: true`, load `core-state-pack.json` for execution context
4. After task run, run `node scripts/postflight-verify.mjs`

The state pack contains everything needed to determine execution reality in a single small file.

---

## Non-Negotiable Constraints

- **Never auto-fix** canonical state or doc sync issues from these scripts. Scripts are read-only detectors.
- **Never commit** the `generated/` directory — these are turn-local artifacts.
- **Fail loudly** if canonical state is missing or malformed.
- **Do not modify** `src/core/context-builder.js`, `src/core/project-service.js`, or `src/server.js` from runtime scripts.
