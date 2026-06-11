# Growth Plugin Layer Contract

Date: 2026-06-01
Task owners: `GROW-PLUG-001`, `GROW-PLUG-002`, `GROW-SEO-001`, `GROW-SEM-001`, `GROW-EMAIL-001`, `GROW-LAND-001`, `GROW-MEASURE-001`
Status: canonical contract, not implementation closure

## Core Promise

`Growth Plugin Layer` lets Nexus choose and operate the right external growth capability for the product goal without forcing the user to learn each external tool.

Short form:

Nexus chooses the channel by goal, prepares the action, asks for approval, executes through the right provider only when allowed, and measures only real results.

## Core Law

Nexus can use external growth capabilities, but only through a defined plugin, clear permissions, user approval, result measurement, and no fake promises.

Tools do not become the product.

## Canonical Answers Locked On 2026-06-01

These decisions are part of the product law for `GROW-PLUG-001/002`.

### Recommendation Policy

Nexus chooses one primary recommended Growth step by default.

User-facing shape:

`This is the best next step now, and this is why.`

Nexus may show one or two alternatives only when there is a real strong tradeoff.

Plugins may generate internal options, but the user sees one recommended action unless alternatives are truly justified.

Law:

Growth Plugin Layer is a decision system, not a menu of tools.

### Product Readiness Gate

A product is ready for a Growth Plugin only when it has at least:

- clear product or skeleton
- clear audience
- clear core value
- demo, screen, page, or artifact that can be shown, tested, or improved

A full release is not required.

Something testable is required.

Law:

No plugin runs from vague idea alone.

### Channel Visibility

The user may see the channel name, but the channel is not the center of the experience.

Good:

`Recommended step: test demand with a short Instagram post.`

Secondary detail:

`Channel: Instagram`

Bad:

`Choose SEO / Google Ads / Instagram.`

Law:

Nexus explains the growth move first and the tool second.

### Draft-Only Mode

First release must support draft-only mode without provider connection.

Allowed without provider:

- prepare an ad
- prepare SEO content
- prepare a social post
- prepare an email
- prepare a landing page experiment
- prepare a measurement plan

Forbidden without provider:

- say it was published
- say it was sent
- say it was scheduled
- say results were collected

Law:

Drafting does not require a provider. External action does.

### Selection Priority

When multiple plugins fit, Nexus chooses by this order:

1. product and audience fit
2. speed of learning
3. low risk
4. low cost
5. likelihood of bringing users

Law:

Nexus learns fast and safely before it spends money or opens broad campaigns.

### Success Metric

Every plugin must return a small success metric.

Examples:

- `5 people saw the demo`
- `3 people understood the value`
- `10 clicks`
- `1 high-quality reply`

Forbidden:

- vague success
- marketing success
- growth success
- implied proof without data

Law:

Every Growth action needs a small learning target.

### Product Change Boundary

A plugin may recommend a product change.

It may not apply the product change itself.

All product-truth changes must pass through `Mutation / Change Agent`.

Law:

Growth can suggest what would improve growth. Mutation decides whether the product changes.

### Registry Visibility

The plugin registry is mostly internal in V1.

The user must not see a plugin marketplace.

Allowed simple user-facing modes:

- social
- search
- email
- demo
- landing page

Law:

Users choose intent when needed, not plugins.

### Hard Prohibitions

Growth Plugins must not:

- publish without approval
- spend money without approval
- promise outcomes
- send emails without lawful audience source
- use private information without approval
- connect external providers silently
- reply as the user without approval
- present estimates as real data

### Product History

Every plugin result must be recorded in product history in product-readable language.

Examples:

- `First SEO experiment was created.`
- `Campaign draft was prepared.`
- `Demo version was sent for review.`
- `Initial result was received.`

The history should include the important product journey, not every technical detail.

## What This Layer Covers

First-release plugin families:

- Social Campaign Plugin
- SEO Plugin
- SEM / Ads Plugin
- Email Campaign Plugin
- Landing Page Experiment Plugin
- Analytics / Measurement Plugin

Future plugin families:

- Search Console Plugin
- Retargeting Plugin
- Marketplace / App Store Plugin
- Affiliate / Partnership Plugin
- WhatsApp Business Growth Plugin

## Plugin Registry Contract

Every growth plugin must declare:

- plugin id
- plugin name
- when to use it
- when not to use it
- what it can do
- what requires user approval
- what requires provider connection
- what can be published
- what must not be published
- required product inputs
- required provider inputs
- output envelope
- success metric model
- provider unavailable behavior
- failed action behavior
- V1 status
- blocked scopes
- related agent handoffs
- draft-only support
- primary recommendation text
- optional alternatives only when justified
- product-history summary

Law:

Nexus chooses the plugin by product goal and readiness, not because the provider exists.

## Plugin Selection

`Growth Agent` chooses the next growth capability by asking:

- Is the product ready for growth?
- What is the smallest useful next move?
- Is this a learning move, acquisition move, message move, demo move, or measurement move?
- Which plugin fits the goal?
- Is a provider connection required?
- Is external approval required?
- What must not be promised?
- What is the one primary recommendation?
- Is an alternative actually justified?
- What small success metric proves learning?

Examples:

- Not ready: build the first skeleton or demo first.
- Ready for customer validation: prepare a share/demo path.
- Ready for search discovery: prepare an SEO page improvement.
- Ready for a small paid test: prepare SEM drafts and budget proposal, no spend without approval.
- Ready for outbound learning: prepare email drafts, no sending without approval and provider connection.
- Ready to measure: connect analytics or define manual measurement.

## User-Facing Decision Shape

The user-facing recommendation must include:

- one primary recommended step
- reason it is the best next move now
- channel as secondary information
- small success metric
- what Nexus can prepare now
- what requires approval or provider connection
- what will be recorded in history

Alternatives may appear only when:

- there are two strong paths with different tradeoffs
- the user asked to compare
- a provider is missing and a draft-only route is available
- cost/risk difference is meaningful

## Social Campaign Plugin

Purpose:

Prepare product-connected social sequences and optionally schedule/publish with explicit approval and provider permissions.

Allowed in first release:

- campaign sequence
- post drafts
- creative brief
- schedule proposal
- draft creation
- schedule/publish only with explicit approval and provider scopes

Blocked in first release:

- ad spend
- automatic replies
- moderation/deletion
- direct messages
- account/page edits
- guaranteed results

Owned execution task:

`GROW-AGT-002`

## SEO Plugin

Purpose:

Help a product become understandable and indexable through page structure, copy, metadata, and search-oriented content.

V1 user-facing framing:

`We will improve the page so it is easier to find and understand.`

Secondary channel detail:

`Channel: SEO`

Allowed in first release:

- page title
- meta description
- headings
- search-intent framing
- opening page copy
- FAQ suggestions
- initial keyword hypotheses
- message-to-search-intent alignment
- landing page content structure
- internal content recommendations
- Search Console connection plan if provider support exists

V1 default path:

- prepare draft/recommendation first
- show keyword hypotheses for approval
- apply to an existing page only after user approval
- create a new page only after user approval and clear reason

New page is allowed in V1 only when there is a clear growth reason, such as a landing page for a specific audience.

Preferred V1 scope:

- improve an existing page first
- long-form articles only when explicitly requested or later scope

Readiness gate:

SEO may run only when at least one exists:

- landing page
- demo that can be explained
- clear product screen
- sharp product description with audience and problem

Best case:

- a page or screen that can actually be improved

If readiness is missing:

`It is too early for SEO. First we need a clear page, demo, or message.`

Application path:

- `Mutation / Change Agent` owns product-message, structure, or product-truth changes
- `Visual Build Agent` owns visible page updates
- `Share / Demo Agent` or `Release Agent` owns external/public visibility

External tools:

- Google Search Console is optional / post-release for V1
- SEO works in draft/page-improvement mode without Search Console
- Google Analytics belongs primarily to `GROW-MEASURE-001`
- SEO may consume analytics insights only if measurement truth already exists

History events:

- SEO experiment created
- keywords selected
- title updated
- meta description updated
- FAQ created
- product message changed
- Search Console missing
- change pending approval
- approved change applied

Small success metrics:

- page has clear title and meta description
- message is clear for the target audience
- FAQ answers basic questions
- 5 people understand the value
- real clicks / impressions / queries, only when real data exists

Hebrew and RTL:

- SEO must support Hebrew and RTL in V1
- titles and descriptions can be Hebrew
- page structure must respect RTL
- language must be natural and not robotic translation

Forbidden:

- guarantee ranking
- guarantee traffic
- guarantee first page placement
- guarantee leads
- guarantee sales
- guarantee conversions
- guarantee organic growth
- guarantee success
- fabricate search volume
- fabricate competition
- fabricate rankings
- publish indexed pages without release/share approval
- treat SEO text as product truth
- show search volume, competition, or rankings as facts without real provider data
- publish SEO changes without approval
- create long-form article content by default
- run before product readiness

Safe failures:

- no page to improve
- unclear product
- missing approval
- provider not connected
- no real data
- message change requires Mutation
- content was not saved
- page was not updated

In safe failure, Nexus must not pretend SEO was completed.

Owned execution task:

`GROW-SEO-001`

## SEM / Ads Plugin

Purpose:

Prepare small paid-search or paid-social tests when the product has a clear audience, message, landing path, and measurement plan.

V1 provider scope:

- default V1 mode is full draft plus publishing preparation, not automatic paid spend
- if one real paid provider is enabled in V1, it starts with Google Ads only
- Meta Ads, TikTok Ads, LinkedIn Ads, and paid social boosts are draft-only or post-release unless explicitly promoted by a later canonical task
- every paid action, including paid promotion of a social post, routes through `GROW-SEM-001`
- organic social routes through `GROW-AGT-002`; paid social routes through `GROW-SEM-001`

Allowed in first release:

- ad copy drafts
- audience hypothesis
- keyword hypothesis
- landing page requirement
- small budget proposal
- campaign structure proposal
- approval envelope
- draft-only paid campaign plan when no provider is connected
- Google Ads publishing preparation if provider connection is explicitly available
- clear user-facing framing: "prepare a small paid experiment to test whether people respond to the message"

External execution allowed only if:

- provider is connected
- exact campaign is approved
- every ad is approved
- budget is approved
- every budget change is approved
- campaign activation is approved
- spend permission exists
- measurement plan exists
- landing page, demo, preview, release, or share link exists
- hard V1 budget cap is enforced

V1 budget boundary:

- Nexus may recommend a small budget, but the user must approve it
- default suggested test budget is 100-200 NIS or up to 50 USD for the first campaign
- any budget increase or cap exception requires a new explicit approval
- provider connection is not spend permission

Landing path boundary:

- paid traffic cannot run before there is something measurable to send people to
- minimum required asset is a landing page or demo
- preferred required asset is a landing page with a clear message and one clear action
- SEM may propose page changes, but it cannot change the page itself
- visual page changes route to `Visual Build Agent`
- message, promise, or audience changes route to `Mutation / Change Agent`

Measurement boundary:

- SEM may read real provider results only after provider connection and scoped permission
- allowed real provider results include spend, clicks, impressions, CPC, and conversions
- conversion measurement belongs primarily to `GROW-MEASURE-001`
- SEM may consume measurement truth, but it is not the owner of measurement truth
- without provider connection or real measurement data, SEM must not present results as real

Safe stop rules:

- Nexus may stop a running campaign automatically only under predefined safety rules
- allowed automatic stop triggers include exhausted budget, unusually fast spend, no clicks, too-high CPC, broken landing page, provider error, or budget-cap breach
- stopping safely is allowed; changing budget, ads, targeting, or campaign structure still requires approval in V1

History events:

- campaign draft created
- keywords selected
- audience proposed
- budget proposed
- budget approved
- ad approved
- campaign activated
- campaign stopped
- results received
- initial learning created

Small success metrics:

- campaign draft is ready
- budget is approved
- ad is ready
- landing page is ready
- if provider is connected: first 20 clicks, initial CPC, or initial response rate
- if human review is used: 3 people understand the landing page after clicking

Blocked until explicitly implemented:

- autonomous spend
- budget changes without approval
- automatic campaign launch
- broad campaign optimization
- result guarantees
- silent ad-provider connection
- paid campaign without landing/demo path
- paid campaign without measurement plan
- paid campaign before campaign, ad, budget, budget-change, and activation approvals
- automatic ad or budget changes after launch

Forbidden promises:

- leads
- sales
- return on ad spend
- conversions
- traffic
- reach
- audience growth
- campaign profitability
- success

Owned execution task:

`GROW-SEM-001`

## Email Campaign Plugin

Purpose:

Prepare and optionally send product-connected email tests through a connected email provider.

V1 provider scope:

- default V1 mode is drafts plus test send, not full audience send
- real audience send is allowed only with connected provider, clear audience source, scoped send permission, and explicit approval
- preferred V1 providers are Mailchimp for lists/campaigns and SendGrid for technical or business sending
- Gmail may be used for test send or small personal email, not broad marketing campaigns
- ConvertKit is optional or post-release unless explicitly promoted by a later canonical task

Allowed in first release:

- email sequence drafts
- subject variants
- audience/source clarification
- approval envelope
- send through provider only with explicit approval and provider scopes
- test send to the user before audience send
- one real email send after explicit approval if provider, audience source, and send permission exist
- sequence preparation as draft
- staged sequence send only with separate approval for every email in V1
- up to two subject/body variants for a small test
- basic list cleanup: duplicate removal, invalid address detection, and basic field separation
- brand-appropriate tone selection, such as business, personal, Israeli, premium, warm, professional, or short and direct
- simple user-facing framing: "prepare a short message for people who already showed interest"

Audience source boundary:

- allowed V1 audience sources are manually entered addresses, a user-uploaded list with user-declared permission, demo/waitlist/interest-form signups, or an existing list inside a connected provider
- cold lists without clear source are not allowed
- Nexus may import addresses only when the user confirms ownership and right to send
- preferred V1 mode is an existing provider list or a small manually entered list
- send must be blocked if audience source or approval is missing
- when audience source is missing, Nexus may prepare draft only

Product and page change boundary:

- Email may propose that the product message or landing page is unclear
- message or product-truth changes route through `Mutation / Change Agent`
- page or screen changes route through `Visual Build Agent`
- Email cannot change the product or page directly

Measurement boundary:

- Email may read provider results only with connected provider and scoped permission
- allowed provider results include sent, opened, clicks, unsubscribes, send errors, bounce, replies if supported, and campaign status
- measurement ownership belongs primarily to `GROW-MEASURE-001`
- Email may show basic results, but comparison, learning, and result truth belong to Measurement

History events:

- draft created
- audience list approved
- audience source approved
- content approved
- test sent
- sent to audience
- send failed
- results received
- initial learning created

Small success metrics:

- draft is ready
- test email is sent
- five addresses receive the email
- first open is recorded
- first click is recorded
- one reply is received
- three out of five people understand the message

Safe failure states:

- provider not connected
- approval missing
- audience source unclear
- addresses missing
- invalid addresses
- send failed
- data unavailable
- list too large
- provider rejected the send
- in every safe failure, Nexus must not send, must not fabricate success, and must preserve retry

Forbidden:

- send without approval
- scrape contacts
- email people without lawful consent basis
- fabricate open/click/reply data
- guarantee replies
- run full email sequence without per-email approval in V1
- send broad marketing campaign through Gmail in V1
- use cold lists without clear audience source
- perform advanced external list verification or enrichment unless a later canonical task adds it
- promise open rates, replies, sales, leads, conversions, revenue, guaranteed improvement, or audience interest

Owned execution task:

`GROW-EMAIL-001`

## Landing Page Experiment Plugin

Purpose:

Create or adjust a product-connected landing experiment for testing a message, audience, or value proposition.

V1 scope:

- default V1 mode is draft or internal experiment inside Nexus
- external publication is allowed only after explicit user approval, valid Share / Demo or Release path, and basic measurement
- a new landing page may be created only when there is a clear product/demo/first screen and a real need to test a message with an audience
- Nexus must not create a landing page just because Growth needs something to do
- landing experiments require at least target audience, problem, core value, and clear product direction
- if those are missing, the flow returns to Discovery or Build

Product boundary:

- landing page is a growth asset connected to the product, not automatically part of the product itself
- if the landing page changes the product's central message, audience, promise, price, existing capability, product behavior, or user expectation, it affects product truth and must route through `Mutation / Change Agent`
- visual-only landing changes include colors, section order, button styling, hierarchy, imagery, hero layout, spacing, or small copy that does not change the promise
- visible landing changes route through `Visual Build Agent`
- every marketing claim must come from product truth

Visibility boundary:

- draft is internal and not shared
- preview is inspectable but not public
- shared demo is sent to specific people for feedback through `Share / Demo Agent`
- release is an approved external version through `Release Agent`
- landing pages cannot become public without `Share / Demo Agent` or `Release Agent`
- the user must approve external sharing

Allowed in first release:

- experiment hypothesis
- page section plan
- CTA variants
- copy variants
- demo/share linkage
- measurement target
- creation of one landing draft from a clear product description plus audience and core value
- preferably creation from an existing skeleton, demo, or first screen
- up to two landing versions for manual comparison
- simple lead capture form with explicit consent
- Hebrew and RTL support
- simple user-facing framing: "prepare a short page to test whether people understand the value"

Blocked or post-release unless explicitly added:

- true A/B test without traffic, measurement, and routing support
- complex experiment system
- public page without Share / Demo or Release gate
- real payment without approved payments path
- real order without clear storage and consent path
- advanced analytics beyond the Measurement layer
- making landing pages a heavy landing-page-builder surface

Lead capture boundary:

- basic lead capture is allowed in V1
- leads must be stored in a defined source
- if no lead system is connected, leads are stored inside Nexus as basic experiment leads
- form consent must be clear
- privacy and data responsibilities route to LEGAL / DATA / SEC

Measurement boundary:

- landing page produces events and results
- measurement ownership belongs primarily to `GROW-MEASURE-001`
- basic events include views, clicks, form submissions, CTA clicks, time on page, and manual feedback
- a landing experiment may say the experiment is ready, but must not claim success without real data

History events:

- landing page created
- version created
- message changed
- CTA changed
- page shared
- page published
- form captured lead
- result received
- learning created
- page returned to draft
- page canceled

Small success metrics:

- page created
- message is clear
- CTA is clear
- five people understand the value
- ten views
- first click
- first lead
- one quality feedback item

Safe failure states:

- product unclear
- audience unclear
- external sharing approval missing
- measurement missing
- form not working
- page not saved
- page not published
- share failed
- page contains an unapproved claim
- in every safe failure, Nexus must not claim the page is live or successful

Forbidden:

- publish as real release without release/share path
- change product truth without `Mutation / Change Agent`
- fabricate conversion data
- promise fake results
- show fake customers, fake numbers, fake testimonials, or fake proof
- collect details without consent
- publish without approval
- become the product truth owner
- create a form that does not store data correctly
- show a public page when it is only a draft
- pretend a landing experiment is a release
- claim success without real measurement

Owned execution task:

`GROW-LAND-001`

## Analytics / Measurement Plugin

Purpose:

Define what success means and ingest only real results from connected tools or manual observations.

Truth boundary:

- a real measurement is any data point with a clear source
- allowed real sources include connected provider data, Nexus internal events, submitted forms, real clicks, opened links, real comments, and user-entered feedback labeled as manual
- data without a clear source is not truth
- manual user data counts as truth only when labeled as manual measurement
- Nexus may learn cautiously from manual measurement, but must not present it as provider data or proof

V1 provider scope:

- Nexus internal measurement is sufficient for V1 if measurement limits are clear
- Google Analytics is optional in V1
- Search Console is optional in V1
- Email providers, social networks, ad providers, and Nexus forms/landing pages may feed measurement only when connected or when the event is recorded internally

Required V1 internal events:

- demo viewed
- share link opened
- primary action clicked
- form submitted
- lead created
- action approved
- landing page opened
- test email sent
- action failed
- action completed

Measurement before action:

- every growth action must define one small success metric before external execution
- draft-only growth actions may run without measurement
- published, sent, shared, or campaign actions require at least a basic metric
- when an action happened but measurement is unavailable, Nexus must say that measurement is not available yet and must not infer success

Reasoning boundary:

- hypothesis means what Nexus thinks may happen
- result means what was actually measured
- insight means what can cautiously be learned from the result
- Nexus must not say "it worked" from one data point
- V1 should default to "initial signal", "indication", "direction to test", or "early result" rather than "proof"
- conclusions must carry a simple confidence level: low, medium, or high
- "proof" is allowed only with sufficient data, consistency, and reliable measurement; this should be rare in V1

Allowed in first release:

- metric definition
- manual measurement checklist
- provider result intake if connected
- experiment summary
- learning summary
- internal event intake
- manual feedback intake labeled as manual
- pending measurement retry with bounded attempts
- multi-source summary that preserves source per datapoint
- conflict summary when sources disagree
- next-step recommendation handoff to `Growth Agent`
- product-change handoff to `Mutation / Change Agent`

Measurement record requirements:

- timestamp
- source
- source type: internal, connected provider, manual, or derived summary
- growth path
- experiment id
- measured event or metric
- raw value when safe
- privacy classification
- confidence level
- linked action or artifact

User visibility:

- user sees a simple summary by default: what happened, what it means, and what to do next
- raw data examples may be shown only when useful and safe
- sensitive personal data should be redacted or summarized when possible
- measurement stays internal by default
- measurement may appear in share/demo only with explicit user approval and non-sensitive data

Forbidden:

- fabricate analytics
- imply statistically significant results from weak data
- expose private provider data publicly
- claim product-market fit without evidence
- present estimates as facts
- present search volume, rankings, conversions, views, comments, or results without measured source
- mix sources without labeling them
- hide uncertainty
- expose sensitive data
- say "it worked" without basis
- turn small data into large decisions
- change the product without the correct agent

Data that must not be presented as fact:

- estimated numbers
- search volume without connected source
- rankings that were not measured
- conversions that were not tracked
- view counts without source
- comments that were not collected
- user guesses

History events:

- metric defined
- experiment started
- data received
- provider failed
- partial data received
- insight created
- conclusion rejected
- action recommended
- action handed to Growth
- action handed to Mutation

Safe failure states:

- no data source
- provider not connected
- partial data
- provider failed
- permission missing
- metric missing
- conflicting data
- measurement not linked to a clear experiment
- in every safe failure, Nexus must not infer success

Owned execution task:

`GROW-MEASURE-001`

## Shared Output Envelope

Every plugin must return structured output.

```json
{
  "pluginId": "",
  "pluginType": "social|seo|sem|email|landing-experiment|analytics-measurement",
  "whyThisPlugin": "",
  "whenNotToUse": "",
  "productBasis": {
    "productId": "",
    "artifactId": "",
    "audience": "",
    "valueProposition": ""
  },
  "requiresProviderConnection": false,
  "requiresUserApproval": false,
  "allowedActions": [],
  "blockedActions": [],
  "inputsNeeded": [],
  "recommendedAction": "",
  "successMetric": "",
  "doNotPromise": [],
  "handoffRequired": "none|growth-agent|share-demo-agent|mutation-change-agent|visual-build-agent|release-agent|verification-agent|social-campaign-execution-agent|analytics-measurement-plugin",
  "status": "ready|needs-product-first|needs-provider|needs-approval|handoff-required|failed-safely"
}
```

## Live Proof Requirements

First-release proof must show:

- Growth Agent chooses different plugins for different goals.
- Social request routes to Social Campaign Plugin / `GROW-AGT-002`.
- Search visibility request routes to SEO Plugin / `GROW-SEO-001`.
- Paid acquisition request routes to SEM / Ads Plugin / `GROW-SEM-001`.
- Email outreach request routes to Email Campaign Plugin / `GROW-EMAIL-001`.
- Landing experiment request routes to Landing Page Experiment Plugin / `GROW-LAND-001`.
- Measurement request routes to Analytics / Measurement Plugin / `GROW-MEASURE-001`.
- No plugin publishes, spends, sends, or creates public visibility without explicit approval and provider scope.
- No plugin promises outcomes without real data.

## Failure Rules

If no plugin fits:

- Growth must say what is missing.
- No generic marketing list is shown.
- No fake provider action is created.

If provider is missing:

- plugin returns `needs-provider`.
- Nexus asks for the narrowest connection needed.

If approval is missing:

- plugin returns `needs-approval`.
- Nexus explains the exact action that needs approval.

## Product Truth Boundary

Growth plugins can shape growth actions.

They cannot replace:

- Product Graph
- Mutation / Change Agent
- Share / Demo Agent
- Release Agent
- Provider gateway
- user approval

Law:

Growth plugins move the product toward the market, but they never become the source of product truth.
