import { useTranslation } from "react-i18next";

export function StepTimeline({ state, setField }) {
  const { t } = useTranslation("portal");
  const TIMELINE_LABELS = {
    IMMEDIATE: t("wizard.timeline.timelineImmediate"),
    THREE_TO_SIX_MONTHS: t("wizard.timeline.timelineThreeToSixMonths"),
    PLANNING_AHEAD: t("wizard.timeline.timelinePlanningAhead"),
  };
  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.timeline.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.timeline.subtitle")}
      </p>

      <div className="field__radio-group">
        {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
          <label key={value} className="field__radio-option">
            <input
              type="radio"
              name="timeline"
              value={value}
              checked={state.fields.timeline === value}
              onChange={() => setField("timeline", value)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
