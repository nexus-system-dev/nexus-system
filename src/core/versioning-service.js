function parseVersion(currentVersion = "0.0.0") {
  const [major = "0", minor = "0", patch = "0"] = String(currentVersion).split(".");
  return {
    major: Number.parseInt(major, 10) || 0,
    minor: Number.parseInt(minor, 10) || 0,
    patch: Number.parseInt(patch, 10) || 0,
  };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

export function createVersioningService({
  releasePolicy = "patch",
  currentVersion = "0.0.0",
} = {}) {
  const version = parseVersion(currentVersion);

  if (releasePolicy === "major") {
    version.major += 1;
    version.minor = 0;
    version.patch = 0;
  } else if (releasePolicy === "minor") {
    version.minor += 1;
    version.patch = 0;
  } else {
    version.patch += 1;
  }

  const nextVersion = formatVersion(version);

  return {
    nextVersion,
    releaseTag: `v${nextVersion}`,
  };
}
