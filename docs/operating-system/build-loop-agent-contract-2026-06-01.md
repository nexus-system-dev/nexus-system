# Build / Loop Agent Contract

Date: 2026-06-01
Task owner: `BLD-AGT-001`
Status: canonical contract, not implementation closure

## Core Promise

`Build / Loop Agent` manages live product construction after the first skeleton exists.

It understands every user message in the build rail, decides which agent or engine must act next, and ensures the conversation leads to a real product change, verification action, continuation step, clarification, approval request, or release path.

Short form:

`Build / Loop Agent` turns post-skeleton conversation into a real build loop, not a chat that talks about building.

## Agent Reality Gate

`BLD-AGT-001` may not be marked `trueGreen` until the agent passes the Agent Reality Gate:

- explicit role file or contract
- explicit routing rules
- structured input contract
- structured output envelope
- live provider-backed execution path
- no passive chat rail pretending to be the build manager
- no local status copy pretending to be build-agent state
- no direct product mutation without agent-owned routing
- persisted build-loop state
- downstream route to the correct agent or engine
- unit tests
- live browser proof
- grep proof that old static loop/status paths do not own the active path

## Build Agent Alive Gate

Before Nexus proves product mutation, it must prove that the Build-side agent conversation path is alive.

The right-side build rail is not acceptable if it is only a visual chat shell.

Minimum live behavior:

1. User sends a message in the Build rail.
2. The user message appears in the conversation.
3. A visible loading or thinking state appears.
4. The request is attached to the active project, runtime skeleton, product skeleton, and visual skeleton context where available.
5. A `Build / Loop Agent` envelope is produced or a bounded failure is produced.
6. The agent response or failure is rendered visibly in the right-side conversation.
7. No silent send is allowed.

This gate is before mutation.

It can close with a visible bounded failure only if the failure is truthful, user-facing, retryable where appropriate, and preserves the original user request as pending retry.

It cannot close if:

- the input accepts text but no handler runs
- the handler runs but the message disappears
- the backend route is missing
- the backend route fails silently
- the agent envelope is produced but not rendered
- the UI stays unchanged after send
- the user cannot tell whether anything happened

Canonical test prompt:

`תוסיף לי דף סלאש סקרין עם שם האפליקציה`

Minimum expected result for this prompt:

- the user message appears
- the rail shows loading/thinking
- the rail shows a Build agent response or a clear failure
- the reply is tied to the current Build context
- no product mutation is required yet for this gate

## Role Boundary

The agent owns build-loop management decisions:

- what the user wants now
- whether the message is a question
- whether the message is a small change
- whether the message is a visual change
- whether the message is a product-truth change
- whether the message asks to continue building
- whether the message asks for verification
- whether the message asks for release
- whether the message expresses dissatisfaction or ambiguity
- which agent or engine should act next
- whether user approval is required
- whether one clarification question is required
- whether the system can proceed safely

It does not do every job itself.

It routes:

- visual change -> `Visual Build Agent`
- product-truth change -> `Mutation / Change Agent`
- verification request -> `Verification / QA Agent`
- release request -> `Release Agent`
- foundational skeleton change -> `Product Skeleton Agent`
- significant style change -> `Visual Build Agent` with `Design Plugin` boundary
- rollback / history / restore -> `History / Continuity Agent`

Law:

`Build / Loop Agent` is the build-loop manager, not the only worker.

Closure boundary:

- `BLD-AGT-001` must prove that the Build rail is alive, classifies requests, receives relevant learning before replying, routes to the right owner, applies only small safe visual/product-domain changes that can be truthfully persisted, and never claims success without matching project truth.
- `BLD-AGT-001` does not close deep product-direction approval, full product verification, release readiness, publishing, external providers, payments, WhatsApp, deployment, or app-store work.
- Product-direction approval and impact analysis belong to `MUT-001`.
- Real screen/product verification belongs to `VER-AGT-001`.
- Release, publishing, provider, payment, and deployment decisions belong to `REL-AGT-001` and the relevant provider/security/release tasks.
- The Build-facing product-direction approval experience belongs to `BUILD-APPROVAL-001`.
- The Build-facing screen/product test request experience belongs to `BUILD-TEST-001`.
- The Build-facing release/provider/payment boundary belongs to `BUILD-RELEASE-GATE-001`.
- `BLD-AGT-001` may show a routed, pending, approval-required, refused, or bounded-failure state for those downstream paths, but it must not pretend those engines completed.

## Message Classification

Every user message in the build rail must be classified into one primary type:

- `question`
- `small-safe-change`
- `visual-change`
- `product-truth-change`
- `continue-building`
- `verification-request`
- `release-request`
- `dissatisfaction`
- `ambiguous`
- `failure-retry`

Examples:

- `Can I change this later?` -> `question`
- `Change the title.` -> `small-safe-change`
- `Make it more premium.` -> `visual-change`, possibly approval-required
- `Actually this is orders, not leads.` -> `product-truth-change`
- `Continue to the next screen.` -> `continue-building`
- `Check that this works.` -> `verification-request`
- `Can we release this?` -> `release-request`
- `This is not what I meant.` -> `dissatisfaction`

## Routing Rules

### Visual Build Agent

Use `Visual Build Agent` when the user requests a visible product change:

- add a region
- change order
- convert table to cards
- make it more premium
- add a button
- clean up design
- add empty state
- change copy
- improve hierarchy
- adjust layout, RTL, or responsive behavior

### Mutation / Change Agent

Use `Mutation / Change Agent` when the request changes product truth:

- primary user changes
- product type changes
- core workflow changes
- major region is removed
- new product flow is introduced
- provider / billing / permission scope changes
- "this is not X, it is Y"

### Both Visual Build And Mutation

Some requests require both.

Example:

`Add hot leads and make that the main part of the screen.`

The loop agent must first decide whether `hot leads` enters product truth, then route visual composition afterward.

### Verification / QA Agent

Use `Verification / QA Agent` when the user asks to test, check, validate, or prove.

It must not answer with a generic "looks fine" message unless real verification happened.

### Release Agent

Use `Release Agent` when the user asks to release, publish, export, deploy, or share a ready version through the release path.

## Ask Or Proceed Policy

Proceed without asking when the request is small, clear, and low-risk:

- title copy
- short explanatory copy
- button clarity
- minor position adjustment
- reduce clutter
- wording fix
- add empty state
- minor emphasis

Ask one sharp question or offer two options when the change can alter direction:

- make it more professional
- change the structure
- add users
- build a mobile app too
- add payments
- change the whole style
- delete a meaningful region
- make it a marketplace

Law:

Small clear changes can proceed. Direction-changing changes require approval or one clarification.

## Product Speech Must Match Product State

The agent must prevent fake progress.

Every user-facing reply must correspond to one of four outcomes:

1. change applied
2. change waiting for approval
3. clarification required
4. execution failed

Forbidden state:

Nexus says "I changed it" while the product surface did not change.

Law:

Nexus speech must match what the product actually did.

## Output Envelope

The agent must return a structured decision after every build-rail user message.

Required fields:

```json
{
  "agentId": "build-loop-agent",
  "responseSource": "agent-envelope",
  "messageType": "",
  "userIntent": "",
  "requiresAction": true,
  "targetAgent": "",
  "targetEngine": "",
  "changeScale": "none|small|significant",
  "requiresApproval": false,
  "approvalReason": "",
  "affectedProductArea": "",
  "affectsProductTruth": false,
  "affectsVisualSurface": false,
  "requiresVerification": false,
  "requiresHistoryUpdate": false,
  "nextStep": "",
  "userReply": "",
  "pendingAction": {
    "id": "",
    "type": "",
    "status": "none|pending-approval|pending-clarification|pending-retry"
  },
  "handoff": {
    "agentId": "",
    "input": {}
  }
}
```

## Required State

The Build / Loop Agent state must persist:

- active product id
- active skeleton id
- active visual skeleton id
- selected design plugin
- current build step
- current pending action
- last applied change
- last failed action
- conversation continuity
- history update requirement
- verification requirement

## Failure Behavior

If the agent fails:

- no product change is applied
- no fake "changed" message is shown
- the request is preserved as pending retry
- the user gets a bounded failure message

If the downstream agent fails:

- the Build / Loop Agent must not hide the failure
- the product state must not silently mutate
- the user-facing reply must reflect the real outcome

Failure message shape:

`I could not apply that change now. Your work is saved, and we can try again.`

## Live Proof

### Scenario 0: Agent Alive

Starting state:

A mobile runtime skeleton exists in Build.

User says:

`תוסיף לי דף סלאש סקרין עם שם האפליקציה`

Expected:

- message reaches the active Build rail handler
- user message appears in the right-side conversation
- loading or thinking state appears
- request reaches a backend Build / Loop Agent route or a truthful local blocked state with no fake agent claim
- response or bounded failure appears visibly
- current project/runtime skeleton context is attached
- no silent failure
- no product mutation is required yet

### Scenario 1: Visual Change

Starting state:

Lead-management skeleton exists.

User says:

`Turn the lead list into cards and add a section for leads that need follow-up today.`

Expected:

- message reaches `Build / Loop Agent`
- classified as `visual-change`
- routed to `Visual Build Agent`
- canvas changes visibly
- list becomes cards
- follow-up-today region appears
- short user reply matches the real change
- history update is required
- no fake reply if the change did not happen

### Scenario 2: Product-Truth Change

User says:

`Actually this is not leads, it is orders.`

Expected:

- classified as `product-truth-change`
- not routed only to `Visual Build Agent`
- routed to `Mutation / Change Agent`
- requires approval or impact explanation before meaningful product mutation
- product does not change silently
- `BLD-AGT-001` may close by proving this handoff and approval boundary
- deeper impact analysis, approved Product Graph mutation, history, rollback, and visual update are owned by `MUT-001`
- the Build-facing approval user experience is owned by `BUILD-APPROVAL-001`

### Scenario 3: Verification

User says:

`Check that this screen works.`

Expected:

- classified as `verification-request`
- routed to `Verification / QA Agent`
- the Build rail shows a routed, pending, or bounded result without claiming a fake pass
- real verification execution, checked items, passed/failed proof, and artifact gate closure are owned by `VER-AGT-001`
- the Build-facing test request experience is owned by `BUILD-TEST-001`
- no generic "looks good" without proof

### Scenario 4: Release / Provider Boundary

User says:

`Publish this and connect WhatsApp payments.`

Expected:

- classified as `release-request` / provider-scoped request
- routed to `Release Agent` or bounded provider/security/release path
- no real external action happens silently
- no fake publish, payment, provider connection, WhatsApp connection, deployment, or app-store claim appears
- the user sees an approval-required, refusal, or bounded next-step state
- real release readiness, publishing, provider, payment, deployment, and external account handling are owned by `REL-AGT-001` and the relevant provider/security/release tasks
- the Build-facing release/provider/payment boundary experience is owned by `BUILD-RELEASE-GATE-001`

### Scenario 5: Failure

If provider or downstream execution fails:

- no canvas mutation
- no fake "changed" reply
- pending retry is saved
- user sees a bounded failure state

## Canonical Promise

`Build / Loop Agent` guarantees that every post-skeleton conversation turn becomes a real build-loop decision: understand intent, route to the correct agent, and make sure the product truth matches the user-facing reply.

It does not guarantee that every downstream engine has completed. Each downstream engine must close under its own canonical task.
