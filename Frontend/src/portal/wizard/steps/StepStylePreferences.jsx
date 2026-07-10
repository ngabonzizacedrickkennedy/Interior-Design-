import { useTranslation } from "react-i18next";
import { WizardImageUploader } from "../WizardImageUploader";

export function StepStylePreferences({ state, setField, dispatch, requestId }) {
  const { t } = useTranslation("portal");
  const STYLE_PREFERENCE_LABELS = {
    MODERN_MINIMALIST: t("wizard.stylePreferences.styleModernMinimalist"),
    MID_CENTURY: t("wizard.stylePreferences.styleMidCentury"),
    INDUSTRIAL: t("wizard.stylePreferences.styleIndustrial"),
    SCANDINAVIAN: t("wizard.stylePreferences.styleScandinavian"),
    BOHEMIAN: t("wizard.stylePreferences.styleBohemian"),
    TRADITIONAL: t("wizard.stylePreferences.styleTraditional"),
    COASTAL: t("wizard.stylePreferences.styleCoastal"),
    CONTEMPORARY: t("wizard.stylePreferences.styleContemporary"),
    RUSTIC: t("wizard.stylePreferences.styleRustic"),
    ECLECTIC: t("wizard.stylePreferences.styleEclectic"),
  };
  const attachments = state.attachments.filter((a) => a.category === "STYLE_REFERENCE");

  function toggleTag(tag) {
    const tags = state.fields.styleTags.includes(tag)
      ? state.fields.styleTags.filter((t) => t !== tag)
      : [...state.fields.styleTags, tag];
    setField("styleTags", tags);
  }

  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.stylePreferences.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.stylePreferences.subtitle")}
      </p>

      <div className="wizard-tag-grid">
        {Object.entries(STYLE_PREFERENCE_LABELS).map(([value, label]) => (
          <label
            key={value}
            className={"wizard-tag" + (state.fields.styleTags.includes(value) ? " is-selected" : "")}
          >
            <input
              type="checkbox"
              checked={state.fields.styleTags.includes(value)}
              onChange={() => toggleTag(value)}
              hidden
            />
            {label}
          </label>
        ))}
      </div>

      <WizardImageUploader
        requestId={requestId}
        category="STYLE_REFERENCE"
        attachments={attachments}
        onAdd={(a) => dispatch({ type: "ADD_ATTACHMENT", attachment: a })}
        onRemove={(id) => dispatch({ type: "REMOVE_ATTACHMENT", attachmentId: id })}
        onUpdateNote={(id, note) => dispatch({ type: "UPDATE_ATTACHMENT_NOTE", attachmentId: id, note })}
      />
    </div>
  );
}
