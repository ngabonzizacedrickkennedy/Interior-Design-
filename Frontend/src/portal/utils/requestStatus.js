export function deriveDisplayStatus(request) {
  if (request.investmentStatus === "INVESTED") return "INVESTED";
  if (request.latestAssessment && !request.latestAssessment.systemTriggered) return "ASSESSED";
  if (request.executionStatus !== "DRAFT") return "NOT_ASSESSED";
  return "DRAFT";
}

export const DISPLAY_STATUS_LABELS = {
  DRAFT: "Draft",
  NOT_ASSESSED: "Not Yet Assessed",
  ASSESSED: "Assessed",
  INVESTED: "Invested",
};

export const DISPLAY_STATUS_BADGE = {
  DRAFT: "draft",
  NOT_ASSESSED: "pending",
  ASSESSED: "approved",
  INVESTED: "completed",
};
