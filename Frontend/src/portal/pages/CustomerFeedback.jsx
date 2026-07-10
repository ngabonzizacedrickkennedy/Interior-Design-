import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "@phosphor-icons/react";
import { useAuth } from "../auth/AuthContext";
import * as feedbackActions from "../../api/actions/feedback";
import { getAllProjects, getProjectsByClient } from "../../api/actions/projects";
import { getClientByUser } from "../../api/actions/clients";
import "../PortalLayout.css";

export function CustomerFeedback() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [projects, setProjects]         = useState([]);
  const [avgRating, setAvgRating]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [submitted, setSubmitted]       = useState(false);
  const [form, setForm] = useState({
    projectId: "", metricRatingScore: 0, feedbackNarrative: "",
  });

  const isClient   = user?.role === "CLIENT";
  const canViewAll = user?.role === "PROJECT_MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    async function load() {
      try {
        if (isClient) {
          const profile = await getClientByUser(user.userId);
          const clientProjects = await getProjectsByClient(profile.id);
          setProjects(clientProjects);
        } else {
          const [all, allProjects, avg] = await Promise.all([
            feedbackActions.getAllFeedback(),
            getAllProjects(),
            feedbackActions.getAverageRating(),
          ]);
          setFeedbackList(all);
          setProjects(allProjects);
          setAvgRating(avg);
        }
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.projectId || form.metricRatingScore === 0) {
      setError(t("customerFeedback.selectProjectAndRating"));
      return;
    }
    try {
      const created = await feedbackActions.submitFeedback({
        projectId: Number(form.projectId),
        metricRatingScore: form.metricRatingScore,
        feedbackNarrative: form.feedbackNarrative,
      });
      setFeedbackList((f) => [...f, created]);
      setForm({ projectId: "", metricRatingScore: 0, feedbackNarrative: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) { setError(e.message); }
  }

  const fiveStarCount = feedbackList.filter((f) => f.metricRatingScore === 5).length;

  return (
    <div>
      <h1 className="portal-page-title">
        {isClient ? t("customerFeedback.leaveFeedback") : t("customerFeedback.customerFeedback")}
      </h1>
      <p className="portal-page-sub">
        {isClient
          ? t("customerFeedback.clientSubtitle")
          : t("customerFeedback.staffSubtitle")}
      </p>

      {error && <p className="portal-error">{error}</p>}

      {canViewAll && !loading && (
        <div className="portal-stat-grid" style={{ marginBottom: "1.75rem" }}>
          <div className="portal-stat-card">
            <p className="portal-stat-card__label">{t("customerFeedback.kpi.averageRating")}</p>
            <p className="portal-stat-card__value portal-stat-card__value--accent">
              {avgRating ? Number(avgRating).toFixed(1) : "–"} / 5
            </p>
          </div>
          <div className="portal-stat-card">
            <p className="portal-stat-card__label">{t("customerFeedback.kpi.totalResponses")}</p>
            <p className="portal-stat-card__value">{feedbackList.length}</p>
          </div>
          <div className="portal-stat-card">
            <p className="portal-stat-card__label">{t("customerFeedback.kpi.fiveStarReviews")}</p>
            <p className="portal-stat-card__value">{fiveStarCount}</p>
          </div>
        </div>
      )}

      <section className="portal-section">
        <h2 className="portal-section__title">
          {isClient ? t("customerFeedback.rateYourExperience") : t("customerFeedback.submitOnBehalfOfClient")}
        </h2>
        {submitted && (
          <p style={{ color: "var(--color-accent)", marginBottom: "1rem", fontWeight: 500 }}>
            {t("customerFeedback.thankYouRecorded")}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="portal-form-row">
            <div className="field">
              <label>{t("customerFeedback.field.project")}</label>
              <select value={form.projectId} required
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">{t("customerFeedback.selectProject")}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.clientName}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("customerFeedback.field.overallRating")}</label>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button"
                    className="star-rating-input__btn"
                    onClick={() => setForm({ ...form, metricRatingScore: star })}>
                    <Star
                      size={26}
                      weight={star <= form.metricRatingScore ? "fill" : "regular"}
                      color={star <= form.metricRatingScore ? "var(--color-accent)" : "var(--color-line)"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="field field--full">
              <label>{t("customerFeedback.field.comments")}</label>
              <textarea rows={4} value={form.feedbackNarrative} required
                placeholder={t("customerFeedback.commentsPlaceholder")}
                onChange={(e) => setForm({ ...form, feedbackNarrative: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-solid">{t("customerFeedback.submitFeedbackButton")}</button>
        </form>
      </section>

      {canViewAll && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("customerFeedback.allFeedbackRecords")}</h2>
          {loading ? <p className="portal-loading">{t("customerFeedback.loadingFeedback")}</p> : (
            <div className="portal-table-wrap">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>{t("customerFeedback.column.client")}</th><th>{t("customerFeedback.column.rating")}</th>
                    <th>{t("customerFeedback.column.comments")}</th><th>{t("customerFeedback.column.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((f) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 500 }}>{f.clientName}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className="star-rating-display">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={15}
                              weight={star <= f.metricRatingScore ? "fill" : "regular"}
                              color={star <= f.metricRatingScore ? "var(--color-accent)" : "var(--color-line)"} />
                          ))}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-ink-soft)", marginLeft: "0.35rem" }}>
                          {f.metricRatingScore}/5
                        </span>
                      </td>
                      <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.feedbackNarrative}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {f.loggedTimestamp?.slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                  {!feedbackList.length && (
                    <tr><td colSpan={4} className="portal-empty">{t("customerFeedback.noFeedbackSubmittedYet")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
