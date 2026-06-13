import test from "node:test";
import assert from "node:assert/strict";

import { buildFilesSupportViewModel } from "../web/nexus-ui/adapters/files-adapter.js";
import { renderFilesSupportScreen } from "../web/nexus-ui/screens/FilesSupportScreen.js";

test("buildFilesSupportViewModel merges project, proof, and draft files without inventing runtime actions", () => {
  const viewModel = buildFilesSupportViewModel({
    project: {
      id: "giftwallet",
      name: "GiftWallet",
      updatedAt: "2026-05-11T10:00:00.000Z",
      files: [
        "docs/vision.md",
        { path: "src/app.js", status: "modified", type: "javascript" },
      ],
      generatedFiles: [
        "dist/app.zip",
      ],
      generatedSurfaceProofSchema: {
        files: [
          { name: "proof.png", validationStatus: "passed", type: "image/png" },
        ],
      },
    },
    draftInputs: {
      fileName: "notes.txt",
      fileContent: "Launch notes for onboarding context",
    },
  });

  assert.equal(viewModel.files.length, 5);
  assert.equal(viewModel.files[0].source, "draft");
  assert.equal(viewModel.stats[0].value, "5");
  assert.equal(viewModel.stats[1].value, "0");
  assert.equal(viewModel.stats[2].value, "1");
  assert.equal(viewModel.stats[3].value, "1");
  assert.equal(viewModel.primaryAction.target, "loop");
  assert.match(viewModel.runtimeCard.body, /project payload/i);
  assert.equal(viewModel.limitsCard.bullets.some((item) => item.includes("upload")), true);
});

test("FILE-001 buildFilesSupportViewModel exposes intake boundary and local storage truth", () => {
  const viewModel = buildFilesSupportViewModel({
    project: {
      id: "lead-tool",
      name: "Lead Tool",
      updatedAt: "2026-05-11T10:00:00.000Z",
      projectIntake: {
        uploadedFiles: [
          { name: "requirements.md", type: "text/markdown", content: "# Leads" },
        ],
        fileIntakeBoundary: {
          taskId: "FILE-001",
          status: "bounded-with-rejections",
          acceptedFiles: [{ name: "requirements.md" }],
          rejectedFiles: [{ name: "installer.exe", reason: "unsupported-file-type" }],
          productUnderstandingRouting: { status: "routed-to-project-understanding" },
          policy: {
            retentionPolicy: "project-lifecycle-local-first-release",
            deleteBehavior: "delete-with-project-request-or-explicit-replace",
            replaceBehavior: "replace-by-reupload-with-new-intake-record",
          },
          userFacing: {
            title: "קבצים נקלטו בגבולות הגרסה הראשונה",
            body: "קובץ אחד נקלט וקובץ אחד נדחה.",
            limits: "עד 8 קבצים ועד 2MB לכל קובץ.",
          },
        },
      },
      fileStorageRecord: {
        attachments: [
          { name: "requirements.md", path: "attachments/lead-tool/requirements.md", type: "text/markdown" },
        ],
      },
      dataOwnershipBoundary: {
        taskId: "DATA-001",
        status: "ready",
        sourceOfTruthLaw: "אמת המוצר נשמרת בפרויקט.",
        entities: [{ entityId: "files" }, { entityId: "project" }],
        persistenceProviderDecision: {
          provider: "Supabase",
          decision: "defer-for-first-release",
          reason: "ספק אחסון חיצוני לא מחובר עכשיו.",
        },
      },
      supabasePersistenceDecision: {
        taskId: "SUPABASE-001",
        provider: "Supabase",
        decision: "defer-for-first-release",
        selectedPersistencePath: "project-service-workspace-store",
        adoptionRequirements: ["schema", "rls", "privacy-hooks"],
        userFacing: {
          title: "ספק אחסון חיצוני",
          status: "לא מחובר עכשיו",
          summary: "נקסוס שומרת כרגע את אמת הפרויקט בשרת המקומי.",
          nextStep: "החיבור ייפתח אחרי שמיפוי הרשאות, קבצים, פרטיות ושחזור יהיה מוכן.",
        },
      },
    },
  });
  const html = renderFilesSupportScreen(viewModel);

  assert.equal(viewModel.fileIntakeBoundary.taskId, "FILE-001");
  assert.equal(viewModel.dataOwnershipBoundary.taskId, "DATA-001");
  assert.equal(viewModel.supabasePersistenceDecision.taskId, "SUPABASE-001");
  assert.equal(viewModel.fileIntakeBoundary.rejectedFiles.length, 1);
  assert.equal(viewModel.files.some((file) => file.source === "intake" && file.name === "requirements.md"), true);
  assert.equal(viewModel.files.some((file) => file.source === "storage" && file.name === "requirements.md"), true);
  assert.equal(viewModel.stats.some((item) => item.label === "נקלטו" && item.value === "1"), true);
  assert.match(viewModel.subtitle, /גבולות ההעלאה/);
  assert.equal(viewModel.limitsCard.title, "גבול הקליטה");
  assert.match(html, /data-data-ownership-task="DATA-001"/);
  assert.match(html, /data-data-ownership-provider-decision="defer-for-first-release"/);
  assert.match(html, /data-supabase-provider-task="SUPABASE-001"/);
  assert.match(html, /data-supabase-provider-decision="defer-for-first-release"/);
  assert.match(html, /אמת המוצר נשמרת בפרויקט/);
});

test("buildFilesSupportViewModel falls back to a safe placeholder when no project runtime exists", () => {
  const viewModel = buildFilesSupportViewModel();

  assert.equal(viewModel.files.length, 0);
  assert.equal(viewModel.primaryAction.target, "create");
  assert.equal(viewModel.secondaryAction.target, "home");
  assert.match(viewModel.runtimeCard.body, /placeholder/i);
});
