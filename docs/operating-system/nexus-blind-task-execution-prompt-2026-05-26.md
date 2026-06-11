# Nexus Blind Task Execution Prompt

תאריך: `2026-05-26`  
סטטוס: `universal execution prompt`

---

## Copy-Paste Prompt

Continue from the canonical Nexus execution system.

You are not here to brainstorm, summarize, or propose a loose plan.
You are here to execute the correct next canonical task end-to-end and close it truthfully if possible.

Your job on every run:

1. identify the correct current canonical task
2. use the active Nexus execution engine and remap rules
3. execute the task fully across code, docs, product surface, and verification as needed
4. continue until the task is either:
   - `trueGreen`
   - or blocked by an explicit canonical blocker that you name precisely
5. write back the truth of what changed

## Authoritative sources

Use these sources in this order:

1. `/Users/yogevlavian/Desktop/The Nexus/docs/operating-system/wave4-permanent-orchestrator-v1.md`
2. `/Users/yogevlavian/Desktop/The Nexus/docs/operating-system/nexus-wave4-orchestrator-remap-prompt-2026-05-26.md`
3. `/Users/yogevlavian/Desktop/The Nexus/docs/operating-system/nexus-canonical-implementation-task-map-2026-05-26.md`
4. `/Users/yogevlavian/Desktop/The Nexus/docs/operating-system/nexus-canonical-product-system-2026-05-26.md`
5. `/Users/yogevlavian/Desktop/The Nexus/docs/wave3-canonical-state.json`
6. `/Users/yogevlavian/Desktop/The Nexus/docs/operating-system/wave4-minimum-believable-core-planning-track.md`
7. `/Users/yogevlavian/Desktop/The Nexus/docs/v2-wave4-execution-plan.md`
8. the repository itself
9. live verification reality

If these conflict:
- the implementation task map decides active execution order
- the canonical product system decides product laws and boundaries
- wave3 canonical state decides existing task-chain truth and closure evidence
- code decides implementation reality
- live verification decides final closure truth

## Mandatory execution behavior

You must do all of the following on every run:

### 1. Select the task correctly

- read the implementation task map
- identify the earliest unresolved `release-blocker`
- verify its dependencies
- classify it as:
  - `existing reused task`
  - `new shell task`
  - `bridge task`
- say why this is the right task now

You may not choose a later task for convenience.

### 2. Execute, do not only plan

Unless blocked by a real dependency,
you must actually perform the work:

- inspect code
- inspect docs
- patch files
- wire the product surface
- preserve engine truth
- remove stale visible UX if required
- run verification
- update canonical docs if the task requires write-back

Do not stop at:
- “here is the plan”
- “here is what I would do”
- “here are recommendations”

### 3. Follow preserve/remove/build truth

For the active task, explicitly determine:

- what engine is preserved
- what old visible behavior is removed
- what new shell behavior is built
- what release/path/continuity truth is affected

### 4. Work end-to-end

If the task touches meaningful product truth,
you must carry it across all relevant layers:

- backend/core
- routing/state
- UI/surface
- continuity/restore
- release/history/mutation implications
- verification evidence

No backend-only closure.
No UI-only closure.

### 5. Verify truthfully

Before claiming closure, verify in the strongest relevant way available:

- tests
- live route verification
- real artifact check
- continuity/refresh check
- mutation/release gate check

If you cannot verify something,
say exactly what remains unverified.

### 6. trueGreen rule

You may mark a task `trueGreen` only if:

- the implementation is real
- the visible Nexus behavior changed where required
- dependencies remain coherent
- verification passed at the appropriate level
- no contradictory truth remains in docs or product behavior

If any of those are missing,
do not claim `trueGreen`.

### 7. Canonical blocker behavior

If the task cannot close,
you must not hand-wave.
Instead:

- name the exact blocker
- state whether it is:
  - missing dependency
  - false prior closure
  - surface contradiction
  - runtime/security/release blocker
  - missing canonical task
- if needed, add the missing canonical task or reopen chain truthfully

## Output shape for every run

Start by stating:

1. current phase
2. current task id
3. task classification
4. why it is selected now
5. what you are about to do first

Then execute.

End by stating:

1. what changed
2. what was verified
3. whether the task is:
   - `trueGreen`
   - `partial`
   - `blocked`
4. what canonical write-back was made
5. what the next canonical task is

## Strong prohibitions

Do not:

- pick tasks from memory instead of the canonical map
- skip dependencies
- preserve old visible shell inertia
- claim progress without visible/product truth
- claim `trueGreen` from code shape alone
- stop at partial implementation unless blocked
- leave docs stale after meaningful canonical change
- invent a parallel planning framework

## Core law

```txt
On every run, choose the correct canonical task, execute it fully, verify it truthfully,
and continue until it is either trueGreen or explicitly blocked by canonical reality.
```

---

## Short Version

If you need the shortest reusable form:

```txt
Continue from the canonical Nexus execution system.
Use wave4-permanent-orchestrator-v1.md, the remap prompt, the canonical implementation task map, the canonical product system, and wave3-canonical-state.json as the only valid navigation framework.
Select the earliest unresolved release-blocking canonical task with all dependencies satisfied.
Do not plan only — execute the task end-to-end across code, docs, surface, continuity, and verification.
Do not stop until the task is either trueGreen or explicitly blocked by a named canonical blocker.
If blocked, write the exact blocker and required next task.
If closed, write back the truth and state the next canonical task.
No fake trueGreen. No backend-only progress. No shell drift. No skipping task order.
```

