function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
}

function buildGoal(screenType) {
  if (screenType === "wizard") {
    return "להוביל את המשתמש להשלים צעד ברור בזרימה";
  }

  if (screenType === "dashboard") {
    return "לתת תמונת מצב ברורה ופעולה ראשית אחת";
  }

  if (screenType === "tracking") {
    return "להציג סטטוס, חסמים והצעד הבא";
  }

  if (screenType === "workspace") {
    return "לאפשר עבודה ממוקדת על תוכן, תכנון או ניתוח";
  }

  return "להציג מידע ברור ולאפשר המשך פעולה";
}

function buildPrimaryAction(screenType) {
  if (screenType === "wizard") {
    return {
      actionId: "continue-flow",
      label: "המשך",
      intent: "progress",
    };
  }

  if (screenType === "dashboard") {
    return {
      actionId: "take-next-step",
      label: "הצעד הבא",
      intent: "primary",
    };
  }

  if (screenType === "tracking") {
    return {
      actionId: "review-status",
      label: "בדוק סטטוס",
      intent: "primary",
    };
  }

  if (screenType === "workspace") {
    return {
      actionId: "apply-workspace-update",
      label: "שמור שינויים",
      intent: "save",
    };
  }

  return {
    actionId: "confirm-screen-action",
    label: "אישור",
    intent: "primary",
  };
}

function buildSecondaryActions(screenType) {
  if (screenType === "wizard") {
    return [
      {
        actionId: "back",
        label: "חזרה",
      },
    ];
  }

  if (screenType === "dashboard") {
    return [
      {
        actionId: "view-details",
        label: "פרטים",
      },
      {
        actionId: "refresh",
        label: "רענון",
      },
    ];
  }

  if (screenType === "tracking") {
    return [
      {
        actionId: "view-timeline",
        label: "ציר זמן",
      },
    ];
  }

  return [
    {
      actionId: "cancel",
      label: "ביטול",
    },
  ];
}

export function createGoalAndCtaDefinitionModule({
  screenContract,
} = {}) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const screenType = normalizedScreenContract.screenType ?? "detail";

  return {
    screenGoal: buildGoal(screenType),
    primaryAction: buildPrimaryAction(screenType),
    secondaryActions: buildSecondaryActions(screenType),
  };
}
