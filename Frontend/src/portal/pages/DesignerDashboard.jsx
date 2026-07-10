import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as designerActions from "../../api/actions/designerProfile";
import { StatTile } from "../components/StatTile";
import "../PortalLayout.css";

export function DesignerDashboard() {
  const { t } = useTranslation("staff");
  const APPROVAL_LABEL = {
    PENDING: t("designerDashboard.approvalPending"),
    APPROVED: t("designerDashboard.approvalApproved"),
    REJECTED: t("designerDashboard.approvalRejected"),
  };
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    designerActions.getMyDesignerProfile()
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const percent = profile?.profileCompletionPercent ?? 0;

  return (
    <div>
      <h1 className="portal-page-title">{t("designerDashboard.title")}</h1>
      <p className="portal-page-sub">{t("designerDashboard.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      {loading ? (
        <p className="portal-loading">{t("designerDashboard.loading")}</p>
      ) : (
        <>
          <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
            <StatTile label={t("designerDashboard.profileCompletion")} value={`${percent}%`} accent />
            <StatTile label={t("designerDashboard.cvScore")} value={profile?.cvStrengthScore != null ? `${profile.cvStrengthScore}/10` : "—"} />
            <StatTile label={t("designerDashboard.interviewScore")} value={profile?.interviewScore != null ? `${profile.interviewScore}/10` : "—"} />
            <StatTile label={t("designerDashboard.approvalStatus")} value={APPROVAL_LABEL[profile?.approvalStatus] || "—"} />
          </div>

          <section className="portal-section">
            <h2 className="portal-section__title">{t("designerDashboard.profileCompletionSectionTitle")}</h2>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
            </div>
            <p style={{ color: "var(--color-ink-soft)", fontSize: "0.9rem" }}>
              {t("designerDashboard.profileCompletionHint")}
            </p>
            <Link to="/portal/professional-background" className="btn btn-solid" style={{ marginTop: "1rem", display: "inline-block" }}>
              {t("designerDashboard.goToProfessionalBackground")}
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
