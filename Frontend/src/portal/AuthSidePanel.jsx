import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBackgroundVideo } from "../api/actions/siteBackgroundVideo";

export function AuthSidePanel() {
  const { t } = useTranslation("auth");
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    getBackgroundVideo()
      .then((res) => setVideoUrl(res.videoUrl))
      .catch(() => {});
  }, []);

  return (
    <div className="auth-page__panel">
      {videoUrl && (
        <>
          <video
            className="auth-page__video"
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="auth-page__video-overlay" />
        </>
      )}

      <div className="auth-page__brand">
        <p className="auth-page__brand-name">{t("sidePanel.brandName")}</p>
        <p className="auth-page__brand-tag">{t("sidePanel.brandTag")}</p>
      </div>

      <div className="auth-page__copy">
        <h1>{t("sidePanel.heading")}</h1>
        <p>{t("sidePanel.subheading")}</p>
      </div>

      <p className="auth-page__footnote">
        {t("sidePanel.footnote", { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
