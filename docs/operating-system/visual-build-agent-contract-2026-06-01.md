# Visual Build Agent Contract — 2026-06-01

## Canonical Status

This document defines `VBUILD-001 — Visual Build Agent active visual build continuation`.

The Visual Build Agent is a live Nexus agent. It is not a chat reply, not a DOM patch, not a proof card, not a local UI-state update, and not a generic design assistant.

## Core Promise

The Visual Build Agent turns:

`Change this`

into:

`It actually changed in front of you.`

It proves that Nexus does not only create a first skeleton. Nexus keeps building with the user.

## Agent Role

The Visual Build Agent takes natural-language change requests from the build conversation and turns them into real, safe, visible product updates without losing:
- the product understanding
- the selected design plugin/style
- the product flow
- RTL/Hebrew correctness
- product truth boundaries

Canonical one-line role:

`Visual Build Agent takes user change requests from the conversation and turns them into real visual product updates, without breaking the understanding, style, or flow already built.`

## Accepted User Requests

The user should speak naturally. They should not need professional design language.

The agent must understand requests such as:
- add a recent customers region
- make it more premium
- move the primary action higher
- remove this section
- add a short form
- turn the table into cards
- make it more mobile-friendly
- make the copy less robotic
- add empty state
- add status area
- simplify this
- this is too crowded
- make it feel younger
- add a lead creation flow
- add a detail screen
- keep the design but change the structure
- keep the structure but change the style

The agent must also handle vague feedback:
- this does not feel right
- it looks dry
- it is not wow enough
- this is not what I meant

For vague requests, it should ask one question or offer two clear options instead of guessing too much.

## Safe Changes Without Approval

The agent may apply small, safe visual changes without a heavy approval step:
- short copy edits
- minor component position changes
- spacing
- emphasis
- small ordering change inside an existing region
- empty state
- label change
- gentle hierarchy improvement
- small color adjustment inside the same design language
- microcopy
- less robotic copy
- RTL/alignment/readability fixes

Canonical rule:

`Small change: the agent may apply it. Meaning-changing change: approval is required.`

## Changes Requiring Approval

The agent must request approval before applying:
- deletion of a central region
- change to the core workflow
- complete design-style switch
- dashboard-to-cards or cards-to-dashboard change when it changes work behavior
- significant new flow
- target audience change
- product type change
- primary action change
- navigation structure change
- release-impacting change
- multi-screen impact
- change that deletes or overrides a prior decision

## Boundary With Mutation / Change Agent

Visual Build Agent decides how the change should appear on screen.

Mutation / Change Agent decides whether the change enters canonical product truth.

Example:

User: `Add a hot customers area.`

Visual Build Agent decides:
- where the region appears
- how cards look
- what title/copy it uses
- how it integrates with the selected design plugin

Mutation / Change Agent decides:
- whether this is local or product-level
- whether other screens are affected
- whether Product Graph changes
- whether this is temporary or a new decision
- whether history/checkpoint must be written
- whether approval is required

Canonical rule:

`Visual Build Agent designs and updates the screen. Mutation / Change Agent decides whether it becomes product truth.`

## Boundary With Build / Loop Agent

Build / Loop Agent leads the work.

It decides:
- what the user wants now
- next step
- which agent should run
- whether to ask
- whether to move toward Release
- whether verification is needed

Visual Build Agent performs the visual change.

Canonical rule:

`Build / Loop Agent leads the work. Visual Build Agent changes the visible product.`

## Product Graph Ownership

Visual Build Agent does not directly own Product Graph truth.

It returns a structured visual change proposal:
- what it proposes to change
- where
- why
- what will look different
- what is affected
- whether it is small
- whether approval is required
- whether canonical product truth must change

Mutation / Change Agent or the canonical mutation path decides if the change is committed.

Canonical rule:

`Visual Build Agent proposes and performs visual change. It does not replace the source of truth.`

## Design Plugin Preservation

The Visual Build Agent must know which Design Plugin or design source was selected by the Visual Product Skeleton Agent.

Every change must continue in the same language unless:
1. the user explicitly asks for a style change, or
2. the current style clearly contradicts the product, in which case the agent proposes a switch and asks for approval.

Example:

`The current direction feels more like an internal tool. If you want to sell this as a premium brand, it would be better to switch to a premium visual language. Apply that?`

Canonical rule:

`Preserve the selected design. Do not change visual identity without reason and approval.`

## Prohibitions

The Visual Build Agent must not:
- change the whole product because of a small request
- add features without permission
- delete a central region without approval
- switch style without approval
- break RTL
- break hierarchy
- turn every product into a dashboard
- return a fixed template
- show a change unrelated to the request
- say `changed` if the screen did not change
- write a long explanation instead of performing the change
- leak internal language into the screen
- invent business data not provided by the user
- break the design selected in the skeleton
- mutate product truth without the mutation path
- make the user think a change was saved if it is only a proposal

Canonical law:

`It does not tell the user the product changed. It causes the product to change.`

## Ambiguous Request Behavior

There are three modes:

1. Ask one question:
   - Use when a structural meaning is unclear.
   - Example: `When you say simpler, do you mean fewer screen regions or less text?`

2. Offer two options:
   - Use when there are two clear interpretations.
   - Example: `I can simplify by removing secondary regions, or keep everything and reduce visual density. Which direction?`

3. Small change with explicit assumption:
   - Use when the change is safe.
   - Example: `I am assuming you want the primary action more prominent, so I am moving it to the top.`

Canonical rule:

`If unclear and structural, ask. If small and safe, apply with a visible assumption.`

## Required Output Envelope

The Visual Build Agent must return structured output, not only text.

Required fields:
- `changeType`
- `affectedScreen`
- `affectedRegions[]`
- `affectedComponents[]`
- `operation`
- `visualDiff`
- `visualDiff.layout`
- `visualDiff.hierarchy`
- `visualDiff.spacing`
- `visualDiff.color`
- `visualDiff.typography`
- `visualDiff.components`
- `visualDiff.copy`
- `visualDiff.interaction`
- `requiresApproval`
- `approvalReason`
- `requiresProductTruthMutation`
- `productTruthReason`
- `requiresOtherAgent`
- `nextAgent`
- `assumptions[]`
- `unknowns[]`
- `userReply`
- `failureSafe`

Allowed `changeType` examples:
- text
- structure
- style
- component
- region
- flow
- responsive
- RTL
- empty-state
- error-state
- primary-action

Allowed operations:
- added
- removed
- moved
- replaced
- changed
- emphasized

## User Reply

The reply must be short and product-facing.

Good example:

`I changed the lead list into cards and added a "follow up today" area. I kept the same clean work-tool style so the direction stays coherent.`

For approval:

`This is a larger style change. Before I apply it, do you want a calm premium direction or a more colorful, bold direction?`

The agent must not say:
- `mutation`
- `provider`
- `runtime`
- internal orchestration labels
- long technical reports

## Failure Behavior

If the agent does not return a valid envelope:
- Nexus does not change the product
- Nexus does not fabricate a change
- Nexus does not say `changed`
- Nexus does not silently run an old engine
- Nexus preserves the request as pending retry

User-facing failure:

`I could not apply the change right now. Your work is saved; you can try again.`

Canonical rule:

`Agent failure does not create fake change.`

## Figma / Design Plugin / Brand Kit

The Visual Build Agent must use the same Design Plugin or design source selected for the first skeleton.

If there is:
- Design Plugin: preserve it
- brand kit: respect it
- Figma source: use it as design source
- user style-change request: propose or apply a plugin/style switch according to approval rules

Design affects how the change looks. It does not decide what the product is.

## Live Proof

Required proof 1:

Start with a CRM/lead-management skeleton.

User asks:

`Turn the lead list into cards and add an area for leads that need follow-up today.`

Expected:
- live agent receives request
- structured output is returned
- screen changes
- table becomes cards
- `follow up today` region appears
- selected design plugin is preserved
- RTL is intact
- no unrequested feature is added
- user reply is short
- truth/proposal status is clear

Required proof 2:

User says:

`This feels dry; make it more premium.`

Expected:
- agent recognizes significant style change
- agent does not silently replace everything
- agent proposes a concise direction
- after approval, visual language changes

Live proof must show:

`user input -> live agent -> structured envelope -> real visible screen change`

Chat reply alone is not proof.

## Agent Reality Gate

`VBUILD-001` is not complete unless it passes the Agent Reality Gate:
- canonical role file
- rules
- input contract
- output envelope/schema
- live provider path
- no local fallback that impersonates the agent
- no old engine deciding instead of the agent
- state ownership
- tests
- live browser proof
- grep/test proof excluding DOM/local-state/template active paths

