# Wave 4 Deployment State Feedback Contract

מטרת המסמך:
- לנעול את החוזה הקנוני של `W4-MBN-018`
- להגדיר איך Nexus מציגה deployment/release status מתוך המוצר
- למנוע מצב שבו מצב deploy נשאר רק ב־logs, events, או backend polling

## Contract Purpose

אחרי ש־`class-aware deployment release path` כבר הוגדר,
Nexus חייבת להחזיק `deployment state feedback contract` אחד שמסביר:
- מה מצב ה־policy
- מה מצב ה־deployment outcome
- מה מצב ה־launch decision
- מה מחזיר ה־provider status האחרון
- מה חסום כרגע ומהו הצעד הבא

## Canonical Output

החוזה הקנוני חייב להגדיר:
- `contractId`
- `feedbackFamily`
- `status`
- `statusLabel`
- `providerType`
- `primaryTarget`
- `environment`
- `currentStepLabel`
- `policyDecision`
- `deploymentOutcome`
- `launchDecision`
- `latestProviderStatus`
- `nextPollInSeconds`
- `visibleFeedbackRule`
- `feedbackItems`
- `blockedReasons`
- `continuityRule`

## Truth Rules

`W4-MBN-018` is not truthful if:
- deploy status appears only in logs
- provider feedback is hidden in backend polling state
- the user cannot tell whether policy, deployment, or launch is blocked

`W4-MBN-018` is truthful when:
- one governing implementation model resolves deployment feedback
- Execution surface shows deployment progress as product-facing state
- blocked reasons and current step are visible
- deployment state survives refresh and route restore

## Visible Surface Requirements

מסך `Execution` חייב להראות לפחות:
- deployment feedback status
- provider
- environment
- current step
- policy decision
- deployment outcome
- launch decision
- provider status
- blocked reasons

## Continuity Rule

`deployment state feedback` חייב להישאר קוהרנטי דרך:
- execution refresh
- route restore
- handoff אל continuity tasks הבאים

אסור שה־deploy feedback תקרוס חזרה ל־logs בלבד אחרי reopen.
