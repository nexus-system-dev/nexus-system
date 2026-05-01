# Codex Runner Guide — Wave 2 Execution

This guide explains how future Codex prompts should use the local runtime artifacts to avoid re-reading the full repository every turn.

---

## Core Principle

**Do not re-derive what was already derived.** The preflight system generates a compact set of artifacts that capture execution reality. Read those artifacts, not the raw source documents, unless the impact report says a full rescan is required.

---

## Standard Execution Flow

### Step 1: Run preflight

```bash
node scripts/run-wave2-preflight.mjs
```

This runs (in order):
1. `generate-core-state-pack` — captures current execution reality
2. `check-core-invariants` — validates canonical state rules
3. `analyze-impact` — classifies risk from changed files
4. `check-wave2-doc-sync` — checks tracking doc alignment

### Step 2: Read preflight-summary.json

```
docs/runtime/generated/preflight-summary.json
```

The preflight summary is the **go/no-go decision point**.

```json
{
  "ready": true,
  "riskLevel": "light",
  "canonicalStateHealthy": true,
  "invariantsPassed": true,
  "docSyncPassed": true,
  "requiresFullRepoRescan": false,
  "blockingIssues": [],
  "warnings": []
}
```

Decision table:

| `ready` | `requiresFullRepoRescan` | Action |
|---------|--------------------------|--------|
| true    | false                    | Proceed using state pack |
| true    | true                     | Full rescan required before proceeding |
| false   | any                      | Fix blockingIssues first |

### Step 3: Read core-state-pack.json (if ready)

```
docs/runtime/generated/core-state-pack.json
```

This tells you:

```json
{
  "wave2": {
    "currentScanPoint": 34,
    "activeTask": {
      "execution_order": 34,
      "taskName": "Create pattern confidence indicator",
      "recordedState": "in-progress"
    },
    "previousTask": {
      "execution_order": 33,
      "taskName": "...",
      "recordedState": "trueGreen"
    },
    "stateCounts": {
      "trueGreen": 37,
      "blocked": 39,
      "bridge-deferred": 12,
      "in-progress": 193
    }
  }
}
```

You now know the active task without reading wave2-canonical-state.json.

### Step 4: Read impact-report.json (if riskLevel is medium or heavy)

```
docs/runtime/generated/impact-report.json
```

If `riskLevel` is `light`, skip this. If `medium` or `heavy`, read the impact report to understand which files are affected:

```json
{
  "riskLevel": "medium",
  "touchedCoreFiles": [],
  "probableDependentFiles": ["src/core/approval-gating-module.js"],
  "requiresFullRepoRescan": false,
  "requiresPreviousTaskRevalidation": true,
  "reasons": ["Integration edge: api-routing-middleware-layer.js modified"]
}
```

### Step 5: Implement the task

Use the `activeTask` from the state pack as your execution target. Follow canonical execution order — do not skip tasks.

### Step 6: Run postflight

```bash
node scripts/postflight-verify.mjs \
  --allowedFiles "src/core/my-module.js,test/my-module.test.js" \
  --taskOrder 34
```

Options:
- `--allowedFiles <comma-separated>` — files the task was expected to touch
- `--forbiddenFiles <comma-separated>` — files that must not have been touched
- `--taskOrder <number>` — execution_order of the task that just ran

### Step 7: Read postflight-report.json

```
docs/runtime/generated/postflight-report.json
```

```json
{
  "likelyValidationStatus": "passed",
  "touchedFiles": ["src/core/my-module.js", "test/my-module.test.js"],
  "unexpectedTouchedFiles": [],
  "docSyncPassed": true,
  "canonicalStateReadable": true,
  "requiredFollowup": [],
  "notes": []
}
```

If `unexpectedTouchedFiles` is non-empty or `likelyValidationStatus` is `failed`, stop and investigate before the next task.

---

## When to Skip the State Pack and Read Raw Files

You MUST read raw canonical files if:

1. `requiresFullRepoRescan: true` in the preflight summary
2. `riskLevel: heavy` in the impact report
3. Any core file hash changed between state pack generations
4. The state pack is older than your current session start
5. Invariant violations are reported

In these cases, re-read:
- `docs/wave2-canonical-state.json` (full)
- `src/core/context-builder.js`
- `src/core/project-service.js`
- `src/server.js`

---

## What NOT to Do

- Do NOT read `wave2-canonical-state.json` every turn if the preflight says `ready: true` and `riskLevel: light`.
- Do NOT re-derive the active task from scratch — read `currentScanPoint` from the state pack.
- Do NOT attempt to fix doc sync issues from these scripts — they are read-only detectors.
- Do NOT skip the postflight check after a task run.
- Do NOT commit the `docs/runtime/generated/` directory.

---

## Script Quick Reference

```bash
# Full preflight (recommended entry point)
node scripts/run-wave2-preflight.mjs

# Individual scripts (for debugging or targeted use)
node scripts/generate-core-state-pack.mjs
node scripts/check-core-invariants.mjs
node scripts/analyze-impact.mjs [--files "file1,file2"]
node scripts/check-wave2-doc-sync.mjs
node scripts/postflight-verify.mjs [--allowedFiles "..."] [--forbiddenFiles "..."] [--taskOrder N]
```

---

## Artifact Freshness

These artifacts are **turn-local**. They reflect repo state at generation time. Always re-run the preflight at the start of each new Codex turn to get fresh artifacts.

The `generatedAt` timestamp in `core-state-pack.json` tells you when the artifacts were last generated.

---

## Invariant Violations

If `check-core-invariants.mjs` reports a violation, the preflight summary will have `invariantsPassed: false` and `ready: false`. The `blockingIssues` array will list exact violations.

Do not proceed with task execution until invariant violations are resolved.

Common invariant violations:
- `invalidTaskState` — a task has a state not in `[trueGreen, blocked, bridge-deferred, in-progress]`
- `executionOrderGap` — execution_order values are not sequential 1..N
- `canonicalStateUnreadable` — wave2-canonical-state.json is missing or malformed
