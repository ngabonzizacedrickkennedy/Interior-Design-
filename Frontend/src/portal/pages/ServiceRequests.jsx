import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import * as requestActions from "../../api/actions/requests";
import { getClientByUser } from "../../api/actions/clients";
import "../PortalLayout.css";

const STATUSES = ["NEW", "IN_REVIEW", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const BADGE_MAP = {
  NEW: "new", IN_REVIEW: "review", APPROVED: "approved",
  IN_PROGRESS: "progress", COMPLETED: "completed", CANCELLED: "cancelled",
};

export function ServiceRequests() {
  const { t } = useTranslation("portal");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const isClient = user?.role === "CLIENT";
  const canEdit  = user?.role === "PROJECT_MANAGER" || user?.role === "ADMIN";

  if (user?.role === "STAFF") {
    return (
      <div className="portal-access-denied">
        <h2>{t("serviceRequests.accessRestricted.title")}</h2>
        <p>{t("serviceRequests.accessRestricted.message")}</p>
      </div>
    );
  }

  useEffect(() => {
    async function load() {
      try {
        if (isClient) {
          // CLIENT sees only their own requests
          const clientProfile = await getClientByUser(user.userId);
          const reqs = await requestActions.getRequestsByClient(clientProfile.id);
          setRequests(reqs);
        } else {
          // Staff / PM / Admin see everything
          const reqs = await requestActions.getAllRequests();
          setRequests(reqs);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleStatusChange(id, executionStatus) {
    try {
      const updated = await requestActions.updateRequestStatus(id, executionStatus);
      setRequests((r) => r.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  const STATUS_LABELS = {
    NEW: t("serviceRequests.statusNew"),
    IN_REVIEW: t("serviceRequests.statusInReview"),
    APPROVED: t("serviceRequests.statusApproved"),
    IN_PROGRESS: t("serviceRequests.statusInProgress"),
    COMPLETED: t("serviceRequests.statusCompleted"),
    CANCELLED: t("serviceRequests.statusCancelled"),
  };

  return (
    <div>
      <h1 className="portal-page-title">
        {isClient ? t("serviceRequests.clientTitle") : t("serviceRequests.staffTitle")}
      </h1>
      <p className="portal-page-sub">
        {isClient
          ? t("serviceRequests.clientSubtitle")
          : t("serviceRequests.staffSubtitle")}
      </p>

      {error && <p className="portal-error">{error}</p>}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("serviceRequests.requestRecords")}</h2>
        {loading ? <p className="portal-loading">{t("serviceRequests.loading")}</p> : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  {!isClient && <th>{t("serviceRequests.columnClient")}</th>}
                  <th>{t("serviceRequests.columnRequestName")}</th>
                  <th>{t("serviceRequests.columnBudget")}</th><th>{t("serviceRequests.columnStatus")}</th>
                  {canEdit && <th>{t("serviceRequests.columnUpdateStatus")}</th>}
                  {!isClient && <th>{t("serviceRequests.columnActions")}</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    {!isClient && <td>{r.clientName}</td>}
                    <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.requestName || r.roomType || t("serviceRequests.untitledRequest")}
                    </td>
                    <td>${r.budgetLimit?.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge--${BADGE_MAP[r.executionStatus] || "draft"}`}>
                        {STATUS_LABELS[r.executionStatus] || r.executionStatus}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <select value={r.executionStatus} style={{ fontSize: "0.8rem" }}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}>
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    {!isClient && (
                      <td>
                        <button type="button" className="btn" style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                          onClick={() => navigate(`/portal/requests/${r.id}`)}>
                          {t("serviceRequests.view")}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {!requests.length && (
                  <tr>
                    <td colSpan={isClient ? 3 : 4 + (canEdit ? 1 : 0) + 1} className="portal-empty">
                      {t("serviceRequests.noneFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
