import { useTranslation } from "react-i18next";

export function StepLighting({ state, setField }) {
  const { t } = useTranslation("portal");
  const WINDOW_DIRECTION_LABELS = {
    NORTH: t("wizard.lighting.directionNorth"),
    SOUTH: t("wizard.lighting.directionSouth"),
    EAST: t("wizard.lighting.directionEast"),
    WEST: t("wizard.lighting.directionWest"),
    MIXED: t("wizard.lighting.directionMixed"),
    UNKNOWN: t("wizard.lighting.directionUnknown"),
  };
  const LIGHT_LEVEL_LABELS = {
    LOW: t("wizard.lighting.levelLow"),
    MEDIUM: t("wizard.lighting.levelMedium"),
    HIGH: t("wizard.lighting.levelHigh"),
  };

  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.lighting.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.lighting.subtitle")}
      </p>

      <div className="portal-form-row">
        <div className="field">
          <label>{t("wizard.lighting.windowDirection")}</label>
          <select value={state.fields.windowDirection}
            onChange={(e) => setField("windowDirection", e.target.value)}>
            <option value="">{t("wizard.lighting.selectPlaceholder")}</option>
            {Object.entries(WINDOW_DIRECTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>{t("wizard.lighting.naturalLightLevel")}</label>
          <select value={state.fields.naturalLightLevel}
            onChange={(e) => setField("naturalLightLevel", e.target.value)}>
            <option value="">{t("wizard.lighting.selectPlaceholder")}</option>
            {Object.entries(LIGHT_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field field--full">
        <label>{t("wizard.lighting.existingArtificialLighting")}</label>
        <textarea
          placeholder={t("wizard.lighting.artificialLightingPlaceholder")}
          value={state.fields.artificialLightingNotes}
          onChange={(e) => setField("artificialLightingNotes", e.target.value)}
        />
      </div>
    </div>
  );
}
