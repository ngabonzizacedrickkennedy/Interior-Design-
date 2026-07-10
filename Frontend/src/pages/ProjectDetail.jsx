import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProjectBySlug } from "../data/projects";
import "./ProjectDetail.css";

const CATEGORY_LABEL_KEYS = {
  Residential: "portfolioPage.filters.residential",
  Commercial: "portfolioPage.filters.commercial",
};

export function ProjectDetail() {
  const { t } = useTranslation("marketing");
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <section className="project-detail">
        <div className="container">
          <p className="eyebrow">{t("projectDetail.eyebrow")}</p>
          <h1 className="project-detail__heading">
            {t("projectDetail.notFound.heading")}
          </h1>
          <Link to="/portfolio" className="btn">
            {t("projectDetail.backToPortfolio")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="project-detail">
      <div className="container">
        <Link to="/portfolio" className="project-detail__back">
          {t("projectDetail.back")}
        </Link>

        <p className="eyebrow">
          {t(CATEGORY_LABEL_KEYS[project.category])} · {project.year}
        </p>
        <h1 className="project-detail__heading">{project.title}</h1>
        <p className="project-detail__summary">{project.summary}</p>

        <div className="project-detail__cover">
          <img src={project.image} alt={project.title} />
        </div>

        <p className="project-detail__body">{project.body}</p>

        <div className="project-detail__gallery">
          {project.gallery.map((image, index) => (
            <div key={index} className="project-detail__gallery-item reveal" style={{ transitionDelay: `${(index % 3) * 0.08}s` }}>
              <img
                src={image}
                alt={t("projectDetail.galleryAlt", {
                  title: project.title,
                  index: index + 1,
                })}
              />
            </div>
          ))}
        </div>

        <div className="project-detail__cta">
          <p>{t("projectDetail.cta.prompt")}</p>
          <Link to="/portal/register" className="btn btn-solid">
            {t("projectDetail.cta.button")}
          </Link>
        </div>
      </div>
    </section>
  );
}
