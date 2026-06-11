# Preserved Project Service Truth Engine Contract

תאריך: `2026-05-26`  
status: `trueGreen contract`  
canonical task: `ENG-001`

---

## Purpose

להגדיר בצורה קנונית למה `ProjectService` נשמרת בתוך Nexus החדשה
ואיך היא מתפקדת כ־internal truth engine,
בלי להשאיר את זה כמשהו שרק “ברור מהקוד”.

---

## Core Claim

`ProjectService` היא לא עוד service כללית.

בתוך Nexus החדשה היא נשמרת בתור:

- owner of live project records
- owner of serialized project truth
- owner of project/workspace persistence
- owner of continuity/snapshot anchors
- bridge between preserved engines and the new shell

היא לא ה־Product Graph itself,
אבל היא המעטפת השומרת והמגישה את truth bundle שממנו ה־shell החדש יצרוך אמת.

---

## What It Must Own

`ProjectService` חייבת להמשיך להחזיק:

- project record persistence
- state persistence
- context persistence
- cycle roadmap
- execution graph exposure
- workspace identity linkage
- continuity linkage
- snapshot linkage
- release-readiness linkage

---

## New Shell Contract

ה־new shell לא אמורה לגשת לעשרות fields אקראיים ולהרכיב מהם אמת.

היא אמורה לקבל מ־`ProjectService` truth envelope ברור.

The canonical access point is:

- `getProjectTruthEnvelope(projectId)`

This envelope must expose:

- current project state
- current execution graph
- current roadmap
- workspace identity
- continuity anchors
- snapshot anchors
- release-readiness anchor
- shell-facing artifact anchors

---

## What This Task Does Not Claim

`ENG-001` does not claim:

- that the new shell already consumes this envelope everywhere
- that versioning/history/release surfaces are already rebuilt
- that old visible routes are already removed

Those belong to:

- `SHL-*`
- `SURF-*`
- `SLICE-*`

---

## trueGreen Rule

`ENG-001` is `trueGreen` when:

- `ProjectService` still truthfully owns project persistence
- there is a canonical write-back that names it as the preserved truth engine
- there is one stable shell-facing truth envelope API
- tests prove that the envelope exposes project state, graph, workspace, continuity, and release anchors

