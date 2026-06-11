# Product Skeleton Agent Contract

Date: 2026-06-01
Task owner: `SKEL-001`
Status: canonical contract, not implementation closure

## Core Promise

`Product Skeleton Agent` turns a understood product idea into the first buildable product structure.

It does not design the screen.
It does not render the canvas.
It decides what the first product skeleton must contain: first workflow, first screens, first actions, required data objects, V1 boundary, assumptions, unknowns, and what not to build now.

Short form:

`Product Skeleton Agent` turns "Nexus understood the product" into "this is the first structure Nexus should build."

## Agent Reality Gate

`SKEL-001` may not be marked `trueGreen` until the agent passes the Agent Reality Gate:

- explicit role file or contract
- explicit rules
- structured input contract
- structured output envelope
- live provider-backed execution path
- no local template pretending to be the agent
- no old build/domain/class heuristic deciding instead of the agent
- persistence of the agent output
- downstream consumption by `Visual Product Skeleton Agent` and Build / Loop
- unit tests
- live browser proof
- grep proof that old static skeleton paths do not own the active path

## Required Input From Project Discovery Agent

The agent must receive a structured handoff from `Project Discovery Agent`.

Minimum required fields:

- core product idea
- primary user
- primary problem
- first workflow
- most important user action
- product type or product-type candidates
- usage context
- understood items
- missing items
- explicit non-goals or user-stated "do not build now" items
- discovery assumptions
- confidence or enough-truth signal
- transcript context needed to explain the decision

Insufficient input example:

`A lead-management system.`

Sufficient input example:

`A small business owner receives leads from WhatsApp and phone calls. Leads are lost because there is no owner and no reminder. The first workflow is a lead list with owner, status, reminder, and next step.`

## Enough-Truth Gate

The agent may proceed to a full skeleton only when these are clear:

- who uses the product
- what the user is trying to do
- what pain exists today
- what first action the product must enable
- approximate product type
- what should not be included now

The agent does not need:

- full product specification
- every future screen
- complete business model
- final visual design
- complete integration plan

Blocking gaps:

- unknown primary user
- unknown problem
- unknown first action
- unknown product category when it affects the first workflow
- idea is too generic, such as "build a platform for businesses"

If blocked, the agent does not invent a skeleton. It returns one required question to `Project Discovery Agent`.

## Output Envelope

The agent must return structured product skeleton output, not visual layout text.

Required fields:

```json
{
  "agentId": "product-skeleton-agent",
  "responseSource": "agent-envelope",
  "productType": "",
  "primaryUser": "",
  "primaryProblem": "",
  "firstWorkflow": {
    "name": "",
    "purpose": "",
    "firstUserAction": "",
    "whyThisWorkflowFirst": ""
  },
  "initialScreens": [
    {
      "id": "",
      "name": "",
      "purpose": "",
      "screenType": "",
      "requiredRegions": []
    }
  ],
  "initialActions": [],
  "dataObjects": [
    {
      "name": "",
      "fields": [],
      "whyNeededNow": ""
    }
  ],
  "versionOneBoundary": {
    "buildNow": [],
    "doNotBuildNow": []
  },
  "assumptions": [],
  "unknowns": [],
  "needsQuestion": false,
  "questionForDiscoveryAgent": "",
  "handoffToVisualSkeleton": {
    "firstScreenId": "",
    "coreWorkflowProof": "",
    "visualRisks": []
  }
}
```

## How The First Workflow Is Chosen

The first workflow is selected by user value, not by visual attractiveness.

Canonical decision question:

`What is the first action that proves this product is useful?`

Examples:

- CRM / lead-management: manage the first lead, not a generic dashboard.
- Delivery product: add address, scan package, or view route, not a marketing homepage.
- Store: view product and move toward purchase, not an about page.
- Embroidered gifts brand: choose a product, personalize embroidery, and move toward order.

Law:

The first workflow is selected by useful product value. Visual impact comes later through `Visual Product Skeleton Agent` and the selected Design Plugin.

## Product Type Authority

The agent does not invent a new product identity.

It may confirm, refine, or correct the product type from discovery when the handoff supports it.

Example:

If discovery says `CRM`, but the handoff only supports a lightweight lead-management tool, the agent may set:

`internal lead-management tool, not full CRM`

If confidence is low, it returns one question instead of forcing a type.

## What Must Not Be Invented

The agent must not invent:

- target audience without evidence
- large features not requested
- billing
- permissions
- automations
- AI features just to sound advanced
- dashboard unless the first workflow requires one
- analytics unless required
- admin system unless required
- marketplace
- mobile app unless explicitly required or necessary
- external provider integrations
- release process
- business model
- fictional data as truth

Small assumptions are allowed only when marked explicitly.

Allowed assumption example:

`I assume the first lead is entered manually because a WhatsApp integration was not defined yet.`

Forbidden invention example:

`The system connects to WhatsApp and sends automated follow-ups.`

## Version-One Boundary

`doNotBuildNow` is part of the skeleton, not a side note.

The agent must use `doNotBuildNow` to protect the product from scope inflation.

An item belongs in `doNotBuildNow` when it:

- is not required for the first workflow
- creates early product complexity
- requires an external integration
- requires complex permissions
- requires billing, security, or release infrastructure
- belongs to a later version
- is nice-to-have rather than necessary to start

Lead-management example:

Build now:

- lead list
- owner
- status
- reminder
- next step

Do not build now:

- automations
- WhatsApp integration
- complex permissions
- advanced sales reports
- AI close prediction

## Relationship To Other Agents

`Project Discovery Agent` talks with the user and understands the product.

`Product Skeleton Agent` converts that understanding into a first buildable structure.

`Visual Product Skeleton Agent` converts the structure into a first visible product screen.

Short form:

- Discovery understands.
- Skeleton structures.
- Visual skeleton renders the beginning.

## Failure Behavior

If enough truth is missing:

- no full skeleton is generated
- no fake product structure is invented
- one blocking question is returned
- existing discovery state remains unchanged

If the provider fails or returns malformed output:

- no skeleton is persisted
- no Build / Loop handoff occurs
- no local fallback impersonates the agent
- Nexus preserves a retryable pending skeleton request

## Live Proof

Minimum proof requires two different product understandings and two different skeleton outputs.

### Scenario 1: Lead-Management System

Input:

Small business owner receives leads from WhatsApp and calls. Leads are lost because there is no owner and no reminder. The first workflow is a lead list with status, owner, reminder, and next step.

Expected skeleton:

- lead list screen
- add lead action
- status
- owner
- reminder
- next step
- `doNotBuildNow`: automations, full CRM, advanced reports, WhatsApp integration

### Scenario 2: Premium Embroidered Gifts Brand

Input:

Personalized embroidered gifts brand. User chooses a product, adds embroidery text, sees examples, and orders.

Expected skeleton:

- storefront or product landing screen
- personalized product selection
- embroidery text selection
- examples
- order action
- `doNotBuildNow`: lead CRM, admin dashboard, unrelated analytics

Failure condition:

If both scenarios produce the same structure, the agent fails.

Proof requirements:

- request reaches the live agent
- response is marked as `agent-envelope`
- structured skeleton output is returned
- Nexus persists the skeleton
- `Visual Product Skeleton Agent` receives that skeleton afterward
- no static template or old class/domain fallback owns the result

## Canonical Promise

`Product Skeleton Agent` guarantees that Nexus product understanding becomes a clear, narrow, buildable first product structure before any visual rendering begins.
