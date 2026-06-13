import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  SURFACE_OWNER_RUNTIME_TASK_ID,
  buildVisibleSurfaceProofDataset,
  getVisibleSurfaceOwnership,
  resolveVisibleSurfaceOwnershipProof,
  resolveVisibleSurfaceRouteKey,
  visibleSurfaceOwnershipMap,
} from "../web/shared/visible-surface-ownership.js";

test("SURFACE-OWNER-RUNTIME-001 maps every primary visible route to an owning host, adapter, state source, and restore path", () => {
  const requiredRoutes = [
    "create",
    "loop",
    "execution",
    "proof",
    "artifact",
    "confirmation",
    "state-update",
    "next-task",
    "timeline",
    "release",
    "share",
    "growth",
    "studio",
    "home",
    "files",
    "settings",
    "help",
  ];

  for (const routeKey of requiredRoutes) {
    const owner = getVisibleSurfaceOwnership(routeKey);
    assert.equal(owner.routeKey, routeKey);
    assert.match(owner.hostSelector, /^#screen-/);
    assert.ok(owner.screenOwner);
    assert.ok(owner.adapterOwner);
    assert.ok(owner.renderOwner);
    assert.ok(owner.stateOwner);
    assert.ok(owner.restoreOwner);
  }

  assert.equal(visibleSurfaceOwnershipMap.length >= requiredRoutes.length, true);
});

test("SURFACE-OWNER-RUNTIME-001 marks project workspace routes invalid until project-backed truth is present", () => {
  const proof = resolveVisibleSurfaceOwnershipProof({
    routeKey: "loop",
    pathname: "/loop",
    protocol: "http:",
    qaMode: false,
    hasProjectId: false,
    hasCurrentProject: false,
    loadedAppScript: "./app.js?v=test",
    loadedStylesheet: "./styles.css?v=test",
  });

  assert.equal(proof.taskId, SURFACE_OWNER_RUNTIME_TASK_ID);
  assert.equal(proof.runtimeMode, "blocked-route");
  assert.equal(proof.proofValid, false);
  assert.ok(proof.invalidators.includes("backend-route-not-project-backed"));
});

test("SURFACE-OWNER-RUNTIME-001 accepts regular project-backed routes only when assets and project truth agree", () => {
  const proof = resolveVisibleSurfaceOwnershipProof({
    routeKey: "loop",
    pathname: "/loop",
    protocol: "http:",
    qaMode: false,
    hasProjectId: true,
    hasCurrentProject: true,
    loadedAppScript: "./app.js?v=surface-owner",
    loadedStylesheet: "./styles.css?v=surface-owner",
  });

  assert.equal(proof.runtimeMode, "project-backed");
  assert.equal(proof.proofValid, true);
  assert.deepEqual(proof.invalidators, []);
  assert.equal(proof.screenOwner, "LoopCoreScreen");
  assert.equal(proof.adapterOwner, "loop-adapter");
  assert.equal(proof.restoreOwner, "projectId-backend-restore");
});

test("SURFACE-OWNER-RUNTIME-001 rejects QA state when proof claims regular user runtime", () => {
  const proof = resolveVisibleSurfaceOwnershipProof({
    routeKey: "loop",
    pathname: "/loop",
    protocol: "http:",
    qaMode: false,
    hasProjectId: true,
    hasCurrentProject: true,
    hasQaState: true,
    hasNexusState: true,
    hasQaScreen: true,
    loadedAppScript: "./app.js?v=test",
    loadedStylesheet: "./styles.css?v=test",
  });

  assert.equal(proof.runtimeMode, "project-backed");
  assert.equal(proof.proofValid, false);
  assert.ok(proof.invalidators.includes("qa-state-on-regular-route"));
});

test("SURFACE-OWNER-RUNTIME-001 exposes a stable dataset for live DOM proof", () => {
  const dataset = buildVisibleSurfaceProofDataset({
    routeKey: "growth",
    pathname: "/growth",
    protocol: "http:",
    qaMode: false,
    hasProjectId: true,
    loadedAppScript: "./app.js?v=test",
    loadedStylesheet: "./styles.css?v=test",
  });

  assert.equal(dataset.surfaceOwnerTask, SURFACE_OWNER_RUNTIME_TASK_ID);
  assert.equal(dataset.surfaceOwnerRoute, "growth");
  assert.equal(dataset.surfaceOwnerHost, "#screen-growth");
  assert.equal(dataset.surfaceOwnerScreen, "GrowthSurfaceScreen");
  assert.equal(dataset.surfaceOwnerRuntimeMode, "project-backed");
  assert.equal(dataset.surfaceOwnerProofValid, "true");
});

test("SURFACE-OWNER-RUNTIME-001 resolves path aliases before falling back to create", () => {
  assert.equal(resolveVisibleSurfaceRouteKey({ pathname: "/release" }), "release");
  assert.equal(resolveVisibleSurfaceRouteKey({ pathname: "/project-brain" }), "project-brain");
  assert.equal(resolveVisibleSurfaceRouteKey({ pathname: "/unknown" }), "create");
});

test("web app applies visible surface ownership markers from the shared truth module", () => {
  const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");

  assert.match(appSource, /visible-surface-ownership\.js/);
  assert.match(appSource, /function annotateVisibleSurfaceOwnership\(screen\)/);
  assert.match(appSource, /buildVisibleSurfaceProofDataset\(/);
  assert.match(appSource, /body\.dataset/);
  assert.match(appSource, /host\.dataset/);
  assert.match(appSource, /annotateVisibleSurfaceOwnership\(normalizedScreen\)/);
});
