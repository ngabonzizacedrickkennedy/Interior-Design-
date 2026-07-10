import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Sparkle, CheckCircle } from "@phosphor-icons/react";
import { getMyRequests } from "../../api/actions/requests";
import { triggerAssessment, remainAssessment } from "../../api/actions/assessments";
import { deriveDisplayStatus } from "../utils/requestStatus";
import { buildAssessmentSpeech, speak } from "../utils/speech";
import { AssessmentResultPanel } from "../components/AssessmentResultPanel";
import "../PortalLayout.css";
import "./assessments.css";

export function Assessments() {
  const { t } = useTranslation("portal");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("not_assessed");
  const [assessingId, setAssessingId] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get("requestId")) setTab("not_assessed");
  }, [searchParams]);

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

  async function handleAssess(id) {
    setAssessingId(id);
    setError(null);
    try {
      const assessment = await triggerAssessment(id);
      await load();
      setTab("assessed");
      speak(buildAssessmentSpeech(assessment));
    } catch (e) {
      setError(e.message);
    } finally {
      setAssessingId(null);
    }
  }

  async function handleRemain(requestId, assessmentId) {
    try {
      await remainAssessment(requestId, assessmentId);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const notAssessed = requests.filter((r) => deriveDisplayStatus(r) === "NOT_ASSESSED");
  const assessed = requests.filter((r) => ["ASSESSED", "INVESTED"].includes(deriveDisplayStatus(r)));
  const highlightId = Number(searchParams.get("requestId")) || null;

  return (
    <div>
      <h1 className="portal-page-title">{t("assessments.title")}</h1>
      <p className="portal-page-sub">
        {t("assessments.subtitle")}
      </p>

      {error && <p className="portal-error">{error}</p>}

      <div className="gallery-tabs" style={{ marginBottom: "1.5rem" }}>
        <button type="button" className={"gallery-tab" + (tab === "not_assessed" ? " is-active" : "")}
          onClick={() => setTab("not_assessed")}>
          {t("assessments.notYetAssessedTab", { count: notAssessed.length })}
        </button>
        <button type="button" className={"gallery-tab" + (tab === "assessed" ? " is-active" : "")}
          onClick={() => setTab("assessed")}>
          {t("assessments.assessedTab", { count: assessed.length })}
        </button>
      </div>

      {loading ? (
        <p className="portal-loading">{t("assessments.loading")}</p>
      ) : tab === "not_assessed" ? (
        notAssessed.length === 0 ? (
          <p className="portal-empty">
            <span className="assessments-empty-icon"><CheckCircle size={22} weight="bold" /></span>
            {t("assessments.allAssessed")}
          </p>
        ) : (
          notAssessed.map((r) => (
            <section
              key={r.id}
              className={"portal-section" + (r.id === highlightId ? " is-highlighted" : "")}
            >
              <h2 className="portal-section__title">{r.requestName || r.roomType || t("assessments.request")}</h2>
              <p className="portal-page-sub" style={{ marginBottom: "1rem" }}>
                {(r.requestDetails || t("assessments.noDescriptionYet")).slice(0, 160)}
              </p>
              <button
                type="button"
                className="btn btn-solid"
                disabled={assessingId === r.id}
                onClick={() => handleAssess(r.id)}
              >
                {assessingId === r.id ? t("assessments.analyzing") : t("assessments.assess")}
              </button>
            </section>
          ))
        )
      ) : assessed.length === 0 ? (
        <p className="portal-empty">
          <span className="assessments-empty-icon"><Sparkle size={22} weight="bold" /></span>
          {t("assessments.noAssessedYet")}
        </p>
      ) : (
        assessed.map((r) => (
          <section key={r.id} className="portal-section">
            <h2 className="portal-section__title">{r.requestName || r.roomType || t("assessments.request")}</h2>
            <AssessmentResultPanel
              assessment={r.latestAssessment}
              onRemain={() => handleRemain(r.id, r.latestAssessment.id)}
            />
          </section>
        ))
      )}
    </div>
  );
}
