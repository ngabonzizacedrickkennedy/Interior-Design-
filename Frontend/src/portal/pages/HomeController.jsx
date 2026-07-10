import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as videoActions from "../../api/actions/siteBackgroundVideo";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

export function HomeController() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLabel, setFileLabel] = useState(t("homeController.noFileChosen"));
  const [uploading, setUploading] = useState(false);

  if (user?.role !== "ADMIN") {
    return (
      <div className="portal-access-denied">
        <h2>{t("homeController.accessRestricted.title")}</h2>
        <p>{t("homeController.accessRestricted.message")}</p>
      </div>
    );
  }

  useEffect(() => {
    videoActions.getBackgroundVideo()
      .then(setVideo)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setFileLabel(f.name); }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const updated = await videoActions.uploadBackgroundVideo(file);
      setVideo(updated);
      setFile(null);
      setFileLabel(t("homeController.noFileChosen"));
      showSuccess(t("homeController.uploadSuccess"));
    } catch (e) {
      showError(e.message || t("homeController.uploadError"));
    } finally { setUploading(false); }
  }

  return (
    <div>
      <h1 className="portal-page-title">{t("homeController.title")}</h1>
      <p className="portal-page-sub">{t("homeController.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("homeController.currentVideo")}</h2>
        {loading ? <p className="portal-loading">{t("homeController.loading")}</p> : video?.videoUrl ? (
          <div>
            <video
              key={video.videoUrl}
              src={video.videoUrl}
              controls
              muted
              style={{ width: "100%", maxWidth: 480, borderRadius: 12, background: "#000", boxShadow: "0 8px 24px rgba(33,31,26,0.15)" }}
            />
            <p style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)", marginTop: "0.5rem" }}>
              {t("homeController.videoUpdatedAt", { fileName: video.originalFilename, date: new Date(video.updatedAt).toLocaleString() })}
            </p>
          </div>
        ) : (
          <p className="portal-empty">{t("homeController.noVideo")}</p>
        )}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("homeController.uploadNewVideo")}</h2>
        <div className="portal-form-row">
          <div className="field">
            <label>{t("homeController.videoFile")}</label>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <small style={{ color: "var(--color-ink-soft)", display: "block", marginTop: "0.25rem" }}>
              {fileLabel}
            </small>
          </div>
        </div>
        <button className="btn btn-solid" disabled={!file || uploading} onClick={handleUpload}>
          {uploading ? t("homeController.uploading") : t("homeController.uploadVideo")}
        </button>
      </section>
    </div>
  );
}
