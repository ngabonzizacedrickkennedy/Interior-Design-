import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../../components/toast/ToastContext";
import * as designerActions from "../../api/actions/designerProfile";
import "../PortalLayout.css";

const APPROVAL_BADGE = { PENDING: "pending", APPROVED: "approved", REJECTED: "cancelled" };

export function DesignerMonitor() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  if (user?.role !== "ADMIN" && user?.role !== "PROJECT_MANAGER") {
    return (
      <div className="portal-access-denied">
        <h2>{t("designerMonitor.accessRestrictedTitle")}</h2>
        <p>{t("designerMonitor.accessRestrictedMessage")}</p>
      </div>
    );
  }

  useEffect(() => {
    async function load() {
      try {
        setProfiles(await designerActions.getAllDesignerProfiles());
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleApprove(id) {
    setBusyId(id);
    try {
      const updated = await designerActions.approveDesignerProfile(id);
      setProfiles((p) => p.map((x) => (x.id === id ? updated : x)));
      showSuccess(t("designerMonitor.approveSuccess"));
    } catch (e) {
      showError(e.message || t("designerMonitor.approveError"));
    } finally { setBusyId(null); }
  }

  async function handleReject(id) {
    setBusyId(id);
    try {
      const updated = await designerActions.rejectDesignerProfile(id);
      setProfiles((p) => p.map((x) => (x.id === id ? updated : x)));
      showSuccess(t("designerMonitor.rejectSuccess"));
    } catch (e) {
      showError(e.message || t("designerMonitor.rejectError"));
    } finally { setBusyId(null); }
  }

  const approvedCount = profiles.filter((p) => p.approvalStatus === "APPROVED").length;
  const pendingCount = profiles.filter((p) => p.approvalStatus === "PENDING").length;

  return (
    <div>
      <h1 className="portal-page-title">{t("designerMonitor.title")}</h1>
      <p className="portal-page-sub">{t("designerMonitor.subtitle")}</p>

      <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("designerMonitor.totalDesigners")}</p>
          <p className="portal-stat-card__value">{profiles.length}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("designerMonitor.approved")}</p>
          <p className="portal-stat-card__value portal-stat-card__value--accent">{approvedCount}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("designerMonitor.pendingReview")}</p>
          <p className="portal-stat-card__value">{pendingCount}</p>
        </div>
      </div>

      {error && <p className="portal-error">{error}</p>}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("designerMonitor.designersSectionTitle")}</h2>
        {loading ? <p className="portal-loading">{t("designerMonitor.loading")}</p> : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t("designerMonitor.columnName")}</th><th>{t("designerMonitor.columnEmail")}</th><th>{t("designerMonitor.columnCvScore")}</th><th>{t("designerMonitor.columnInterviewScore")}</th>
                  <th>{t("designerMonitor.columnStatus")}</th><th>{t("designerMonitor.columnActions")}</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.fullName}</td>
                    <td style={{ color: "var(--color-ink-soft)" }}>{p.email}</td>
                    <td>
                      {p.cvStrengthScore != null ? (
                        <span title={p.cvReasoning || ""}>
                          {p.cvStrengthScore}/10 {p.cvIsValidDocument === false && "⚠"}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      {p.interviewScore != null ? (
                        <span title={p.interviewReasoning || ""}>{p.interviewScore}/10</span>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`badge badge--${APPROVAL_BADGE[p.approvalStatus] || "draft"}`}>
                        {p.approvalStatus === "PENDING" ? t("designerMonitor.statusPending")
                          : p.approvalStatus === "APPROVED" ? t("designerMonitor.statusApproved")
                          : p.approvalStatus === "REJECTED" ? t("designerMonitor.statusRejected")
                          : p.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <div className="portal-actions">
                        <button className="btn"
                          style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                          disabled={busyId === p.id || p.approvalStatus === "APPROVED"}
                          onClick={() => handleApprove(p.id)}>
                          {t("designerMonitor.approveButton")}
                        </button>
                        <button className="btn"
                          style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                          disabled={busyId === p.id || p.approvalStatus === "REJECTED"}
                          onClick={() => handleReject(p.id)}>
                          {t("designerMonitor.rejectButton")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!profiles.length && (
                  <tr><td colSpan={6} className="portal-empty">{t("designerMonitor.noDesigners")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
