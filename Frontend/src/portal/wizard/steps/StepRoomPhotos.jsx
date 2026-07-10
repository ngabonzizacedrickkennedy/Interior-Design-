import { useTranslation } from "react-i18next";
import { WizardImageUploader } from "../WizardImageUploader";
import { REQUEST_NAME_OPTIONS } from "../../utils/requestOptions";

export function StepRoomPhotos({ state, setField, dispatch, requestId }) {
  const { t } = useTranslation("portal");
  const attachments = state.attachments.filter((a) => a.category === "ROOM_PHOTO");

  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.roomPhotos.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.roomPhotos.subtitle")}
      </p>

      <div className="field field--full">
        <label>{t("wizard.roomPhotos.requestName")}</label>
        <select
          value={state.fields.requestName}
          onChange={(e) => setField("requestName", e.target.value)}
        >
          <option value="">{t("wizard.roomPhotos.selectRequestType")}</option>
          {REQUEST_NAME_OPTIONS.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="field field--full">
        <label>{t("wizard.roomPhotos.roomType")}</label>
        <input
          type="text"
          placeholder={t("wizard.roomPhotos.roomTypePlaceholder")}
          value={state.fields.roomType}
          onChange={(e) => setField("roomType", e.target.value)}
        />
      </div>

      <div className="field field--full">
        <label>{t("wizard.roomPhotos.describeYourRequest")}</label>
        <textarea
          placeholder={t("wizard.roomPhotos.describePlaceholder")}
          value={state.fields.requestDetails}
          onChange={(e) => setField("requestDetails", e.target.value)}
        />
      </div>

      <WizardImageUploader
        requestId={requestId}
        category="ROOM_PHOTO"
        attachments={attachments}
        onAdd={(a) => dispatch({ type: "ADD_ATTACHMENT", attachment: a })}
        onRemove={(id) => dispatch({ type: "REMOVE_ATTACHMENT", attachmentId: id })}
        onUpdateNote={(id, note) => dispatch({ type: "UPDATE_ATTACHMENT_NOTE", attachmentId: id, note })}
      />
    </div>
  );
}
