import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderNexusSidebar } from "../web/nexus-ui/components/NexusSidebar.js";
import { renderNexusWorkspaceRail } from "../web/nexus-ui/components/NexusWorkspaceRail.js";
import { renderWorkspaceLayout } from "../web/nexus-ui/layouts/WorkspaceLayout.js";
import { renderGrowthSurfaceScreen } from "../web/nexus-ui/screens/GrowthSurfaceScreen.js";
import { renderReleaseSurfaceScreen } from "../web/nexus-ui/screens/ReleaseSurfaceScreen.js";
import { renderShareSurfaceScreen } from "../web/nexus-ui/screens/ShareSurfaceScreen.js";
import { renderStudioBoundaryScreen } from "../web/nexus-ui/screens/StudioBoundaryScreen.js";

function countRailButtons(html) {
  return (html.match(/class="nexus-workspace-rail__button"/g) ?? []).length;
}

const advancedItems = [
  { title: "Developer", href: "/developer", icon: "⌘" },
  { title: "מוח הפרויקט", href: "/brain", icon: "☷" },
  { title: "שחרורים", href: "/release", icon: "▤" },
  { title: "צמיחה", href: "/growth", icon: "↗" },
];

test("normal Nexus sidebar keeps canonical product routes and hides internal advanced routes", () => {
  const html = renderNexusSidebar({
    advanced: advancedItems,
    currentRoute: "/growth",
  });

  assert.match(html, /href="\/release"/);
  assert.match(html, /href="\/growth"/);
  assert.doesNotMatch(html, /href="\/developer"/);
  assert.doesNotMatch(html, /href="\/brain"/);
  assert.doesNotMatch(html, /Developer/);
  assert.doesNotMatch(html, /מוח הפרויקט/);
});

test("dev mode may expose internal advanced routes for explicit diagnostics only", () => {
  const previousLocation = globalThis.location;
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { search: "?dev=1" },
  });

  try {
    const html = renderNexusSidebar({
      advanced: advancedItems,
      currentRoute: "/developer",
    });

    assert.match(html, /href="\/developer"/);
    assert.match(html, /href="\/brain"/);
  } finally {
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: previousLocation,
    });
  }
});

test("WorkspaceLayout always renders the canonical compact rail, not the legacy wide sidebar", () => {
  const html = renderWorkspaceLayout({
    sidebar: {
      currentRoute: "/growth",
      primary: [{ title: "יצירה", href: "/create", target: "create", icon: "＋" }],
      advanced: [
        { title: "Developer", href: "/developer", icon: "⌘" },
        { title: "צמיחה", href: "/growth", icon: "↗" },
      ],
    },
    content: "<section>Growth content</section>",
  });

  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-rail-active-route="growth"/);
  assert.match(html, /data-nexus-ui-target="create"/);
  assert.match(html, /data-nexus-ui-target="loop"/);
  assert.match(html, /data-nexus-ui-target="release"/);
  assert.match(html, /data-nexus-ui-target="share"/);
  assert.match(html, /data-nexus-ui-target="growth"/);
  assert.match(html, /data-nexus-ui-target="studio"/);
  assert.match(html, /data-nexus-ui-target="timeline"/);
  assert.match(html, /data-nexus-ui-target="home"/);
  assert.match(html, /data-nexus-ui-target="files"/);
  assert.match(html, /data-nexus-ui-target="settings"/);
  assert.match(html, /data-nexus-ui-target="help"/);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
  assert.doesNotMatch(html, /Developer/);
  assert.doesNotMatch(html, /מוח הפרויקט/);
});

test("WorkspaceLayout pins the canonical rail to the same physical side across RTL pages", () => {
  const layoutsCss = readFileSync(new URL("../web/nexus-ui/styles/layouts.css", import.meta.url), "utf8");
  const screensCss = readFileSync(new URL("../web/nexus-ui/styles/screens.css", import.meta.url), "utf8");

  assert.match(layoutsCss, /\.nexus-ui-workspace-shell\s*\{[\s\S]*?direction:\s*ltr;/);
  assert.match(layoutsCss, /\.nexus-ui-workspace-shell\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*96px;/);
  assert.match(layoutsCss, /\.nexus-ui-workspace-shell\s*>\s*\.nexus-workspace-rail\s*\{[\s\S]*?grid-column:\s*2;/);
  assert.match(layoutsCss, /\.nexus-ui-main\s*\{[\s\S]*?direction:\s*rtl;/);
  assert.match(screensCss, /\.nexus-share-workspace-shell\s*\{[\s\S]*?direction:\s*ltr;/);
  assert.match(screensCss, /\.nexus-share-workspace-shell\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*96px;/);
  assert.match(screensCss, /\.nexus-share-workspace-shell\s*>\s*\.nexus-workspace-rail\s*\{[\s\S]*?grid-column:\s*2;/);
  assert.match(screensCss, /\.nexus-studio-workspace-shell\s*\{[\s\S]*?direction:\s*ltr;/);
  assert.match(screensCss, /\.nexus-studio-workspace-shell\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s*96px;/);
  assert.match(screensCss, /\.nexus-studio-workspace-shell\s*>\s*\.nexus-workspace-rail\s*\{[\s\S]*?grid-column:\s*2;/);
  assert.match(screensCss, /@media\s*\(max-width:\s*980px\)\s*\{[\s\S]*?\.nexus-share-workspace-shell\s*\{[\s\S]*?grid-template-columns:\s*minmax\(720px,\s*1fr\)\s*72px;/);
  assert.match(screensCss, /@media\s*\(max-width:\s*980px\)\s*\{[\s\S]*?\.nexus-share-workspace-shell\s*>\s*\.nexus-workspace-rail\s*\{[\s\S]*?grid-column:\s*2;/);
  assert.match(screensCss, /@media\s*\(max-width:\s*980px\)\s*\{[\s\S]*?\.nexus-studio-workspace-shell\s*\{[\s\S]*?grid-template-columns:\s*minmax\(720px,\s*1fr\)\s*72px;/);
  assert.match(screensCss, /@media\s*\(max-width:\s*980px\)\s*\{[\s\S]*?\.nexus-studio-workspace-shell\s*>\s*\.nexus-workspace-rail\s*\{[\s\S]*?grid-column:\s*2;/);
  assert.doesNotMatch(screensCss, /grid-template-columns:\s*264px\s+1fr/);
});

test("canonical compact rail normalizes every product route to the same button order and active state", () => {
  const routeExpectations = {
    "/": "create",
    "/loop": "loop",
    "/release": "release",
    "/share": "share",
    "/growth": "growth",
    "/studio": "studio",
    "/timeline": "timeline",
    "/home": "home",
    "/files": "files",
    "/settings": "settings",
    "/help": "help",
  };

  for (const [route, activeRoute] of Object.entries(routeExpectations)) {
    const html = renderNexusWorkspaceRail({ currentRoute: route });
    assert.match(html, new RegExp(`data-nexus-rail-active-route="${activeRoute}"`));
    assert.equal(countRailButtons(html), 11);
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
  }
});

test("browser shell route sync only carries project ids to backend-restorable product workspaces", () => {
  const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");

  assert.match(appSource, /isBackendRestorableWorkspaceScreen\(normalizedRouteKey\)/);
  assert.match(appSource, /params\.set\("projectId", routeProjectId\)/);
  assert.match(appSource, /params\.delete\("qaState"\)/);
  assert.match(appSource, /params\.delete\("nexusState"\)/);
  assert.doesNotMatch(appSource, /normalizedRouteKey !== "create"[\s\S]*?normalizedRouteKey !== "onboarding"/);
});

test("first skeleton handoff refuses draft ids and clears stale project surfaces on create", () => {
  const appSource = readFileSync(new URL("../web/app.js", import.meta.url), "utf8");

  assert.match(appSource, /function isRealBackendProjectId\(value\)/);
  assert.match(appSource, /projectId !== "project-draft"/);
  assert.match(appSource, /!projectId\.startsWith\("onboarding-project-draft"\)/);
  assert.match(appSource, /!projectId\.startsWith\("project-draft-"\)/);
  assert.match(appSource, /finishedPayload\?\.blocked === true \|\| !isRealBackendProjectId\(backendProject\.id\)/);
  assert.match(appSource, /if \(isRealBackendProjectId\(finished\.project\?\.id\)\)/);
  assert.doesNotMatch(appSource, /renderLoopCoreScreenView\(continuationPreview\)/);
  assert.doesNotMatch(appSource, /const canOpenFallbackLoop =/);
  assert.match(appSource, /function clearProjectWorkspaceSurfacesForCreate\(\)/);
  assert.match(appSource, /clearProjectWorkspaceSurfacesForCreate\(\);\s*renderCreateScreenView\(\);/);
  assert.match(appSource, /const persistedProjectId = isRealBackendProjectId\(persistedContext\.resolvedProjectId\)/);
  assert.match(appSource, /currentProjectId: persistedProjectId/);
  assert.match(appSource, /projectId: null/);
  assert.match(appSource, /normalizedScreen === "create" && !isRealBackendProjectId\(normalizedFlowState\.currentProjectId\)/);
  assert.match(appSource, /fetchJsonWithTimeout\(`\/api\/onboarding\/sessions\/\$\{onboardingFlow\.sessionId\}\/conversation-prime`/);
  assert.match(appSource, /timeoutMs: 45000/);
  assert.match(appSource, /timeoutCode: "onboarding_conversation_prime_timeout"/);
});

test("server loads local environment before provider-backed onboarding starts", () => {
  const serverSource = readFileSync(new URL("../src/server.js", import.meta.url), "utf8");

  assert.match(serverSource, /function loadLocalEnvironmentFile\(/);
  assert.match(serverSource, /path\.join\(projectRootDir, "\.env"\)/);
  assert.match(serverSource, /process\.env\[key\] != null/);
  assert.match(serverSource, /loadLocalEnvironmentFile\(\);\s*function sendJson/);
});

test("canonical product surfaces expose the same compact rail shape", () => {
  const releaseHtml = renderReleaseSurfaceScreen({
    projectName: "Release proof",
    title: "שחרור",
    subtitle: "בדיקת שחרור",
    badge: "Release",
    statusCards: [],
    releaseGate: { title: "Gate", body: "No blocker", items: [] },
    preview: { title: "Preview", body: "Preview", artifactName: "artifact", artifactPath: "path" },
    evidence: { title: "Evidence", body: "Evidence", items: [] },
  });
  const growthHtml = renderGrowthSurfaceScreen({
    projectName: "Growth proof",
    title: "צמיחה",
    subtitle: "בדיקת צמיחה",
    badge: "Growth",
    signal: { title: "Signal", body: "Signal", items: [] },
    nextMove: { title: "Next", body: "Next", cta: "Start" },
    continuity: { title: "Continuity", body: "Continuity", items: [] },
    opportunities: { title: "Opportunities", body: "Opportunities", items: [] },
  });
  const shareHtml = renderShareSurfaceScreen({
    projectName: "Share proof",
    share: {
      isShareReady: true,
      readinessLabel: "קישור review מוכן",
      readinessBody: "אפשר לשלוח תצוגת review.",
      shareLinkLabel: "https://demo.nexus.local/share",
      experienceTitle: "Landing page",
      experienceBody: "תצוגת review.",
      audienceTitle: "מי רואה",
      audienceItems: ["משתמש review"],
      accessMode: "review-demo",
      privacyScope: "רק תצוגת מוצר.",
      releaseStatus: "ready",
      releaseTarget: "private-demo",
      evidenceItems: ["Preview checked"],
    },
  });
  const studioHtml = renderStudioBoundaryScreen({
    projectName: "Studio proof",
    studio: {
      connection: {
        status: "not-installed",
        isConnected: false,
        label: "Studio עדיין לא מחובר",
        body: "צריך Nexus Studio Desktop.",
      },
      desktopOpenUrl: "nexus-studio://open?project=studio-proof",
      installUrl: "",
      primaryActionLabel: "נסה לפתוח Studio",
      fallbackActionLabel: "Studio Desktop עדיין לא מותקן",
      boundaryTitle: "Studio הוא אפליקציה מקומית, לא עוד מסך באתר",
      boundaryBody: "Nexus Web רק מזהה, מסביר ומעביר ל־Desktop.",
      webResponsibilities: ["שומר את אמת הפרויקט בענן"],
      desktopResponsibilities: ["גישה לקבצים מקומיים"],
      requiredReason: "הפעולה דורשת יכולות מקומיות.",
      returnTargets: [{ label: "חזור לבנייה", target: "loop" }],
    },
  });

  for (const [html, activeRoute] of [[releaseHtml, "release"], [growthHtml, "growth"], [shareHtml, "share"], [studioHtml, "studio"]]) {
    assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
    assert.match(html, new RegExp(`data-nexus-rail-active-route="${activeRoute}"`));
    assert.equal(countRailButtons(html), 11);
    assert.doesNotMatch(html, /nexus-ui-sidebar/);
  }
});
