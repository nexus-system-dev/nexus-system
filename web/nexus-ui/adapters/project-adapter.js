function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

const CREATE_PROJECT_UPLOAD_EMPTY_META = "README, package.json, קבצי קוד, מסמכים וקבצי הקשר. אפשר לבחור כמה קבצים יחד.";
const CREATE_PROJECT_UPLOAD_SELECTED_META = "הקבצים ייכנסו ל־onboarding כחומר פרויקט אמיתי לפני פתיחת ה־workspace.";

function parseDraftFiles(fileName = "", fileContent = "") {
  if (typeof fileContent === "string" && fileContent.trim()) {
    try {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed)) {
        return parsed.filter((file) => file && typeof file.name === "string" && file.name.trim());
      }
    } catch {
      // Fall back to the legacy single-file representation below.
    }
  }

  if (!fileName) {
    return [];
  }

  return [{ name: fileName }];
}

export function buildProjectCreateViewModel({
  currentProject = null,
  draftInputs = {},
  statusMessage = "ספר לנו על הרעיון שלך כדי שנוכל להפוך אותו למציאות",
} = {}) {
  const projectName = normalizeString(draftInputs.projectName, currentProject?.name ?? "");
  const visionText = normalizeString(draftInputs.visionText, currentProject?.goal ?? "");
  const supportingLink = normalizeString(draftInputs.supportingLink, "");
  const fileName = normalizeString(draftInputs.fileName, "");
  const fileContent = normalizeString(draftInputs.fileContent, "");
  const selectedFiles = parseDraftFiles(fileName, fileContent);
  const primaryFileName = selectedFiles[0]?.name ?? "";

  return {
    title: "מה אתה רוצה לבנות?",
    statusMessage,
    fields: {
      projectName,
      visionText,
      supportingLink,
      fileName,
      fileContent,
    },
    upload: {
      title: selectedFiles.length > 1
        ? `${selectedFiles.length} קבצי פרויקט נבחרו`
        : primaryFileName
          ? `נבחר קובץ: ${primaryFileName}`
          : "גרור קבצים לכאן או לחץ להעלאה",
      meta: selectedFiles.length > 0 ? CREATE_PROJECT_UPLOAD_SELECTED_META : CREATE_PROJECT_UPLOAD_EMPTY_META,
    },
    helperCards: [
      {
        title: "טיפים להתחלה",
        items: ["תאר בעיה ברורה", "הוסף דוגמאות", "היה ספציפי"],
      },
      {
        title: "מה קורה עכשיו?",
        items: ["ניצור פרויקט", "נבין את הרעיון", "נבנה משימה", "נתחיל ביצוע"],
      },
    ],
  };
}
