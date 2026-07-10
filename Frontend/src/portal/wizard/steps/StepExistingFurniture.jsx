import { useTranslation } from "react-i18next";
import { WizardImageUploader } from "../WizardImageUploader";

export function StepExistingFurniture({ state, dispatch, requestId }) {
  const { t } = useTranslation("portal");
  const attachments = state.attachments.filter((a) => a.category === "EXISTING_FURNITURE");

  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.existingFurniture.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.existingFurniture.subtitle")}
      </p>

      <WizardImageUploader
        requestId={requestId}
        category="EXISTING_FURNITURE"
        attachments={attachments}
        onAdd={(a) => dispatch({ type: "ADD_ATTACHMENT", attachment: a })}
        onRemove={(id) => dispatch({ type: "REMOVE_ATTACHMENT", attachmentId: id })}
        onUpdateNote={(id, note) => dispatch({ type: "UPDATE_ATTACHMENT_NOTE", attachmentId: id, note })}
      />
    </div>
  );
}
