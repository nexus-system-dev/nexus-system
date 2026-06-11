# Mutation / Change Agent Contract

Date: 2026-06-01
Task owner: `MUT-001`
Status: canonical contract, not implementation closure

## Core Promise

`Mutation / Change Agent` receives a meaningful change request, understands what it changes in the product itself, analyzes impact, and decides whether and how it enters canonical product truth.

Short form:

`Mutation / Change Agent` keeps real product changes conscious, safe, documented, and approved when needed.

## Agent Reality Gate

`MUT-001` may not be marked `trueGreen` until the agent passes the Agent Reality Gate:

- explicit role file or contract
- explicit mutation rules
- structured input contract
- structured output envelope
- live provider-backed execution path
- no direct edit path bypassing mutation interpretation
- no artifact or Product Graph mutation without mutation envelope
- impact analysis before meaningful change
- approval boundary for high-impact change
- checkpoint/history handoff after successful mutation
- verification handoff when needed
- unit tests
- live browser proof
- grep proof that old direct mutation paths do not own active product truth

## Product Truth Boundary

A visual change changes how something appears.

Examples:

- color
- copy
- position
- table to cards
- spacing
- hierarchy
- design style
- RTL/readability

A product-truth change changes what the product does, who it serves, how it works, or what it promises.

Examples:

- `This is orders, not leads.`
- `The primary user is a manager, not a representative.`
- `Add permissions.`
- `Connect payments.`
- `The first workflow is a map, not a list.`
- `Remove reminders completely.`
- `Add customers as a core system object.`
- `Change this from store to marketplace.`

Law:

Visual change changes form. Product-truth change changes product reality.

## Safe Apply Versus Approval Required

### May Apply Immediately

Small, clear, low-risk changes may be applied without stopping the user:

- text fix
- label change
- minor ordering change
- readability improvement
- color change inside the same style
- short explanation
- empty state
- change that strengthens an already agreed direction
- RTL fix
- change that does not erase prior decisions

### Requires Approval

Changes that alter product direction or can break product truth require approval:

- target audience change
- core workflow change
- important region deletion
- product type change
- payments
- permissions
- external provider connection
- multi-screen impact
- release-impacting change
- change that cancels a previous decision
- product identity change

Law:

If a change can alter product direction, it must not be applied silently.

## Impact Analysis Checklist

Before approving or applying a meaningful mutation, the agent must evaluate:

- what the user actually requested
- affected product area
- whether this is small or directional
- contradiction with prior understanding
- impacted screens
- impacted workflows
- impacted actions
- impacted data objects
- impacted design language
- impacted release readiness
- permissions, security, billing, or provider implications
- whether Product Skeleton Agent must be re-entered
- whether Visual Build Agent must update the visible surface
- whether a checkpoint is needed before the change
- whether user approval is required
- safer alternative if available

Canonical question:

`What moves if we apply this?`

## Change Record

Every meaningful mutation must produce a short product-history record:

- before
- after
- why
- requested by
- affected areas
- approval status
- rollback availability
- temporary change or new truth
- verification required

Example:

`The product changed its primary work center from leads to orders. The main screen, actions, and primary data object must update accordingly. This requires approval because it changes the first workflow identity.`

The record must be product-readable, not a long technical log.

## Approval Message

For high-impact change, the user must receive a simple explanation:

- what changes
- what remains
- what may be removed
- what is affected
- whether rollback is available

Example:

`If we switch from leads to orders, the lead list becomes an orders screen, reminders may become handling status, and owner remains relevant. Apply this change?`

Law:

Big changes do not enter through the back door.

## Output Envelope

The agent must return a structured mutation decision.

Required fields:

```json
{
  "agentId": "mutation-change-agent",
  "responseSource": "agent-envelope",
  "changeType": "small|visual|product-truth|workflow|audience|data|release|risky|understanding-correction",
  "userRequest": "",
  "actualChange": {
    "added": [],
    "removed": [],
    "replaced": [],
    "unchanged": []
  },
  "affectedAreas": {
    "screens": [],
    "workflows": [],
    "actions": [],
    "dataObjects": [],
    "design": [],
    "release": [],
    "history": []
  },
  "requiresApproval": false,
  "approvalReason": "",
  "requiresAgent": [],
  "requiresCheckpoint": false,
  "requiresVerification": false,
  "status": "applied|pending-approval|needs-clarification|rejected|failed-safely",
  "historyRecord": {
    "before": "",
    "after": "",
    "why": "",
    "requestedBy": "",
    "approvalStatus": "",
    "rollbackAvailable": false,
    "truthStatus": "temporary|new-truth"
  },
  "userReply": ""
}
```

## Required Agent Handoffs

The mutation agent may require:

- `Visual Build Agent` when visible product surface must update
- `Product Skeleton Agent` when the first structure or core workflow must be recalculated
- `Verification / QA Agent` when behavior or release readiness may be affected
- `Release Agent` when release gate must be reconsidered
- `History / Continuity Agent` when checkpoint, rollback, restore, or continuity state must update

## Failure Behavior

If the agent cannot classify or analyze the change:

- no Product Graph mutation occurs
- no artifact mutation occurs
- no fake product-truth update is recorded
- one clarification question is returned

If the provider fails or returns malformed output:

- no mutation occurs
- pending mutation is preserved for retry
- user sees bounded failure

Failure message shape:

`I could not safely apply that product change now. Your work is saved, and we can try again.`

## Live Proof

### Scenario 1: Product-Truth Change

Starting state:

Lead-management product skeleton exists.

User says:

`Actually this is not leads, it is orders.`

Expected:

- request does not go directly to `Visual Build Agent`
- product screen does not change silently
- `Build / Loop Agent` classifies it as product-truth change
- request reaches `Mutation / Change Agent`
- agent explains the product-center impact
- approval is required before application
- after approval, Product Graph truth changes
- visible screen updates through the correct downstream path
- History records what changed and why
- rollback/checkpoint exists if required

### Scenario 2: Small Safe Change

User says:

`Change the title to leads that need attention today.`

Expected:

- classified as small safe change
- no heavy approval flow
- visible title changes
- Product Graph identity does not change
- no product-truth mutation is recorded as if the product changed identity

Failure condition:

If every change uses the same path, the agent fails.

## Canonical Promise

`Mutation / Change Agent` guarantees that significant product changes enter Nexus truth only when they are understood, safe, documented, and approved when needed.

Short form:

It prevents Nexus from changing the soul of the product by accident.
