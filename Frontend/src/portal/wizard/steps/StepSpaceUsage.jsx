import { useTranslation } from "react-i18next";

export function StepSpaceUsage({ state, setField }) {
  const { t } = useTranslation("portal");
  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.spaceUsage.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.spaceUsage.subtitle")}
      </p>

      <div className="field__radio-group">
        <label className="field__radio-option">
          <input type="checkbox" checked={state.fields.worksFromHome}
            onChange={(e) => setField("worksFromHome", e.target.checked)} />
          {t("wizard.spaceUsage.worksFromHome")}
        </label>
        <label className="field__radio-option">
          <input type="checkbox" checked={state.fields.entertainsOften}
            onChange={(e) => setField("entertainsOften", e.target.checked)} />
          {t("wizard.spaceUsage.entertainsOften")}
        </label>
        <label className="field__radio-option">
          <input type="checkbox" checked={state.fields.hasKids}
            onChange={(e) => setField("hasKids", e.target.checked)} />
          {t("wizard.spaceUsage.hasKids")}
        </label>
        <label className="field__radio-option">
          <input type="checkbox" checked={state.fields.hasPets}
            onChange={(e) => setField("hasPets", e.target.checked)} />
          {t("wizard.spaceUsage.hasPets")}
        </label>
      </div>

      <div className="field field--full" style={{ marginTop: "1.5rem" }}>
        <label>{t("wizard.spaceUsage.specificStorageNeeds")}</label>
        <textarea
          placeholder={t("wizard.spaceUsage.storageNeedsPlaceholder")}
          value={state.fields.storageNeeds}
          onChange={(e) => setField("storageNeeds", e.target.value)}
        />
      </div>
    </div>
  );
}
