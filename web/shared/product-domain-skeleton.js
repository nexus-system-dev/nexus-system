function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createOperation({ id, label, kind, input = {}, output = {} }) {
  return {
    id,
    label,
    kind,
    input,
    output,
    persistence: "mock-local-project-state",
  };
}

function createModel({ name, fields }) {
  return {
    name,
    fields: fields.map((field) => ({
      name: field,
      type: "string",
      required: true,
    })),
  };
}

function resolveBaseFields(productSkeleton = {}, fallbackFields = []) {
  const dataObject = normalizeObject(normalizeArray(productSkeleton.dataObjects)[0]);
  const fields = normalizeArray(dataObject.fields)
    .map((field) => normalizeString(field, ""))
    .filter(Boolean);
  return fields.length ? fields : fallbackFields;
}

function createMobileDomain({ projectId, runtimeSkeletonId, productSkeleton }) {
  const fields = resolveBaseFields(productSkeleton, ["title", "status", "owner"]);
  return {
    productDomainSkeletonId: `product-domain:${projectId}:mobile-app`,
    domainTaskId: "PRODUCT-BACKEND-SKEL-001",
    productClass: "mobile-app",
    runtimeSkeletonId,
    domainKind: "mobile-local-app-state",
    models: [createModel({ name: "Task", fields })],
    state: {
      tasks: [
        { id: "task-1", title: "משימה ראשונה", status: "open", owner: "אני" },
        { id: "task-2", title: "בדיקת המשך", status: "done", owner: "אני" },
      ],
      activeScreen: "today",
      completedCount: 1,
    },
    operations: [
      createOperation({ id: "task.create", label: "הוסף משימה", kind: "create", input: { title: "string" }, output: { taskId: "string" } }),
      createOperation({ id: "task.updateStatus", label: "סמן סטטוס", kind: "update", input: { taskId: "string", status: "string" } }),
      createOperation({ id: "task.delete", label: "מחק משימה", kind: "delete", input: { taskId: "string" } }),
    ],
  };
}

function createLandingDomain({ projectId, runtimeSkeletonId }) {
  return {
    productDomainSkeletonId: `product-domain:${projectId}:landing-page`,
    domainTaskId: "PRODUCT-BACKEND-SKEL-001",
    productClass: "landing-page",
    runtimeSkeletonId,
    domainKind: "lead-capture-local-state",
    models: [createModel({ name: "Lead", fields: ["name", "phone", "message", "source"] })],
    state: {
      leads: [],
      form: { name: "", phone: "", message: "" },
      lastSubmissionStatus: "empty",
    },
    operations: [
      createOperation({ id: "lead.submit", label: "שמור ליד", kind: "create", input: { name: "string", phone: "string" }, output: { leadId: "string" } }),
      createOperation({ id: "lead.validate", label: "בדוק טופס", kind: "validate", input: { name: "string", phone: "string" } }),
    ],
  };
}

function createInternalToolDomain({ projectId, runtimeSkeletonId, productSkeleton }) {
  const fields = resolveBaseFields(productSkeleton, ["name", "status", "owner", "reminder", "nextStep"]);
  return {
    productDomainSkeletonId: `product-domain:${projectId}:internal-tool`,
    domainTaskId: "PRODUCT-BACKEND-SKEL-001",
    productClass: "internal-tool",
    runtimeSkeletonId,
    domainKind: "workflow-record-local-state",
    models: [createModel({ name: "Record", fields })],
    state: {
      records: [
        { id: "rec-1", name: "ליד ראשון", status: "פתוח", owner: "דנה", reminder: "היום", nextStep: "שיחה חוזרת" },
        { id: "rec-2", name: "ליד שני", status: "בטיפול", owner: "יוסי", reminder: "מחר", nextStep: "שליחת הצעה" },
      ],
      selectedRecordId: "rec-1",
      statusCounts: { open: 1, active: 1, done: 0 },
    },
    operations: [
      createOperation({ id: "record.create", label: "הוסף רשומה", kind: "create", input: { name: "string" }, output: { recordId: "string" } }),
      createOperation({ id: "record.select", label: "בחר רשומה", kind: "update", input: { recordId: "string" } }),
      createOperation({ id: "record.updateStatus", label: "עדכן סטטוס", kind: "update", input: { recordId: "string", status: "string" } }),
      createOperation({ id: "record.assignOwner", label: "שנה אחראי", kind: "update", input: { recordId: "string", owner: "string" } }),
      createOperation({ id: "record.updateReminder", label: "קבע תזכורת", kind: "update", input: { recordId: "string", reminder: "string" } }),
      createOperation({ id: "record.addField", label: "הוסף שדה", kind: "schema-update", input: { fieldName: "string" } }),
    ],
  };
}

function createCommerceDomain({ projectId, runtimeSkeletonId }) {
  return {
    productDomainSkeletonId: `product-domain:${projectId}:commerce-ops`,
    domainTaskId: "PRODUCT-BACKEND-SKEL-001",
    productClass: "commerce-ops",
    runtimeSkeletonId,
    domainKind: "cart-order-draft-local-state",
    models: [
      createModel({ name: "Product", fields: ["name", "price", "inventory"] }),
      createModel({ name: "Cart", fields: ["items", "total"] }),
      createModel({ name: "OrderDraft", fields: ["items", "status"] }),
    ],
    state: {
      products: [{ id: "prod-1", name: "מוצר לדוגמה", price: 120, inventory: 8 }],
      cart: { items: [], total: 0 },
      orderDraft: { id: "order-draft-1", status: "not-started", paymentBoundary: "blocked-real-payment" },
    },
    operations: [
      createOperation({ id: "cart.addItem", label: "הוסף לעגלה", kind: "update", input: { productId: "string", quantity: "number" } }),
      createOperation({ id: "order.createDraft", label: "צור טיוטת הזמנה", kind: "create", input: { cartId: "string" } }),
    ],
  };
}

function createGameDomain({ projectId, runtimeSkeletonId }) {
  return {
    productDomainSkeletonId: `product-domain:${projectId}:game`,
    domainTaskId: "PRODUCT-BACKEND-SKEL-001",
    productClass: "game",
    runtimeSkeletonId,
    domainKind: "game-state-rules-local-state",
    models: [createModel({ name: "GameState", fields: ["score", "level", "status", "player"] })],
    state: {
      score: 0,
      level: 1,
      status: "ready",
      player: { x: 0, y: 0 },
    },
    operations: [
      createOperation({ id: "game.start", label: "התחל משחק", kind: "update", output: { status: "running" } }),
      createOperation({ id: "game.score", label: "הוסף ניקוד", kind: "update", input: { amount: "number" } }),
    ],
  };
}

function createToolDomain({ projectId, runtimeSkeletonId, productClass = "software-tool", productKindDiscovery = null }) {
  const normalizedProductClass = normalizeString(productClass, "software-tool");
  const pattern = normalizeString(productKindDiscovery?.productPattern, "tool-io");
  const productDomainSkeletonId = `product-domain:${projectId}:${pattern === "tool-io" ? normalizedProductClass : pattern}`;

  if (pattern === "editor-canvas") {
    return {
      productDomainSkeletonId,
      domainTaskId: "PRODUCT-BACKEND-SKEL-001",
      productClass: normalizedProductClass,
      runtimeSkeletonId,
      domainKind: "editor-document-local-state",
      models: [
        createModel({ name: "EditorDocument", fields: ["objects", "selectedObjectId", "history"] }),
        createModel({ name: "CanvasObject", fields: ["type", "x", "y", "style"] }),
      ],
      state: {
        document: { objects: [{ id: "obj-1", type: "shape", x: 40, y: 30, style: "primary" }], selectedObjectId: "obj-1" },
        history: ["created-shape"],
      },
      operations: [
        createOperation({ id: "editor.addObject", label: "הוסף אובייקט", kind: "create", input: { type: "string" }, output: { objectId: "string" } }),
        createOperation({ id: "editor.updateSelection", label: "שנה בחירה", kind: "update", input: { objectId: "string" } }),
        createOperation({ id: "editor.undo", label: "בטל פעולה", kind: "update" }),
        createOperation({ id: "editor.redo", label: "חזור פעולה", kind: "update" }),
      ],
    };
  }

  if (pattern === "simulator-state") {
    return {
      productDomainSkeletonId,
      domainTaskId: "PRODUCT-BACKEND-SKEL-001",
      productClass: normalizedProductClass,
      runtimeSkeletonId,
      domainKind: "simulator-state-control-local-state",
      models: [createModel({ name: "SimulationRun", fields: ["scenario", "parameters", "metrics", "result"] })],
      state: {
        scenario: "base",
        parameters: { intensity: 50, duration: 10 },
        metrics: { confidence: 82, delta: 12 },
        result: "ready",
        runs: [],
      },
      operations: [
        createOperation({ id: "simulator.runScenario", label: "הרץ תרחיש", kind: "process", input: { scenario: "string" }, output: { result: "string" } }),
        createOperation({ id: "simulator.updateParameter", label: "שנה פרמטר", kind: "update", input: { key: "string", value: "number" } }),
        createOperation({ id: "simulator.reset", label: "אפס סימולציה", kind: "update" }),
      ],
    };
  }

  if (pattern === "ai-tool") {
    return {
      productDomainSkeletonId,
      domainTaskId: "PRODUCT-BACKEND-SKEL-001",
      productClass: normalizedProductClass,
      runtimeSkeletonId,
      domainKind: "ai-tool-operation-local-state",
      models: [createModel({ name: "PromptRun", fields: ["prompt", "input", "output", "status"] })],
      state: {
        prompt: "",
        input: "",
        output: "",
        status: "local-preview-only",
        runs: [],
      },
      operations: [
        createOperation({ id: "aiTool.preview", label: "הפק תוצאה מדומה", kind: "process", input: { prompt: "string", input: "string" }, output: { output: "string" } }),
        createOperation({ id: "aiTool.updatePrompt", label: "שנה הנחיה", kind: "update", input: { prompt: "string" } }),
      ],
    };
  }

  return {
    productDomainSkeletonId,
    domainTaskId: "PRODUCT-BACKEND-SKEL-001",
    productClass: normalizedProductClass,
    runtimeSkeletonId,
    domainKind: "tool-operation-local-state",
    models: [createModel({ name: "ToolRun", fields: ["input", "output", "mode"] })],
    state: {
      input: "",
      output: "",
      mode: "default",
      runs: [],
    },
    operations: [
      createOperation({ id: "tool.run", label: "הרץ פעולה", kind: "process", input: { input: "string" }, output: { output: "string" } }),
      createOperation({ id: "tool.changeMode", label: "שנה מצב", kind: "update", input: { mode: "string" } }),
    ],
  };
}

export function buildProductDomainSkeletonEnvelope({
  projectId = "runtime-preview",
  productClass = "generic",
  runtimeSkeletonId = "",
  productSkeleton = {},
  productKindDiscovery = null,
} = {}) {
  const normalizedProductClass = normalizeString(productClass, "generic");
  const params = {
    projectId: normalizeString(projectId, "runtime-preview"),
    productClass: normalizedProductClass,
    runtimeSkeletonId: normalizeString(runtimeSkeletonId, `runtime-skeleton:${projectId}:${normalizedProductClass}`),
    productSkeleton: normalizeObject(productSkeleton),
    productKindDiscovery: normalizeObject(productKindDiscovery),
  };
  const byClass = {
    "mobile-app": createMobileDomain,
    "landing-page": createLandingDomain,
    "internal-tool": createInternalToolDomain,
    "saas": createInternalToolDomain,
    "commerce-ops": createCommerceDomain,
    game: createGameDomain,
  };
  const builder = byClass[normalizedProductClass] ?? createToolDomain;
  const envelope = builder(params);
  return {
    ...envelope,
    truthSource: "generated-product-domain-skeleton",
    truthStatus: "mock-local-domain-truth",
    canonicalProjectTruth: true,
    productionBackend: false,
    persistenceBoundary: "local/mock product state stored inside Nexus project truth; not a deployed product backend",
    uiBindingContract: {
      actionAttribute: "data-product-domain-operation",
      stateAttribute: "data-product-domain-state",
      operationBoundary: "UI controls must reference one of the generated product-domain operations before claiming behavior.",
    },
  };
}

export function applyProductDomainOperation(domainSkeleton = {}, operationId = "", payload = {}) {
  const skeleton = normalizeObject(domainSkeleton);
  const state = structuredClone(normalizeObject(skeleton.state));
  const operation = normalizeArray(skeleton.operations).find((candidate) => candidate.id === operationId);
  if (!operation) {
    return {
      ok: false,
      error: "unknown-product-domain-operation",
      state,
      domainSkeleton: skeleton,
    };
  }

  if (operationId === "task.create") {
    const tasks = normalizeArray(state.tasks);
    tasks.push({ id: `task-${tasks.length + 1}`, title: normalizeString(payload.title, "משימה חדשה"), status: "open", owner: "אני" });
    state.tasks = tasks;
  } else if (operationId === "task.updateStatus") {
    state.tasks = normalizeArray(state.tasks).map((task) => task.id === payload.taskId ? { ...task, status: normalizeString(payload.status, "done") } : task);
    state.completedCount = state.tasks.filter((task) => task.status === "done").length;
  } else if (operationId === "lead.submit") {
    if (!normalizeString(payload.name, "") || !normalizeString(payload.phone, "")) {
      return { ok: false, error: "lead-validation-failed", state: { ...state, lastSubmissionStatus: "validation-failed" }, domainSkeleton: skeleton };
    }
    const leads = normalizeArray(state.leads);
    leads.push({ id: `lead-${leads.length + 1}`, name: payload.name, phone: payload.phone, message: normalizeString(payload.message, ""), source: "runtime-skeleton" });
    state.leads = leads;
    state.lastSubmissionStatus = "saved";
  } else if (operationId === "record.select") {
    const requestedRecordId = normalizeString(payload.recordId, "");
    const selected = normalizeArray(state.records).find((record) => record.id === requestedRecordId);
    state.selectedRecordId = selected?.id ?? normalizeString(state.selectedRecordId, requestedRecordId);
  } else if (operationId === "record.updateStatus") {
    state.records = normalizeArray(state.records).map((record) => record.id === payload.recordId ? { ...record, status: normalizeString(payload.status, "בוצע") } : record);
  } else if (operationId === "record.assignOwner") {
    state.records = normalizeArray(state.records).map((record) => record.id === payload.recordId ? { ...record, owner: normalizeString(payload.owner, record.owner) } : record);
  } else if (operationId === "record.updateReminder") {
    state.records = normalizeArray(state.records).map((record) => record.id === payload.recordId ? { ...record, reminder: normalizeString(payload.reminder, record.reminder) } : record);
  } else if (operationId === "record.create") {
    const records = normalizeArray(state.records);
    const nextIndex = records.length + 1;
    state.records = [
      ...records,
      {
        id: `rec-${nextIndex}`,
        name: normalizeString(payload.name, `ליד חדש ${nextIndex}`),
        status: normalizeString(payload.status, "פתוח"),
        owner: normalizeString(payload.owner, "ללא אחראי"),
        reminder: normalizeString(payload.reminder, "היום"),
        nextStep: normalizeString(payload.nextStep, "לחזור לשיחה"),
      },
    ];
    state.selectedRecordId = `rec-${nextIndex}`;
    state.statusCounts = {
      ...normalizeObject(state.statusCounts),
      open: normalizeArray(state.records).filter((record) => normalizeString(record.status, "") === "פתוח").length,
      active: normalizeArray(state.records).filter((record) => normalizeString(record.status, "") === "בטיפול").length,
    };
  } else if (operationId === "record.addField") {
    const fieldName = normalizeString(payload.fieldName, "שדה חדש");
    const normalizedModels = normalizeArray(skeleton.models);
    const model = normalizeObject(normalizedModels[0]);
    const currentFields = normalizeArray(model.fields);
    const hasField = currentFields.some((field) => normalizeString(field.name, "") === fieldName);
    const models = normalizedModels.length
      ? [
          {
            ...model,
            fields: hasField
              ? currentFields
              : [
                  ...currentFields,
                  { name: fieldName, type: "string", required: false },
                ],
          },
          ...normalizedModels.slice(1),
        ]
      : [createModel({ name: "Record", fields: [fieldName] })];
    state.records = normalizeArray(state.records).map((record) => ({
      ...record,
      [fieldName]: Object.hasOwn(record, fieldName) ? record[fieldName] : normalizeString(payload.defaultValue, "לא סומן"),
    }));
    state.lastSchemaChange = `added-field:${fieldName}`;
    return {
      ok: true,
      operationId,
      state,
      domainSkeleton: {
        ...skeleton,
        models,
        state,
      },
    };
  } else if (operationId === "cart.addItem") {
    const product = normalizeArray(state.products).find((item) => item.id === payload.productId) ?? normalizeArray(state.products)[0];
    const quantity = Number.isFinite(Number(payload.quantity)) ? Number(payload.quantity) : 1;
    state.cart = {
      items: [...normalizeArray(state.cart?.items), { productId: product?.id ?? "prod-1", quantity }],
      total: Number(state.cart?.total ?? 0) + Number(product?.price ?? 0) * quantity,
    };
  } else if (operationId === "game.start") {
    state.status = "running";
  } else if (operationId === "game.score") {
    state.score = Number(state.score ?? 0) + (Number.isFinite(Number(payload.amount)) ? Number(payload.amount) : 1);
  } else if (operationId === "tool.run") {
    state.input = normalizeString(payload.input, state.input);
    state.output = state.input ? `פלט עבור: ${state.input}` : "אין קלט";
    state.runs = [...normalizeArray(state.runs), { input: state.input, output: state.output }];
  } else if (operationId === "editor.addObject") {
    const objects = normalizeArray(state.document?.objects);
    const object = { id: `obj-${objects.length + 1}`, type: normalizeString(payload.type, "shape"), x: 64, y: 48, style: "primary" };
    state.document = { ...normalizeObject(state.document), objects: [...objects, object], selectedObjectId: object.id };
    state.history = [...normalizeArray(state.history), "added-object"];
  } else if (operationId === "editor.updateSelection") {
    state.document = { ...normalizeObject(state.document), selectedObjectId: normalizeString(payload.objectId, state.document?.selectedObjectId) };
    state.history = [...normalizeArray(state.history), "changed-selection"];
  } else if (operationId === "simulator.runScenario") {
    state.scenario = normalizeString(payload.scenario, state.scenario);
    state.result = `תוצאה עבור ${state.scenario}`;
    state.runs = [...normalizeArray(state.runs), { scenario: state.scenario, result: state.result }];
  } else if (operationId === "simulator.updateParameter") {
    const key = normalizeString(payload.key, "intensity");
    state.parameters = { ...normalizeObject(state.parameters), [key]: Number.isFinite(Number(payload.value)) ? Number(payload.value) : 50 };
  } else if (operationId === "aiTool.preview") {
    state.prompt = normalizeString(payload.prompt, state.prompt);
    state.input = normalizeString(payload.input, state.input);
    state.output = state.input ? `תוצאה מדומה עבור: ${state.input}` : "נדרש קלט";
    state.runs = [...normalizeArray(state.runs), { prompt: state.prompt, input: state.input, output: state.output }];
  }

  return {
    ok: true,
    operationId,
    state,
    domainSkeleton: {
      ...skeleton,
      state,
    },
  };
}
