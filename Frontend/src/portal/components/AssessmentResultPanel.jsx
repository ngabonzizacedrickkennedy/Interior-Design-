import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isSpeechSupported, isVoiceMuted, setVoiceMuted, stopSpeaking } from "../utils/speech";

export function AssessmentResultPanel({ assessment, onRemain }) {
  const { t } = useTranslation("portal");
  const [muted, setMuted] = useState(isVoiceMuted());

  useEffect(() => () => stopSpeaking(), []);

  if (!assessment) return null;
  const isPendingDecision = assessment.verdict === "INSUFFICIENT" && assessment.status === "PENDING";

  function handleToggleMute() {
    const next = !muted;
    setVoiceMuted(next);
    setMuted(next);
  }

  return (
    <div className="portal-detail-panel">
      {isSpeechSupported() && (
        <button type="button" className="btn assessment-speak-btn" onClick={handleToggleMute}>
          {muted ? t("assessmentResult.unmuteAiVoice") : t("assessmentResult.muteAiVoice")}
        </button>
      )}

      <dl>
        <dt>{t("assessmentResult.verdict")}</dt>
        <dd>
          <span className={`badge badge--${assessment.verdict === "SUFFICIENT" ? "completed" : "pending"}`}>
            {assessment.verdict === "SUFFICIENT" ? t("assessmentResult.budgetSufficient") : t("assessmentResult.budgetInsufficient")}
          </span>
        </dd>
        <dt>{t("assessmentResult.recommendedBudget")}</dt>
        <dd>
          {Number(assessment.recommendedBudgetMin || 0).toLocaleString()} –{" "}
          {Number(assessment.recommendedBudgetMax || 0).toLocaleString()}
        </dd>
        <dt>{t("assessmentResult.reasoning")}</dt><dd>{assessment.reasoning}</dd>
        <dt>{t("assessmentResult.styleSummary")}</dt><dd>{assessment.styleSummary}</dd>
        <dt>{t("assessmentResult.roomCondition")}</dt><dd>{assessment.roomConditionSummary}</dd>
      </dl>

      {isPendingDecision && (
        <div className="portal-actions" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn" onClick={onRemain}>{t("assessmentResult.remain")}</button>
        </div>
      )}
      {assessment.verdict === "INSUFFICIENT" && (
        <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
          {t("assessmentResult.insufficientNote")}
        </p>
      )}
    </div>
  );
}
