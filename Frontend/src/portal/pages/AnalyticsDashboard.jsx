import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { getAnalyticsSnapshot } from "../../api/actions/analytics";
import "../PortalLayout.css";

export function AnalyticsDashboard() {
  const { t } = useTranslation("staff");
  const { user }      = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  if (user?.role !== "PROJECT_MANAGER" && user?.role !== "ADMIN") {
    return (
      <div className="portal-access-denied">
        <h2>{t("analyticsDashboard.accessRestrictedTitle")}</h2>
        <p>{t("analyticsDashboard.accessRestrictedMessage")}</p>
      </div>
    );
  }

  function load() {
    setLoading(true);
    getAnalyticsSnapshot()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) return <p className="portal-loading">{t("analyticsDashboard.computingSnapshot")}</p>;
  if (error)   return <p className="portal-error">{error}</p>;
  if (!data)   return null;

  const taskPct  = data.totalTasks ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  const reqPct   = data.totalRequests ? Math.round((data.approvedRequests / data.totalRequests) * 100) : 0;
  const quotePct = data.totalQuotations ? Math.round((data.approvedQuotations / data.totalQuotations) * 100) : 0;

  const kpis = [
    { label: t("analyticsDashboard.kpi.totalClients"),       value: data.totalClients,           accent: false },
    { label: t("analyticsDashboard.kpi.activeProjects"),      value: data.activeProjects,         accent: true  },
    { label: t("analyticsDashboard.kpi.avgProjectProgress"), value: `${data.averageProjectProgress?.toFixed(0)}%`, accent: true },
    { label: t("analyticsDashboard.kpi.taskCompletion"),      value: `${taskPct}%`,               accent: true  },
    { label: t("analyticsDashboard.kpi.totalRequests"),       value: data.totalRequests,          accent: false },
    { label: t("analyticsDashboard.kpi.approvedRequests"),    value: data.approvedRequests,       accent: false },
    { label: t("analyticsDashboard.kpi.approvedQuotations"),  value: data.approvedQuotations,     accent: false },
    { label: t("analyticsDashboard.kpi.avgClientRating"),    value: data.averageFeedbackRating
        ? `${Number(data.averageFeedbackRating).toFixed(1)} / 5` : t("analyticsDashboard.notAvailable"), accent: true },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <h1 className="portal-page-title">{t("analyticsDashboard.title")}</h1>
          <p className="portal-page-sub" style={{ margin: 0 }}>
            {t("analyticsDashboard.subtitle")}
          </p>
        </div>
        <button className="btn" onClick={load}>{t("analyticsDashboard.refresh")}</button>
      </div>

      <div className="portal-stat-grid" style={{ marginBottom: "1.75rem" }}>
        {kpis.map((k) => (
          <div key={k.label} className="portal-stat-card">
            <p className="portal-stat-card__label">{k.label}</p>
            <p className={`portal-stat-card__value${k.accent ? " portal-stat-card__value--accent" : ""}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("analyticsDashboard.performanceRates")}</h2>

        {[
          { label: t("analyticsDashboard.rate.taskCompletion"),      value: taskPct,  total: t("analyticsDashboard.rate.tasksCompletedOf", { completed: data.completedTasks, total: data.totalTasks }) },
          { label: t("analyticsDashboard.rate.requestApproval"),     value: reqPct,   total: t("analyticsDashboard.rate.requestsApprovedOf", { approved: data.approvedRequests, total: data.totalRequests }) },
          { label: t("analyticsDashboard.rate.quotationApproval"),   value: quotePct, total: t("analyticsDashboard.rate.quotationsApprovedOf", { approved: data.approvedQuotations, total: data.totalQuotations }) },
          { label: t("analyticsDashboard.rate.avgProjectProgress"),  value: Math.round(data.averageProjectProgress || 0), total: t("analyticsDashboard.rate.totalProjects", { total: data.totalProjects }) },
        ].map((bar) => (
          <div key={bar.label} style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.4rem" }}>
              <span style={{ fontWeight: 500 }}>{bar.label}</span>
              <span style={{ color: "var(--color-ink-soft)" }}>{bar.total}</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-bar__fill" style={{ width: `${bar.value}%` }} />
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)", marginTop: "0.25rem" }}>
              {bar.value}%
            </div>
          </div>
        ))}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("analyticsDashboard.serviceDeliverySummary")}</h2>
        <div className="portal-form-row" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          <div className="portal-detail-panel" style={{ margin: 0 }}>
            <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-ink-soft)", fontWeight: 600 }}>
              {t("analyticsDashboard.summary.requests")}
            </p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              {t("analyticsDashboard.summary.requestsLine", { total: data.totalRequests, approved: data.approvedRequests, pending: data.totalRequests - data.approvedRequests })}
            </p>
          </div>
          <div className="portal-detail-panel" style={{ margin: 0 }}>
            <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-ink-soft)", fontWeight: 600 }}>
              {t("analyticsDashboard.summary.projects")}
            </p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              {t("analyticsDashboard.summary.projectsLine", { total: data.totalProjects, active: data.activeProjects, other: data.totalProjects - data.activeProjects })}
            </p>
          </div>
          <div className="portal-detail-panel" style={{ margin: 0 }}>
            <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-ink-soft)", fontWeight: 600 }}>
              {t("analyticsDashboard.summary.tasks")}
            </p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              {t("analyticsDashboard.summary.tasksLine", { total: data.totalTasks, done: data.completedTasks, pending: data.totalTasks - data.completedTasks })}
            </p>
          </div>
          <div className="portal-detail-panel" style={{ margin: 0 }}>
            <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-ink-soft)", fontWeight: 600 }}>
              {t("analyticsDashboard.summary.clientSatisfaction")}
            </p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              {data.averageFeedbackRating
                ? t("analyticsDashboard.summary.averageRating", { rating: Number(data.averageFeedbackRating).toFixed(1) })
                : t("analyticsDashboard.summary.noFeedbackYet")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
