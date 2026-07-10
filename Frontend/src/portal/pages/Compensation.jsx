import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Wallet } from "@phosphor-icons/react";
import { useAuth } from "../auth/AuthContext";
import * as projectActions from "../../api/actions/projects";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

const STATUS_BADGE = {
  NOT_READY: "not-ready", PENDING: "pending", READY: "ready",
  PLANNING: "pending", ACTIVE: "active", ON_HOLD: "review",
  COMPLETED: "completed", CANCELLED: "cancelled",
};

export function Compensation() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState([]);
  const [blockedAmount, setBlockedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compensatingId, setCompensatingId] = useState(null);

  if (user?.role !== "PROJECT_MANAGER") {
    return (
      <div className="portal-access-denied">
        <h2>{t("compensation.accessRestrictedTitle")}</h2>
        <p>{t("compensation.accessRestrictedMessage")}</p>
      </div>
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([
        projectActions.getAssignedProjects(),
        projectActions.getBlockedAmount(),
      ]);
      setProjects(p);
      setBlockedAmount(b);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleCompensate(id) {
    setCompensatingId(id);
    try {
      const updated = await projectActions.compensateProject(id);
      setProjects((p) => p.map((x) => x.id === id ? updated : x));
      const b = await projectActions.getBlockedAmount();
      setBlockedAmount(b);
      showSuccess(t("compensation.fundsReleasedSuccess"));
    } catch (e) { showError(e.message || t("compensation.failedToCompensate")); }
    finally { setCompensatingId(null); }
  }

  return (
    <div>
      <h1 className="portal-page-title">{t("compensation.title")}</h1>
      <p className="portal-page-sub">{t("compensation.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("compensation.kpi.assignedProjects")}</p>
          <p className="portal-stat-card__value">{projects.length}</p>
        </div>
        <div className="portal-stat-card wallet-hero-card">
          <span className="wallet-hero-card__icon"><Wallet size={22} weight="fill" /></span>
          <p className="portal-stat-card__label">{t("compensation.kpi.blockedInSystem")}</p>
          <p className="portal-stat-card__value portal-stat-card__value--accent">
            {Number(blockedAmount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("compensation.assignedProjects")}</h2>
        {loading ? <p className="portal-loading">{t("compensation.loadingProjects")}</p> : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t("compensation.column.request")}</th><th>{t("compensation.column.assignedTo")}</th><th>{t("compensation.column.status")}</th>
                  <th>{t("compensation.column.investedAmount")}</th><th>{t("compensation.column.compensated")}</th><th>{t("compensation.column.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const canCompensate = p.operationalStatus === "COMPLETED" && !p.compensatedAt;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.requestName || p.clientName}</td>
                      <td>{p.assignedDesignerName || p.assignedStaffName}</td>
                      <td>
                        <span className={`badge badge--${STATUS_BADGE[p.operationalStatus] || "draft"}`}>
                          {t(`compensation.status.${p.operationalStatus}`, p.operationalStatus?.replace(/_/g, " "))}
                        </span>
                      </td>
                      <td>{Number(p.investedAmount || 0).toLocaleString()}</td>
                      <td>{p.compensatedAt ? new Date(p.compensatedAt).toLocaleDateString() : "—"}</td>
                      <td>
                        {canCompensate ? (
                          <button className="btn btn-solid" style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                            disabled={compensatingId === p.id}
                            onClick={() => handleCompensate(p.id)}>
                            {compensatingId === p.id ? t("compensation.compensating") : t("compensation.compensateButton")}
                          </button>
                        ) : (
                          <span style={{ color: "var(--color-ink-soft)", fontSize: "0.8rem" }}>
                            {p.compensatedAt ? t("compensation.done") : t("compensation.notYetCompleted")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!projects.length && (
                  <tr><td colSpan={6} className="portal-empty">{t("compensation.noAssignedProjectsYet")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
