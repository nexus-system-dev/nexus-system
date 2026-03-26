function classifyIssues(items = [], category, severity = "blocking") {
  return items.map((item) => ({
    category,
    severity,
    issue: item,
  }));
}

export function createBlockingIssuesClassifier({
  artifactValidation = null,
  metadataValidation = null,
  approvalValidation = null,
} = {}) {
  const blockingIssues = [
    ...classifyIssues(artifactValidation?.missingArtifacts ?? [], "artifact"),
    ...classifyIssues(metadataValidation?.missingMetadata ?? [], "metadata"),
    ...classifyIssues(approvalValidation?.missingApprovals ?? [], "approval"),
  ];

  return {
    blockingIssues,
  };
}
