# V1 Product Flow Foundation

This document turns the current first user flow into a product contract rather than a temporary UI agreement.

Scope of this foundation:
- Create Project
- Onboarding
- Finish onboarding
- Workspace landing

Out of scope for this foundation:
- real execution
- real AI reasoning
- backend conversation orchestration
- real file picker/upload pipeline

## Current Status

Current status of this foundation:
- `v1 flow usable`

Validated browser flow:
- `Create Project -> Onboarding -> Finish -> Workspace landing`

Validated support behaviors:
- `run-cycle` continuity does not feel like reset
- `Create Project` can be reopened from the workspace
- `Onboarding` can be reopened for dev checks and exited safely
- refresh restores the current screen for `Onboarding` and `Workspace`

## Locked Foundation

These are product-flow foundations that should now be treated as locked.

1. `Create Project` is a separate screen.
2. `Onboarding` is a separate screen.
3. `Workspace` is a separate screen.
4. Users move from `Create Project` to `Onboarding` only after creating a project draft and onboarding session.
5. Users reach `Workspace` only after successful `finish onboarding`.
6. `Onboarding` and `Workspace` must not be visible together.
7. Workspace tabs appear only inside the `Workspace` screen.
8. The onboarding experience is guided conversation, not a flat form.
9. The onboarding conversation progresses one question at a time.
10. The onboarding flow includes an AI working memory panel.
11. Workspace starts with tabs first, then a clear header/overview, then the rest of the workspace content.
12. The workspace landing must immediately answer:
   - what the current state is
   - what the main blocker is
   - what the next action is

## Invariants And Acceptance Criteria

### Screen Separation

- `Create Project`, `Onboarding`, and `Workspace` are distinct screens.
- `Onboarding` must never render as an extension of the create-project screen.
- `Workspace` must never render under `Onboarding`.

Acceptance criteria:
- Initial empty-app state shows only `Create Project`.
- After successful create-project action, `Create Project` is hidden and `Onboarding` is shown.
- Before onboarding finish succeeds, `Workspace` remains hidden.
- After onboarding finish succeeds, `Onboarding` is hidden and `Workspace` is shown.

### Finish Gate

- A user cannot enter `Workspace` without successful onboarding finish.
- If onboarding finish is blocked, the user remains on the `Onboarding` screen with a visible explanation.

Acceptance criteria:
- Blocked finish keeps `Onboarding` visible.
- Blocked finish keeps `Workspace` hidden.
- Successful finish loads the project and switches to `Workspace`.

### Workspace Tabs

- Workspace tabs are not part of create-project or onboarding screens.
- Tabs appear only after the user has entered `Workspace`.

Acceptance criteria:
- Before `Workspace`, the workspace screen is hidden.
- Tabs become visible only through the visible `Workspace` screen.

### Guided Onboarding

- Onboarding is structured as guided conversation.
- The user answers one prompt at a time.
- The AI working memory updates during the conversation.

Acceptance criteria:
- The current onboarding question is shown as the active prompt.
- The answer composer is active for only the current prompt.
- Working memory is visible during onboarding and updates across steps.

## Presentation Layer

These can change later without breaking the product-flow foundation:

- styling
- typography
- colors
- spacing
- motion and transitions
- micro-copy
- visual hierarchy tuning
- panel and card rendering
- animation timing
- exact visual treatment of chat bubbles, tabs, and cards

## What Is Temporary

These are implementation details that work today but are not locked as product invariants:

- the exact wording of onboarding questions
- the exact wording of AI replies
- the exact number of onboarding questions in the current UI
- the exact delay used for micro-interactions
- the current visual style of the AI working memory panel
- the current visual style of the conversation composer
- the dev/test-only action to reopen onboarding from the workspace
- the current pseudo-file intake fields for supporting material

## What AI Design May Change

AI Design may iterate on:

- the look and feel of the create-project screen
- the visual rendering of the onboarding conversation
- the visual rendering of the AI working memory panel
- the visual rendering of the workspace landing header
- transitions between screens
- copy, tone, and motion

AI Design may not break:

- screen separation
- onboarding-before-workspace gating
- tabs-only-in-workspace behavior
- guided conversation structure
- AI working memory presence
- clear workspace landing order:
  - tabs
  - header / overview
  - workspace content

## Enforcement Mapping

### Invariant: screen separation

Enforced in:
- `web/app.js`
  - `setAppScreen(screen)` toggles `#screen-create`, `#screen-onboarding`, and `#screen-workspace`
  - `renderEmptyAppState(...)` routes empty-app rendering into either create or onboarding
- `test/web-app-wave1-cockpit.test.js`
  - initial screen assertions
  - create-to-onboarding assertions
  - onboarding-to-workspace assertions

### Invariant: workspace only after finish onboarding

Enforced in:
- `src/server.js`
  - `POST /api/onboarding/sessions/:id/finish`
- `src/core/project-service.js`
  - `finishOnboardingSession(sessionId)` blocks project-state handoff until onboarding completion is ready
- `web/app.js`
  - `finishFirstProjectOnboarding()` only calls `loadProject(...)` when finish returns a usable project
- `test/web-app-wave1-cockpit.test.js`
  - blocked finish keeps onboarding visible
  - successful finish shows workspace

### Invariant: tabs only inside workspace

Enforced in:
- `web/index.html`
  - workspace tabs live inside the workspace screen structure
- `web/app.js`
  - `setAppScreen("workspace")` is the only visible path to the workspace shell
- `test/web-app-wave1-cockpit.test.js`
  - create and onboarding states keep `#screen-workspace` hidden

### Invariant: onboarding and workspace do not appear together

Enforced in:
- `web/app.js`
  - `setAppScreen(screen)` hides one screen when another becomes active
- `test/web-app-wave1-cockpit.test.js`
  - create, onboarding, blocked-finish, and workspace assertions all verify exclusivity

### Invariant: guided conversation plus working memory

Enforced in:
- `web/app.js`
  - onboarding conversation state
  - current-question rendering
  - onboarding notes / working memory rendering
- `test/web-app-wave1-cockpit.test.js`
  - onboarding progression assertions
  - working-memory content assertions
