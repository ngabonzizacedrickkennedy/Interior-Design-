import { useTranslation } from "react-i18next";

export function StepReview({ state }) {
  const { t } = useTranslation("portal");
  const STYLE_PREFERENCE_LABELS = {
    MODERN_MINIMALIST: t("wizard.review.styleModernMinimalist"),
    MID_CENTURY: t("wizard.review.styleMidCentury"),
    INDUSTRIAL: t("wizard.review.styleIndustrial"),
    SCANDINAVIAN: t("wizard.review.styleScandinavian"),
    BOHEMIAN: t("wizard.review.styleBohemian"),
    TRADITIONAL: t("wizard.review.styleTraditional"),
    COASTAL: t("wizard.review.styleCoastal"),
    CONTEMPORARY: t("wizard.review.styleContemporary"),
    RUSTIC: t("wizard.review.styleRustic"),
    ECLECTIC: t("wizard.review.styleEclectic"),
  };
  const TIMELINE_LABELS = {
    IMMEDIATE: t("wizard.review.timelineImmediate"),
    THREE_TO_SIX_MONTHS: t("wizard.review.timelineThreeToSixMonths"),
    PLANNING_AHEAD: t("wizard.review.timelinePlanningAhead"),
  };
  const WINDOW_DIRECTION_LABELS = {
    NORTH: t("wizard.review.directionNorth"),
    SOUTH: t("wizard.review.directionSouth"),
    EAST: t("wizard.review.directionEast"),
    WEST: t("wizard.review.directionWest"),
    MIXED: t("wizard.review.directionMixed"),
    UNKNOWN: t("wizard.review.directionUnknown"),
  };
  const LIGHT_LEVEL_LABELS = {
    LOW: t("wizard.review.levelLow"),
    MEDIUM: t("wizard.review.levelMedium"),
    HIGH: t("wizard.review.levelHigh"),
  };

  const f = state.fields;
  const countByCategory = (category) => state.attachments.filter((a) => a.category === category).length;

  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.review.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.review.subtitle")}
      </p>

      <div className="portal-detail-panel">
        <dl>
          <dt>{t("wizard.review.requestName")}</dt><dd>{f.requestName || "—"}</dd>
          <dt>{t("wizard.review.roomType")}</dt><dd>{f.roomType || "—"}</dd>
          <dt>{t("wizard.review.description")}</dt><dd>{f.requestDetails || "—"}</dd>
          <dt>{t("wizard.review.dimensions")}</dt>
          <dd>{t("wizard.review.dimensionsValue", { length: f.lengthMeters || "?", width: f.widthMeters || "?", height: f.ceilingHeightMeters || "?" })}</dd>
          <dt>{t("wizard.review.budgetRange")}</dt><dd>{f.budgetMin || "?"} – {f.budgetMax || "?"}</dd>
          <dt>{t("wizard.review.stylePreferences")}</dt>
          <dd>{f.styleTags.length ? f.styleTags.map((s) => STYLE_PREFERENCE_LABELS[s] || s).join(", ") : "—"}</dd>
          <dt>{t("wizard.review.spaceUsage")}</dt>
          <dd>
            {[
              f.worksFromHome && t("wizard.review.worksFromHome"),
              f.entertainsOften && t("wizard.review.entertainsOften"),
              f.hasKids && t("wizard.review.hasKids"),
              f.hasPets && t("wizard.review.hasPets"),
            ].filter(Boolean).join(", ") || "—"}
          </dd>
          <dt>{t("wizard.review.lighting")}</dt>
          <dd>
            {t("wizard.review.facingLight", {
              direction: WINDOW_DIRECTION_LABELS[f.windowDirection] || "—",
              level: LIGHT_LEVEL_LABELS[f.naturalLightLevel] || "—",
            })}
          </dd>
          <dt>{t("wizard.review.timeline")}</dt><dd>{TIMELINE_LABELS[f.timeline] || "—"}</dd>
          <dt>{t("wizard.review.avoid")}</dt><dd>{f.avoidNotes || "—"}</dd>
          <dt>{t("wizard.review.location")}</dt><dd>{f.sourcingLocation || "—"}</dd>
          <dt>{t("wizard.review.photosUploaded")}</dt>
          <dd>
            {t("wizard.review.photosSummary", {
              roomPhotos: countByCategory("ROOM_PHOTO"),
              floorPlans: countByCategory("FLOOR_PLAN"),
              styleReferences: countByCategory("STYLE_REFERENCE"),
              existingFurniture: countByCategory("EXISTING_FURNITURE"),
            })}
          </dd>
        </dl>
      </div>
    </div>
  );
}
