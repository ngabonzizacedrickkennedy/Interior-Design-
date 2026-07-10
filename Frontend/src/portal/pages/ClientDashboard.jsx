import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getMyRequests, withdrawRequest } from "../../api/actions/requests";
import { StatTile } from "../components/StatTile";
import { RequestCard } from "../components/RequestCard";
import { deriveDisplayStatus } from "../utils/requestStatus";
import { clearWizardProgress } from "../wizard/wizardStepStorage";
import "../PortalLayout.css";
import "./dashboard.css";

export function ClientDashboard() {
  const { t } = useTranslation("portal");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getMyRequests();
      setRequests(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(id) {
    if (!confirm(t("dashboard.confirmWithdraw"))) return;
    try {
      await withdrawRequest(id);
      clearWizardProgress(id);
      setRequests((r) => r.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  const total = requests.length;
  const assessed = requests.filter((r) => ["ASSESSED", "INVESTED"].includes(deriveDisplayStatus(r))).length;
  const pending = requests.filter((r) => deriveDisplayStatus(r) === "NOT_ASSESSED").length;
  const invested = requests.filter((r) => deriveDisplayStatus(r) === "INVESTED").length;

  return (
    <div>
      <h1 className="portal-page-title">{t("dashboard.title")}</h1>
      <p className="portal-page-sub">
        {t("dashboard.subtitle")}
      </p>

      {error && <p className="portal-error">{error}</p>}

      <div className="portal-stat-grid" style={{ marginBottom: "2rem" }}>
        <StatTile label={t("dashboard.totalSubmitted")} value={total} />
        <StatTile label={t("dashboard.assessed")} value={assessed} accent />
        <StatTile label={t("dashboard.pendingAssessment")} value={pending} />
        <StatTile label={t("dashboard.invested")} value={invested} accent />
      </div>

      <div className="portal-actions" style={{ marginBottom: "1.5rem" }}>
        <Link to="/portal/requests/new" className="btn btn-solid">{t("dashboard.newRequest")}</Link>
      </div>

      {loading ? (
        <p className="portal-loading">{t("dashboard.loading")}</p>
      ) : requests.length === 0 ? (
        <p className="portal-empty">{t("dashboard.noRequestsYet")}</p>
      ) : (
        <div className="request-card-grid">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} onWithdraw={handleWithdraw} />
          ))}
        </div>
      )}
    </div>
  );
}
