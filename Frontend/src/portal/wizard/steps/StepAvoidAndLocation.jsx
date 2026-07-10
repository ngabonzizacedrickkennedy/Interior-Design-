import { useTranslation } from "react-i18next";

export function StepAvoidAndLocation({ state, setField }) {
  const { t } = useTranslation("portal");
  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.avoidAndLocation.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.avoidAndLocation.subtitle")}
      </p>

      <div className="field field--full">
        <label>{t("wizard.avoidAndLocation.colorsMaterialsToAvoid")}</label>
        <textarea
          placeholder={t("wizard.avoidAndLocation.avoidPlaceholder")}
          value={state.fields.avoidNotes}
          onChange={(e) => setField("avoidNotes", e.target.value)}
        />
      </div>

      <div className="field field--full">
        <label>{t("wizard.avoidAndLocation.yourLocation")}</label>
        <input
          type="text"
          placeholder={t("wizard.avoidAndLocation.locationPlaceholder")}
          value={state.fields.sourcingLocation}
          onChange={(e) => setField("sourcingLocation", e.target.value)}
        />
      </div>
    </div>
  );
}
