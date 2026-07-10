import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getRequestById } from "../../api/actions/requests";
import { getStagingHistory, generateStaging } from "../../api/actions/staging";
import { deriveDisplayStatus, DISPLAY_STATUS_BADGE } from "../utils/requestStatus";
import { BeforeAfterSlider } from "../../components/BeforeAfterSlider";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";
import "./dashboard.css";

const CATEGORY_ORDER = ["ROOM_PHOTO", "FLOOR_PLAN", "STYLE_REFERENCE", "EXISTING_FURNITURE"];

export function RequestDetail() {
  const { t } = useTranslation("portal");
  const { showSuccess, showError } = useToast();
  const { id } = useParams();
  const { user } = useAuth();
  const isClient = user?.role === "CLIENT";
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ROOM_PHOTO");
  const [stagingStyle, setStagingStyle] = useState("MODERN_MINIMALIST");
  const [stagingHistory, setStagingHistory] = useState([]);
  const [stagingBusyId, setStagingBusyId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRequestById(id);
        setRequest(data);
        const firstNonEmpty = CATEGORY_ORDER.find(
          (c) => data.attachments?.some((a) => a.category === c)
        );
        if (firstNonEmpty) setActiveCategory(firstNonEmpty);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!isClient) return;
    getStagingHistory(id).then(setStagingHistory).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isClient]);

  async function handleGenerate(attachmentId) {
    setStagingBusyId(attachmentId);
    try {
      const created = await generateStaging(id, attachmentId, stagingStyle);
      setStagingHistory((list) => [created, ...list]);
      showSuccess(t("requestDetail.staging.success"));
    } catch (e) {
      showError(e.message || t("requestDetail.staging.error"));
    } finally {
      setStagingBusyId(null);
    }
  }

  const DISPLAY_STATUS_LABELS = {
    DRAFT: t("requestDetail.statusDraft"),
    NOT_ASSESSED: t("requestDetail.statusNotYetAssessed"),
    ASSESSED: t("requestDetail.statusAssessed"),
    INVESTED: t("requestDetail.statusInvested"),
  };
  const STYLE_PREFERENCE_LABELS = {
    MODERN_MINIMALIST: t("requestDetail.styleModernMinimalist"),
    MID_CENTURY: t("requestDetail.styleMidCentury"),
    INDUSTRIAL: t("requestDetail.styleIndustrial"),
    SCANDINAVIAN: t("requestDetail.styleScandinavian"),
    BOHEMIAN: t("requestDetail.styleBohemian"),
    TRADITIONAL: t("requestDetail.styleTraditional"),
    COASTAL: t("requestDetail.styleCoastal"),
    CONTEMPORARY: t("requestDetail.styleContemporary"),
    RUSTIC: t("requestDetail.styleRustic"),
    ECLECTIC: t("requestDetail.styleEclectic"),
  };
  const WINDOW_DIRECTION_LABELS = {
    NORTH: t("requestDetail.directionNorth"),
    SOUTH: t("requestDetail.directionSouth"),
    EAST: t("requestDetail.directionEast"),
    WEST: t("requestDetail.directionWest"),
    MIXED: t("requestDetail.directionMixed"),
    UNKNOWN: t("requestDetail.directionUnknown"),
  };
  const LIGHT_LEVEL_LABELS = {
    LOW: t("requestDetail.lightLow"),
    MEDIUM: t("requestDetail.lightMedium"),
    HIGH: t("requestDetail.lightHigh"),
  };
  const TIMELINE_LABELS = {
    IMMEDIATE: t("requestDetail.timelineImmediate"),
    THREE_TO_SIX_MONTHS: t("requestDetail.timelineThreeToSixMonths"),
    PLANNING_AHEAD: t("requestDetail.timelinePlanningAhead"),
  };
  const ATTACHMENT_CATEGORIES = {
    ROOM_PHOTO: t("requestDetail.categoryRoomPhotos"),
    FLOOR_PLAN: t("requestDetail.categoryFloorPlan"),
    STYLE_REFERENCE: t("requestDetail.categoryStyleReferences"),
    EXISTING_FURNITURE: t("requestDetail.categoryExistingFurniture"),
  };

  if (loading) return <p className="portal-loading">{t("requestDetail.loading")}</p>;
  if (error) return <p className="portal-error">{error}</p>;
  if (!request) return null;

  const displayStatus = deriveDisplayStatus(request);
  const attachmentsInCategory = (request.attachments || []).filter((a) => a.category === activeCategory);
  const roomPhotos = (request.attachments || []).filter((a) => a.category === "ROOM_PHOTO");

  return (
    <div>
      <Link to={isClient ? "/portal/dashboard" : "/portal/requests"} className="btn" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
        ← {isClient ? t("requestDetail.backToDashboard") : t("requestDetail.backToServiceRequests")}
      </Link>

      <h1 className="portal-page-title">
        {request.requestName || request.roomType || t("requestDetail.request")}
      </h1>
      <span className={`badge badge--${DISPLAY_STATUS_BADGE[displayStatus]}`}>
        {DISPLAY_STATUS_LABELS[displayStatus]}
      </span>

      <section className="portal-section" style={{ marginTop: "1.5rem" }}>
        <h2 className="portal-section__title">{t("requestDetail.requestDetails")}</h2>
        <div className="portal-detail-panel">
          <dl>
            <dt>{t("requestDetail.description")}</dt><dd>{request.requestDetails || "—"}</dd>
            <dt>{t("requestDetail.dimensions")}</dt>
            <dd>{t("requestDetail.dimensionsValue", { length: request.lengthMeters || "?", width: request.widthMeters || "?", height: request.ceilingHeightMeters || "?" })}</dd>
            <dt>{t("requestDetail.spatialNotes")}</dt><dd>{request.spatialNotes || "—"}</dd>
            <dt>{t("requestDetail.budgetRange")}</dt>
            <dd>{Number(request.budgetMin || 0).toLocaleString()} – {Number(request.budgetMax || 0).toLocaleString()}</dd>
            <dt>{t("requestDetail.currentWorkingBudget")}</dt><dd>{Number(request.budgetLimit || 0).toLocaleString()}</dd>
            <dt>{t("requestDetail.stylePreferences")}</dt>
            <dd>{(request.styleTags || []).map((s) => STYLE_PREFERENCE_LABELS[s] || s).join(", ") || "—"}</dd>
            <dt>{t("requestDetail.spaceUsage")}</dt>
            <dd>
              {[
                request.worksFromHome && t("requestDetail.worksFromHome"),
                request.entertainsOften && t("requestDetail.entertainsOften"),
                request.hasKids && t("requestDetail.hasKids"),
                request.hasPets && t("requestDetail.hasPets"),
              ].filter(Boolean).join(", ") || "—"}
              {request.storageNeeds ? ` — ${request.storageNeeds}` : ""}
            </dd>
            <dt>{t("requestDetail.lighting")}</dt>
            <dd>
              {t("requestDetail.facingLight", {
                direction: WINDOW_DIRECTION_LABELS[request.windowDirection] || "—",
                level: LIGHT_LEVEL_LABELS[request.naturalLightLevel] || "—",
              })}
              {request.artificialLightingNotes ? ` — ${request.artificialLightingNotes}` : ""}
            </dd>
            <dt>{t("requestDetail.timeline")}</dt><dd>{TIMELINE_LABELS[request.timeline] || "—"}</dd>
            <dt>{t("requestDetail.avoid")}</dt><dd>{request.avoidNotes || "—"}</dd>
            <dt>{t("requestDetail.location")}</dt><dd>{request.sourcingLocation || "—"}</dd>
            {request.investmentStatus === "INVESTED" && (
              <>
                <dt>{t("requestDetail.investedAmount")}</dt><dd>{Number(request.investedAmount || 0).toLocaleString()}</dd>
              </>
            )}
          </dl>
        </div>
      </section>

      {request.latestAssessment && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("requestDetail.latestAiAssessment")}</h2>
          <div className="portal-detail-panel">
            <dl>
              <dt>{t("requestDetail.verdict")}</dt><dd>{request.latestAssessment.verdict}</dd>
              <dt>{t("requestDetail.recommendedBudget")}</dt>
              <dd>
                {Number(request.latestAssessment.recommendedBudgetMin || 0).toLocaleString()} –{" "}
                {Number(request.latestAssessment.recommendedBudgetMax || 0).toLocaleString()}
              </dd>
              <dt>{t("requestDetail.reasoning")}</dt><dd>{request.latestAssessment.reasoning}</dd>
              <dt>{t("requestDetail.styleSummary")}</dt><dd>{request.latestAssessment.styleSummary}</dd>
              <dt>{t("requestDetail.roomCondition")}</dt><dd>{request.latestAssessment.roomConditionSummary}</dd>
            </dl>
          </div>
        </section>
      )}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("requestDetail.uploadedImages")}</h2>
        <div className="gallery-tabs">
          {CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              className={"gallery-tab" + (activeCategory === category ? " is-active" : "")}
              onClick={() => setActiveCategory(category)}
            >
              {ATTACHMENT_CATEGORIES[category]} ({(request.attachments || []).filter((a) => a.category === category).length})
            </button>
          ))}
        </div>

        {attachmentsInCategory.length === 0 ? (
          <p className="portal-empty">{t("requestDetail.noImagesInCategory")}</p>
        ) : (
          <div className="gallery-grid">
            {attachmentsInCategory.map((a) => (
              <div key={a.id} className="gallery-item">
                <img src={a.url} alt={a.originalFileName || ""} />
                {a.note && <div className="gallery-item__note">{a.note}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      {isClient && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("requestDetail.staging.title")}</h2>
          <p className="portal-page-sub" style={{ margin: "0 0 1.25rem" }}>{t("requestDetail.staging.subtitle")}</p>

          {roomPhotos.length === 0 ? (
            <p className="portal-empty">{t("requestDetail.staging.noRoomPhotos")}</p>
          ) : (
            <>
              <div className="field" style={{ maxWidth: 260, marginBottom: "1.25rem" }}>
                <label>{t("requestDetail.staging.styleLabel")}</label>
                <select value={stagingStyle} onChange={(e) => setStagingStyle(e.target.value)}>
                  {Object.entries(STYLE_PREFERENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="gallery-grid">
                {roomPhotos.map((a) => (
                  <div key={a.id} className="gallery-item">
                    <img src={a.url} alt={a.originalFileName || ""} />
                    <button
                      type="button"
                      className="btn btn-solid"
                      style={{ marginTop: "0.6rem", width: "100%" }}
                      disabled={stagingBusyId === a.id}
                      onClick={() => handleGenerate(a.id)}
                    >
                      {stagingBusyId === a.id ? t("requestDetail.staging.generating") : t("requestDetail.staging.generateButton")}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {stagingHistory.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3 className="portal-section__title" style={{ fontSize: "1rem" }}>{t("requestDetail.staging.historyTitle")}</h3>
              <div className="gallery-grid">
                {stagingHistory.map((sv) => (
                  <div key={sv.id} className="gallery-item">
                    <BeforeAfterSlider
                      beforeSrc={sv.originalImageUrl}
                      afterSrc={sv.generatedImageUrl}
                      beforeLabel={t("requestDetail.staging.before")}
                      afterLabel={t("requestDetail.staging.after")}
                    />
                    <div className="gallery-item__note">
                      {STYLE_PREFERENCE_LABELS[sv.style] || sv.style}
                      {" · "}
                      <a href={sv.generatedImageUrl} download target="_blank" rel="noreferrer">
                        {t("requestDetail.staging.download")}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
