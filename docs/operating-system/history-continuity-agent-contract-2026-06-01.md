# History / Continuity Agent Contract

Date: 2026-06-01
Task owner: `HIST-AGT-001`
Status: canonical contract, not implementation closure

## Core Promise

`History / Continuity Agent` preserves the product's evolution story, explains what changed, creates restore points when needed, and enables safe rollback without breaking product truth, conversation continuity, or the current visible surface.

Short form:

`History / Continuity Agent` makes sure Nexus remembers what changed, why it changed, and how to go back safely.

## Agent Reality Gate

`HIST-AGT-001` may not be marked `trueGreen` until the agent passes the Agent Reality Gate:

- explicit role file or contract
- explicit history / checkpoint / restore rules
- structured input contract
- structured output envelope
- live provider-backed execution path
- no static timeline pretending to be the agent
- no route/localStorage restore bypassing continuity validation
- preserved snapshot / rollback / continuity engines remain hidden engines
- user-visible history remains product-readable, not technical logs
- restore decisions validate product graph, visual surface, conversation, and release state
- unit tests
- live browser proof
- grep proof that old timeline/debug/local restore paths do not own active continuity truth

## Preserved Engine Boundary

The agent does not replace the existing snapshot, rollback, recovery, or continuity engines.

It consumes and coordinates them.

Preserved engines include:

- `project-snapshot-store`
- snapshot backup schedule
- rollback execution module
- recovery envelope
- continuity memory / refresh behavior
- durable session continuity store
- route restore continuity

Law:

Engines preserve data and recovery capability. `History / Continuity Agent` decides the product-readable history, restore meaning, and safe continuity action.

## Three History Types

### Conversation History

Conversation history records what the user said and what Nexus answered.

It helps understand intent, but it is not product truth.

Example:

User said: `Make this simpler.`

Nexus answered: `I will simplify the screen and keep only the primary action.`

### Product History

Product history tells how the product evolved.

It answers:

`How did the product reach its current state?`

Example:

The product started as lead management, then reminders were added, then the lead list became cards, then advanced reports were removed from V1.

### Change History

Change history records one specific change.

It answers:

`What exactly changed in this action?`

Required details:

- before
- after
- who requested it
- why
- affected areas
- whether rollback is possible

Law:

Conversation is what was said. Product history is how the product evolved. Change history is what changed now.

## Checkpoint Policy

### Regular History Is Enough

Small changes do not require a heavy restore point:

- title change
- short copy change
- small color change
- small explanatory text
- spacing adjustment
- wording fix
- minor screen improvement

These changes still need a record, but not a heavy checkpoint.

### Checkpoint Required

A checkpoint is required when a change could make the user say:

`Wait, bring back what I had before.`

Examples:

- product type change
- target audience change
- core workflow change
- important region deletion
- new screen
- multi-region change
- broad design change
- release-impacting change
- external provider action
- approval-required change

Law:

If a change can create meaningful regret, create a restore point before applying it.

## User-Visible Versus Internal History

### User Should See

Product-readable history:

- what changed
- why it changed
- when it happened
- what was affected
- whether it was small or meaningful
- where the user can safely go back
- what restore means

Examples:

- `The lead list was changed into cards to make daily handling clearer.`
- `A follow-up today section was added to the main screen.`
- `The core workflow remained lead handling.`

### Must Stay Internal

The user must not see:

- system ids
- file names
- function names
- internal agent names
- internal provider details
- internal test labels
- raw logs
- deep technical errors
- orchestration labels

Law:

The user should see what happened to the product, not how the machine moved.

## Restore Policy

Restore is not a blind time jump.

Before restore, the agent must evaluate:

- target restore point
- what will change
- what will be lost
- what remains
- whether recent conversation remains relevant
- whether the visible screen matches the restored truth
- whether a release already happened
- whether later work depends on the target point
- whether partial restore is safer than full restore

Restore explanation examples:

`If we return to this point, the lead list comes back instead of cards, but the reminders added later can remain. Continue?`

`This restore will also remove the follow-up today section. Restore anyway?`

Law:

Restore does not only restore a screen. It restores product truth safely.

## Return-After-Time Summary

When a user returns after refresh, crash, or another day, the agent should provide a short orientation, not a full log.

Example:

`Since your last visit, the lead list became cards, a follow-up today section was added, and the core workflow stayed focused on lead handling.`

If a meaningful change occurred:

`One meaningful change was added: the product narrowed from general lead management to manual lead handling for a small business owner.`

The summary must distinguish:

- small change
- meaningful change
- pending approval
- failed change that did not enter truth
- rollback-available change

Law:

The user should understand where they are now without reading a log.

## Output Envelope

The agent must return structured continuity output.

Required fields:

```json
{
  "agentId": "history-continuity-agent",
  "responseSource": "agent-envelope",
  "eventType": "small-change|meaningful-change|product-truth-change|visual-change|failed-change|checkpoint|restore|return-after-time|pending-approval",
  "changeSummary": {
    "before": "",
    "after": "",
    "unchanged": ""
  },
  "reason": "user-request|nexus-decision|correction|verification-result|design-adjustment|direction-change",
  "affectedAreas": {
    "screens": [],
    "workflows": [],
    "regions": [],
    "design": [],
    "productTruth": [],
    "release": [],
    "history": []
  },
  "requiresCheckpoint": false,
  "checkpointReason": "",
  "restoreAvailability": "safe|possible-with-impact|not-recommended|not-possible",
  "restoreImpact": {
    "willRestore": [],
    "willRemove": [],
    "willKeep": [],
    "releaseImpact": ""
  },
  "userReply": "",
  "status": "recorded|checkpoint-saved|pending-approval|restored|failed-safely"
}
```

## Required Handoffs

The agent coordinates with:

- `Mutation / Change Agent` for product-truth mutation records
- `Visual Build Agent` for visible state after restore
- `Build / Loop Agent` for continuity in the conversation rail
- `Release Agent` when restore affects released or release-ready state
- preserved snapshot / rollback engines for actual recovery execution

## Failure Behavior

If the agent cannot validate a restore:

- no restore happens
- current product truth remains active
- user receives a clear reason
- pending restore request is preserved if retryable

If provider output is malformed:

- no continuity state is committed
- no checkpoint is marked safe
- no stale state is restored as current truth

Failure message shape:

`I could not safely restore that point now. Your current work is unchanged, and we can try again.`

## Live Proof

### Scenario 1: Change And History Record

Starting state:

Lead-management product exists.

User says:

`Turn the lead list into cards and add a follow-up today section.`

Expected:

- product changes
- history records what changed
- History surface shows product-readable explanation
- no technical log appears
- previous state is inspectable

### Scenario 2: Meaningful Change With Checkpoint

User says:

`Actually this is orders, not leads.`

Expected:

- Nexus identifies meaningful change
- checkpoint is created before change
- user receives short impact explanation
- after approval, product changes
- History stores the previous point
- restore is available

### Scenario 3: Restore

User selects a previous point.

Expected:

- Nexus explains what returns and what is removed
- after approval, product truth returns safely
- visible screen matches restored truth
- conversation remains available
- History records the restore
- there are not two active truth states

### Scenario 4: Return After Time

User returns after refresh or another day.

Expected:

- Nexus summarizes what changed since the last visit
- it does not dump raw logs
- it gives one clear continuation action

## Canonical Promise

`History / Continuity Agent` guarantees every meaningful Nexus change is preserved as a clear product story with a safe way to understand, continue, and go back.
