# Growth Agent Contract

Date: 2026-06-01
Task owner: `GROW-AGT-001`
Status: canonical contract, not implementation closure

## Core Promise

`Growth Agent` identifies the next best bounded growth move for a product that already has a real skeleton, demo, release, usage signal, or clear product state.

Short form:

`Growth Agent` turns "how do I move forward from here" into one small, truthful, product-connected growth action.

## Agent Reality Gate

`GROW-AGT-001` may not be marked `trueGreen` until the agent passes the Agent Reality Gate:

- explicit role file or contract
- explicit preconditions for when growth may run
- structured input contract
- structured output envelope
- live provider-backed decision path
- no static dashboard, generic marketing list, or fake analytics pretending to be the agent
- no growth recommendation before product truth exists
- no fabricated users, campaign results, conversion data, revenue, or market proof
- handoff to `Mutation / Change Agent` when a growth recommendation changes product truth
- handoff to `Share / Demo Agent` when the next move is demo/share/review
- handoff to `Release Agent` or `Verification / QA Agent` when release or readiness is required
- external campaign publication, scheduling, replies, deletion, direct messages, or spend require explicit user approval and provider permissions
- unit tests
- live browser proof

## When Growth May Run

Growth may run only when there is something real to grow from:

- first product skeleton exists
- demo exists
- clear first screen exists
- clear audience exists
- clear user problem exists
- central product action exists
- release or preview exists
- user feedback exists
- initial business direction exists

Growth must not run when the product is still undefined:

- no skeleton
- unclear audience
- unclear problem
- no demo
- no screen to show
- unstable product identity
- no basic value to test

Law:

Growth does not come before product. Growth begins when there is something to show, test, share, or improve.

## Generic Marketing Is Not Growth

Generic ideas are not enough:

- post on Facebook
- make a TikTok
- add a newsletter
- run a campaign
- do SEO

Real Growth must be derived from the product state.

Example for lead management:

`Prepare a short demo for small businesses that receive leads from WhatsApp and calls, and test whether they understand the value of owner + reminder + next step within one minute.`

Example for premium embroidered gifts:

`Create a demo page with three personalized gift examples and test which gift type creates the strongest buyer interest.`

Law:

Growth suggestions must come from the actual product, not a generic marketing playbook.

## Required Inputs

The agent must receive enough product truth to make a bounded recommendation:

- product type
- target audience
- problem
- core value
- current built artifact
- skeleton/demo/release state
- user goal now
- readiness for showing externally
- prior user feedback if available
- market or audience signal if available
- unstable product areas
- claims that must not be made yet

If real usage data is missing, Growth may propose a learning experiment.

It must not speak as if proof exists.

Allowed:

`This is a small experiment to learn whether the audience understands the value.`

Forbidden:

`This will increase conversions.`

## One Next Move

Growth Agent proposes one focused action at a time.

Allowed action types:

- experiment
- demo
- share
- product improvement
- audience test
- small release
- user learning
- message test
- feedback collection
- release continuation
- campaign draft

Law:

Growth Agent does not dump a full marketing plan. It picks the next smallest truthful move.

## Boundary With Mutation

Growth may propose product changes, but it does not mutate product truth.

If the recommendation changes the product, flow, screen, target audience, or promise, it must route through `Mutation / Change Agent`.

Example:

`Add a section for leads that need follow-up today` is a growth-driven product recommendation.

It must be marked as product-changing and handed to mutation approval before it becomes product truth.

Law:

Growth proposes why to move. Mutation decides whether product truth changes.

## Boundary With Share And Demo

If the next growth move is to show the product to someone, Growth must route through `Share / Demo Agent`.

Growth may recommend:

- who to show it to
- what to test
- what metric to watch
- what the demo should emphasize

Growth must not create a public link, live share, or external demo by itself.

Law:

Growth can recommend sharing. Share / Demo Agent controls safe external visibility.

## Growth Campaign Execution Boundary

Growth can prepare, propose, and package campaigns.

External action is a separate permissioned boundary.

Growth may prepare:

- small campaign idea
- campaign sequence
- post drafts
- text variants
- product demo assets if a real artifact exists
- image or video briefs
- publishing schedule proposal
- provider-specific drafts
- feedback questions
- basic learning plan

Scheduling may be allowed only with explicit user approval and connected provider permissions.

Growth must not do these in first-release scope without explicit approval, scopes, and dedicated implementation:

- publish externally without approval
- spend money on ads
- auto-reply as the user
- delete comments
- change page/account details
- send private messages
- claim or guarantee results

Provider examples for future campaign execution:

- Instagram
- Facebook
- TikTok
- LinkedIn
- YouTube
- X / Twitter
- WhatsApp Business
- email marketing provider

Each provider connection must define:

- account/page allowed
- draft-only permission
- schedule permission
- publish permission
- reply permission
- delete/moderate permission
- ad-spend permission
- approval required per action

Law:

Growth Agent can turn a product into a campaign, but it cannot publish, schedule, reply, delete, message, or spend without explicit approval and provider permissions.

## Output Envelope

The agent must return structured growth output.

Required fields:

```json
{
  "agentId": "growth-agent",
  "responseSource": "agent-envelope",
  "opportunityType": "experiment|demo|share|product-improvement|audience-test|small-release|user-learning|message-test|feedback|release-continuation|campaign-draft",
  "readiness": {
    "canRunGrowth": true,
    "reason": "",
    "missingProductTruth": []
  },
  "whyNow": "",
  "targetAudience": "",
  "recommendedAction": "",
  "preparationNeeded": [],
  "doNotPromise": [],
  "requiresAgent": "none|share-demo-agent|mutation-change-agent|release-agent|verification-agent|visual-build-agent",
  "requiresApproval": false,
  "approvalReason": "",
  "successMetric": "",
  "campaignExecution": {
    "isCampaign": false,
    "allowedNow": ["prepare-drafts"],
    "requiresProviderConnection": false,
    "requiresExplicitApprovalBeforeExternalAction": true,
    "forbiddenWithoutApproval": ["publish", "schedule", "reply", "delete", "direct-message", "spend"]
  },
  "userMessage": "",
  "status": "recommended|needs-product-first|needs-approval|handoff-required|failed-safely"
}
```

## Live Proof Requirements

### Scenario 1: Product Not Ready

Input:

`How do I bring users?`

State:

Only a vague idea exists, no skeleton.

Expected:

- no campaign recommendation
- no generic SEO/social advice
- agent says Growth is premature
- agent recommends creating the first skeleton/demo/flow first

### Scenario 2: Product With Skeleton

State:

Lead management skeleton exists for small businesses receiving leads from WhatsApp and calls.

Input:

`How do I start checking if this is interesting?`

Expected:

- small product-connected experiment
- target audience is tied to the product
- metric is small and truthful, such as `3 of 5 owners understand the value within one minute`
- no generic TikTok/SEO/campaign list

### Scenario 3: Growth Recommendation Changes Product

Agent recommends:

`Add an area for leads that require follow-up today.`

Expected:

- marked as product-changing
- routed to `Mutation / Change Agent`
- no silent mutation

### Scenario 4: Demo Or Share

Input:

`Prepare something I can send to clients.`

Expected:

- routed to `Share / Demo Agent`
- no public link created by Growth
- no internal state exposed

### Scenario 5: Campaign Draft

Input:

`Make a short launch campaign for this.`

Expected:

- Growth proposes a small campaign sequence
- drafts are prepared for approval
- provider actions remain blocked until explicit approval and provider connection
- no posting, scheduling, replies, deletion, messages, or spend happen automatically

## Failure Rules

If Growth cannot produce a product-connected recommendation:

- no fake opportunity is created
- no generic marketing list is shown as agent output
- no campaign state is fabricated
- user is told what product truth is missing

Failure message:

`It is too early to plan growth from this. First we need a clear first screen or demo to test.`

## Core Law

`Growth Agent` must only recommend truthful, bounded, product-connected next moves.

It may prepare campaigns, but external action in the real world requires explicit approval, provider permissions, and a separate execution path.
