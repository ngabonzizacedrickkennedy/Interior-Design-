import { useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadAttachment } from "../../api/actions/uploads";
import { deleteAttachment, updateAttachmentNote } from "../../api/actions/requests";

export function WizardImageUploader({ requestId, category, attachments, onAdd, onRemove, onUpdateNote }) {
  const { t } = useTranslation("portal");
  const [pending, setPending] = useState([]);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    for (const file of files) {
      setPending((p) => [...p, { name: file.name, status: "uploading" }]);
      try {
        const attachment = await uploadAttachment({ requestId, category, file, note: "" });
        onAdd(attachment);
      } catch (err) {
        setPending((p) =>
          p.map((f) => (f.name === file.name ? { ...f, status: "error", error: err.message } : f))
        );
        continue;
      }
      setPending((p) => p.filter((f) => f.name !== file.name));
    }
  }

  async function handleNoteChange(attachmentId, note) {
    onUpdateNote(attachmentId, note);
  }

  async function handleNoteBlur(attachmentId, note) {
    try {
      await updateAttachmentNote(requestId, attachmentId, note);
    } catch {
    }
  }

  async function handleRemove(attachmentId) {
    try {
      await deleteAttachment(requestId, attachmentId);
      onRemove(attachmentId);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="wizard-uploader">
      <label className="wizard-uploader__dropzone">
        <input type="file" accept="image/*" multiple onChange={handleFiles} hidden />
        <span>{t("wizard.imageUploader.clickToUpload")}</span>
        <span className="wizard-uploader__hint">{t("wizard.imageUploader.fileHint")}</span>
      </label>

      {pending.length > 0 && (
        <ul className="wizard-uploader__pending">
          {pending.map((f) => (
            <li key={f.name} className={f.status === "error" ? "is-error" : ""}>
              {f.name} — {f.status === "error" ? f.error || t("wizard.imageUploader.uploadFailed") : t("wizard.imageUploader.uploading")}
            </li>
          ))}
        </ul>
      )}

      {attachments.length > 0 && (
        <div className="wizard-uploader__grid">
          {attachments.map((a) => (
            <div key={a.id} className="wizard-uploader__item">
              <img src={a.url} alt={a.originalFileName || t("wizard.imageUploader.uploadedAlt")} />
              <textarea
                placeholder={t("wizard.imageUploader.notePlaceholder")}
                value={a.note || ""}
                onChange={(e) => handleNoteChange(a.id, e.target.value)}
                onBlur={(e) => handleNoteBlur(a.id, e.target.value)}
              />
              <button type="button" className="wizard-uploader__remove" onClick={() => handleRemove(a.id)}>
                {t("wizard.imageUploader.remove")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
