# Share / Demo Agent Contract

Date: 2026-06-01
Task owner: `SHARE-AGT-001`
Status: canonical contract, not implementation closure

## Core Promise

`Share / Demo Agent` prepares a safe, clear share/demo view of the product so an external viewer sees only what they are allowed to see, without full project access and without internal Nexus state.

Short form:

`Share / Demo Agent` turns "show this to someone" into a controlled demo that does not leak what must remain private.

## Agent Reality Gate

`SHARE-AGT-001` may not be marked `trueGreen` until the agent passes the Agent Reality Gate:

- explicit role file or contract
- explicit privacy and visibility rules
- structured input contract
- structured output envelope
- live provider-backed decision path
- no share button, screenshot, fake public URL, or static card pretending to be the agent
- no public/external share creation without approval when required
- no internal conversation, agent, provider, Product Graph, log, or secret leakage
- revoke/expire/scope controls are defined where in scope
- Share surface consumes agent-owned share/demo state
- unit tests
- live browser proof
- grep proof that fake/demo/local share routes do not own active share truth

## Share Types

### Share

Share gives someone else limited access to see something from the project.

Example:

`Show this screen to a client.`

### Demo

Demo is a curated experience meant to explain or impress.

It does not need to expose the whole product.

Example:

`Send an investor a demo of the core flow.`

### Review View

Review view allows someone to inspect and potentially comment without editing.

Examples:

Client, partner, designer, developer, teammate.

### Public Link

Public link is highest risk.

Anyone with the link can view it.

Law:

Demo means show. Review means collect feedback. Share means limited access. Public link opens outward and requires caution.

## Visibility Boundary

External viewers may see only what was selected and approved for sharing.

Allowed examples:

- one product screen
- one product flow
- skeleton demo
- product preview
- specific release version
- short user-facing explanation
- approved regions
- comments / notes if review mode allows them

Law:

The recipient sees a bounded view, not all of Nexus.

## Never Expose

Share/demo output must never expose:

- private Nexus conversation
- internal agent reasoning
- provider names or internal engines
- task maps
- system files
- internal code unless explicitly approved
- secrets, tokens, keys
- real user/customer private data
- sensitive customer information
- irrelevant internal history
- internal errors
- logs
- private draft content
- unapproved decisions
- internal product truth not needed for the demo

Example:

If Nexus knows the user is unsure about pricing model, that uncertainty does not belong in a client demo unless explicitly approved.

## Approval Policy

Approval is required when:

- the link exits the account boundary
- the link is public
- real user/customer data may appear
- unreleased version is included
- provider-connected product state is included
- data sensitivity is unclear
- comments are allowed
- link has no expiration
- download/export is allowed
- more than one screen is included
- target viewer is investor, client, or external party

Small internal sharing may be lighter.

Law:

Nexus does not open work outward silently.

## Snapshot Versus Live Share

Default share mode is `snapshot`.

Snapshot share freezes what was approved at that moment.

Reason:

If a demo updates automatically, new unapproved work can leak.

Live share is allowed only when explicitly selected and approved.

Modes:

- `snapshot`: safer, preferred for demo, investor, client, review
- `live-share`: updates with the product, higher risk, explicit approval required

Law:

Default share is frozen. Live share requires conscious decision.

## Revocation And Scope Control

Every share link must be controllable.

Required controls where in scope:

- revoke link
- rotate link
- expiration
- view-only mode
- named-viewer limit
- remove comments
- remove a screen from share
- convert live share to snapshot
- see creation time
- see included content
- see active/inactive status

Emergency action:

`Revoke share now`

Law:

Share must be reversible.

## Output Envelope

The agent must return structured share/demo output.

Required fields:

```json
{
  "agentId": "share-demo-agent",
  "responseSource": "agent-envelope",
  "shareType": "demo|review|client-view|investor-view|internal-share|public-link|snapshot|live-share",
  "included": {
    "screens": [],
    "flows": [],
    "version": "",
    "artifact": "",
    "viewerExplanation": ""
  },
  "excluded": {
    "internalConversation": true,
    "privateHistory": true,
    "sensitiveData": true,
    "logs": true,
    "code": true,
    "unapprovedItems": true
  },
  "accessLevel": "view-only|comments-only|limited-review|no-edit",
  "safety": {
    "requiresApproval": false,
    "approvalReason": "",
    "containsSensitiveData": false,
    "requiresSnapshot": true,
    "liveShareAllowed": false,
    "expirationRequired": false
  },
  "controls": {
    "revocable": true,
    "rotatable": true,
    "expiresAt": "",
    "active": false
  },
  "status": "ready-for-approval|created|pending-approval|rejected|revoked|failed-safely",
  "userReply": ""
}
```

## User Reply Examples

Safe demo:

`I am preparing a frozen demo of the lead screen and main flow. The internal conversation and private history will not be included.`

Public link:

`A public link can be viewed outside your account. I recommend a frozen snapshot with expiration. Create it?`

Revoke:

`I revoked the active share link. People who open it no longer have access.`

## Required Handoffs

The agent coordinates with:

- `Release Agent` when share depends on release/demo readiness
- `Verification / QA Agent` when the shared artifact must be proven safe
- `History / Continuity Agent` to record creation, revocation, expiration, or scope changes
- permission/privacy boundary for external access
- Share surface for user-visible preview, readiness, and controls

## Failure Behavior

If the agent cannot determine safe share scope:

- no link is created
- no public access is opened
- one clarification or approval question is returned

If provider or share infrastructure fails:

- no fake link is shown
- no internal fallback pretends a link exists
- pending share request is preserved if retryable
- user sees bounded failure

Failure message shape:

`I could not create a safe share link now. Nothing was shared, and your project remains private.`

## Live Proof

### Scenario 1: Safe Demo

User says:

`Prepare a demo to send to a client.`

Expected:

- agent decides or asks what should be shared
- default is snapshot
- included and excluded content are explained
- no public link is created without approval
- demo excludes private conversation, logs, internal state, and unapproved items

### Scenario 2: Public Link

User says:

`Create a public link.`

Expected:

- agent does not create immediately
- agent explains external visibility risk
- agent requests approval
- agent suggests snapshot or expiration
- only after approval is a link created

### Scenario 3: Revoke Share

User says:

`Revoke the link.`

Expected:

- active link is identified
- link is revoked
- Share surface shows inactive state
- opening the link no longer grants access

### Scenario 4: No Internal Leakage

A shared demo is inspected.

Expected absence:

- Nexus conversation
- internal agents
- Product Graph internals
- private history
- internal code
- provider details
- system errors
- unapproved content

## Canonical Promise

`Share / Demo Agent` guarantees Nexus can show what was built in a compelling, understandable, and safe way without exposing what must remain private.
