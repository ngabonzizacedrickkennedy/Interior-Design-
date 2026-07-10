import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { getBusinessReport } from "../../api/actions/analytics";
import "./BusinessReport.css";

function monthBounds(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const toIso = (d) => d.toISOString().slice(0, 10);
  return { start: toIso(start), end: toIso(end) };
}

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function BusinessReport() {
  const { t, i18n } = useTranslation("staff");
  const { user } = useAuth();
  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (user?.role !== "ADMIN") {
    return (
      <div className="portal-access-denied">
        <h2>{t("businessReport.accessRestricted.title")}</h2>
        <p>{t("businessReport.accessRestricted.message")}</p>
      </div>
    );
  }

  function load() {
    setLoading(true);
    setError(null);
    const { start, end } = monthBounds(monthValue);
    getBusinessReport(start, end)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthValue]);

  const locale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";
  const currency = (value) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
  const dateLong = (value) =>
    new Date(value).toLocaleDateString(locale, { year: "numeric", month: "long" });
  const dateTime = (value) =>
    new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  const dateShort = (value) =>
    new Date(value).toLocaleDateString(locale, { dateStyle: "medium" });

  return (
    <div className="report-page">
      <div className="report-toolbar">
        <div>
          <h1 className="portal-page-title">{t("businessReport.title")}</h1>
          <p className="portal-page-sub" style={{ margin: 0 }}>{t("businessReport.subtitle")}</p>
        </div>
        <div className="report-toolbar__controls">
          <input
            type="month"
            className="report-month-input"
            value={monthValue}
            max={currentMonthValue()}
            onChange={(e) => setMonthValue(e.target.value)}
          />
          <button className="btn btn-solid" onClick={() => window.print()} disabled={!report}>
            {t("businessReport.download")}
          </button>
        </div>
      </div>

      {loading && <p className="portal-loading">{t("businessReport.loading")}</p>}
      {error && <p className="portal-error">{error}</p>}

      {report && (
        <div className="report-sheet">
          <div className="report-sheet__accent-bar" />

          <header className="report-sheet__header">
            <div className="report-sheet__brandblock">
              <span className="report-sheet__mark">SDG</span>
              <div>
                <p className="report-sheet__brand">Space Design Group</p>
                <p className="report-sheet__tagline">{t("businessReport.tagline")}</p>
              </div>
            </div>
            <div className="report-sheet__meta">
              <p className="report-sheet__refno">{t("businessReport.refNo", { ref: monthValue.replace("-", "") })}</p>
              <p>{t("businessReport.preparedBy", { name: user?.fullName || user?.email })}</p>
              <p>{t("businessReport.generatedOn", { date: dateTime(report.generatedAt) })}</p>
            </div>
          </header>

          <div className="report-sheet__titleblock">
            <h2 className="report-sheet__title">{t("businessReport.docTitle")}</h2>
            <p className="report-sheet__period">{dateLong(report.periodStart)}</p>
            <p className="report-sheet__range">{t("businessReport.periodRange", { start: dateShort(report.periodStart), end: dateShort(report.periodEnd) })}</p>
          </div>

          <section className="report-section">
            <h3 className="report-section__title">{t("businessReport.financials.title")}</h3>
            <div className="report-kpi-grid">
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.financials.deposits")}</span>
                <span className="report-kpi__value report-kpi__value--accent">{currency(report.periodDeposits)}</span>
              </div>
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.financials.investments")}</span>
                <span className="report-kpi__value report-kpi__value--accent">{currency(report.periodInvestments)}</span>
              </div>
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.financials.compensated")}</span>
                <span className="report-kpi__value">{currency(report.periodCompensatedTotal)}</span>
              </div>
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.financials.transactions")}</span>
                <span className="report-kpi__value">{report.periodTransactionCount}</span>
              </div>
            </div>
          </section>

          <section className="report-section">
            <h3 className="report-section__title">{t("businessReport.compensatedProjects.title")}</h3>
            {report.periodCompensatedProjects.length === 0 ? (
              <p className="report-empty">{t("businessReport.compensatedProjects.empty")}</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>{t("businessReport.compensatedProjects.client")}</th>
                    <th>{t("businessReport.compensatedProjects.project")}</th>
                    <th>{t("businessReport.compensatedProjects.date")}</th>
                    <th className="report-table__num">{t("businessReport.compensatedProjects.amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.periodCompensatedProjects.map((line, i) => (
                    <tr key={i}>
                      <td>{line.clientName}</td>
                      <td>{line.requestName}</td>
                      <td>{dateShort(line.compensatedAt)}</td>
                      <td className="report-table__num">{currency(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="report-section">
            <h3 className="report-section__title">{t("businessReport.satisfaction.title")}</h3>
            <div className="report-kpi-grid">
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.satisfaction.responses")}</span>
                <span className="report-kpi__value">{report.periodFeedbackCount}</span>
              </div>
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.satisfaction.averageRating")}</span>
                <span className="report-kpi__value report-kpi__value--accent">
                  {report.periodAverageRating ? `${report.periodAverageRating.toFixed(1)} / 5` : t("businessReport.satisfaction.none")}
                </span>
              </div>
            </div>
          </section>

          <section className="report-section report-section--muted">
            <h3 className="report-section__title">{t("businessReport.snapshot.title")}</h3>
            <p className="report-section__hint">{t("businessReport.snapshot.hint")}</p>
            <div className="report-kpi-grid report-kpi-grid--compact">
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.snapshot.totalClients")}</span>
                <span className="report-kpi__value">{report.totalClients}</span>
              </div>
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.snapshot.activeProjects")}</span>
                <span className="report-kpi__value">{report.activeProjects} / {report.totalProjects}</span>
              </div>
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.snapshot.taskCompletion")}</span>
                <span className="report-kpi__value">{Math.round(report.taskCompletionRate * 100)}%</span>
              </div>
              <div className="report-kpi">
                <span className="report-kpi__label">{t("businessReport.snapshot.quotationApproval")}</span>
                <span className="report-kpi__value">{report.approvedQuotations} / {report.totalQuotations}</span>
              </div>
            </div>
          </section>

          <footer className="report-sheet__footer">
            {t("businessReport.footer")}
          </footer>
        </div>
      )}
    </div>
  );
}
