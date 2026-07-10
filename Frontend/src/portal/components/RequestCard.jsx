import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { deriveDisplayStatus, DISPLAY_STATUS_BADGE } from "../utils/requestStatus";
import { useTilt3D } from "../../hooks/useTilt3D";

export function RequestCard({ request, onWithdraw }) {
  const { t } = useTranslation("portal");
  const tiltRef = useTilt3D(3);
  const DISPLAY_STATUS_LABELS = {
    DRAFT: t("requestCard.statusDraft"),
    NOT_ASSESSED: t("requestCard.statusNotYetAssessed"),
    ASSESSED: t("requestCard.statusAssessed"),
    INVESTED: t("requestCard.statusInvested"),
  };
  const TIMELINE_LABELS = {
    IMMEDIATE: t("requestCard.timelineImmediate"),
    THREE_TO_SIX_MONTHS: t("requestCard.timelineThreeToSixMonths"),
    PLANNING_AHEAD: t("requestCard.timelinePlanningAhead"),
  };
  const navigate = useNavigate();
  const attachments = request.attachments || [];
  const roomPhotos = attachments.filter((a) => a.category === "ROOM_PHOTO");
  const cover = roomPhotos[0] || attachments[0] || null;
  const strip = attachments.filter((a) => a.id !== cover?.id).slice(0, 3);
  const overflowCount = attachments.length - 1 - strip.length;

  const displayStatus = deriveDisplayStatus(request);
  const isDraft = request.executionStatus === "DRAFT";
  const canWithdraw = (request.executionStatus === "DRAFT" || request.executionStatus === "NEW")
    && request.investmentStatus !== "INVESTED";

  const title = [request.roomType, request.requestDetails?.split("\n")[0]].filter(Boolean).join(" — ") || t("requestCard.untitledRequest");

  function goToDetail() {
    navigate(`/portal/requests/${request.id}`);
  }

  return (
    <div className="request-card" ref={tiltRef}>
      <div className="request-card__media" onClick={goToDetail} role="button" tabIndex={0}>
        {cover ? (
          <>
            <img className="request-card__cover" src={cover.url} alt="" />
            {strip.length > 0 && (
              <div className="request-card__strip">
                {strip.map((a, idx) => (
                  <div key={a.id} className="request-card__strip-item">
                    <img src={a.url} alt="" />
                    {idx === strip.length - 1 && overflowCount > 0 && (
                      <div className="request-card__overflow">+{overflowCount}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="request-card__cover request-card__cover--empty">{t("requestCard.noPhotosYet")}</div>
        )}
      </div>

      <div className="request-card__body">
        <span className={`badge badge--${DISPLAY_STATUS_BADGE[displayStatus]}`}>
          {DISPLAY_STATUS_LABELS[displayStatus]}
        </span>
        {request.requestName && (
          <span className="request-card__id">{request.requestName}</span>
        )}

        <p className="request-card__title">{title}</p>

        <div className="request-card__stats">
          <div className="request-card__stat">
            <span className="request-card__stat-label">{t("requestCard.budget")}</span>
            <span className="request-card__stat-value">
              {request.budgetMin || request.budgetMax
                ? `${Number(request.budgetMin || 0).toLocaleString()} – ${Number(request.budgetMax || 0).toLocaleString()}`
                : Number(request.budgetLimit || 0).toLocaleString()}
            </span>
          </div>
          <div className="request-card__stat">
            <span className="request-card__stat-label">{t("requestCard.timeline")}</span>
            <span className="request-card__stat-value">{TIMELINE_LABELS[request.timeline] || "—"}</span>
          </div>
        </div>

        {isDraft && (
          <div className="request-card__hint">
            {t("requestCard.unfinishedHint")}
          </div>
        )}

        {displayStatus === "NOT_ASSESSED" && (
          <div className="request-card__hint">
            {t("requestCard.assessmentPendingHint")}{" "}
            <Link to={`/portal/assessments?requestId=${request.id}`}>{t("requestCard.completeItBelow")}</Link>
          </div>
        )}

        {displayStatus === "NOT_ASSESSED" && (
          <button
            type="button"
            className="btn btn-solid request-card__assess-btn"
            onClick={() => navigate(`/portal/assessments?requestId=${request.id}`)}
          >
            {t("requestCard.completeAiAssessment")}
          </button>
        )}

        <div className="portal-actions">
          <button type="button" className="btn" onClick={goToDetail}>{t("requestCard.view")}</button>
          {isDraft && (
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => navigate(`/portal/requests/new?draftId=${request.id}`)}
            >
              {t("requestCard.continue")}
            </button>
          )}
          {canWithdraw && (
            <button type="button" className="btn request-card__withdraw" onClick={() => onWithdraw(request.id)}>
              {t("requestCard.withdraw")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
