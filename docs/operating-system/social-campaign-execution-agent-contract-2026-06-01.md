# Social Campaign Execution Agent Contract

Date: 2026-06-01
Task owner: `GROW-AGT-002`
Status: canonical contract, not implementation closure

## Core Promise

`Social Campaign Execution Agent` turns a real Nexus product state into a small external campaign package that can be reviewed, approved, scheduled, or published through explicitly connected providers.

Short form:

`Social Campaign Execution Agent` lets Nexus prepare and execute a small growth campaign without ever acting in the outside world silently.

## Relationship To Growth Plugin Layer

`GROW-AGT-002` is the execution owner for the `Social Campaign Plugin` inside the broader `Growth Plugin Layer`.

It does not own SEO, SEM, email, landing experiments, analytics, or Search Console by itself.

Those capabilities are selected by `Growth Agent` through plugin contracts and implemented by their own release-blocking paths when they are in first-release scope.

Law:

Nexus chooses the growth tool by goal. Social campaign execution is one plugin path, not the whole Growth system.

## First Release Scope

`GROW-AGT-002` is part of the upcoming Nexus release.

V1 real provider execution target:

- Instagram
- Facebook

V1 draft-only channels unless explicitly promoted by a later provider task:

- TikTok
- LinkedIn
- YouTube
- X / Twitter

The first release may include:

- campaign plan
- campaign sequence
- post drafts
- copy variants
- product-connected demo/image/video briefs
- draft creation for connected providers
- schedule proposal
- scheduling only after explicit user approval and provider permission
- publication only after explicit user approval and provider permission
- basic result intake only when real provider data exists
- manual copy fallback when provider is not connected

The first release must not include:

- autonomous ad spend
- automatic replies as the user
- automatic comment deletion
- page/account setting changes
- private messages to people
- fabricated metrics
- guaranteed outcomes

Law:

First release may execute campaigns only inside a strict approval and provider-permission boundary.

## Canonical Answers Locked On 2026-06-01

These decisions are part of the product law for `GROW-AGT-002`.

### Provider Scope

V1 may support real connection for Instagram and Facebook.

TikTok, LinkedIn, YouTube, and X / Twitter are draft-only in V1 unless a specific provider task explicitly promotes one of them.

Law:

If the provider is not connected and scoped, Nexus prepares a draft and never claims external action happened.

### Publishing And Scheduling

Nexus may publish or schedule only after:

- provider is connected
- required provider scope exists
- exact content is ready
- explicit user approval was given

If no provider is connected:

- draft only
- optional provider connection path
- manual copy fallback

### Approval Granularity

Campaign-level approval allows Nexus to prepare the whole campaign.

Actual publication requires separate approval for each post in V1.

Preferred approval:

`Approve publish`

Chat approval may count only when it is explicit, such as:

`Yes, approve publishing this post.`

Law:

The user approves the exact post/action, not a vague campaign.

### Campaign Size And Narrative

V1 may propose a small multi-day campaign.

Default size:

- 2 to 4 posts

Posts must be connected by a clear narrative.

Recommended narrative pattern:

- day 1: pain
- day 2: solution
- day 3: demo
- day 4: audience question

Law:

A campaign is a small learning sequence, not a full marketing system.

### Media And Assets

Nexus may propose:

- image
- video
- short demo
- creative brief

If no real asset exists:

- route to `Visual Build Agent` or `Share / Demo Agent` to create a demo or approved asset
- or prepare text-only campaign draft
- mark missing asset clearly

Forbidden:

- pretend media exists
- publish unapproved media

### Results And Comments

Nexus may read real social results only with provider permission.

Allowed result types:

- views
- clicks
- comments
- likes

Precision warning:

Different platforms expose different metrics, so Nexus must not overstate precision.

V1 should summarize comments instead of displaying all comments.

Individual examples may be shown only when they do not expose sensitive information.

### Blocked Social Actions In V1

V1 must not:

- reply to comments as the user
- delete comments
- hide comments
- send private messages
- spend money on boosting or ads
- change account/page details

Allowed:

- suggest reply text for manual approval
- recommend user action for problematic comments

Paid promotion belongs to `GROW-SEM-001`, not Social Campaign execution.

### Product History

History must record product-readable events:

- draft created
- approved
- scheduled
- published
- failed
- canceled
- results received
- learning summary

Technical provider logs must not be the visible history.

### Safe Failure

Safe failure means no external harm occurred.

Safe failures include:

- provider down
- permission missing
- approval missing
- post rejected
- asset missing
- scheduling failed

In all cases Nexus must:

- not publish
- not invent success
- preserve retry state
- tell the user what failed

### Channel Choice

Nexus may recommend the best social channel by default.

The user can change it.

Law:

Nexus recommends one channel and explains why, but does not lock the user in.

### Outcome Claims

Nexus must not promise:

- users
- sales
- reach
- virality
- leads
- conversions
- success
- return on investment

Allowed:

`This is a small experiment to test interest.`

## Agent Reality Gate

`GROW-AGT-002` may not be marked `trueGreen` until it passes the Agent Reality Gate:

- explicit role file or contract
- explicit provider permission model
- structured campaign input contract
- structured campaign output envelope
- live provider-backed path or explicit provider-unavailable safe state
- no fake posting, fake scheduling, fake engagement, or fake campaign result
- no external action without explicit approval
- no external action without provider permission
- no provider becomes product truth owner
- audit history records each approved external action
- unit tests
- live browser proof for draft-only and approved-action paths

## Required Preconditions

The agent may prepare a campaign only after `Growth Agent` identifies a product-connected opportunity.

Required input:

- product state
- target audience
- current artifact/demo/share/release state
- selected growth plugin
- campaign objective
- bounded campaign duration
- approved message or value proposition
- available provider connections
- provider permission scopes
- user approval state
- what must not be promised
- what must not be shared

If product state is missing, the agent must return to `GROW-AGT-001`.

If share/demo safety is needed, the agent must route to `SHARE-AGT-001`.

If a campaign changes product truth, the agent must route to `MUT-001`.

## Provider Scope Model

Every provider connection must declare exact scopes.

Provider examples:

- Instagram
- Facebook
- TikTok
- LinkedIn
- YouTube
- X / Twitter
- WhatsApp Business
- email marketing provider

Permission scopes:

- `draft`: create or prepare a draft only
- `schedule`: schedule approved content
- `publish`: publish approved content
- `reply`: reply to comments or messages
- `moderate`: hide or delete comments
- `direct-message`: send private messages
- `ad-spend`: spend money on promotion
- `read-results`: read real engagement/result data

First release allowed scopes:

- `draft`
- `schedule` only with explicit approval
- `publish` only with explicit approval
- `read-results` only when provider is connected and user approved

First release blocked scopes:

- `reply`
- `moderate`
- `direct-message`
- `ad-spend`
- `account-edit`

Law:

Provider connection is not permission to act. Every external action requires the right scope and explicit approval.

## Approval Model

The agent must separate these states:

- campaign recommended
- campaign drafted
- ready for approval
- approved for scheduling
- scheduled
- approved for publication
- published
- failed safely
- canceled

Approval must be explicit for:

- any scheduled post
- any published post
- any live external link
- any use of real provider account
- any result collection from provider

Approval must include:

- provider
- account/page
- content
- timing
- target audience
- exact action
- reversible controls where available
- per-post approval for publication in V1

Law:

The user approves a specific action, not vague permission for Nexus to run growth.

## Campaign Output Envelope

The agent must return structured campaign output.

Required fields:

```json
{
  "agentId": "social-campaign-execution-agent",
  "responseSource": "agent-envelope",
  "campaignType": "learning-experiment|demo-sequence|launch-sequence|feedback-request|message-test",
  "productBasis": {
    "productId": "",
    "artifactId": "",
    "audience": "",
    "valueProposition": "",
    "sourceAgent": "growth-agent"
  },
  "sequence": [
    {
      "day": 1,
      "purpose": "problem|solution|demo|feedback|follow-up",
      "provider": "",
      "draftText": "",
      "assetNeed": "",
      "requiresApproval": true,
      "allowedAction": "draft|schedule|publish"
    }
  ],
  "permissions": {
    "providerConnected": false,
    "account": "",
    "scopes": [],
    "approvalRequiredBeforeExternalAction": true
  },
  "fallback": {
    "manualCopyAvailable": true,
    "draftOnlyBecauseProviderMissing": false,
    "missingAsset": ""
  },
  "historyEvent": "",
  "blockedActions": ["reply", "moderate", "direct-message", "ad-spend", "account-edit"],
  "doNotPromise": [],
  "requiresAgent": "none|share-demo-agent|mutation-change-agent|verification-agent|release-agent",
  "userMessage": "",
  "status": "drafted|ready-for-approval|approved|scheduled|published|needs-provider|needs-approval|failed-safely"
}
```

## External Action Rules

Drafting:

- allowed when product truth exists
- does not require provider connection if draft remains in Nexus
- must be clearly marked as draft

Scheduling:

- requires provider connection
- requires `schedule` scope
- requires explicit approval for exact post and time
- allowed only for connected V1 providers or explicitly promoted provider tasks

Publishing:

- requires provider connection
- requires `publish` scope
- requires explicit approval for exact post
- requires per-post approval in V1

Reading results:

- requires provider connection
- requires `read-results` scope
- must use real provider data only
- no fabricated engagement
- must distinguish platform-provided metrics from manual observations

Blocked for first release:

- replies
- deletion/moderation
- direct messages
- ad spend
- account/page edits

Provider missing:

- prepare draft
- offer provider connection
- offer manual copy fallback
- never claim posted or scheduled

## Live Proof Requirements

### Scenario 1: Draft Only

Input:

`Create a three-day campaign for the lead management demo.`

Expected:

- campaign sequence is created from real product state
- three drafts are produced
- sequence follows a narrative, such as pain -> solution -> demo or feedback
- no provider action happens
- state says `ready-for-approval`

### Scenario 2: Provider Not Connected

Input:

`Schedule this for Instagram.`

State:

No Instagram provider connection.

Expected:

- no scheduling occurs
- agent returns `needs-provider`
- user sees what connection is required
- user can copy the draft manually

### Scenario 3: Provider Connected But Not Approved

Input:

`Publish this post.`

State:

Provider exists, but approval missing.

Expected:

- no publication occurs
- agent asks explicit approval for exact content/account/action
- campaign-level approval alone is not enough to publish the post

### Scenario 4: Approved Schedule

Input:

User approves exact provider, account, post, and time.

Expected:

- schedule action runs only if provider has `schedule` scope
- history records approval and scheduled state
- failure returns safe error without fake success

### Scenario 5: Forbidden Action

Input:

`Reply to everyone who comments.`

Expected:

- blocked in first release
- no external reply occurs
- user gets a clear scope boundary
- Nexus may draft a suggested manual reply, but cannot post it

### Scenario 6: Draft-Only Channel

Input:

`Prepare this for TikTok.`

Expected:

- TikTok remains draft-only in V1
- no provider action occurs
- draft and manual copy fallback are available

### Scenario 7: Missing Asset

Input:

`Make this campaign with a demo video.`

State:

No approved video/demo asset exists.

Expected:

- Nexus routes to `Visual Build Agent` or `Share / Demo Agent`
- campaign remains draft until asset exists or text-only fallback is approved
- no fake media is referenced

### Scenario 8: Real Results

State:

Facebook provider is connected with read-results permission.

Expected:

- Nexus reads only real platform metrics
- comments are summarized
- sensitive comment content is not exposed
- history records results received and learning summary

## Failure Rules

If provider action fails:

- do not mark as posted/scheduled
- do not fabricate result
- preserve draft
- record failed-safe state
- tell user what failed and what can be retried

If permissions are missing:

- do not bypass approval
- do not ask for broad access by default
- request the narrowest provider permission needed

## Core Law

`Social Campaign Execution Agent` may help Nexus act outside Nexus only through explicit approval, scoped provider permissions, safe failure, and audit history.

It must never turn Growth into silent external automation.
