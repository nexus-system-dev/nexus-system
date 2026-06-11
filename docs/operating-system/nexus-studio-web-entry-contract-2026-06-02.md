# Nexus Studio Web Entry Contract

Date: `2026-06-02`
Task: `STD-ENTRY-001`
Status: `canonical entry contract created`
Depends on:

- `STD-SCREENS-001`
- `SURF-008`

## Purpose

This contract locks the Web-to-Studio entry states before any Desktop implementation.

It defines what Nexus Web may show, what it may promise, what it must not promise, and what happens when Studio is not installed, installed but not connected, connected to the project, or handoff fails.

Core law:

```txt
Web opens the Studio door. Studio performs local work. Web must not pretend local capability exists before Studio is installed, connected, and approved.
```

## Scope

This contract covers the Web-side entry and immediate handoff boundary.

It does not implement:

- Desktop Studio
- local runtime
- local filesystem access
- sync engine
- packaging
- offline work
- local secrets
- Studio internal workspace

It consumes:

- `SURF-008` as the Web boundary surface
- `STD-SCREENS-001` as the Studio screen/workspace map

It feeds:

- `STD-FND-002`
- `STD-DOOR-001`
- `STD-PERM-001`
- `STD-SYNC-001`
- `STD-HANDOFF-AGT-001`

## Web Entry States

### 1. `not-installed`

Meaning:

```txt
Nexus Web does not have proof that Nexus Studio is installed.
```

Web may show:

- what Nexus Studio is
- why this action requires local Studio
- what Web cannot do alone
- what the user can still do in Web
- download/install action
- manual install fallback

Primary button:

```txt
התקן את Nexus Studio
```

Secondary button:

```txt
המשך ב־Web
```

Web must not show:

- `Studio מחובר`
- `הרצה מקומית זמינה`
- `קבצים מקומיים זמינים`
- `פורסם / נארז / סונכרן`
- any claim that local access already exists

Allowed promise:

```txt
כדי להריץ, לבדוק, לדבג או לעבוד עם קבצים מקומיים צריך להתקין את Nexus Studio.
```

Forbidden promise:

```txt
נקסוס כבר יכולה להריץ או לערוך את הפרויקט מהמחשב שלך.
```

Failure path:

- install link unavailable -> show manual install fallback
- user declines install -> keep Web state available
- browser cannot detect install -> stay `not-installed` or offer manual open, never claim connected

### 2. `installed-not-connected`

Meaning:

```txt
Studio appears installed or openable, but this Web project is not locally bound.
```

Web may show:

- Studio installed/openable state
- project not connected state
- project binding explanation
- local approval requirement
- what Studio will receive after approval

Primary button:

```txt
חבר את הפרויקט ל־Studio
```

Secondary button:

```txt
המשך ב־Web
```

Web must not bind automatically.

Studio must confirm:

- project identity
- cloud revision
- opening package
- folder permission if needed
- local binding approval

Allowed promise:

```txt
Studio יכול לפתוח את הפרויקט אחרי אישור חיבור מקומי.
```

Forbidden promise:

```txt
הפרויקט כבר מחובר לתיקייה המקומית.
```

Failure path:

- deep link opens but project is not accepted -> stay installed-not-connected
- local approval denied -> show continue-in-Web fallback
- project mismatch -> show handoff failed / reconnect

### 3. `connected-project-bound`

Meaning:

```txt
Studio is installed/openable and this Web project has an approved local binding.
```

Web may show:

- connected Studio state
- last known local sync state
- last known Studio version if available
- action that requires Studio
- clear handoff button

Primary button:

```txt
פתח ב־Nexus Studio
```

Repeat-use button:

```txt
המשך ב־Studio
```

Web may promise:

- Studio can be opened for this project
- Studio can ask for required local permissions
- Studio can work locally if local permissions are still valid

Web must not promise:

- local folder still exists
- permissions are still valid
- local run will succeed
- sync will be accepted
- package/release is ready

Required handoff payload:

- project id
- project name
- current cloud revision
- requested action
- required local capability category
- return URL
- boundary reason
- short user-facing explanation

Failure path:

- Studio cannot open -> `handoff-failed`
- Studio opens but local folder missing -> Studio handles read-only/reconnect
- cloud revision stale -> Studio routes to cloud conflict or stale binding

### 4. `handoff-failed`

Meaning:

```txt
Web attempted to open or connect Studio, but the handoff did not complete safely.
```

Web may show:

- what failed
- whether Studio was not detected, not connected, mismatched, stale, or unavailable
- retry action
- install/connect fallback
- continue-in-Web option

Primary button options by failure:

- `נסה לפתוח שוב`
- `חבר את הפרויקט ל־Studio`
- `התקן את Nexus Studio`
- `המשך ב־Web`

Web must not show:

- `נפתח בהצלחה`
- `מחובר`
- `סונכרן`
- `העבודה המקומית עודכנה`

Failure categories:

- `studio-not-detected`
- `deep-link-blocked`
- `version-mismatch`
- `project-mismatch`
- `stale-project-binding`
- `local-folder-missing`
- `permission-denied`
- `offline-unavailable`
- `handoff-timeout`

### 5. `version-mismatch`

Meaning:

```txt
Studio is installed, but its version cannot safely handle the Web handoff contract.
```

Web may show:

- version mismatch explanation
- update Studio action
- continue-in-Web fallback

Primary button:

```txt
עדכן את Nexus Studio
```

Forbidden:

- opening local work through an incompatible contract
- silently downgrading the payload

### 6. `stale-project-binding`

Meaning:

```txt
The local binding exists, but its cloud revision or project identity is stale.
```

Web may show:

- Studio is connected but needs refresh
- local work may need conflict review
- handoff to Studio for safe reconciliation

Primary button:

```txt
פתח לבדיקה ב־Studio
```

Web must not claim sync is clean.

### 7. `local-dirty`

Meaning:

```txt
Studio has reported unsynced local work for this project.
```

Web may show:

- unsynced local work exists
- user should open Studio to review
- Web can continue cloud editing only with caution

Primary button:

```txt
ראה עבודה מקומית ב־Studio
```

Web must not:

- overwrite local state
- claim local changes are accepted
- release without resolving local truth when relevant

### 8. `offline-bounded`

Meaning:

```txt
Studio can work locally in a bounded offline mode, but Web cannot receive new truth until reconnection.
```

Web may show:

- Studio can continue locally if already opened and permitted
- cloud truth will not change while offline
- sync will require reconnection

Forbidden:

- release while disconnected
- claim cloud sync while offline

### 9. `sync-rejected`

Meaning:

```txt
Studio tried to return candidate work, but Web/cloud rejected it because it was stale, conflicted, failed verification, or lacked permission.
```

Web may show:

- rejection reason
- return to Studio for review
- keep local draft option
- retry after resolving blocker

Primary button:

```txt
פתח תיקון ב־Studio
```

Web must not:

- partially accept rejected truth silently
- show rejected work as release-ready

## Web Copy Contract

Primary entry copy:

```txt
פתח ב־Nexus Studio
```

Repeat-use copy:

```txt
המשך ב־Studio
```

Project connect copy:

```txt
חבר את הפרויקט ל־Studio
```

Studio opening confirmation:

```txt
פותחים את הפרויקט הזה ב־Nexus Studio
```

Safe unavailable copy:

```txt
כדי לבצע את הפעולה הזאת צריך Studio מקומי. אפשר להמשיך לעבוד ב־Web, או לפתוח את Nexus Studio כשיהיה זמין.
```

Local boundary copy:

```txt
הפעולה הזאת דורשת את המחשב שלך: קבצים, הרצה, דיבוג, אריזה, סודות מקומיים או עבודה אופליין.
```

## What Web May Promise

Web may promise:

- Studio is a local Nexus application
- Studio is needed when the action requires the user's computer
- Web can explain, prepare, and hand off to Studio
- Web can continue cloud work when Studio is unavailable
- Studio will ask for local permissions when needed
- Studio can return evidence/candidate state after safe sync

## What Web Must Not Promise

Web must not promise:

- Studio is installed unless detected or confirmed
- local folder access exists before approval
- local run will work
- dependencies can be installed automatically
- files can be edited locally from Web
- secrets are accessible from Web
- sync will be accepted
- package means release
- offline work changes cloud truth
- Desktop is implemented by the Web `/studio` screen

## Handoff Envelope

The Web-to-Studio handoff envelope must include:

- `handoffId`
- `projectId`
- `projectName`
- `cloudRevision`
- `requestedAction`
- `requiredLocalCapability`
- `entryState`
- `returnToWebUrl`
- `userVisibleReason`
- `createdAt`
- `expiresAt`

The envelope must not include:

- secrets
- raw local paths
- local credentials
- provider tokens
- private logs
- unrelated files

## Deep Link Contract

V1 may use a bounded deep link:

```txt
nexus-studio://open?handoffId=...
```

The deep link is only an open/connect attempt.

It does not prove:

- Studio is installed
- project is connected
- folder access exists
- local permission exists
- local action succeeded
- sync succeeded

## Studio Confirmation Contract

After Web handoff, Studio must show:

```txt
פותחים את הפרויקט הזה ב־Nexus Studio
```

The confirmation must include:

- project name
- connection state
- what Studio is about to receive
- required folder/permission when needed
- primary action `פתח פרויקט`

If no special permissions are needed, this step can be short and nearly immediate, but it must still make the transition to local work visible.

## Return-To-Web Contract

Studio-to-Web return states may include:

- `opened`
- `connected`
- `local-dirty`
- `sync-ready`
- `sync-accepted`
- `sync-rejected`
- `package-candidate-created`
- `evidence-returned`
- `permission-denied`
- `handoff-failed`
- `returned-without-action`

Web may display returned evidence/status.

Web must not accept returned changes as product truth unless the sync/release gate accepts them.

## Failure Behavior

All entry failures follow the same user-facing rule:

1. state what failed
2. state what can still continue in Web
3. offer a safe next action
4. never claim local success

## V1 Boundaries

V1 includes:

- Web boundary explanation
- install fallback
- installed/not-connected state
- connected/project-bound state
- handoff failed state
- version mismatch state
- stale binding state
- local dirty state
- bounded offline state
- sync rejected state
- bounded deep link envelope
- Studio confirmation screen contract
- return-to-Web status contract

V1 excludes:

- actual Desktop implementation
- actual install detector implementation
- actual local filesystem access
- automatic project binding
- automatic local permission grant
- automatic sync acceptance
- release from Studio
- Web acting as local runtime

## Verification

Verification performed:

- `SURF-008` exists as Web boundary / handoff surface and is not Studio implementation.
- `STD-SCREENS-001` is trueGreen as screen/workspace contract.
- This contract includes `not-installed`, `installed-not-connected`, `connected-project-bound`, and `handoff-failed`.
- This contract includes install, connect, approve, fail, continue-in-Web, version mismatch, stale binding, local dirty, offline-bounded, and sync rejected states.
- This contract defines what Web may promise and what Web must not promise.

Verification not performed:

- no Desktop app implemented
- no real install detection implemented
- no deep link tested live
- no browser route changed in this task

## Status

`STD-ENTRY-001` can be marked `trueGreen` as a planning/entry-contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-FND-002 — Lock cloud truth vs local working-state model
```
