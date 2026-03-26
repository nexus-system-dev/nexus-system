function normalizeRequestPayload(requestPayload) {
  return requestPayload && typeof requestPayload === "object" ? requestPayload : {};
}

function normalizeRouteDefinition(routeDefinition) {
  return routeDefinition && typeof routeDefinition === "object"
    ? routeDefinition
    : { method: "GET", path: "/", handler: "unknown-handler", middlewares: [] };
}

function collectMissingFields(payload, requiredFields) {
  return requiredFields.filter((field) => payload[field] == null);
}

export function createRequestValidationAndErrorBoundaryLayer({
  requestPayload = null,
  routeDefinition = null,
} = {}) {
  const normalizedRequestPayload = normalizeRequestPayload(requestPayload);
  const normalizedRouteDefinition = normalizeRouteDefinition(routeDefinition);
  const requiredFields = Array.isArray(normalizedRouteDefinition.requiredFields)
    ? normalizedRouteDefinition.requiredFields
    : [];
  const missingFields = collectMissingFields(normalizedRequestPayload, requiredFields);
  const isValid = missingFields.length === 0;

  return {
    validatedRequest: {
      method: normalizedRouteDefinition.method ?? "GET",
      path: normalizedRouteDefinition.path ?? "/",
      handler: normalizedRouteDefinition.handler ?? "unknown-handler",
      payload: normalizedRequestPayload,
      requiredFields,
      missingFields,
      isValid,
      normalizedAt: new Date().toISOString(),
    },
    errorEnvelope: isValid
      ? {
          status: "ok",
          code: null,
          message: null,
          details: [],
        }
      : {
          status: "error",
          code: "INVALID_REQUEST",
          message: `Request validation failed for ${normalizedRouteDefinition.handler ?? "unknown-handler"}`,
          details: missingFields.map((field) => ({
            field,
            issue: "missing-required-field",
          })),
        },
  };
}
