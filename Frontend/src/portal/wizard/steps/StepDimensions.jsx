import { useTranslation } from "react-i18next";
import { WizardImageUploader } from "../WizardImageUploader";

export function StepDimensions({ state, setField, dispatch, requestId }) {
  const { t } = useTranslation("portal");
  const attachments = state.attachments.filter((a) => a.category === "FLOOR_PLAN");

  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.dimensions.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.dimensions.subtitle")}
      </p>

      <div className="portal-form-row">
        <div className="field">
          <label>{t("wizard.dimensions.length")}</label>
          <input type="number" min="0" step="0.1" value={state.fields.lengthMeters}
            onChange={(e) => setField("lengthMeters", e.target.value)} />
        </div>
        <div className="field">
          <label>{t("wizard.dimensions.width")}</label>
          <input type="number" min="0" step="0.1" value={state.fields.widthMeters}
            onChange={(e) => setField("widthMeters", e.target.value)} />
        </div>
        <div className="field">
          <label>{t("wizard.dimensions.ceilingHeight")}</label>
          <input type="number" min="0" step="0.1" value={state.fields.ceilingHeightMeters}
            onChange={(e) => setField("ceilingHeightMeters", e.target.value)} />
        </div>
      </div>

      <div className="field field--full">
        <label>{t("wizard.dimensions.doorsWindowsFixedFeatures")}</label>
        <textarea
          placeholder={t("wizard.dimensions.spatialNotesPlaceholder")}
          value={state.fields.spatialNotes}
          onChange={(e) => setField("spatialNotes", e.target.value)}
        />
      </div>

      <p className="portal-page-sub">{t("wizard.dimensions.floorPlanUploadHint")}</p>
      <WizardImageUploader
        requestId={requestId}
        category="FLOOR_PLAN"
        attachments={attachments}
        onAdd={(a) => dispatch({ type: "ADD_ATTACHMENT", attachment: a })}
        onRemove={(id) => dispatch({ type: "REMOVE_ATTACHMENT", attachmentId: id })}
        onUpdateNote={(id, note) => dispatch({ type: "UPDATE_ATTACHMENT_NOTE", attachmentId: id, note })}
      />
    </div>
  );
}
