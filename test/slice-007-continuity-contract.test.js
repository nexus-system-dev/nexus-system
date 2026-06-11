import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const taskMap = fs.readFileSync("docs/operating-system/nexus-canonical-implementation-task-map-2026-05-26.md", "utf8");
const appSource = fs.readFileSync("web/app.js", "utf8");
const serverSource = fs.readFileSync("src/server.js", "utf8");

function sectionFor(taskId) {
  const start = taskMap.indexOf(`#### \`${taskId}`);
  assert.notEqual(start, -1, `${taskId} section is missing`);
  const next = taskMap.indexOf("\n#### `", start + 1);
  return taskMap.slice(start, next === -1 ? taskMap.length : next);
}

test("SLICE-007 — canonical dependency cycle is split before execution", () => {
  const section = sectionFor("SLICE-007");
  assert.match(section, /dependency_correction:/);
  assert.match(section, /SLICE-007 -> HIST-AGT-001 -> EXP-002 -> MUT-001 -> EXP-001 -> SLICE-008 -> SLICE-007/);
  assert.doesNotMatch(section, /depends_on:\n(?:  - `[^`]+`\n)*  - `HIST-AGT-001`/);
  assert.match(section, /SLICE-007 now owns the first vertical-slice refresh\/return continuity/);
  assert.match(section, /HIST-AGT-001 still owns deeper History \/ Continuity Agent behavior/);
});

test("SLICE-007 — project-backed route return reloads backend truth", () => {
  assert.match(appSource, /requestedProjectId && isBackendRestorableWorkspaceScreen\(requestedRoute\)/);
  assert.match(appSource, /activeWorkspace = requestedRoute/);
  assert.match(appSource, /void loadProject\(requestedProjectId/);
  assert.match(appSource, /Nexus שחזרה את השלד, השיחה והשינויים מאמת הפרויקט/);
  assert.match(appSource, /params\.set\("projectId", routeProjectId\)/);
  assert.match(appSource, /function isProjectContinuityShellRoute\(screen\)/);
  assert.match(appSource, /routeKey === "home"/);
  assert.match(appSource, /routeKey === "files"/);
  assert.match(appSource, /routeKey === "settings"/);
  assert.match(appSource, /routeKey === "help"/);
  assert.match(appSource, /isProjectContinuityShellRoute\(normalizedRouteKey\)/);
  assert.match(appSource, /renderLoopCoreScreenView\(currentProject\);\n\s*persistFlowState\("loop"\);\n\s*renderShellChrome\("loop", activeWorkspace\);/);
  assert.match(appSource, /restoreRoute: requestedRoute/);
  assert.match(appSource, /visibleRouteKey !== transitionFeedback\.restoreRoute/);
  assert.match(appSource, /!isBackendRestorableWorkspaceScreen\(visibleRouteKey\)/);
});

test("SLICE-007 — live events keep authenticated local session continuity", () => {
  assert.match(appSource, /url\.searchParams\.set\("userId", userId\)/);
  assert.match(appSource, /return url\.origin === globalThis\.location\?\.origin/);
  assert.match(serverSource, /url\?\.pathname\?\.endsWith\?\.\("\/live-events"\)/);
  assert.match(serverSource, /url\.searchParams\?\.get\?\.\("userId"\)/);
  assert.match(serverSource, /const resolvedUserId = resolveRequestUserId\(request, url\)/);
});
